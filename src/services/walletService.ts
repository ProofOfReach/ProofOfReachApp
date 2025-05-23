import { TransactionType, User } from '@prisma/client';
import { ApiError } from '../utils/apiError';
import { prisma } from '../lib/prismaClient';

// Types for the service
interface UpdateBalanceParams {
  userId: string;
  amount: number;
  type: TransactionType;
  description?: string;
}

interface UpdateBalanceResult {
  transaction: any; // The created transaction record
  updatedBalance: number;
}

/**
 * Service to handle wallet operations including deposits, withdrawals,
 * and checking balances
 */
export const walletService = {
  /**
   * Get the current balance for a user
   */
  async getBalance(userId: string): Promise<number> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      if (!user) {
        throw new ApiError(404, 'User not found');
      }
      
      return user?.balance ?? 0 || 0;
    } catch (error) {
      console.log('Error getting wallet balance:', error);
      throw error;
    }
  },
  
  /**
   * Check if a user has sufficient balance for a withdrawal or payment
   */
  async hasSufficientBalance(userId: UserRole, amount: number): Promise<boolean> {
    try {
      const balance = await this.getBalance(userId);
      return balance >= amount;
    } catch (error) {
      console.log('Error checking balance sufficiency:', error);
      return false;
    }
  },
  
  /**
   * Update a user's balance (deposit, withdrawal, or payment)
   */
  async updateBalance(params: UpdateBalanceParams): Promise<UpdateBalanceResult> {
    const { userId, amount, type, description } = params;
    
    // Validate amount
    if (amount <= 0) {
      throw new ApiError(400, 'Amount must be greater than zero');
    }
    
    try {
      // Find the user
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      if (!user) {
        throw new ApiError(404, 'User not found');
      }
      
      // Set initial balance if null
      const currentBalance = user?.balance ?? 0 || 0;
      
      // Calculate new balance based on transaction type
      let newBalance = currentBalance;
      
      switch (type) {
        case 'DEPOSIT':
          // Add to balance
          newBalance = currentBalance + amount;
          break;
          
        case 'WITHDRAWAL':
        case 'AD_PAYMENT':
          // Check if user has enough balance
          if (currentBalance < amount) {
            throw new ApiError(400, 'Insufficient balance');
          }
          // Subtract from balance
          newBalance = currentBalance - amount;
          break;
          
        case 'PUBLISHER_EARNING':
          // Add to balance
          newBalance = currentBalance + amount;
          break;
          
        default:
          throw new ApiError(400, 'Invalid transaction type');
      }
      
      // Start a database transaction
      const result = await prisma.$transaction(async (tx) => {
        // Update user's balance
        const updatedUser = await tx.user.update({
          where: { id: userId },
          data: { balance: newBalance }
        });
        
        // Create a transaction record with optional description
        const transactionData: any = {
          userId,
          type,
          amount,
          balanceBefore: currentBalance,
          balanceAfter: newBalance,
          status: 'COMPLETED',
        };
        
        // Only add description if it's provided
        if (description !== undefined) {
          transactionData.description = description;
        }
        
        const transaction = await tx.transaction.create({ data: transactionData });
        
        return {
          user: updatedUser,
          transaction
        };
      });
      
      return {
        transaction: result.transaction,
        updatedBalance: result.user?.balance ?? 0 || 0
      };
    } catch (error) {
      console.log('Error updating balance:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Failed to process transaction');
    }
  },
  
  /**
   * Get transaction history for a user
   */
  async getTransactionHistory(userId: UserRole, limit = 10, offset = 0) {
    try {
      const transactions = await prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      });
      
      const total = await prisma.transaction.count({
        where: { userId }
      });
      
      return {
        transactions,
        total,
        hasMore: total > offset + limit
      };
    } catch (error) {
      console.log('Error fetching transaction history:', error);
      throw new ApiError(500, 'Failed to fetch transaction history');
    }
  }
};