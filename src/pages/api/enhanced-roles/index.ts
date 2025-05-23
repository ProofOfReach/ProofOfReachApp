import { NextApiRequest, NextApiResponse } from 'next';
import '@/lib/enhancedRoleService';
import '@/lib/logger';

/**
 * API endpoint to get user role data
 * 
 * GET /api/enhanced-roles
 * Returns the current user's role data
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // For testing purposes, use a test ID if no user is authenticated
    // In production, this should come from the authentication system
    const userId = req.headers['x-user-id'] as string || 'pk_test_user';
    
    // Get the user's role data
    let userData = await enhancedRoleService.getUserRoleData(userId);
    
    // If user doesn't exist yet, create them
    if (!userData) {
      userData = await enhancedRoleService.createUserWithTestMode(userId);
    }
    
    // Return success with user data
    return res.status(200).json({ 
      success: true, 
      userData
    });
  } catch (error) {
    logger.error('Error getting role data:', error);
    
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    });
  }
}