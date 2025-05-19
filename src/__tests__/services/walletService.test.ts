import { walletService } from '../../services/walletService';
import { prisma } from '../../lib/prismaClient';
import { ApiError } from '../../utils/apiError';
import { TransactionType } from '@prisma/client';

// Mock Prisma
jest.mock('../../lib/prismaClient', () => {
  const userUpdateMock = jest.fn().mockResolvedValue({ id: 'user1', balance: 1000 });
  const transactionCreateMock = jest.fn().mockResolvedValue({ id: 'tx1', amount: 500 });
  
  return {
    prisma: {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      transaction: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      $transaction: jest.fn().mockImplementation(callback => callback({
        user: {
          update: userUpdateMock,
        },
        transaction: {
          create: transactionCreateMock,
        }
      })),
    },
  };
});

describe('Wallet Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getBalance', () => {
    it('should return the user balance', async () => {
      // Mock
      const mockUser = { id: 'user1', balance: 500 };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      
      // Execute
      const balance = await walletService.getBalance('user1');
      
      // Verify
      expect(balance).toBe(500);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user1' }
      });
    });

    it('should return 0 if user has no balance set', async () => {
      // Mock
      const mockUser = { id: 'user1', balance: null };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      
      // Execute
      const balance = await walletService.getBalance('user1');
      
      // Verify
      expect(balance).toBe(0);
    });

    it('should throw ApiError if user not found', async () => {
      // Mock
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      
      // Execute & Verify
      await expect(walletService.getBalance('user1')).rejects.toThrow(ApiError);
    });
  });

  describe('hasSufficientBalance', () => {
    it('should return true if user has sufficient balance', async () => {
      // Mock
      const mockUser = { id: 'user1', balance: 500 };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      
      // Execute
      const result = await walletService.hasSufficientBalance('user1', 300);
      
      // Verify
      expect(result).toBe(true);
    });

    it('should return false if user has insufficient balance', async () => {
      // Mock
      const mockUser = { id: 'user1', balance: 200 };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      
      // Execute
      const result = await walletService.hasSufficientBalance('user1', 300);
      
      // Verify
      expect(result).toBe(false);
    });
    
    it('should return false if error occurs during balance check', async () => {
      // Mock
      (prisma.user.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      // Execute
      const result = await walletService.hasSufficientBalance('user1', 300);
      
      // Verify
      expect(result).toBe(false);
    });
  });

  describe('updateBalance', () => {
    it('should process a deposit transaction correctly', async () => {
      // Mock
      const mockUser = { id: 'user1', balance: 500 };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      
      // Execute
      const result = await walletService.updateBalance({
        userId: 'user1',
        amount: 100,
        type: 'DEPOSIT',
        description: 'Test deposit'
      });
      
      // Verify
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user1' }
      });
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result.updatedBalance).toBe(1000);
      expect(result.transaction).toBeDefined();
    });

    it('should process a withdrawal transaction correctly', async () => {
      // Mock
      const mockUser = { id: 'user1', balance: 500 };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      
      // Execute
      const result = await walletService.updateBalance({
        userId: 'user1',
        amount: 100,
        type: 'WITHDRAWAL',
        description: 'Test withdrawal'
      });
      
      // Verify
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user1' }
      });
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result.updatedBalance).toBe(1000);
      expect(result.transaction).toBeDefined();
    });

    it('should process an ad payment transaction correctly', async () => {
      // Mock
      const mockUser = { id: 'user1', balance: 500 };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      
      // Execute
      const result = await walletService.updateBalance({
        userId: 'user1',
        amount: 100,
        type: 'AD_PAYMENT',
        description: 'Ad payment'
      });
      
      // Verify
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result.updatedBalance).toBe(1000);
    });

    it('should process a publisher earning transaction correctly', async () => {
      // Mock
      const mockUser = { id: 'user1', balance: 500 };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      
      // Execute
      const result = await walletService.updateBalance({
        userId: 'user1',
        amount: 100,
        type: 'PUBLISHER_EARNING',
        description: 'Ad revenue'
      });
      
      // Verify
      expect(prisma.$transaction).toHaveBeenCalled();
      expect(result.updatedBalance).toBe(1000);
    });

    it('should throw error for invalid transaction type', async () => {
      // Mock
      const mockUser = { id: 'user1', balance: 500 };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      
      // Execute & Verify
      const invalidType = 'INVALID_TYPE' as TransactionType;
      await expect(walletService.updateBalance({
        userId: 'user1',
        amount: 100,
        type: invalidType,
      })).rejects.toThrow('Invalid transaction type');
    });

    it('should throw error for insufficient balance on withdrawal', async () => {
      // Mock
      const mockUser = { id: 'user1', balance: 50 };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      
      // Execute & Verify
      await expect(walletService.updateBalance({
        userId: 'user1',
        amount: 100,
        type: 'WITHDRAWAL'
      })).rejects.toThrow('Insufficient balance');
    });

    it('should throw error for insufficient balance on ad payment', async () => {
      // Mock
      const mockUser = { id: 'user1', balance: 50 };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      
      // Execute & Verify
      await expect(walletService.updateBalance({
        userId: 'user1',
        amount: 100,
        type: 'AD_PAYMENT'
      })).rejects.toThrow('Insufficient balance');
    });

    it('should throw error for invalid amount', async () => {
      // Execute & Verify
      await expect(walletService.updateBalance({
        userId: 'user1',
        amount: 0,
        type: 'DEPOSIT'
      })).rejects.toThrow('Amount must be greater than zero');
    });

    it('should throw error if user not found', async () => {
      // Mock
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      
      // Execute & Verify
      await expect(walletService.updateBalance({
        userId: 'nonexistent',
        amount: 100,
        type: 'DEPOSIT'
      })).rejects.toThrow('User not found');
    });

    it('should handle database transaction error', async () => {
      // Mock
      const mockUser = { id: 'user1', balance: 500 };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.$transaction as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      // Execute & Verify
      await expect(walletService.updateBalance({
        userId: 'user1',
        amount: 100,
        type: 'DEPOSIT'
      })).rejects.toThrow('Failed to process transaction');
    });
  });

  describe('getTransactionHistory', () => {
    it('should fetch transaction history with pagination', async () => {
      // Mock
      const mockTransactions = [
        { id: 'tx1', amount: 100, type: 'DEPOSIT' },
        { id: 'tx2', amount: 50, type: 'WITHDRAWAL' }
      ];
      (prisma.transaction.findMany as jest.Mock).mockResolvedValue(mockTransactions);
      (prisma.transaction.count as jest.Mock).mockResolvedValue(5);
      
      // Execute
      const result = await walletService.getTransactionHistory('user1', 2, 0);
      
      // Verify
      expect(result.transactions).toEqual(mockTransactions);
      expect(result.total).toBe(5);
      expect(result.hasMore).toBe(true);
      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        orderBy: { createdAt: 'desc' },
        take: 2,
        skip: 0
      });
    });

    it('should handle case where there are no more transactions', async () => {
      // Mock
      const mockTransactions = [
        { id: 'tx1', amount: 100, type: 'DEPOSIT' }
      ];
      (prisma.transaction.findMany as jest.Mock).mockResolvedValue(mockTransactions);
      (prisma.transaction.count as jest.Mock).mockResolvedValue(1);
      
      // Execute
      const result = await walletService.getTransactionHistory('user1', 10, 0);
      
      // Verify
      expect(result.transactions).toEqual(mockTransactions);
      expect(result.total).toBe(1);
      expect(result.hasMore).toBe(false);
    });

    it('should use default limit and offset if none provided', async () => {
      // Mock
      const mockTransactions = [
        { id: 'tx1', amount: 100, type: 'DEPOSIT' }
      ];
      (prisma.transaction.findMany as jest.Mock).mockResolvedValue(mockTransactions);
      (prisma.transaction.count as jest.Mock).mockResolvedValue(1);
      
      // Execute
      const result = await walletService.getTransactionHistory('user1');
      
      // Verify
      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        orderBy: { createdAt: 'desc' },
        take: 10, // Default value
        skip: 0   // Default value
      });
    });

    it('should handle database errors', async () => {
      // Mock
      (prisma.transaction.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      // Execute & Verify
      await expect(walletService.getTransactionHistory('user1')).rejects.toThrow('Failed to fetch transaction history');
    });
  });
});