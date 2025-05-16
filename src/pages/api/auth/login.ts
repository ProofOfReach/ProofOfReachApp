import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prismaClient';
import { setAuthCookie } from '../../../lib/auth';
import { handleError, throwValidationError } from '../../../lib/errorHandling';
import { logger } from '../../../lib/logger';

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     description: Login with Nostr pubkey
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pubkey
 *             properties:
 *               pubkey:
 *                 type: string
 *                 description: Nostr public key
 *               isTest:
 *                 type: boolean
 *                 description: Whether this is a test mode login
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid request data
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
    const { pubkey, isTest } = req.body;

    // Validate pubkey
    if (!pubkey || typeof pubkey !== 'string') {
      throwValidationError('Invalid pubkey');
      return;
    }

    // Log login attempt
    logger.log(`Login attempt for pubkey: ${pubkey.substring(0, 8)}...`);

    // Find user in database - this is now directly in the API route
    // instead of delegated to AuthService
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { nostrPubkey: pubkey }
      });

      // If user doesn't exist, create a new one
      if (!user) {
        logger.log(`Creating new user for pubkey: ${pubkey.substring(0, 8)}...`);
        
        // First create the user with basic fields
        user = await prisma.user.create({
          data: {
            nostrPubkey: pubkey,
            // Set default role to 'viewer'
            currentRole: 'viewer',
            // Flag as test user if appropriate
            isTestUser: isTest ? true : false
          }
        });
        
        // Then create the default role entries
        await prisma.userRole.create({
          data: {
            userId: user.id,
            role: 'viewer',
            isActive: true,
            isTestRole: isTest ? true : false
          }
        });
        
        // For test users, add advertiser and publisher roles
        if (isTest) {
          await prisma.userRole.createMany({
            data: [
              {
                userId: user.id,
                role: 'advertiser',
                isActive: true,
                isTestRole: true
              },
              {
                userId: user.id,
                role: 'publisher',
                isActive: true,
                isTestRole: true
              }
            ]
          });
        }
      }
      // If isTest is true, ensure user has advertiser and publisher roles
      else if (isTest) {
        logger.log(`Updating test user roles for: ${pubkey.substring(0, 8)}...`);
        
        // Check for existing advertiser role
        const existingAdvertiserRole = await prisma.userRole.findFirst({
          where: { 
            userId: user.id,
            role: 'advertiser'
          }
        });
        
        // Check for existing publisher role
        const existingPublisherRole = await prisma.userRole.findFirst({
          where: { 
            userId: user.id,
            role: 'publisher'
          }
        });
        
        // Create roles if they don't exist
        if (!existingAdvertiserRole) {
          await prisma.userRole.create({
            data: {
              userId: user.id,
              role: 'advertiser',
              isActive: true,
              isTestRole: true
            }
          });
        }
        
        if (!existingPublisherRole) {
          await prisma.userRole.create({
            data: {
              userId: user.id,
              role: 'publisher',
              isActive: true,
              isTestRole: true
            }
          });
        }
        
        // Update user to be flagged as a test user
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            isTestUser: true
          }
        });
      }

      // Set the auth cookie
      setAuthCookie(pubkey, req, res);

      // Return success response
      res.status(200).json({
        success: true,
        message: 'Authentication successful',
        userId: user.id
      });
      return;
    } catch (dbError) {
      logger.error('Database error during login:', dbError);
      throw dbError;
    }
  } catch (error) {
    logger.error('Login error:', error);
    handleError(error, req, res);
    return;
  }
}
