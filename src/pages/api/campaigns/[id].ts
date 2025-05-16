import { NextApiRequest, NextApiResponse } from 'next';
import { CampaignStatus } from '@prisma/client';
import { campaignService, UpdateCampaignDto } from '../../../services/campaignService';
import { apiHandler } from '../../../utils/apiHandler';
import { authenticateRequest } from '../../../utils/enhancedAuthMiddleware';
import { ApiError } from '../../../utils/apiError';
import { logger } from '../../../lib/logger';

export default apiHandler({
  // GET /api/campaigns/[id] - Get a specific campaign
  GET: async (req: NextApiRequest, res: NextApiResponse) => {
    const { id } = req.query as { id: string };
    const user = await authenticateRequest(req);
    
    // Check for test mode
    const isTestMode = user.isTestMode || (user.pubkey && user.pubkey.startsWith('pk_test_'));
    
    if (isTestMode) {
      logger.info(`Test mode detected for user ${user.pubkey || user.userId}, fetching test campaign ${id}`);
      
      // Use test pubkey to fetch campaign
      const campaign = await campaignService.getCampaign(id, user.pubkey || user.userId);
      
      if (!campaign) {
        throw new ApiError(404, 'Campaign not found');
      }
      
      return res.status(200).json(campaign);
    }
    
    // For normal operation, check role access
    if (!user.currentRole || (user.currentRole !== 'advertiser' && user.currentRole !== 'admin')) {
      logger.warn(`User ${user.userId} with role ${user.currentRole} attempted to access advertiser-only endpoint`);
      throw new ApiError(403, 'Forbidden: Advertiser role required');
    }
    
    const campaign = await campaignService.getCampaign(id, user.userId);
    
    if (!campaign) {
      throw new ApiError(404, 'Campaign not found');
    }
    
    return res.status(200).json(campaign);
  },
  
  // PUT /api/campaigns/[id] - Update a campaign
  PUT: async (req: NextApiRequest, res: NextApiResponse) => {
    const { id } = req.query as { id: string };
    const user = await authenticateRequest(req);
    
    // Check for test mode
    const isTestMode = user.isTestMode || (user.pubkey && user.pubkey.startsWith('pk_test_'));
    
    if (isTestMode) {
      logger.info(`Test mode detected for user ${user.pubkey || user.userId}, updating test campaign ${id}`);
      
      const updateData: UpdateCampaignDto = {
        ...req.body,
        id,
      };
      
      // Use test pubkey to update campaign
      const campaign = await campaignService.updateCampaign(updateData, user.pubkey || user.userId);
      
      return res.status(200).json(campaign);
    }
    
    // For normal operation, check role access
    if (!user.currentRole || (user.currentRole !== 'advertiser' && user.currentRole !== 'admin')) {
      logger.warn(`User ${user.userId} with role ${user.currentRole} attempted to update campaign without proper role`);
      throw new ApiError(403, 'Forbidden: Advertiser role required');
    }
    
    const updateData: UpdateCampaignDto = {
      ...req.body,
      id,
    };
    
    const campaign = await campaignService.updateCampaign(updateData, user.userId);
    
    return res.status(200).json(campaign);
  },
  
  // DELETE /api/campaigns/[id] - Delete a campaign
  DELETE: async (req: NextApiRequest, res: NextApiResponse) => {
    const { id } = req.query as { id: string };
    const user = await authenticateRequest(req);
    
    // Check for test mode
    const isTestMode = user.isTestMode || (user.pubkey && user.pubkey.startsWith('pk_test_'));
    
    if (isTestMode) {
      logger.info(`Test mode detected for user ${user.pubkey || user.userId}, deleting test campaign ${id}`);
      
      // Use test pubkey to delete campaign
      await campaignService.deleteCampaign(id, user.pubkey || user.userId);
      
      return res.status(204).end();
    }
    
    // For normal operation, check role access
    if (!user.currentRole || (user.currentRole !== 'advertiser' && user.currentRole !== 'admin')) {
      logger.warn(`User ${user.userId} with role ${user.currentRole} attempted to delete campaign without proper role`);
      throw new ApiError(403, 'Forbidden: Advertiser role required');
    }
    
    await campaignService.deleteCampaign(id, user.userId);
    
    return res.status(204).end();
  },
  
  // PATCH /api/campaigns/[id] - Update campaign status
  PATCH: async (req: NextApiRequest, res: NextApiResponse) => {
    const { id } = req.query as { id: string };
    const user = await authenticateRequest(req);
    
    // Check for test mode
    const isTestMode = user.isTestMode || (user.pubkey && user.pubkey.startsWith('pk_test_'));
    
    // Validate status is a valid CampaignStatus enum value
    const { status } = req.body;
    if (!status || !Object.values(CampaignStatus).includes(status)) {
      throw new ApiError(400, 'Invalid status value');
    }
    
    if (isTestMode) {
      logger.info(`Test mode detected for user ${user.pubkey || user.userId}, updating test campaign ${id} status to ${status}`);
      
      // Use test pubkey to update campaign status
      const campaign = await campaignService.updateCampaignStatus(
        id, 
        status as CampaignStatus,
        user.pubkey || user.userId
      );
      
      return res.status(200).json(campaign);
    }
    
    // For normal operation, check role access
    if (!user.currentRole || (user.currentRole !== 'advertiser' && user.currentRole !== 'admin')) {
      logger.warn(`User ${user.userId} with role ${user.currentRole} attempted to update campaign status without proper role`);
      throw new ApiError(403, 'Forbidden: Advertiser role required');
    }
    
    const campaign = await campaignService.updateCampaignStatus(
      id, 
      status as CampaignStatus,
      user.userId
    );
    
    return res.status(200).json(campaign);
  },
});