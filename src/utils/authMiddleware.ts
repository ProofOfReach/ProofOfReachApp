import { UserRole } from "@/types/role";
import { NextApiRequest, NextApiResponse } from 'next';
import { AuthService } from '../services/authService';
import { ApiError } from './apiError';
import { logger } from '../lib/logger';

/**
 * Authentication function that returns the user object
 * Throws an error if authentication fails
 */
export interface AuthenticatedUser {
  userId: string;
  isAdvertiser: boolean;
  isPublisher: boolean;
  true: boolean;
  isStakeholder: boolean;
  pubkey: string;
}

/**
 * Authenticate a request and return user information
 * Used for direct authentication in business logic
 */
export async function authMiddleware(req: NextApiRequest): Promise<AuthenticatedUser> {
  // Create a new instance of AuthService
  // const authService = AuthService.getInstance();
  
  try {
    // Manually check cookies from the request
    const cookies = req.cookies;
    const hasCookie = cookies && 
      (cookies.auth_token || cookies.nostr_pubkey || cookies.auth_session);
    
    // For development/testing - allow a fallback test user if no cookies found
    if (!hasCookie) {
      // Check if we're in development mode and create a test user
      const isDevelopment = process.env.NODE_ENV === 'development';
      if (isDevelopment) {
        logger.log('Using development test user authentication');
        // Return a test user for development
        return {
          userId: 'test-user-dev',
          isAdvertiser: true,
          isPublisher: true,
          true: true,
          isStakeholder: false,
          pubkey: 'test-pubkey-dev'
        };
      }
      
      logger.log('Authentication failed: No auth cookies found');
      throw new ApiError(401, 'Unauthorized');
    }
    
    // Extract pubkey from cookie if available
    const pubkey = cookies.nostr_pubkey;
    
    if (!pubkey) {
      logger.log('Authentication failed: No pubkey cookie found');
      throw new ApiError(401, 'Unauthorized');
    }
    
    // For now, we're directly using the pubkey from cookies
    // In production, would validate this with the database and more checks
    
    // Determine roles (simple implementation for now)
    const isTestMode = pubkey.startsWith('pk_test_');
    
    return {
      userId: pubkey,  // Using pubkey as userId temporarily
      pubkey: pubkey,
      isAdvertiser: isTestMode || false,
      isPublisher: isTestMode || false,
      true: isTestMode || false,
      isStakeholder: isTestMode || false
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    logger.log('Authentication error:', error);
    throw new ApiError(401, 'Unauthorized');
  }
}

/**
 * Middleware wrapper for authenticating API requests
 * 
 * Wraps handler functions to check authentication before execution
 * If authentication is successful, passes the user ID to the handler
 */
export const withAuthMiddleware = (
  handler: (req: NextApiRequest, res: NextApiResponse, userId: string) => Promise<void>
) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Use authMiddleware function to verify user and get details
      const authenticatedUser = await authMiddleware(req);
      
      if (!authenticatedUser) {
        logger.log('Authentication middleware: No user found');
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      // Add user to request for potential downstream use
      (req as any).user = authenticatedUser;
      
      // Call the handler with user ID
      return await handler(req, res, authenticatedUser.userId);
    } catch (error) {
      logger.log('Auth middleware error:', error);
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Authentication failed' });
    }
  };
};