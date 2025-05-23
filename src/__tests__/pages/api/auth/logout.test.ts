import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../../../../pages/api/auth/logout';
import * as authModule from '../../../../lib/auth';
import * as errorHandlingModule from '../../../../lib/errorHandling';

// Mock the auth module
jest.mock('../../../../lib/auth', () => ({
  clearAuthCookie: jest.fn(),
}));

// Mock the error handling module
jest.mock('../../../../lib/errorHandling', () => {
  const originalModule = jest.requireActual('../../../../lib/errorHandling');
  return {
    ...originalModule,
    error: jest.fn((err, req, res) => {
      // Simple implementation that mimics the real error function
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

describe('Logout API', () => {
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
    } catch (error) {
      // We expect an error to be thrown, so this is actually the success case
      expect(error).toBeDefined();
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Method not allowed');
    }

    // Check that throwValidationError was called with the correct message
    expect(errorHandlingModule.throwValidationError).toHaveBeenCalledWith('Method not allowed');
  });

  it('logs out user successfully', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
    });

    await handler(req, res);

    expect(authModule.clearAuthCookie).toHaveBeenCalledWith(req, res);
    
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      message: 'Logout successful',
    });
  });

  it('handles errors properly', async () => {
    const mockError = new Error('Cookie error');
    
    // Mock a cookie error
    (authModule.clearAuthCookie as jest.Mock).mockImplementation(() => {
      throw mockError;
    });

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
    });

    await handler(req, res);

    expect(res.statusCode).toBe(500);
    expect(JSON.parse(res._getData())).toMatchObject({
      error: 'Error',
      message: 'Cookie error',
    });
  });
});