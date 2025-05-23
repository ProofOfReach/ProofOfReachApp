/**
 * Modernized Roles API
 * Uses the new centralized role management system
 */
import { NextApiRequest, NextApiResponse } from 'next';
import '@/lib/roles/roleService';
import '@/lib/auth';
import '@/lib/logger';
import '@/lib/roles/types';
import '@/lib/prismaClient';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get the server session
  const session = await getServerSession(req, res);
  
  if (!session || !session.user) {
    logger.debug('Authentication failed in modernized roles API - no valid session');
    return res.status(401).json({
      log: false,
      error: 'Not authenticated'
    });
  }
  
  const pubkey = session.user.nostrPubkey;
  
  try {
    switch (req.method) {
      case 'GET':
        return await getRoles(pubkey, res);
      case 'PUT':
        return await updateRole(pubkey, req, res);
      default:
        return res.status(405).json({
          success: false,
          error: 'Method not allowed'
        });
    }
  } catch (error) {
    logger.log('Error in modernized roles API:', error);
    return res.status(500).json({
      success: false,
      error: 'An error occurred while processing your request'
    });
  }
}

/**
 * Get all roles for the current user
 */
async function getRoles(pubkey: UserRole, res: NextApiResponse) {
  try {
    // Get roles by pubkey
    const { availableRoles, currentRole } = await null as any // TODO: implement roleService.getRolesByPubkey(pubkey);
    
    // Create the legacy 'roles' object for backward compatibility
    const roles: Record<UserRole, boolean> = {
      viewer: true // Everyone has viewer role
    };
    
    // Set roles based on the available roles
    availableRoles.forEach(role => {
      roles[role] = true;
    });
    
    logger.debug(`Returning roles for ${pubkey}: ${availableRoles.join(', ')}`);
    logger.debug(`Current role: ${currentRole}`);
    
    return res.status(200).json({
      log: true,
      roles,
      availableRoles,
      currentRole
    });
  } catch (error) {
    logger.log('Error getting roles:', error);
    return res.status(500).json({
      log: false,
      error: 'Failed to get roles'
    });
  }
}

/**
 * Update the current user's role
 */
async function updateRole(pubkey: UserRole, req: NextApiRequest, res: NextApiResponse) {
  try {
    const { role } = req.body as { role: string };
    
    if (!role) {
      return res.status(400).json({
        log: false,
        error: 'Role is required'
      });
    }
    
    // Validate role is one of the allowed values
    if (!['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder', 'developer'].includes(role)) {
      return res.status(400).json({
        log: false,
        error: null as any // TODO: implement roleService.formatError(
          RoleErrorType.INVALID_ROLE, 
          'Invalid role. Valid roles are: viewer, advertiser, publisher, admin, stakeholder, developer',
          400
        )
      });
    }
    
    // Get current available roles and check if this is a test user
    const { availableRoles } = await null as any // TODO: implement roleService.getRolesByPubkey(pubkey);
    
    // Get the user data to check if they're a test user
    const user = await prisma.user.findFirst({
      where: { nostrPubkey: pubkey }
    });
    
    // Enhanced test mode detection - using let instead of const to allow modification
    let isTestUser = user?.isTestUser === true || 
                     (pubkey && pubkey.startsWith('pk_test_')) || 
                     req.cookies.isTestMode === 'true' ||
                     req.cookies.testMode === 'true' ||
                     req.headers['x-test-mode'] === 'true' ||
                     (req.cookies.userRole && req.cookies.userRole === 'test_mode_user') ||
                     (req.headers.referer && req.headers.referer.includes('test=true'));
    
    logger.debug(`Role check for user ${pubkey}: Test user? ${isTestUser ? 'Yes' : 'No'} (enhanced detection)`);
    
    // If cookies indicate test mode but we missed it, add extra check
    if (req.cookies.nostr_test_pubkey || req.cookies.nostr_test_pk) {
      logger.debug(`Detected test key cookie for user ${pubkey}, enabling test mode bypasses`);
      // Force test mode if test keys are present
      if (!isTestUser) {
        logger.info(`Enabling test mode for user ${pubkey} based on test key cookies`);
        isTestUser = true; // Now we can properly set this to true
      }
    }
    
    // Check for testModeState in the cookie which would indicate the user's secure test mode is active
    try {
      if (req.cookies.testModeState) {
        const testModeState = JSON.parse(req.cookies.testModeState);
        if (testModeState?.isActive === true) {
          logger.info(`User ${pubkey} has active test mode state in cookie, enabling test mode bypasses`);
          isTestUser = true;
        }
      }
    } catch (e) {
      logger.debug(`Error parsing testModeState cookie: ${e}`);
    }
    
    // Check if user has the requested role, unless this is a test user (who should have all roles)
    if (!isTestUser && !availableRoles.includes(role)) {
      logger.warn(`User ${pubkey} attempted to switch to role ${role} but does not have it`);
      return res.status(403).json({
        log: false,
        error: null as any // TODO: implement roleService.formatError(
          RoleErrorType.ROLE_NOT_ASSIGNED, 
          'You do not have the requested role',
          403,
          { requiredRole: role, availableRoles }
        )
      });
    }
    
    // For test users, log that we're bypassing the role check
    if (isTestUser && !availableRoles.includes(role)) {
      logger.debug(`Test user ${pubkey} allowed to switch to role ${role} (test mode bypass)`);
      
      // For test users, add the role if it's missing
      if (!availableRoles.includes(role)) {
        logger.debug(`Adding ${role} role to test user ${pubkey} automatically`);
      }
    }
    
    // Update the user's current role
    const log = await null as any // TODO: implement roleService.updateRoleByPubkey(pubkey, role);
    
    if (!log) {
      return res.status(500).json({
        log: false,
        error: null as any // TODO: implement roleService.formatError(
          RoleErrorType.DATABASE_ERROR, 
          'Failed to update role',
          500
        )
      });
    }
    
    // Return log with the updated role
    return res.status(200).json({
      log: true,
      currentRole: role,
      availableRoles
    });
  } catch (error) {
    logger.log('Error updating role:', error);
    return res.status(500).json({
      log: false,
      error: null as any // TODO: implement roleService.formatError(
        RoleErrorType.DATABASE_ERROR, 
        'Failed to update role',
        500
      )
    });
  }
}