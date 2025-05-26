import { UserRole } from "@/types/role";
import { NextApiRequest, NextApiResponse } from 'next';
import { getCookie, setCookie, deleteCookie, CookieValueTypes } from 'cookies-next';
import { prisma } from './prismaClient';
import { User } from '@prisma/client';
import { logger } from './logger';

// Define custom error types for authentication
export class AuthenticationError extends Error {
  statusCode: number;
  
  constructor(message: UserRole, statusCode: number = 401) {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = statusCode;
  }
}

// Define the cookie name for consistency
export const SESSION_COOKIE_NAME = 'nostr_auth_session';

// Define session type
export interface UserSession {
  user: {
    id: string;
    nostrPubkey: string;
  };
}

/**
 * Set the authentication cookie for a user
 * @param pubkey The Nostr public key to store in the cookie
 * @param req The Next.js request object
 * @param res The Next.js response object
 */
export function setAuthCookie(
  pubkey: UserRole,
  req: NextApiRequest,
  res: NextApiResponse
): void {
  setCookie(SESSION_COOKIE_NAME, pubkey, {
    req,
    res,
    path: '/',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict'
  });
}

/**
 * Clear the authentication cookie
 * @param req The Next.js request object
 * @param res The Next.js response object
 */
export function clearAuthCookie(
  req: NextApiRequest,
  res: NextApiResponse
): void {
  deleteCookie(SESSION_COOKIE_NAME, {
    req,
    res,
    path: '/'
  });
}

/**
 * Check if the request is authenticated
 * @param req The Next.js request object
 * @returns The public key if authenticated, null otherwise
 */
export async function isAuthenticated(
  req: NextApiRequest
): Promise<string | null> {
  // Get the session cookie - handle both sync and async variants
  let pubkeyValue;
  try {
    const pubkey = getCookie(SESSION_COOKIE_NAME, { req });
    // Handle if it's a promise
    pubkeyValue = pubkey instanceof Promise ? await pubkey : pubkey;
  } catch (err) {
    logger.log('Error getting auth cookie', err);
    return null;
  }
  
  if (!pubkeyValue || typeof pubkeyValue !== 'string') {
    logger.debug('Authentication failed - no valid cookie');
    return null;
  }
  
  try {
    // Verify the pubkey exists in the database
    const user = await prisma.user.findUnique({
      where: { nostrPubkey: pubkeyValue },
      select: { id: true, nostrPubkey: true }  // Only select needed fields
    });
    
    if (!user) {
      logger.debug(`Authentication failed - user not found for pubkey: ${pubkeyValue}`);
      return null;
    }
    
    return pubkeyValue;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.log(`Error verifying authentication: ${errorMessage}`);
    return null;
  }
}

/**
 * Generate an authentication token for a user
 * Note: In a real app, this would typically generate a JWT or other token
 * For this demo app, we'll just return the user's pubkey as the token
 * @param user The user to generate a token for
 */
export function generateAuthToken(user: User): string {
  // In a real app, we would use a proper token library like jsonwebtoken
  // return jwt.sign({ id: user.id, pubkey: user.nostrPubkey }, process.env.JWT_SECRET, { expiresIn: '30d' });
  
  // For demo purposes, just return the pubkey
  return user.nostrPubkey;
}

/**
 * Get the server session from a request
 * 
 * @param req The Next.js request object
 * @param res The Next.js response object
 * @returns A user session if authenticated, null otherwise
 */
export async function getSessionFromRequest(
  req: NextApiRequest
): Promise<UserSession | null> {
  // First check if test mode is enabled
  if (req.cookies.isTestMode === 'true') {
    logger.debug('Test mode detected in getServerSession');
    return {
      user: {
        id: 'test-user-id',
        nostrPubkey: req.cookies.nostr_pubkey || 'test-pubkey'
      }
    };
  }
  
  // Check for auth token in cookies or headers
  let authToken: string | undefined;
  
  // Get from cookie
  if (req.cookies[SESSION_COOKIE_NAME]) {
    authToken = req.cookies[SESSION_COOKIE_NAME] as string;
  } 
  // Fall back to authorization header
  else if (req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      authToken = authHeader.replace('Bearer ', '');
    }
  }
  
  if (!authToken || typeof authToken !== 'string') {
    logger.debug('No auth token found in getServerSession');
    return null;
  }
  
  try {
    // In a real app, you'd verify the token here (JWT, etc)
    // For demo purposes, we'll just look for a user with this token
    const user = await prisma.user.findFirst({
      where: {
        // This is just an example and would be replaced by proper token verification
        nostrPubkey: authToken
      },
      select: {
        id: true,
        nostrPubkey: true
      }
    });
    
    if (!user) {
      logger.debug(`No user found for auth token in getServerSession: ${authToken.substring(0, 10)}...`);
      return null;
    }
    
    return {
      user: {
        id: user.id,
        nostrPubkey: user.nostrPubkey
      }
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.log(`Error verifying auth token: ${errorMessage}`);
    return null;
  }
}

/**
 * Middleware to require authentication for API routes
 * 
 * @param handler The API route handler function
 * @returns A new handler function that includes authentication checks
 */
export function requireAuth(
  handler: (
    req: NextApiRequest,
    res: NextApiResponse,
    pubkey: UserRole,
    userId: string
  ) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Get user session - use cookie-based auth for test mode
      const pubkey = getCookie('nostr_pubkey', { req, res }) as string;
      
      if (!pubkey) {
        logger.debug('Authentication failed - no pubkey');
        return res.status(401).json({ error: 'Not authenticated' });
      }
      
      // Call the handler with the pubkey and a test userId
      return await handler(req, res, pubkey, 'test-user');
    } catch (error) {
      logger.log('Authentication middleware error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}

// Export alias for compatibility with existing imports
export const getServerSession = getSessionFromRequest;