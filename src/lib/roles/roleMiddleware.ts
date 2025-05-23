/**
 * Role-based Authorization Middleware
 * 
 * This middleware integrates the centralized RoleService with API routes
 * to provide role-based access control.
 */
import { NextApiRequest, NextApiResponse } from 'next';
import { getSessionFromToken } from '../auth';
import { getRoleCapabilities } from '../accessControl';
import { errorService } from '../errorService';

type UserRole = 'viewer' | 'advertiser' | 'publisher' | 'admin' | 'stakeholder';

/**
 * Middleware to require specific roles for API routes
 * 
 * @param roles An array of roles that are allowed to access the endpoint
 * @returns Middleware function that checks if the user has any of the specified roles
 */
export function requireRole(roles: string[]) {
  return async (
    req: NextApiRequest,
    res: NextApiResponse,
    next: (userId: string, pubkey: string) => Promise<void>
  ) => {
    try {
      // Get user session
      const session = await getSessionFromToken(req);
      
      if (!session || !session.user) {
        console.log('Authentication failed in role middleware - no valid session');
        return res.status(401).json({
          success: false,
          error: 'Not authenticated'
        });
      }
      
      // Find user by pubkey
      const pubkey = session.user.nostrPubkey;
      const userId = session.user.id;
      
      if (!pubkey || !userId) {
        console.log('Session missing pubkey or userId');
        return res.status(401).json({
          success: false,
          error: 'Invalid session data'
        });
      }
      
      // Get user permissions
      const userPermissions = await getRoleCapabilities(userId);
      
      // Check if user has any of the required roles
      const hasRequiredRole = roles.some(role => {
        const permission = `access_${role}`;
        return userPermissions[permission];
      });
      
      if (!hasRequiredRole) {
        console.log(`Access denied for user ${userId} - required roles: ${roles.join(', ')}`);
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions'
        });
      }
      
      // User has the required role, proceed
      return next(userId, pubkey);
    } catch (error) {
      errorService.logError(error, 'roleMiddleware', 'auth', 'error');
      return res.status(500).json({
        success: false,
        error: 'An error occurred while checking permissions'
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
export function requirePermission(permissions: string[]) {
  return async (
    req: NextApiRequest,
    res: NextApiResponse,
    next: (userId: string, pubkey: string) => Promise<void>
  ) => {
    try {
      // Get user session
      const session = await getSessionFromToken(req);
      
      if (!session || !session.user) {
        console.log('Authentication failed in permission middleware - no valid session');
        return res.status(401).json({
          success: false,
          error: 'Not authenticated'
        });
      }
      
      // Find user by pubkey
      const pubkey = session.user.nostrPubkey;
      const userId = session.user.id;
      
      if (!pubkey || !userId) {
        console.log('Session missing pubkey or userId');
        return res.status(401).json({
          success: false,
          error: 'Invalid session data'
        });
      }
      
      // Get user permissions
      const userPermissions = await getRoleCapabilities(userId);
      
      // Check if user has all required permissions
      const missingPermissions: string[] = [];
      
      for (const permission of permissions) {
        if (!userPermissions[permission]) {
          missingPermissions.push(permission);
        }
      }
      
      if (missingPermissions.length > 0) {
        console.log(`Permission denied for user ${userId} - missing: ${missingPermissions.join(', ')}`);
        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions'
        });
      }
      
      // User has all required permissions, proceed
      return next(userId, pubkey);
    } catch (error) {
      errorService.logError(error, 'roleMiddleware', 'permission', 'error');
      return res.status(500).json({
        success: false,
        error: 'An error occurred while checking permissions'
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