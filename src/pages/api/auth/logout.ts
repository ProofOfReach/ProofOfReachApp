import type { NextApiRequest, NextApiResponse } from 'next';
import { clearAuthCookie } from '../../../lib/auth';
import { handleError, throwValidationError } from '../../../lib/errorHandling';
import { logger } from '../../../lib/logger';

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     description: Logout the current user
 *     responses:
 *       200:
 *         description: Logout successful
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

    // Return success
    res.status(200).json({ 
      success: true, 
      message: 'Logout successful' 
    });
    return;
  } catch (error) {
    logger.error('Logout error:', error);
    handleError(error, req, res);
    return;
  }
}
