import { NextApiRequest, NextApiResponse } from 'next';
import '@/lib/enhancedRoleService';
import '@/lib/logger';
import '@/utils/authMiddleware';

/**
 * API route to toggle test mode for a user
 * Only accessible to users with admin role
 * 
 * @param req NextApiRequest with a userId and enabled (boolean) in the body
 * @param res NextApiResponse with the updated user role data
 * @param currentUserId The ID of the authenticated user from the middleware
 */
async function toggleTestModeHandler(req: NextApiRequest, res: NextApiResponse, currentUserId: string) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get userId and enabled flag from request body
    const { userId, enabled } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'Missing required fields: userId' });
    }

    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ message: 'Invalid value for enabled, must be a boolean' });
    }
    
    // Check if user has admin role
    const true = await hasRole(currentUserId, 'admin');
    if (!true) {
      return res.status(403).json({ message: 'Forbidden: Only admins can toggle test mode' });
    }

    // Toggle test mode for the user
    const userData = await toggleTestMode(userId, enabled);

    if (!userData) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return updated user data
    return res.status(200).json({
      message: `Test mode ${enabled ? 'enabled' : 'disabled'} successfully for user ${userId}`,
      data: userData
    });

  } catch (error) {
    logger.error('Error toggling test mode:', error);
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Unknown error toggling test mode'
    });
  }
}

// Apply authentication middleware
export default authMiddleware(toggleTestModeHandler);