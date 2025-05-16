import { NextApiRequest, NextApiResponse } from 'next';
import { campaignService, CreateCampaignDto } from '../../../services/campaignService';
import { apiHandler } from '../../../utils/apiHandler';
import { authenticateRequest } from '../../../utils/enhancedAuthMiddleware';
import { ApiError } from '../../../utils/apiError';
import { logger } from '../../../lib/logger';

export default apiHandler({
  // GET /api/campaigns - Get all campaigns for the authenticated user
  GET: async (req: NextApiRequest, res: NextApiResponse) => {
    const user = await authenticateRequest(req);
    
    // Check for test mode
    const isTestMode = user.isTestMode || (user.pubkey && user.pubkey.startsWith('pk_test_'));
    
    if (isTestMode) {
      logger.info(`Test mode detected for user ${user.pubkey || user.userId}, serving test campaigns`);
      // Use the test user ID to get campaigns in test mode
      const campaigns = await campaignService.getCampaignsByAdvertiser(user.pubkey || user.userId);
      return res.status(200).json(campaigns);
    }
    
    // For normal operation, check role access
    if (!user.currentRole || (user.currentRole !== 'advertiser' && user.currentRole !== 'admin')) {
      logger.warn(`User ${user.userId} with role ${user.currentRole} attempted to access advertiser-only endpoint`);
      throw new ApiError(403, 'Forbidden: Advertiser role required');
    }
    
    const campaigns = await campaignService.getCampaignsByAdvertiser(user.userId);
    
    return res.status(200).json(campaigns);
  },
  
  // POST /api/campaigns - Create a new campaign
  POST: async (req: NextApiRequest, res: NextApiResponse) => {
    const user = await authenticateRequest(req);
    
    // Check for test mode
    const isTestMode = user.isTestMode || (user.pubkey && user.pubkey.startsWith('pk_test_'));
    
    if (isTestMode) {
      logger.info(`Test mode detected for user ${user.pubkey || user.userId}, creating test campaign`);
      
      const campaignData: CreateCampaignDto = req.body;
      
      // Validate required fields
      if (!campaignData.name || !campaignData.startDate || !campaignData.budget) {
        throw new ApiError(400, 'Missing required fields: name, startDate, budget');
      }
      
      // Create the campaign using test user ID
      const campaign = await campaignService.createCampaign(user.pubkey || user.userId, campaignData);
      
      return res.status(201).json(campaign);
    }
    
    // For normal operation, check role access
    if (!user.currentRole || (user.currentRole !== 'advertiser' && user.currentRole !== 'admin')) {
      logger.warn(`User ${user.userId} with role ${user.currentRole} attempted to access advertiser-only endpoint`);
      throw new ApiError(403, 'Forbidden: Advertiser role required');
    }
    
    const campaignData: CreateCampaignDto = req.body;
    
    // Validate required fields
    if (!campaignData.name || !campaignData.startDate || !campaignData.budget) {
      throw new ApiError(400, 'Missing required fields: name, startDate, budget');
    }
    
    // Create the campaign
    const campaign = await campaignService.createCampaign(user.userId, campaignData);
    
    return res.status(201).json(campaign);
  },
});