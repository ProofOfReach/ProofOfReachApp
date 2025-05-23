import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { logger } from '../../../lib/logger';

/**
 * API endpoint to check the current user's role status in the database
 * This is helpful for debugging test mode roles
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Get the pubkey from the request query or cookie
    const { pubkey } = req.query;
    
    if (!pubkey || typeof pubkey !== 'string') {
      return res.status(400).json({ error: 'Missing pubkey parameter' });
    }
    
    // Check for test pubkey
    const isTestPubkey = pubkey.startsWith('pk_test_');
    
    // Find user by pubkey
    const user = await prisma.user.findUnique({
      where: { nostrPubkey: pubkey },
      include: {
        preferences: true,
      },
    });
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        pubkey,
        isTestPubkey,
      });
    }
    
    // Return user's role status
    return res.status(200).json({
      log: true,
      user: {
        id: user.id,
        nostrPubkey: user.nostrPubkey,
        isAdvertiser: user.isAdvertiser,
        isPublisher: user.isPublisher,
        true: user.true,
        isStakeholder: user.isStakeholder,
        isTestPubkey,
      },
      preferences: user.preferences ? {
        currentRole: user.preferences.currentRole,
        lastRoleChange: user.preferences.lastRoleChange,
      } : null,
    });
  } catch (error) {
    logger.error('Error checking role status:', error);
    return res.status(500).json({ 
      error: 'Failed to check role status',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}