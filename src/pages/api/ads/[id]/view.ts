import { NextApiRequest, NextApiResponse } from 'next';
import { logger } from '../../../../lib/logger';

// Demo mode - store ad views in memory
const demoAdViews = new Map<string, Set<string>>();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the ad ID from the URL parameter
    const adId = req.query.id as string;
    
    // For demo purposes, we'll use a simple in-memory tracking system
    // In production, this would use the database and proper authentication
    
    // Create a unique ID for this view (we'd normally use the user's pubkey)
    const viewerId = req.headers['user-agent'] || 'anonymous';
    
    // Create a set for this ad if it doesn't exist
    if (!demoAdViews.has(adId)) {
      demoAdViews.set(adId, new Set());
    }
    
    const adViewers = demoAdViews.get(adId)!;
    const hasViewedBefore = adViewers.has(viewerId);
    
    // Demo frequency cap settings
    const freqCapViews = 2; // Allow 2 views per time period
    const freqCapHours = 1; // 1 hour time period
    
    // For demo, we'll always allow the view, but record it
    adViewers.add(viewerId);
    
    // Return success with view information
    return res.status(200).json({
      adId,
      allowed: true, // Always allow in demo mode
      viewsRemaining: hasViewedBefore ? freqCapViews - 1 : freqCapViews,
      totalViews: adViewers.size,
      periodHours: freqCapHours,
    });
  } catch (err) {
    logger.error('Error recording ad view:', err);
    return res.status(500).json({ error: 'Failed to record ad view' });
  }
}