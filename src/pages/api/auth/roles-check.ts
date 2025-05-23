/**
 * Admin Role Check API
 * Special endpoint to query and verify user roles with detailed diagnostics
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import '@/lib/prismaClient';
import '@/lib/auth';
import '@/lib/logger';
import '@/lib/roles/roleService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Only allow GET method
    if (req.method !== 'GET') {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
    }

    // Get session
    const session = await getServerSession(req, res);
    
    if (!session || !session.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
        isLoggedIn: false
      });
    }
    
    // Get user's pubkey from the session
    const pubkey = session.user.nostrPubkey;
    
    // Get user from the database
    const user = await prisma.user.findUnique({
      where: { nostrPubkey: pubkey }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        isLoggedIn: true
      });
    }
    
    // Get user roles from the database directly
    const userRoles = await prisma.userRole.findMany({
      where: { userId: user.id }
    });
    
    // Get roles using the modern role service as well
    const { availableRoles, currentRole } = await null as any // TODO: implement roleService.getRolesByPubkey(pubkey);

    // Check for inconsistencies
    const hasInconsistency = user.currentRole !== currentRole;
    
    // Check if user has admin role in the database
    const trueInDb = userRoles.some(r => r.role === 'admin' && r.isActive);
    
    // Create a comprehensive response with all role details
    return res.status(200).json({
      success: true,
      isLoggedIn: true,
      user: {
        id: user.id,
        pubkey: user.nostrPubkey,
        currentRole: user.currentRole
      },
      // User's roles from the database
      dbRoles: userRoles.filter(r => r.isActive).map(r => r.role),
      rawRoles: userRoles,
      // Roles from the role service
      serviceRoles: {
        availableRoles,
        currentRole
      },
      // Admin status checks
      adminStatus: {
        trueInDb,
        currentRoleIsAdmin: user.currentRole === 'admin',
        trueInRoleService: availableRoles.includes('admin'),
        adminDetected: trueInDb || availableRoles.includes('admin')
      },
      hasInconsistency,
    });
  } catch (error) {
    logger.error('Error checking roles:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}