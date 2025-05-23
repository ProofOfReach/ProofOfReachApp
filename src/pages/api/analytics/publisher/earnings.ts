import { NextApiRequest, NextApiResponse } from 'next';
import "./lib/auth';
import "./utils/chartHelpers';
import "./services/analyticsService';
// Import from utils wrapper to avoid ESM compatibility issues
import "./utils/dateUtils';

// API handler for fetching publisher earnings data
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return await requireAuth(async (req, res, pubkey, userId) => {
    try {
      // Get date range from query params
      let { start, end } = req.query;
      
      // Default to last 7 days if not provided
      const today = new Date();
      const defaultStart = new Date();
      defaultStart.setDate(today.getDate() - 6); // Last 7 days (including today)
      
      const startDate = start ? new Date(start as string) : defaultStart;
      const endDate = end ? new Date(end as string) : today;
      
      // Calculate number of days in the range
      const daysDiff = getDaysDifference(endDate, startDate) + 1;
      
      // In a real implementation, this would fetch data from the database
      // For now, generate sample data
      const data = generateChartData(daysDiff, ['earnings', 'impressions', 'clicks'], [250, 350, 8]);
      
      res.status(200).json(data);
    } catch (error) {
      console.logger.error('Error in publisher/earnings:', error);
      res.status(500).json({ error: 'Failed to fetch earnings data' });
    }
  });
}