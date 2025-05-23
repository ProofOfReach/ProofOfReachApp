import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

/**
 * DEBUG ENDPOINT ONLY - DO NOT USE IN PRODUCTION
 * This endpoint returns information about the current users in the database
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Get all users with their preferences
    const users = await prisma.user.findMany({
      include: {
        preferences: true
      }
    });
    
    // Get the current user based on the nostrPubkey cookie
    const nostrPubkey = req.cookies.nostr_pubkey;
    let currentUser = null;
    
    if (nostrPubkey) {
      currentUser = await prisma.user.findUnique({
        where: { nostrPubkey },
        include: {
          preferences: true
        }
      });
    }
    
    // Prepare the response
    const response = {
      totalUsers: users.length,
      currentUser: currentUser ? {
        id: currentUser.id,
        nostrPubkey: currentUser.nostrPubkey,
        isAdvertiser: currentUser.isAdvertiser,
        isPublisher: currentUser.isPublisher,
        isAdmin: currentUser.isAdmin,
        isStakeholder: currentUser.isStakeholder,
        currentRole: currentUser.preferences?.currentRole || null
      } : null,
      allUsers: users.map(user => ({
        id: user.id,
        nostrPubkey: user.nostrPubkey,
        isAdvertiser: user.isAdvertiser,
        isPublisher: user.isPublisher,
        isAdmin: user.isAdmin,
        isStakeholder: user.isStakeholder,
        currentRole: user.preferences?.currentRole || null
      }))
    };
    
    return res.status(200).json(response);
  } catch (error) {
    console.logger.error('Error in debug/users endpoint:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}