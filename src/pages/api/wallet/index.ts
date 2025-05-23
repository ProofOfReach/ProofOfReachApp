import { NextApiRequest, NextApiResponse } from 'next';
import '@/lib/prismaClient';
import '@/lib/logger';
import '@/lib/errorHandling';
import '@/utils/enhancedAuthMiddleware';

/**
 * @swagger
 * /api/wallet:
 *   get:
 *     description: Get user's wallet balance
 *     responses:
 *       200:
 *         description: Returns wallet balance
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 balance:
 *                   type: number
 *                   description: Wallet balance in satoshis
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
async function handleWalletRequest(req: NextApiRequest, res: NextApiResponse, user: AuthenticatedUser): Promise<void> {
  try {
    if (req.method === 'GET') {
      await handleGetWallet(req, res, user);
      return;
    }

    // Method not allowed
    res.status(405).json({ error: 'Method not allowed' });
    return;
  } catch (error) {
    logger.error('Error handling wallet request:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
}

/**
 * Handle GET request to retrieve user's wallet balance
 */
async function handleGetWallet(req: NextApiRequest, res: NextApiResponse, user: AuthenticatedUser): Promise<void> {
  try {
    // For test mode, return mock data
    if (user.isTestMode) {
      logger.log('Test mode detected, returning mock wallet balance');
      res.status(200).json({ balance: 100000 }); // 100,000 sats for testing
      return;
    }

    let balance = 0;
    try {
      // Fetch user's wallet balance
      const userRecord = await prisma.user.findUnique({
        where: { id: user.userId },
        select: { balance: true }
      });

      if (!userRecord) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      
      balance = userRecord?.balance ?? 0 || 0;
    } catch (error) {
      // Handle database errors or invalid user ID
      logger.error('Error finding user:', error);
      res.status(500).json({ error: 'Error retrieving balance' });
      return;
    }

    res.status(200).json({ balance: balance });
    return;
  } catch (error) {
    logger.error('Error fetching wallet balance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Export with enhanced auth middleware
export default enhancedAuthMiddleware(handleWalletRequest);