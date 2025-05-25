import { UserRole } from "@/types/role";
import { NextApiRequest, NextApiResponse } from 'next';
import { GetServerSidePropsContext } from 'next';
import '@/lib/enhancedRoleService';
// import '@/lib/prisma';
import { logger } from '@/lib/logger';

type NextHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

interface EnhancedRoleMiddlewareOptions {
  allowedRoles?: RoleType[];
  unauthorized?: (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
}

/**
 * Middleware to protect API routes based on user roles
 * 
 * @param handler The next handler
 * @param options Middleware options
 * @returns Handler function with role-based middleware applied
 */
export function withEnhancedRoleProtection(
  handler: NextHandler,
  options: EnhancedRoleMiddlewareOptions = {}
): NextHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Extract user ID from headers or cookies
      // This depends on your authentication strategy
      const userId = req.headers['x-user-id'] as string || req.cookies?.userId || 'pk_test_user';
      
      if (!userId) {
        const defaultUnauthorized = async (req: NextApiRequest, res: NextApiResponse) => {
          return res.status(401).json({ error: 'Unauthorized. Please log in.' });
        };
        
        const unauthorizedHandler = options.unauthorized || defaultUnauthorized;
        return await unauthorizedHandler(req, res);
      }
      
      // If no allowed roles specified, just check if user exists
      if (!options.allowedRoles || options.allowedRoles.length === 0) {
        return await handler(req, res);
      }
      
      // Check if user has any of the allowed roles
      let hasAllowedRole = false;
      
      for (const role of options.allowedRoles) {
        if (await hasRole(userId, role)) {
          hasAllowedRole = true;
          break;
        }
      }
      
      if (!hasAllowedRole) {
        const defaultUnauthorized = async (req: NextApiRequest, res: NextApiResponse) => {
          return res.status(403).json({ 
            error: 'Access denied. Insufficient privileges.',
            requiredRoles: options.allowedRoles 
          });
        };
        
        const unauthorizedHandler = options.unauthorized || defaultUnauthorized;
        return await unauthorizedHandler(req, res);
      }
      
      // User has at least one of the required roles, continue
      return await handler(req, res);
    } catch (error) {
      logger.log('Error in enhanced role middleware:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}

interface ServerSidePropsContext extends GetServerSidePropsContext {
  req: {
    headers: {
      'x-user-id'?: string;
    },
    cookies: {
      userId?: string;
    }
  } & NextApiRequest;
}

/**
 * Higher-order function to protect server-rendered pages based on user roles
 * 
 * @param allowedRoles Array of roles that can access the page
 * @returns Redirect object if not authorized, or props if authorized
 */
export function withEnhancedRoleCheck(allowedRoles: RoleType[] = []) {
  return async (context: ServerSidePropsContext) => {
    try {
      // Extract user ID from headers or cookies
      const userId = context.req.headers['x-user-id'] as string || 
                    context.req.cookies?.userId || 
                    'pk_test_user';
      
      // If no user ID, redirect to login
      if (!userId) {
        return {
          redirect: {
            destination: '/auth/login?returnUrl=' + encodeURIComponent(context.resolvedUrl),
            permanent: false,
          },
        };
      }
      
      // If no allowed roles specified, just check if user exists
      if (!allowedRoles || allowedRoles.length === 0) {
        return {
          props: {},
        };
      }
      
      // Check if user has any of the allowed roles
      let hasAllowedRole = false;
      
      for (const role of allowedRoles) {
        if (await hasRole(userId, role)) {
          hasAllowedRole = true;
          break;
        }
      }
      
      // If user doesn't have any of the required roles, redirect to access denied page
      if (!hasAllowedRole) {
        return {
          redirect: {
            destination: '/access-denied?requiredRoles=' + encodeURIComponent(allowedRoles.join(',')),
            permanent: false,
          },
        };
      }
      
      // User has at least one of the required roles, continue
      return {
        props: {},
      };
    } catch (error) {
      logger.log('Error in enhanced role check:', error);
      
      // On error, redirect to an error page
      return {
        redirect: {
          destination: '/error?message=' + encodeURIComponent('Failed to check authorization'),
          permanent: false,
        },
      };
    }
  };
}