import { NextApiRequest, NextApiResponse } from 'next';
import { changeUserRole, RoleType } from '@/lib/enhancedRoleService';
import { withEnhancedRoleProtection } from '@/utils/enhancedRoleMiddleware';
import logger from '@/lib/logger';

/**
 * @swagger
 * /api/enhanced-roles/change-role:
 *   post:
 *     description: Change the user's active role
 *     tags:
 *       - Enhanced Roles
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, admin, advertiser, publisher, developer, stakeholder]
 *     responses:
 *       200:
 *         description: Role changed successfully
 *       400:
 *         description: Invalid role or missing parameter
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not allowed to switch to requested role
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

    // Get role from request body
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ error: 'Role parameter is required' });
    }

    // Validate role
    const validRoles: (RoleType | 'user')[] = ['user', 'admin', 'advertiser', 'publisher', 'developer', 'stakeholder'];
    if (!validRoles.includes(role as RoleType | 'user')) {
      return res.status(400).json({ 
        error: 'Invalid role',
        validRoles
      });
    }

    // Change user role
    try {
      const updatedUserData = await changeUserRole(userId, role);
      
      return res.status(200).json({
        success: true,
        message: `Role changed to ${role} successfully`,
        data: updatedUserData
      });
    } catch (error: any) {
      if (error.message.includes('does not have access to role')) {
        return res.status(403).json({ 
          error: `You don't have access to the ${role} role.`,
          message: error.message 
        });
      }
      throw error;
    }
  } catch (error) {
    logger.error('Error changing user role:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Apply middleware without role restrictions since any authenticated user
// should be able to switch between their available roles
export default withEnhancedRoleProtection(handler);