/**
 * Role-based Authorization Middleware
 * 
 * This middleware integrates the centralized RoleService with API routes
 * to provide role-based access control.
 */
import { NextApiRequest, NextApiResponse } from 'next';
import { roleService } from './roleService';
import { getServerSession } from '../auth';
import { logger } from '../logger';
import { UserRoleType, RolePermissions, RoleErrorType } from './types';

/**
 * Middleware to require specific roles for API routes
 * 
 * @param roles An array of roles that are allowed to access the endpoint
 * @returns Middleware function that checks if the user has any of the specified roles
 */
export function requireRole(roles: UserRoleType[]) {
  return async (
    req: NextApiRequest,
    res: NextApiResponse,
    next: (userId: string, pubkey: string) => Promise<void>
  ) => {
    try {
      // Get user session
      const session = await getServerSession(req, res);
      
      if (!session || !session.user) {
        logger.debug('Authentication failed in role middleware - no valid session');
        return res.status(401).json({
          success: false,
          error: null as any // TODO: implement roleService.formatError(
            RoleErrorType.NOT_AUTHENTICATED, 
            'Not authenticated',
            401
          )
        });
      }
      
      // Find user by pubkey
      const pubkey = session.user.nostrPubkey;
      const userId = session.user.id;
      
      if (!pubkey || !userId) {
        logger.logger.error('Session missing pubkey or userId');
        return res.status(401).json({
          success: false,
          error: null as any // TODO: implement roleService.formatError(
            RoleErrorType.NOT_AUTHENTICATED, 
            'Invalid session data',
            401
          )
        });
      }
      
      // Get user roles
      const userRoles = await null as any // TODO: implement roleService.getUserRoles(userId);
      logger.debug(`User roles: ${userRoles.join(', ')}`);
      
      // Check if user has any of the required roles
      const hasRequiredRole = roles.some(role => userRoles.includes(role));
      
      if (!hasRequiredRole) {
        logger.warn(`Access denied for user ${userId} - required roles: ${roles.join(', ')}`);
        return res.status(403).json({
          success: false,
          error: null as any // TODO: implement roleService.formatError(
            RoleErrorType.PERMISSION_DENIED, 
            'You do not have permission to access this resource',
            403,
            { requiredRoles: roles, userRoles }
          )
        });
      }
      
      // User has the required role, proceed
      return next(userId, pubkey);
    } catch (error) {
      logger.logger.error('Role middleware error:', error);
      return res.status(500).json({
        success: false,
        error: null as any // TODO: implement roleService.formatError(
          RoleErrorType.UNKNOWN_ERROR, 
          'An error occurred while checking permissions',
          500
        )
      });
    }
  };
}

/**
 * Middleware to require specific permissions for API routes
 * 
 * @param permissions An array of permissions that are required to access the endpoint
 * @returns Middleware function that checks if the user has all specified permissions
 */
export function requirePermission(permissions: Array<keyof RolePermissions>) {
  return async (
    req: NextApiRequest,
    res: NextApiResponse,
    next: (userId: string, pubkey: string) => Promise<void>
  ) => {
    try {
      // Get user session
      const session = await getServerSession(req, res);
      
      if (!session || !session.user) {
        logger.debug('Authentication failed in permission middleware - no valid session');
        return res.status(401).json({
          success: false,
          error: null as any // TODO: implement roleService.formatError(
            RoleErrorType.NOT_AUTHENTICATED, 
            'Not authenticated',
            401
          )
        });
      }
      
      // Find user by pubkey
      const pubkey = session.user.nostrPubkey;
      const userId = session.user.id;
      
      if (!pubkey || !userId) {
        logger.logger.error('Session missing pubkey or userId');
        return res.status(401).json({
          success: false,
          error: null as any // TODO: implement roleService.formatError(
            RoleErrorType.NOT_AUTHENTICATED, 
            'Invalid session data',
            401
          )
        });
      }
      
      // Get user permissions
      const userPermissions = await null as any // TODO: implement roleService.getUserPermissions(userId);
      
      // Check if user has all required permissions
      const missingPermissions: Array<keyof RolePermissions> = [];
      
      for (const permission of permissions) {
        if (!userPermissions[permission]) {
          missingPermissions.push(permission);
        }
      }
      
      if (missingPermissions.length > 0) {
        logger.warn(`Permission denied for user ${userId} - missing: ${missingPermissions.join(', ')}`);
        return res.status(403).json({
          success: false,
          error: null as any // TODO: implement roleService.formatError(
            RoleErrorType.PERMISSION_DENIED, 
            'You do not have all required permissions',
            403,
            { requiredPermissions: permissions, missingPermissions }
          )
        });
      }
      
      // User has all required permissions, proceed
      return next(userId, pubkey);
    } catch (error) {
      logger.logger.error('Permission middleware error:', error);
      return res.status(500).json({
        success: false,
        error: null as any // TODO: implement roleService.formatError(
          RoleErrorType.UNKNOWN_ERROR, 
          'An error occurred while checking permissions',
          500
        )
      });
    }
  };
}

/**
 * Helper that builds a middleware pipeline for API routes
 * 
 * @param middlewares Array of middleware functions to execute in order
 * @returns A function that processes the request through all middlewares
 */
export function composeMiddleware(
  middlewares: Array<(req: NextApiRequest, res: NextApiResponse, next: (userId: string, pubkey: string) => Promise<void>) => Promise<void>>
) {
  return (handler: (req: NextApiRequest, res: NextApiResponse, userId: string, pubkey: string) => Promise<void>) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      // Create a function to call the next middleware
      const executeMiddleware = async (index: number, userId?: string, pubkey?: string): Promise<void> => {
        if (index >= middlewares.length) {
          // We've reached the end of the middleware chain, call the handler
          return handler(req, res, userId as string, pubkey as string);
        }
        
        // Call the current middleware with a function to call the next one
        return middlewares[index](req, res, (nextUserId: string, nextPubkey: string): Promise<void> => {
          return executeMiddleware(index + 1, nextUserId || userId, nextPubkey || pubkey);
        });
      };
      
      // Start executing middlewares
      return executeMiddleware(0);
    };
  };
}

/**
 * Middleware for admin-only API routes
 */
export const adminOnly = requireRole(['admin']);

/**
 * Middleware for advertiser-only API routes
 */
export const advertiserOnly = requireRole(['admin', 'advertiser']);

/**
 * Middleware for publisher-only API routes
 */
export const publisherOnly = requireRole(['admin', 'publisher']);

/**
 * Middleware that requires any authenticated user
 */
export const authenticatedOnly = requireRole(['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder', 'developer']);