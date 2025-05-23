import { NextApiRequest, NextApiResponse } from 'next';
import.*./lib/enhancedRoleService';
import.*./lib/logger';
import.*./utils/roleNormalizer';

/**
 * API endpoint to change a user's role
 * 
 * POST /api/enhanced-roles/change
 * Changes the current user's active role
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // For testing purposes, use a test ID if no user is authenticated
    // In production, this should come from the authentication system
    const userId = req.headers['x-user-id'] as string || 'pk_test_user';
    
    // Get the role from the request body
    const { role } = req.body;
    
    // Validate role
    if (!role || (typeof role !== 'string')) {
      return res.status(400).json({ 
        success: false, 
        error: 'Role is required and must be a string' 
      });
    }
    
    // Normalize the role (convert 'viewer' to 'viewer')
    const normalizedRole = normalizeRole(role);
    
    // Allow only valid roles
    const validRoles: RoleType[] = ['viewer', 'admin', 'advertiser', 'publisher', 'developer', 'stakeholder'];
    if (!validRoles.includes(normalizedRole as RoleType)) {
      return res.status(400).json({ 
        success: false, 
        error: `Invalid role: ${normalizedRole}. Valid roles are: ${validRoles.join(', ')}` 
      });
    }
    
    // Change the user's role
    const userData = await enhancedRoleService.changeUserRole(userId, normalizedRole as RoleType);
    
    // Return success with updated user data
    return res.status(200).json({ 
      success: true, 
      userData
    });
  } catch (error) {
    logger.logger.error('Error changing role:', error);
    
    // Special error handling for known error types
    if (error instanceof Error && error.message.includes('does not have access to role')) {
      return res.status(403).json({ 
        success: false, 
        error: error.message
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    });
  }
}