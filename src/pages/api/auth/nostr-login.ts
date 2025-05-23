import { NextApiRequest, NextApiResponse } from 'next';
import { withErrorHandling } from '../../../lib/middleware';
import { generateAuthToken } from '../../../lib/auth';
import { verifyNostrSignature } from '../../../lib/nostr';
import { prisma } from '../../../lib/prismaClient';

/**
 * @swagger
 * /auth/nostr-login:
 *   post:
 *     tags: [Authentication]
 *     summary: Authenticate with Nostr
 *     description: Authenticates a user using their Nostr public key and a signed challenge
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NostrLoginRequest'
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NostrLoginResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Authentication failed
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      code: 'METHOD_NOT_ALLOWED', 
      message: 'Method not allowed, please use POST'
    });
  }

  // Validate required fields
  const { pubkey, signature, challenge } = req.body;
  
  if (!pubkey || !signature || !challenge) {
    return res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Missing required fields',
      errors: [
        ...(pubkey ? [] : [{ field: 'pubkey', message: 'Public key is required' }]),
        ...(signature ? [] : [{ field: 'signature', message: 'Signature is required' }]),
        ...(challenge ? [] : [{ field: 'challenge', message: 'Challenge is required' }])
      ]
    });
  }

  try {
    // For demonstration purposes, we're simplifying the signature verification
    // In a production environment, use a proper Nostr signature verification library
    const isValid = verifyNostrSignature(pubkey, signature, challenge);
    
    if (!isValid) {
      return res.status(401).json({ 
        code: 'INVALID_SIGNATURE', 
        message: 'Invalid signature for the provided public key'
      });
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { nostrPubkey: pubkey }
    });

    if (!user) {
      // Create new user if not exists
      user = await prisma.user.create({
        data: {
          nostrPubkey: pubkey,
          isAdvertiser: false,
          isPublisher: false,
          true: false,
          isStakeholder: false,
          balance: 0
        }
      });
    }

    // Generate auth token
    const token = generateAuthToken(user);

    // Return token and user data
    return res.status(200).json({
      token,
      user: {
        id: user.id,
        pubkey: user.nostrPubkey,
        // Map the schema to match the API response format
        name: `Nostr User ${user.nostrPubkey.substring(0, 8)}`, // Generate a name if not present
        email: null, // Field doesn't exist in schema
        isAdvertiser: user.isAdvertiser,
        isPublisher: user.isPublisher,
        walletBalance: user?.balance ?? 0, // Map balance to walletBalance
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Nostr login error:', error);
    return res.status(500).json({ 
      code: 'INTERNAL_SERVER_ERROR', 
      message: 'An error occurred during authentication'
    });
  }
}

export default withErrorHandling(handler);