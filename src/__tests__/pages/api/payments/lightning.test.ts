import { createMocks } from 'node-mocks-http';
import lightningHandler from '../../../../pages/api/payments/lightning';
import * as lightningLib from '../../../../lib/lightning';
import * as auth from '../../../../lib/auth';
import { prisma } from '../../../../lib/prismaClient';

// Mock the lightning library
jest.mock('../../../../lib/lightning', () => ({
  createInvoice: jest.fn(),
  payInvoice: jest.fn(),
  checkPayment: jest.fn(),
}));

// Mock the auth library
jest.mock('../../../../lib/auth', () => ({
  requireAuth: jest.fn((handler) => {
    // This will call the handler directly with a mock pubkey for testing
    return (req, res) => handler(req, res, 'test-pubkey', 'user-123');
  }),
  getAuthenticatedUser: jest.fn().mockResolvedValue({
    id: 'user-123',
    pubkey: 'test-pubkey',
  }),
  getServerSession: jest.fn().mockResolvedValue({
    user: {
      id: 'user-123',
      nostrPubkey: 'test-pubkey'
    }
  })
}));

// Mock Prisma client
jest.mock('../../../../lib/prismaClient', () => ({
  prisma: {
    user: {
      findUnique: jest.fn().mockResolvedValue({
        id: 'user-123',
        nostrPubkey: 'test-pubkey',
        balance: 50000,
      }),
      update: jest.fn().mockResolvedValue({
        id: 'user-123',
        balance: 51000,
      }),
    },
    transaction: {
      findUnique: jest.fn().mockResolvedValue({
        id: 'test-transaction-id',
        userId: 'user-123',
        status: 'COMPLETED',
        type: 'DEPOSIT',
        amount: 1000,
      }),
      create: jest.fn().mockResolvedValue({
        id: 'test-transaction-id',
      }),
      update: jest.fn().mockResolvedValue({
        id: 'test-transaction-id',
        status: 'COMPLETED'
      }),
    },
  }
}));

describe('Lightning API Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle methods other than POST', async () => {
    const { req, res } = createMocks({
      method: 'PUT', // Using PUT to test rejection of non-POST/GET methods
    });

    await lightningHandler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({
        error: expect.stringContaining('Method not allowed'),
      })
    );
  });

  it('should return 400 for invalid action', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        action: 'invalid_action',
        amount: 1000,
      }
    });

    await lightningHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({
        error: expect.stringContaining('Invalid action'),
      })
    );
  });

  it('should return 400 for deposit with missing amount', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        action: 'deposit',
        // Missing amount
      }
    });

    await lightningHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({
        error: expect.stringContaining('Invalid amount'),
      })
    );
  });

  it('should return 400 for withdraw with missing invoice', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        action: 'withdraw',
        amount: 1000,
        // Missing invoice
      }
    });

    await lightningHandler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({
        error: expect.stringContaining('Invalid invoice'),
      })
    );
  });

  it('should validate payment status properly', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: {
        transactionId: 'test-transaction-id',
      }
    });

    await lightningHandler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      status: 'COMPLETED',
      message: 'Payment received'
    });
  });
});