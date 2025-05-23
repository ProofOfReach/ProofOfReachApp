import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prismaClient';
import { requireAuth } from '../../../lib/auth';

async function getTransactionHistory(req: NextApiRequest, res: NextApiResponse, pubkey: string) {
  try {
    // Get user ID from pubkey
    const user = await prisma.user.findUnique({
      where: { nostrPubkey: pubkey },
      select: { id: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get optional limit parameter
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

    // Get all transactions for the user
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      ...(limit ? { take: limit } : {})
    });

    return res.status(200).json(transactions);
  } catch (error) {
    console.logger.error('Error fetching transaction history:', error);
    return res.status(500).json({ error: 'Failed to fetch transaction history' });
  }
}

// Process API requests with auth middleware
const handleRequest = async (req: NextApiRequest, res: NextApiResponse, pubkey: string, userId: string) => {
  if (req.method === 'GET') {
    return getTransactionHistory(req, res, pubkey);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
};

// Export with auth middleware
export default requireAuth(handleRequest);
