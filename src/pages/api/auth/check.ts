import { UserRole } from "@/types/role";
import type { NextApiRequest, NextApiResponse } from 'next';
import { isAuthenticated } from '../../../lib/auth';
import { error, throwValidationError } from '../../../lib/errorHandling';
import { logger } from '../../../lib/logger';

/**
 * @swagger
 * /api/auth/check:
 *   get:
 *     description: Check if the user is authenticated
 *     responses:
 *       200:
 *         description: Authentication status and pubkey if authenticated
 *       500:
 *         description: Server error
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  // Only allow GET method
  if (req.method !== 'GET') {
    throwValidationError('Method not allowed');
    return;
  }

  try {
    // Use the auth.ts module directly to check authentication
    const pubkey = await isAuthenticated(req);

    if (pubkey) {
      logger.debug(`User authenticated: ${pubkey.substring(0, 8)}...`);
      res.status(200).json({ 
        authenticated: true,
        pubkey: pubkey
      });
      return;
    } else {
      logger.debug('User not authenticated');
      res.status(200).json({ 
        authenticated: false
      });
      return;
    }
  } catch (error) {
    // Don't log empty objects or normal authentication failures
    if (error && Object.keys(error).length > 0) {
      logger.log('Authentication check error:', error);
    }
    // Return unauthenticated instead of throwing error for auth failures
    res.status(200).json({ 
      authenticated: false
    });
    return;
  }
}
