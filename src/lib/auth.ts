import { NextApiRequest, NextApiResponse } from 'next';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';
import { prisma } from './prismaClient';
import { User } from '@prisma/client';
import { logger } from './logger';

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
  pubkey: string,
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
  // Get the session cookie
  const pubkey = getCookie(SESSION_COOKIE_NAME, { req });
  
  if (!pubkey || typeof pubkey !== 'string') {
    return null;
  }
  
  try {
    // Verify the pubkey exists in the database
    const user = await prisma.user.findUnique({
      where: { nostrPubkey: pubkey }
    });
    
    if (!user) {
      return null;
    }
    
    return pubkey;
  } catch (error) {
    logger.error('Error verifying authentication:', error);
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

export async function getServerSession(
  req: NextApiRequest, 
  res: NextApiResponse
): Promise<UserSession | null> {
  // First check if test mode is enabled
  if (req.cookies.isTestMode === 'true') {
    return {
      user: {
        id: 'test-user-id',
        nostrPubkey: 'test-pubkey'
      }
    };
  }
  
  // Check for auth token in cookies or headers
  const authToken = req.cookies[SESSION_COOKIE_NAME] || req.headers.authorization?.replace('Bearer ', '');
  
  if (!authToken || typeof authToken !== 'string') {
    return null;
  }
  
  try {
    // In a real app, you'd verify the token here (JWT, etc)
    // For demo purposes, we'll just look for a user with this token
    const user = await prisma.user.findFirst({
      where: {
        // This is just an example and would be replaced by proper token verification
        nostrPubkey: authToken
      }
    });
    
    if (!user) {
      return null;
    }
    
    return {
      user: {
        id: user.id,
        nostrPubkey: user.nostrPubkey
      }
    };
  } catch (error) {
    logger.error('Error verifying auth token:', error);
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
    pubkey: string,
    userId: string
  ) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Get user session
      const session = await getServerSession(req, res);
      
      if (!session || !session.user) {
        logger.debug('Authentication failed - no session');
        return res.status(401).json({ error: 'Not authenticated' });
      }
      
      // Call the handler with the pubkey and userId
      return await handler(req, res, session.user.nostrPubkey, session.user.id);
    } catch (error) {
      logger.error('Authentication middleware error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}