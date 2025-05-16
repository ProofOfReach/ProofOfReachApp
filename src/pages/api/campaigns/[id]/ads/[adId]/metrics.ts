import { NextApiRequest, NextApiResponse } from 'next';
import { adService } from '../../../../../../../services/adService';
import { apiHandler } from '../../../../../../../utils/apiHandler';
import { authenticateRequest } from '../../../../../../../utils/authMiddleware';
import { ApiError } from '../../../../../../../utils/apiError';

export default apiHandler({
  // GET /api/campaigns/[id]/ads/[adId]/metrics - Get metrics for a specific ad
  GET: async (req: NextApiRequest, res: NextApiResponse) => {
    const { adId } = req.query as { adId: string };
    const user = await authenticateRequest(req);
    
    if (!user.isAdvertiser) {
      throw new ApiError(403, 'Forbidden: Advertiser role required');
    }
    
    const metrics = await adService.getAdMetrics(adId, user.userId);
    
    return res.status(200).json(metrics);
  },
});