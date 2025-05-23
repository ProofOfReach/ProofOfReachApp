import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from './prismaClient';
import { SESSION_COOKIE_NAME } from './auth';

// Type for the authenticated request handler
type AuthenticatedHandler = (
  req: NextApiRequest, 
  res: NextApiResponse,
  auth: { 
    id: string;
    nostrPubkey: string;
    isAdvertiser: boolean;
    isPublisher: boolean;
    isAdmin: boolean;
    isStakeholder: boolean;
    isTestMode?: boolean;
  }
) => Promise<void> | void;

/**
 * Middleware to authenticate requests based on either:
 * 1. API key in header
 * 2. Cookie-based auth (from Nostr login)
 * 3. Test mode credentials
 */
export function authMiddleware(handler: AuthenticatedHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Option 1: Check for API key auth
      const apiKey = req.headers['x-api-key'] as string;
      if (apiKey) {
        // Find API key in database and validate
        const key = await prisma.apiKey.findUnique({
          where: { key: apiKey, isActive: true },
          include: { user: true }
        });
        
        // If key exists and has an associated user
        if (key && key.user) {
          // Update last used timestamp
          await prisma.apiKey.update({
            where: { id: key.id },
            data: { 
              lastUsed: new Date(),
              usageCount: { increment: 1 }
            }
          });
          
          // Call handler with user data
          return handler(req, res, {
            id: key.user.id,
            nostrPubkey: key.user.nostrPubkey,
            isAdvertiser: key.user.isAdvertiser,
            isPublisher: key.user.isPublisher,
            isAdmin: key.user.isAdmin || false,
            isStakeholder: key.user.isStakeholder || false
          });
        }
      }
      
      // Option 2: Check for cookie-based auth using the SESSION_COOKIE_NAME
      const pubkey = req.cookies[SESSION_COOKIE_NAME];
      if (pubkey) {
        try {
          // Find user by Nostr pubkey
          const user = await prisma.user.findUnique({
            where: { nostrPubkey: pubkey }
          });
          
          if (user) {
            return handler(req, res, {
              id: user.id,
              nostrPubkey: user.nostrPubkey,
              isAdvertiser: user.isAdvertiser,
              isPublisher: user.isPublisher,
              isAdmin: user.isAdmin || false,
              isStakeholder: user.isStakeholder || false
            });
          }
        } catch (e) {
          console.logger.error('Auth cookie parse error:', e);
        }
      }
      
      // Option 3: Check for test mode (in development only)
      if (process.env.NODE_ENV === 'development' && req.headers['x-test-mode'] === 'true') {
        const testPubkey = req.headers['x-test-pubkey'] as string || 'test-pubkey';
        
        // Find or create test user
        const user = await prisma.user.upsert({
          where: { nostrPubkey: testPubkey },
          update: {}, // No updates if exists
          create: {
            nostrPubkey: testPubkey,
            isAdvertiser: true,
            isPublisher: true,
            isAdmin: true,
            isStakeholder: true
          }
        });
        
        return handler(req, res, {
          id: user.id,
          nostrPubkey: user.nostrPubkey,
          isAdvertiser: user.isAdvertiser,
          isPublisher: user.isPublisher,
          isAdmin: user.isAdmin || false,
          isStakeholder: user.isStakeholder || false,
          isTestMode: true
        });
      }
      
      // If all auth methods fail, return 401
      return res.status(401).json({ error: 'Unauthorized' });
    } catch (error) {
      console.logger.error('Auth middleware error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}