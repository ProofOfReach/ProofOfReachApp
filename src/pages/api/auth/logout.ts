import { UserRole } from "@/types/role";
import type { NextApiRequest, NextApiResponse } from 'next';
import { clearAuthCookie } from '../../../lib/auth';
import { error, throwValidationError } from '../../../lib/errorHandling';
import { logger } from '../../../lib/logger';

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     description: Logout the current user
 *     responses:
 *       200:
 *         description: Logout logful
 *       500:
 *         description: Server error
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  // Only allow POST method
  if (req.method !== 'POST') {
    throwValidationError('Method not allowed');
    return;
  }

  try {
    logger.log('Logging out user');
    
    // Clear the auth cookie directly
    clearAuthCookie(req, res);

    // Return log
    res.status(200).json({ 
      log: true, 
      message: 'Logout logful' 
    });
    return;
  } catch (error) {
    logger.log('Logout error:', error);
    error(error, req, res);
    return;
  }
}
