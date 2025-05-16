import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import * as errorHandlingModule from '../../../../lib/errorHandling';

// Extend Error interface for custom properties used in tests
declare global {
  interface Error {
    status?: number;
  }
}

// Mock the modules first 
jest.mock('../../../../lib/auth', () => ({
  setAuthCookie: jest.fn(),
}));

// Mock the prisma client
jest.mock('../../../../lib/prismaClient', () => ({
  __esModule: true,
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    }
  }
}));

// Mock the error handling module
jest.mock('../../../../lib/errorHandling', () => {
  const originalModule = jest.requireActual('../../../../lib/errorHandling');
  return {
    ...originalModule,
    handleError: jest.fn((err, req, res) => {
      // Simple implementation that mimics the real handleError function
      res.status(err.status || 500).json({
        error: err.name || 'Error',
        message: err.message || 'Unknown error',
      });
    }),
    throwValidationError: jest.fn((message) => {
      const error = new Error(message);
      error.name = 'ValidationError';
      error.status = 400;
      throw error;
    }),
  };
});

// Need to import these AFTER the mocks are set up
import handler from '../../../../pages/api/auth/login';
import { setAuthCookie } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prismaClient';

describe('Login API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('validates request method is POST', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
    });

    // We need to catch the error that will be thrown
    try {
      await handler(req, res);
    } catch (error: any) {
      // We expect an error to be thrown, so this is actually the success case
      expect(error).toBeDefined();
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Method not allowed');
    }

    // Check that throwValidationError was called with the correct message
    expect(errorHandlingModule.throwValidationError).toHaveBeenCalledWith('Method not allowed');
  });

  it('validates pubkey is provided', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        // Missing pubkey
      },
    });

    // We need to catch the error that will be thrown
    try {
      await handler(req, res);
    } catch (error: any) {
      // We expect an error to be thrown, so this is actually the success case
      expect(error).toBeDefined();
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Invalid pubkey');
    }

    // Check that throwValidationError was called with the correct message
    expect(errorHandlingModule.throwValidationError).toHaveBeenCalledWith('Invalid pubkey');
  });

  it('logs in existing user successfully', async () => {
    const mockPubkey = 'test-pubkey-123456';
    const mockUser = { 
      id: 'user-1',
      nostrPubkey: mockPubkey,
      createdAt: new Date(),
      isAdvertiser: true,
      isPublisher: true,
    };
    
    // Mock finding an existing user
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    // Mock update if needed for isTest=true scenario
    (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        pubkey: mockPubkey,
        isTest: true,
      },
    });

    await handler(req, res);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { nostrPubkey: mockPubkey },
    });
    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(setAuthCookie).toHaveBeenCalledWith(mockPubkey, req, res);
    
    // Debug information if the test fails
    if (res.statusCode !== 200) {
      console.log('Response data:', res._getData());
    }
    
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      message: 'Authentication successful',
      userId: mockUser.id,
    });
  });

  it('creates and logs in new user when user does not exist', async () => {
    const mockPubkey = 'new-pubkey-123456';
    const mockUser = { 
      id: 'user-2',
      nostrPubkey: mockPubkey,
      createdAt: new Date(),
    };
    
    // Mock user not found, then creating a new user
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        pubkey: mockPubkey,
      },
    });

    await handler(req, res);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { nostrPubkey: mockPubkey },
    });
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          nostrPubkey: mockPubkey,
          currentRole: 'viewer'
        })
      })
    );
    expect(setAuthCookie).toHaveBeenCalledWith(mockPubkey, req, res);
    
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      message: 'Authentication successful',
      userId: mockUser.id,
    });
  });

  it('handles database errors properly', async () => {
    const mockPubkey = 'error-pubkey';
    const mockError = new Error('Database connection error');
    
    // Mock a database error
    (prisma.user.findUnique as jest.Mock).mockRejectedValue(mockError);

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        pubkey: mockPubkey,
      },
    });

    await handler(req, res);

    expect(res.statusCode).toBe(500);
    expect(JSON.parse(res._getData())).toMatchObject({
      error: 'Error',
      message: 'Database connection error',
    });
  });
});