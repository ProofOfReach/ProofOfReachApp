/**
 * User Profile API Endpoint
 * 
 * This endpoint demonstrates the enhanced role-based authentication middleware
 * by providing user profile information including roles and permissions.
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { enhancedAuthMiddleware, AuthenticatedUser } from '../../../utils/enhancedAuthMiddleware';
import { unifiedRoleService } from '../../../lib/unifiedRoleService';
import { logger } from '../../../lib/logger';

/**
 * Handler for the user profile endpoint
 */
async function handler(
  req: NextApiRequest, 
  res: NextApiResponse, 
  user: AuthenticatedUser
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Log the request for monitoring
    logger.info(`Profile request for user: ${user.pubkey}`);

    // Return the user profile with role information
    return res.status(200).json({
      profile: {
        pubkey: user.pubkey,
        userId: user.userId,
        currentRole: user.currentRole,
        availableRoles: user.roles,
        isTestMode: user.isTestMode,
        permissions: {
          canManageAdvertisements: user.roles.includes('advertiser') || user.roles.includes('admin'),
          canManagePublisherSpaces: user.roles.includes('publisher') || user.roles.includes('admin'),
          canAccessAdminDashboard: user.roles.includes('admin'),
          canViewStakeholderAnalytics: user.roles.includes('stakeholder') || user.roles.includes('admin')
        }
      }
    });
  } catch (error) {
    logger.logger.error('Error in profile endpoint:', error);
    return res.status(500).json({ error: 'An error occurred while fetching profile' });
  }
}

// Export the handler with authentication middleware
export default enhancedAuthMiddleware(handler);