import { NextApiRequest, NextApiResponse } from 'next';
import { enableAllRoles } from '@/lib/enhancedRoleService';
import { withEnhancedRoleProtection } from '@/utils/enhancedRoleMiddleware';
import logger from '@/lib/logger';

/**
 * @swagger
 * /api/enhanced-roles/enable-all:
 *   post:
 *     description: Enable all roles for the current user (test mode only)
 *     tags:
 *       - Enhanced Roles
 *     responses:
 *       200:
 *         description: All roles enabled successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized for this action
 *       500:
 *         description: Server error
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Extract user ID from headers or cookies
    const userId = req.headers['x-user-id'] as string || req.cookies?.userId || 'pk_test_user';

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized. Please log in.' });
    }

    // This endpoint should be restricted in production
    // In a real-world app, check for admin rights or environment
    const isProduction = process.env.NODE_ENV === 'production';
    if (isProduction) {
      return res.status(403).json({ 
        error: 'This action is not allowed in production',
        message: 'Enabling all roles is only available in development/test environments'
      });
    }

    // Enable all roles for the user
    const updatedUserData = await enableAllRoles(userId);
    
    return res.status(200).json({
      success: true,
      message: 'All roles enabled successfully',
      data: updatedUserData
    });
  } catch (error) {
    logger.error('Error enabling all roles:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Apply middleware with no role restrictions
// In production, this would be restricted to admins
export default withEnhancedRoleProtection(handler);