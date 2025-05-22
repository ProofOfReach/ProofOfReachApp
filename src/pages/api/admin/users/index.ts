import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';
import { isAuthenticated } from '../../../../lib/auth';
import { requireRole } from '../../../../lib/apiKeyAuth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if user is authenticated
    const user = await isAuthenticated(req, res);
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Check if the user has admin role
    if (!user.isAdmin) {
      return res.status(403).json({ error: 'Forbidden - Admin role required' });
    }
    
    // Get all users with basic information
    const users = await prisma.user.findMany({
      select: {
        id: true,
        pubkey: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        isAdmin: true,
        isAdvertiser: true,
        isPublisher: true,
        isStakeholder: true,
        walletBalance: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}