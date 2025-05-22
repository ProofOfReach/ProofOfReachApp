import { NextApiRequest, NextApiResponse } from 'next';
import { adService, UpdateAdDto } from '@/services/adService';
import { apiHandler } from '@/utils/apiHandler';
import { authenticateRequest } from '@/utils/authMiddleware';
import { ApiError } from '@/utils/apiError';
import { AdStatus } from '@prisma/client';

export default apiHandler({
  // GET /api/campaigns/[id]/ads/[adId] - Get a specific ad
  GET: async (req: NextApiRequest, res: NextApiResponse) => {
    const { id: campaignId, adId } = req.query as { id: string; adId: string };
    const user = await authenticateRequest(req);
    
    if (!user.isAdvertiser) {
      throw new ApiError(403, 'Forbidden: Advertiser role required');
    }
    
    const ad = await adService.getAd(adId, user.userId, campaignId);
    
    if (!ad) {
      throw new ApiError(404, 'Ad not found');
    }
    
    return res.status(200).json(ad);
  },
  
  // PUT /api/campaigns/[id]/ads/[adId] - Update an ad
  PUT: async (req: NextApiRequest, res: NextApiResponse) => {
    const { id: campaignId, adId } = req.query as { id: string; adId: string };
    const user = await authenticateRequest(req);
    
    if (!user.isAdvertiser) {
      throw new ApiError(403, 'Forbidden: Advertiser role required');
    }
    
    const updateData: UpdateAdDto = {
      ...req.body,
      id: adId
    };
    
    const ad = await adService.updateAd(updateData, user.userId);
    
    return res.status(200).json(ad);
  },
  
  // DELETE /api/campaigns/[id]/ads/[adId] - Delete an ad
  DELETE: async (req: NextApiRequest, res: NextApiResponse) => {
    const { id: campaignId, adId } = req.query as { id: string; adId: string };
    const user = await authenticateRequest(req);
    
    if (!user.isAdvertiser) {
      throw new ApiError(403, 'Forbidden: Advertiser role required');
    }
    
    await adService.deleteAd(adId, user.userId);
    
    return res.status(204).end();
  },
  
  // PATCH /api/campaigns/[id]/ads/[adId] - Update ad status
  PATCH: async (req: NextApiRequest, res: NextApiResponse) => {
    const { id: campaignId, adId } = req.query as { id: string; adId: string };
    const user = await authenticateRequest(req);
    
    if (!user.isAdvertiser) {
      throw new ApiError(403, 'Forbidden: Advertiser role required');
    }
    
    const { status } = req.body;
    
    // Validate status is a valid AdStatus enum value
    if (!status || !Object.values(AdStatus).includes(status)) {
      throw new ApiError(400, 'Invalid status value');
    }
    
    const ad = await adService.updateAdStatus(
      adId,
      status as AdStatus,
      user.userId
    );
    
    return res.status(200).json(ad);
  },
});