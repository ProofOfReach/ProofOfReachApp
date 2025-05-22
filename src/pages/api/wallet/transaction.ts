import { NextApiRequest, NextApiResponse } from 'next';
// import { getUserFromRequest } from '../../../lib/auth';
import { walletService } from '../../../services/walletService';
import { ApiError } from '../../../utils/apiError';
import { TransactionType } from '@prisma/client';

/**
 * API handler for processing wallet transactions (deposits and withdrawals)
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Check authentication
    const user = await getUserFromRequest(req);
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Validate request body
    const { type, amount, description } = req.body;
    
    if (!type || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (!Object.values(TransactionType).includes(type)) {
      return res.status(400).json({ error: 'Invalid transaction type' });
    }
    
    const amountNumber = parseFloat(amount);
    if (isNaN(amountNumber) || amountNumber <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }
    
    // If this is a withdrawal, check for sufficient funds
    if (type === 'WITHDRAWAL' || type === 'AD_PAYMENT') {
      const hasSufficientFunds = await walletService.hasSufficientBalance(user.id, amountNumber);
      if (!hasSufficientFunds) {
        return res.status(400).json({ error: 'Insufficient balance for this transaction' });
      }
    }
    
    // Process the transaction
    const result = await walletService.updateBalance({
      userId: user.id,
      amount: amountNumber, 
      type: type as TransactionType,
      description
    });
    
    return res.status(200).json({
      success: true,
      transaction: result.transaction,
      newBalance: result.updatedBalance
    });
    
  } catch (error) {
    console.error('Transaction error:', error);
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Failed to process transaction' });
  }
}