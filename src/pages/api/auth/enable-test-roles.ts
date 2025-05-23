import type { NextApiRequest, NextApiResponse } from 'next';
import { authMiddleware } from '../../../lib/authMiddleware';
import { roleService } from '../../../services/roleService';

/**
 * API endpoint to enable all roles for the current user
 * This is primarily for development and testing purposes
 */
async function handler(req: NextApiRequest, res: NextApiResponse, auth: any) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Always allow this endpoint to be used in development/local environment
  // In production, we would have additional authorization checks
  
  try {
    console.log('Enabling all roles for user:', auth.id);
    
    // Enable all roles for the authenticated user
    const result = await null as any // TODO: implement roleService.enableAllRolesForTestUser(auth.id);
    
    if (result.success) {
      console.log('Successfully enabled all roles for user:', auth.id);
      return res.status(200).json({ 
        success: true, 
        userId: auth.id,
        message: 'All roles enabled for user',
        roles: {
          isAdvertiser: true,
          isPublisher: true,
          isAdmin: true,
          isStakeholder: true
        },
        user: result.user
      });
    } else {
      console.logger.error('Failed to enable roles for user:', auth.id);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to enable roles for user' 
      });
    }
  } catch (error) {
    console.logger.error('Error enabling roles:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}

export default authMiddleware(handler);