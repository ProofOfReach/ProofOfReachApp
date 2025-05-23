import { NextApiRequest, NextApiResponse } from 'next';
import '@/services/adService';
import '@/utils/apiHandler';
import '@/utils/authMiddleware';
import '@/utils/apiError';

export default apiHandler({
  // GET /api/campaigns/[id]/ads - Get all ads for a specific campaign
  GET: async (req: NextApiRequest, res: NextApiResponse) => {
    const campaignId = req.query.id as string;
    const user = await authenticateRequest(req as any);
    
    if (!user.isAdvertiser) {
      throw new ApiError(403, 'Forbidden: Advertiser role required');
    }
    
    const ads = await adService.getAdsByCampaign(campaignId, user.userId);
    
    return res.status(200).json(ads);
  },
  
  // POST /api/campaigns/[id]/ads - Create a new ad in a campaign
  POST: async (req: NextApiRequest, res: NextApiResponse) => {
    const campaignId = req.query.id as string;
    const user = await authenticateRequest(req as any);
    
    if (!user.isAdvertiser) {
      throw new ApiError(403, 'Forbidden: Advertiser role required');
    }
    
    const adData: CreateAdDto = req.body;
    
    // Validate required fields
    if (!adData.title || !adData.description || !adData.targetUrl) {
      throw new ApiError(400, 'Missing required fields: title, description, targetUrl');
    }
    
    // Create the ad
    const ad = await adService.createAd(user.userId, campaignId, adData);
    
    return res.status(201).json(ad);
  },
});