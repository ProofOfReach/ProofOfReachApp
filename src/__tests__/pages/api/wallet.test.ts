import { createMocks } from 'node-mocks-http';
import type { NextApiRequest, NextApiResponse } from 'next';
import walletHandler from '../../../pages/api/wallet/index';
import { prisma } from '../../../lib/prismaClient';
import { logger } from '../../../lib/logger';

// Mock Prisma
jest.mock('../../../lib/prismaClient', () => ({
  prisma: {
    user: {
      findUnique: jest.fn()
    }
  }
}));

// Mock logger
jest.mock('../../../lib/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    http: jest.fn(),
    debug: jest.fn(),
    log: jest.fn()
  }
}));

// Mock the enhanced auth middleware
jest.mock('../../../utils/enhancedAuthMiddleware', () => ({
  enhancedAuthMiddleware: jest.fn().mockImplementation((handler) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      const user = {
        pubkey: 'test-pubkey',
        userId: 'user123',
        isAuthenticated: true,
        isTestMode: false,
        roles: ['viewer']
      };
      return await handler(req, res, user);
    };
  })
}));

describe('/api/wallet endpoint', () => {
  describe('GET /api/wallet', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    
    it('returns wallet balance successfully', async () => {
      // Setup mocks
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'user123',
        balance: 20000
      });
      
      // Create mock request/response
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
      });
      
      // Call the API handler
      await walletHandler(req, res);
      
      // Verify mocks were called
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user123' },
        select: { balance: true }
      });
      
      // Check response
      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({
        balance: 20000,
      });
    });
    
    it('returns 404 when user is not found', async () => {
      // Setup mocks
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
      
      // Create mock request/response
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
      });
      
      // Call the API handler
      await walletHandler(req, res);
      
      // Check response
      expect(res._getStatusCode()).toBe(404);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'User not found',
      });
    });
    
    it('returns 0 balance when user balance is null', async () => {
      // Setup mocks
      (prisma.user.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'user123',
        balance: null
      });
      
      // Create mock request/response
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
      });
      
      // Call the API handler
      await walletHandler(req, res);
      
      // Check response
      expect(res._getStatusCode()).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({
        balance: 0,
      });
    });
    
    it('handles database errors gracefully', async () => {
      // Setup mocks
      (prisma.user.findUnique as jest.Mock).mockRejectedValueOnce(new Error('Database error'));
      
      // Create mock request/response
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
      });
      
      // Call the API handler
      await walletHandler(req, res);
      
      // Check response
      expect(res._getStatusCode()).toBe(500);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Error retrieving balance',
      });
    });
    
    it('returns 405 for non-GET methods', async () => {
      // Create mock request/response
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
      });
      
      // Call the handler
      await walletHandler(req, res);
      
      // Check response
      expect(res._getStatusCode()).toBe(405);
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Method not allowed',
      });
    });
  });
});