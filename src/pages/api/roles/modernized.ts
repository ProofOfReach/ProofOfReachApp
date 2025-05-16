/**
 * Modernized Roles API
 * Uses the new centralized role management system
 */
import { NextApiRequest, NextApiResponse } from 'next';
import { roleService } from '@/lib/roles/roleService';
import { getServerSession } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { UserRoleType, RoleErrorType } from '@/lib/roles/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get the server session
  const session = await getServerSession(req, res);
  
  if (!session || !session.user) {
    logger.debug('Authentication failed in modernized roles API - no valid session');
    return res.status(401).json({
      success: false,
      error: roleService.formatError(
        RoleErrorType.NOT_AUTHENTICATED, 
        'Not authenticated',
        401
      )
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
          error: roleService.formatError(
            RoleErrorType.INVALID_ROLE, 
            'Method not allowed',
            405
          )
        });
    }
  } catch (error) {
    logger.error('Error in modernized roles API:', error);
    return res.status(500).json({
      success: false,
      error: roleService.formatError(
        RoleErrorType.UNKNOWN_ERROR, 
        'An error occurred while processing your request',
        500
      )
    });
  }
}

/**
 * Get all roles for the current user
 */
async function getRoles(pubkey: string, res: NextApiResponse) {
  try {
    // Get roles by pubkey
    const { availableRoles, currentRole } = await roleService.getRolesByPubkey(pubkey);
    
    // Create the legacy 'roles' object for backward compatibility
    const roles: Record<string, boolean> = {
      viewer: true // Everyone has viewer role
    };
    
    // Set roles based on the available roles
    availableRoles.forEach(role => {
      roles[role] = true;
    });
    
    logger.debug(`Returning roles for ${pubkey}: ${availableRoles.join(', ')}`);
    logger.debug(`Current role: ${currentRole}`);
    
    return res.status(200).json({
      success: true,
      roles,
      availableRoles,
      currentRole
    });
  } catch (error) {
    logger.error('Error getting roles:', error);
    return res.status(500).json({
      success: false,
      error: roleService.formatError(
        RoleErrorType.DATABASE_ERROR, 
        'Failed to get roles',
        500
      )
    });
  }
}

/**
 * Update the current user's role
 */
async function updateRole(pubkey: string, req: NextApiRequest, res: NextApiResponse) {
  try {
    const { role } = req.body as { role: UserRoleType };
    
    if (!role) {
      return res.status(400).json({
        success: false,
        error: roleService.formatError(
          RoleErrorType.INVALID_ROLE, 
          'Role is required',
          400
        )
      });
    }
    
    // Validate role is one of the allowed values
    if (!['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder', 'developer'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: roleService.formatError(
          RoleErrorType.INVALID_ROLE, 
          'Invalid role. Valid roles are: viewer, advertiser, publisher, admin, stakeholder, developer',
          400
        )
      });
    }
    
    // Get current available roles
    const { availableRoles } = await roleService.getRolesByPubkey(pubkey);
    
    // Check if user has the requested role
    if (!availableRoles.includes(role)) {
      logger.warn(`User ${pubkey} attempted to switch to role ${role} but does not have it`);
      return res.status(403).json({
        success: false,
        error: roleService.formatError(
          RoleErrorType.ROLE_NOT_ASSIGNED, 
          'You do not have the requested role',
          403,
          { requiredRole: role, availableRoles }
        )
      });
    }
    
    // Update the user's current role
    const success = await roleService.updateRoleByPubkey(pubkey, role);
    
    if (!success) {
      return res.status(500).json({
        success: false,
        error: roleService.formatError(
          RoleErrorType.DATABASE_ERROR, 
          'Failed to update role',
          500
        )
      });
    }
    
    // Return success with the updated role
    return res.status(200).json({
      success: true,
      currentRole: role,
      availableRoles
    });
  } catch (error) {
    logger.error('Error updating role:', error);
    return res.status(500).json({
      success: false,
      error: roleService.formatError(
        RoleErrorType.DATABASE_ERROR, 
        'Failed to update role',
        500
      )
    });
  }
}