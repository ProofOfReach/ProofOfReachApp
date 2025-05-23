import type { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';

/**
 * Force Logout API endpoint - independent of all other auth code
 * 
 * This is a standalone logout implementation that doesn't rely on any other
 * code in the application. It directly manipulates cookies for a clean logout.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Set all authentication cookies with an expired date
    const expiredCookies = [
      'nostr_pubkey',
      'auth_token',
      'user_role',
      'auth_nonce',
      'next-auth.session-token',
      'next-auth.callback-url',
      'next-auth.csrf-token',
      'session',
      '__Secure-next-auth.callback-url',
      '__Host-next-auth.csrf-token'
    ];

    // Add the cookies to the response with expired dates
    const cookieOptions = {
      maxAge: -1,
      path: '/',
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
    };

    expiredCookies.forEach(name => {
      const cookie = serialize(name, '', cookieOptions);
      res.setHeader('Set-Cookie', cookie);
    });

    // Return success
    return res.status(200).json({
      success: true,
      message: 'Force logout successful',
      timestamp: Date.now()
    });
  } catch (error) {
    console.logger.error('Force logout error:', error);
    return res.status(500).json({
      error: 'Logout failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}