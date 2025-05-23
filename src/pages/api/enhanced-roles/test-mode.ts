import { NextApiRequest, NextApiResponse } from 'next';
import '@/lib/enhancedRoleService';
import '@/utils/enhancedRoleMiddleware';
import '@/lib/logger';

/**
 * @swagger
 * /api/enhanced-roles/test-mode:
 *   get:
 *     description: Check if test mode is enabled for a user
 *     tags:
 *       - Enhanced Roles
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Test mode status
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 *   post:
 *     description: Create a new user with test mode enabled
 *     tags:
 *       - Enhanced Roles
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: User created or updated with test mode enabled
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      // Check if test mode is enabled for a user
      const { userId } = req.query;
      
      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ error: 'Invalid or missing userId parameter' });
      }
      
      const isTestMode = await isTestModeEnabled(userId);
      
      return res.status(200).json({
        success: true,
        isTestMode
      });
    } else if (req.method === 'POST') {
      // Create a new user with test mode enabled
      const { userId } = req.body;
      
      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ error: 'Invalid or missing userId in request body' });
      }
      
      // Only allow in non-production environments
      const isProduction = process.env.NODE_ENV === 'production';
      if (isProduction) {
        return res.status(403).json({ 
          error: 'Test mode is not available in production',
          message: 'Test mode is only available in development/test environments'
        });
      }
      
      const userData = await createUserWithTestMode(userId);
      
      return res.status(200).json({
        success: true,
        message: 'Test mode enabled successfully',
        data: userData
      });
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    logger.error('Error handling test mode:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}