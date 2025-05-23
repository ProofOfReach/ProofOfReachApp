import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prismaClient';
import { requireAuth } from '../../../lib/auth';
import { createInvoice, payInvoice } from '../../../lib/lightning';
import { logger } from '../../../lib/logger';

async function handleDeposit(req: NextApiRequest, res: NextApiResponse, pubkey: string) {
  try {
    const { amount } = req.body;

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Get user ID from pubkey
    const user = await prisma.user.findUnique({
      where: { nostrPubkey: pubkey },
      select: { id: true, balance: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create a lightning invoice for the deposit
    const invoice = await createInvoice(amount, `Nostr Ad Marketplace deposit: ${amount} sats`);

    // Calculate balance values
    const currentBalance = user?.balance ?? 0 || 0;
    
    // Save the invoice to track payment
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        amount,
        type: 'DEPOSIT',
        status: 'PENDING',
        description: `Deposit of ${amount} sats`,
        lightningInvoice: invoice.bolt11,
        paymentHash: invoice.paymentHash,
        balanceBefore: currentBalance,
        balanceAfter: currentBalance, // Will be updated when payment is confirmed
      }
    });

    return res.status(200).json({
      invoice: invoice.bolt11,
      paymentHash: invoice.paymentHash,
      transactionId: transaction.id
    });
  } catch (error) {
    logger.error('Error creating deposit invoice:', error);
    return res.status(500).json({ error: 'Failed to create lightning invoice' });
  }
}

async function handleWithdraw(req: NextApiRequest, res: NextApiResponse, pubkey: string) {
  try {
    const { invoice, amount } = req.body;

    if (!invoice || typeof invoice !== 'string') {
      return res.status(400).json({ error: 'Invalid invoice' });
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Get user from pubkey
    const user = await prisma.user.findUnique({
      where: { nostrPubkey: pubkey },
      select: { id: true, balance: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user has enough balance
    if (user?.balance ?? 0 < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Attempt to pay the invoice
    try {
      const payment = await payInvoice(invoice, amount);

      // Update user balance
      await prisma.user.update({
        where: { id: user.id },
        data: { balance: user?.balance ?? 0 - amount }
      });

      // Calculate balance values
      const previousBalance = user?.balance ?? 0 || 0;
      const newBalance = previousBalance - amount;
      
      // Create a transaction record
      const transaction = await prisma.transaction.create({
        data: {
          userId: user.id,
          amount,
          type: 'WITHDRAWAL',
          status: 'COMPLETED',
          description: `Withdrawal of ${amount} sats`,
          lightningInvoice: invoice,
          paymentHash: payment.paymentHash,
          balanceBefore: previousBalance,
          balanceAfter: newBalance,
        }
      });

      return res.status(200).json({
        log: true,
        paymentHash: payment.paymentHash,
        transactionId: transaction.id
      });
    } catch (error) {
      logger.error('Lightning payment error:', error);
      return res.status(400).json({ error: 'Payment failed' });
    }
  } catch (error) {
    logger.error('Error handling withdrawal:', error);
    return res.status(500).json({ error: 'Failed to process withdrawal' });
  }
}

async function handlePaymentCheck(req: NextApiRequest, res: NextApiResponse, pubkey: string) {
  try {
    const { transactionId } = req.query;

    if (!transactionId) {
      return res.status(400).json({ error: 'Transaction ID is required' });
    }

    // Get user ID from pubkey
    const user = await prisma.user.findUnique({
      where: { nostrPubkey: pubkey },
      select: { id: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get the transaction
    const transaction = await prisma.transaction.findUnique({
      where: {
        id: transactionId as string
      }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Verify that the transaction belongs to the user
    if (transaction.userId !== user.id) {
      return res.status(403).json({ error: 'You do not have permission to view this transaction' });
    }

    // For the MVP, simulate payment completion for deposit
    // In a real implementation, we would check the invoice status with the Lightning Network
    if (transaction.type === 'DEPOSIT' && transaction.status === 'PENDING') {
      // Simulate payment received for test mode
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'COMPLETED' }
      });

      // Add the amount to the user's balance
      await prisma.user.update({
        where: { id: user.id },
        data: { balance: { increment: transaction.amount } }
      });

      return res.status(200).json({
        status: 'COMPLETED',
        message: 'Payment received'
      });
    }

    return res.status(200).json({
      status: transaction.status,
      message: transaction.status === 'COMPLETED' ? 'Payment received' : 'Payment pending'
    });
  } catch (error) {
    logger.error('Error checking payment status:', error);
    return res.status(500).json({ error: 'Failed to check payment status' });
  }
}

// Process API requests with auth middleware
const handleRequest = async (req: NextApiRequest, res: NextApiResponse, pubkey: string, userId: string) => {
  if (req.method === 'POST') {
    const { action } = req.body;

    if (action === 'deposit') {
      return handleDeposit(req, res, pubkey);
    } else if (action === 'withdraw') {
      return handleWithdraw(req, res, pubkey);
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }
  } else if (req.method === 'GET') {
    return handlePaymentCheck(req, res, pubkey);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
};

// Export with auth middleware
export default requireAuth(handleRequest);
