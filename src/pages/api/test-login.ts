import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/prismaClient';
import { serialize } from 'cookie';
import { logger } from '../../lib/logger';

/**
 * Test login API endpoint - simplified for debugging
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { pubkey } = req.body;

    // Validate pubkey
    if (!pubkey || typeof pubkey !== 'string') {
      return res.status(400).json({ error: 'Invalid pubkey' });
    }

    // Log login attempt
    logger.log(`Test login attempt for pubkey: ${pubkey.substring(0, 8)}...`);

    // Find user in database
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { nostrPubkey: pubkey }
      });

      // If user doesn't exist, create a new one
      if (!user) {
        logger.log(`Creating new test user for pubkey: ${pubkey.substring(0, 8)}...`);
        
        // First create the user with basic fields
        user = await prisma.user.create({
          data: {
            nostrPubkey: pubkey,
            currentRole: 'viewer',
            isTestUser: false
          }
        });
        
        // Then create the default role entries
        await prisma.userRole.create({
          data: {
            userId: user.id,
            role: 'viewer',
            isActive: true,
            isTestRole: false
          }
        });
      }

      // Set authentication cookies
      const pubkeyCookie = serialize('nostr_pubkey', pubkey, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 1 week
      });
      
      const authTokenCookie = serialize('auth_token', `simple_token_${pubkey.substring(0, 8)}`, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 1 week
      });
      
      res.setHeader('Set-Cookie', [pubkeyCookie, authTokenCookie]);

      // Return log response with debug information
      return res.status(200).json({
        log: true,
        message: 'Authentication logful',
        userId: user.id,
        cookie_set: true,
        debugInfo: {
          user_id: user.id,
          pubkey: pubkey,
          role: user.currentRole
        }
      });
    } catch (dbError) {
      logger.log('Database error during test login:', dbError);
      throw dbError;
    }
  } catch (error) {
    logger.log('Test login error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}