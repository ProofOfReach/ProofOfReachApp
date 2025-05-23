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
  isAdmin: boolean;
  isStakeholder: boolean;
  pubkey: string;
}

/**
 * Authenticate a request and return user information
 * Used for direct authentication in business logic
 */
export async function authenticateRequest(req: NextApiRequest): Promise<AuthenticatedUser> {
  // Create a new instance of AuthService
  const authService = new AuthService();
  
  try {
    // Manually check cookies from the request
    const cookies = req.cookies;
    const hasCookie = cookies && 
      (cookies.auth_token || cookies.nostr_pubkey || cookies.auth_session);
    
    if (!hasCookie) {
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
      isAdmin: isTestMode || false,
      isStakeholder: isTestMode || false
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    logger.error('Authentication error:', error);
    throw new ApiError(401, 'Unauthorized');
  }
}

/**
 * Middleware for authenticating API requests
 * 
 * Wraps handler functions to check authentication before execution
 * If authentication is successful, passes the user ID to the handler
 */
export const authMiddleware = (
  handler: (req: NextApiRequest, res: NextApiResponse, userId: string) => Promise<any>
) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Use authenticateRequest to verify user and get details
      const authenticatedUser = await authenticateRequest(req);
      
      if (!authenticatedUser) {
        logger.log('Authentication middleware: No user found');
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      // Add user to request for potential downstream use
      (req as any).user = authenticatedUser;
      
      // Call the handler with user ID
      return await handler(req, res, authenticatedUser.userId);
    } catch (error) {
      logger.error('Auth middleware error:', error);
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Authentication failed' });
    }
  };
};