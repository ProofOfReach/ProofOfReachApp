/**
 * @jest-environment jsdom
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { 
  setAuthCookie, 
  clearAuthCookie, 
  isAuthenticated,
  SESSION_COOKIE_NAME,
} from '../../lib/auth';
import { PrismaClient } from '@prisma/client';
import type { UserRole } from '../../types/role';

// Mock cookies-next
jest.mock('cookies-next', () => ({
  setCookie: jest.fn(),
  deleteCookie: jest.fn(),
  getCookie: jest.fn(),
}));

// Mock the prisma client module
jest.mock('../../lib/prismaClient', () => ({
  __esModule: true,
  prisma: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  },
  default: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Mock the Next.js API request and response
const mockReq = {
  headers: {
    cookie: '',
  },
  cookies: {},
} as any as NextApiRequest;

const mockRes = {
  setHeader: jest.fn(),
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
  end: jest.fn(),
} as any as NextApiResponse;

describe('Auth Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReq.cookies = {};
    mockReq.headers.cookie = '';
  });

  describe('setAuthCookie', () => {
    it('sets the cookie with the pubkey', () => {
      const testPubkey = 'viewer' as UserRole;
      
      // Import the actual setCookie function to mock
      const { setCookie } = require('cookies-next');
      
      setAuthCookie(testPubkey, mockReq, mockRes);
      
      // Check that setCookie was called with the correct parameters
      expect(setCookie).toHaveBeenCalledWith(
        SESSION_COOKIE_NAME, 
        testPubkey,
        expect.objectContaining({
          req: mockReq,
          res: mockRes,
          path: '/',
        })
      );
    });
  });

  describe('clearAuthCookie', () => {
    it('clears the auth cookie', () => {
      // Import the actual deleteCookie function to mock
      const { deleteCookie } = require('cookies-next');
      
      clearAuthCookie(mockReq, mockRes);
      
      // Check that deleteCookie was called with the correct parameters
      expect(deleteCookie).toHaveBeenCalledWith(
        SESSION_COOKIE_NAME,
        expect.objectContaining({
          req: mockReq,
          res: mockRes,
          path: '/',
        })
      );
    });
  });

  describe('isAuthenticated', () => {
    it('returns null when no pubkey cookie is present', async () => {
      // Set up mock request with empty cookies
      mockReq.headers.cookie = '';
      
      // Mock the getCookie function
      const { getCookie } = require('cookies-next');
      (getCookie as jest.Mock).mockReturnValue(null);
      
      const authenticated = await isAuthenticated(mockReq);
      
      expect(authenticated).toBe(null);
    });
    
    it('returns the pubkey when a pubkey cookie is present and valid', async () => {
      const testPubkey = 'test-pubkey-123';
      
      // Set up mock request with cookie
      mockReq.headers.cookie = `${SESSION_COOKIE_NAME}=${testPubkey}`;
      
      // Mock the getCookie function for fallback
      const { getCookie } = require('cookies-next');
      (getCookie as jest.Mock).mockReturnValue(testPubkey);
      
      // Get the prisma client mock and set up the response
      const prismaModule = require('../../lib/prismaClient');
      
      // Clear and set up the mock implementation for findUnique
      prismaModule.prisma.user.findUnique.mockReset();
      prismaModule.prisma.user.findUnique.mockResolvedValue({
        id: 'user-1',
        nostrPubkey: testPubkey
      });
      
      // Also set up mock for findFirst which is used in getServerSession
      prismaModule.prisma.user.findFirst.mockReset();
      prismaModule.prisma.user.findFirst.mockResolvedValue({
        id: 'user-1',
        nostrPubkey: testPubkey
      });
      
      // Run the authentication check
      const authenticated = await isAuthenticated(mockReq);
      
      // Verify the result
      expect(authenticated).toBe(testPubkey);
    });
    
    it('returns null when user is not found in database', async () => {
      const testPubkey = 'unknown-pubkey';
      
      // Set up mock request with cookie
      mockReq.headers.cookie = `${SESSION_COOKIE_NAME}=${testPubkey}`;
      
      // Mock the getCookie function for fallback
      const { getCookie } = require('cookies-next');
      (getCookie as jest.Mock).mockReturnValue(testPubkey);
      
      // Get the prisma client mock and set it to return null
      const prismaModule = require('../../lib/prismaClient');
      
      // Clear and set up the mock implementation to return null
      prismaModule.prisma.user.findUnique.mockReset();
      prismaModule.prisma.user.findUnique.mockResolvedValue(null);
      
      // Also set up mock for findFirst which is used in getServerSession
      prismaModule.prisma.user.findFirst.mockReset();
      prismaModule.prisma.user.findFirst.mockResolvedValue(null);
      
      // Run the authentication check with our null-returning mock
      const authenticated = await isAuthenticated(mockReq);
      
      // Should return null since user doesn't exist
      expect(authenticated).toBe(null);
    });
  });
});