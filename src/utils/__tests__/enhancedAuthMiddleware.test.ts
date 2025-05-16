/**
 * Tests for Enhanced Authentication Middleware
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { enhancedAuthMiddleware, requireRoles, requireAdmin } from '../enhancedAuthMiddleware';
import { prisma } from '../../lib/prisma';

// Mock Next.js request/response
const createMockReq = (cookies: Record<string, string> = {}): NextApiRequest => {
  return {
    cookies,
    method: 'GET',
  } as unknown as NextApiRequest;
};

const createMockRes = () => {
  const res: Partial<NextApiResponse> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis(),
  };
  return res as NextApiResponse;
};

// Mock Prisma
jest.mock('../../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
  },
}));

// Mock logger to prevent console spam during tests
jest.mock('../../lib/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('Enhanced Authentication Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('enhancedAuthMiddleware', () => {
    it('should return 401 if no pubkey cookie is found', async () => {
      const req = createMockReq();
      const res = createMockRes();
      const handler = jest.fn();

      await enhancedAuthMiddleware(handler)(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
      expect(handler).not.toHaveBeenCalled();
    });

    it('should handle test mode users', async () => {
      const req = createMockReq({ nostr_pubkey: 'pk_test_user123', userRole: 'admin' });
      const res = createMockRes();
      const handler = jest.fn();

      await enhancedAuthMiddleware(handler)(req, res);

      expect(handler).toHaveBeenCalledWith(
        req, 
        res, 
        expect.objectContaining({ 
          pubkey: 'pk_test_user123',
          roles: ['user', 'advertiser', 'publisher', 'admin', 'stakeholder'],
          currentRole: 'admin',
          isTestMode: true,
        })
      );
    });

    it('should return 401 if user not found', async () => {
      const req = createMockReq({ nostr_pubkey: 'real_pubkey123' });
      const res = createMockRes();
      const handler = jest.fn();

      // Mock user not found
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

      await enhancedAuthMiddleware(handler)(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(handler).not.toHaveBeenCalled();
    });

    it('should call handler with user info for valid users', async () => {
      const req = createMockReq({ nostr_pubkey: 'real_pubkey123', userRole: 'publisher' });
      const res = createMockRes();
      const handler = jest.fn();

      // Mock user found with both findUnique and findFirst
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user123',
        nostrPubkey: 'real_pubkey123',
        isPublisher: true,
        isAdmin: false,
        preferences: {
          currentRole: 'publisher',
        },
      });
      
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({
        id: 'user123',
        nostrPubkey: 'real_pubkey123',
        isPublisher: true,
        isAdmin: false,
        preferences: {
          currentRole: 'publisher',
        },
      });

      await enhancedAuthMiddleware(handler)(req, res);

      expect(handler).toHaveBeenCalledWith(
        req, 
        res, 
        expect.objectContaining({ 
          userId: 'user123',
          pubkey: 'real_pubkey123',
          roles: expect.arrayContaining(['user', 'publisher']),
          currentRole: 'publisher',
          isTestMode: false,
        })
      );
    });
  });

  describe('requireRoles', () => {
    it('should allow access when user has required role', async () => {
      const req = createMockReq({ nostr_pubkey: 'pk_test_user123', userRole: 'admin' });
      const res = createMockRes();
      const handler = jest.fn();

      await requireRoles(['admin'])(handler)(req, res);

      expect(handler).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalledWith(403);
    });

    it('should deny access when user does not have required role', async () => {
      const req = createMockReq({ nostr_pubkey: 'pk_test_user123', userRole: 'user' });
      const res = createMockRes();
      const handler = jest.fn();

      // Mock a user with only 'user' role despite being in test mode
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({
        id: 'user123',
        nostrPubkey: 'pk_test_user123',
        isPublisher: false,
        isAdmin: false,
        isAdvertiser: false,
        isStakeholder: false,
      });

      await requireRoles(['admin'])(handler)(req, res);

      expect(handler).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  describe('convenience middlewares', () => {
    it('requireAdmin should only allow admin users', async () => {
      const req = createMockReq({ nostr_pubkey: 'pk_test_user123', userRole: 'admin' });
      const res = createMockRes();
      const handler = jest.fn();

      await requireAdmin(handler)(req, res);

      expect(handler).toHaveBeenCalled();
    });

    it('requireAdmin should deny non-admin users', async () => {
      const req = createMockReq({ nostr_pubkey: 'pk_test_user123', userRole: 'publisher' });
      const res = createMockRes();
      const handler = jest.fn();

      // Override test mode to only allow publisher role
      (prisma.user.findFirst as jest.Mock).mockResolvedValue({
        id: 'user123',
        nostrPubkey: 'pk_test_user123',
        isPublisher: true,
        isAdmin: false,
      });

      await requireAdmin(handler)(req, res);

      expect(handler).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });
});