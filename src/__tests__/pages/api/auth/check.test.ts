import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../../../../pages/api/auth/check';
import * as authModule from '../../../../lib/auth';
import * as errorHandlingModule from '../../../../lib/errorHandling';

// Mock the auth module
jest.mock('../../../../lib/auth', () => ({
  isAuthenticated: jest.fn(),
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

describe('Auth Check API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('validates request method is GET', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
    });

    // We need to catch the error that will be thrown
    try {
      await handler(req, res);
    } catch (error) {
      // We expect an error to be thrown, so this is actually the success case
      expect(error).toBeDefined();
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Method not allowed');
    }

    // Check that throwValidationError was called with the correct message
    expect(errorHandlingModule.throwValidationError).toHaveBeenCalledWith('Method not allowed');
  });

  it('returns authenticated=true with pubkey when user is authenticated', async () => {
    const mockPubkey = 'test-pubkey-123456';
    
    // Mock the isAuthenticated function to return a pubkey
    (authModule.isAuthenticated as jest.Mock).mockResolvedValue(mockPubkey);

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
    });

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      authenticated: true,
      pubkey: mockPubkey,
    });
  });

  it('returns authenticated=false when user is not authenticated', async () => {
    // Mock the isAuthenticated function to return null (not authenticated)
    (authModule.isAuthenticated as jest.Mock).mockResolvedValue(null);

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
    });

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      authenticated: false,
    });
  });

  it('handles errors properly', async () => {
    // Mock the isAuthenticated function to throw an error
    const mockError = new Error('Authentication error');
    (authModule.isAuthenticated as jest.Mock).mockRejectedValue(mockError);

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
    });

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res._getData())).toMatchObject({
      authenticated: false
    });
  });
});