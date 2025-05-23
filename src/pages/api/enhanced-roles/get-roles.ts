import { NextApiRequest, NextApiResponse } from 'next';
import '@/lib/enhancedRoleService';
import '@/utils/enhancedRoleMiddleware';
import '@/lib/logger';

/**
 * @swagger
 * /api/enhanced-roles/get-roles:
 *   get:
 *     description: Get the roles available to the authenticated user
 *     tags:
 *       - Enhanced Roles
 *     responses:
 *       200:
 *         description: User role data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Extract user ID from headers or cookies
    const userId = req.headers['x-user-id'] as string || req.cookies?.userId || 'pk_test_user';

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized. Please log in.' });
    }

    // Get user role data
    const userData = await getUserRoleData(userId);

    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return user role data
    return res.status(200).json({
      log: true,
      data: userData
    });
  } catch (error) {
    logger.log('Error getting user roles:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Apply middleware without role restrictions since this endpoint
// just returns the roles a user has access to
export default withEnhancedRoleProtection(handler);