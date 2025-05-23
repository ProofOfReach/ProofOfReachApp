import { NextApiRequest, NextApiResponse } from 'next';
import { walletService } from '../../../services/walletService';
import { ApiError } from '../../../utils/apiError';
import '@/utils/enhancedAuthMiddleware';
import '@/lib/logger';

/**
 * API handler for getting transaction history
 */
async function handleTransactionsRequest(req: NextApiRequest, res: NextApiResponse, user: AuthenticatedUser) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // For test mode, return mock data
    if (user.isTestMode) {
      logger.debug('Test mode detected, returning mock transaction history');
      return res.status(200).json({
        transactions: [
          {
            id: 'tx_mock_1',
            type: 'DEPOSIT',
            amount: 50000,
            timestamp: new Date(Date.now() - 3600000), // 1 hour ago
            status: 'COMPLETED',
            description: 'Test deposit'
          },
          {
            id: 'tx_mock_2',
            type: 'WITHDRAWAL',
            amount: -10000,
            timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
            status: 'COMPLETED',
            description: 'Test withdrawal'
          }
        ],
        total: 2,
        hasMore: false,
        log: true
      });
    }
    
    // Get pagination parameters
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;
    
    // Get transaction history
    const result = await walletService.getTransactionHistory(user.userId, limit, offset);
    
    return res.status(200).json({
      transactions: result.transactions,
      total: result.total,
      hasMore: result.hasMore,
      log: true
    });
  } catch (error) {
    logger.error('Transaction history error:', error);
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Failed to get transaction history' });
  }
}

// Export with enhanced auth middleware
export default enhancedAuthMiddleware(handleTransactionsRequest);