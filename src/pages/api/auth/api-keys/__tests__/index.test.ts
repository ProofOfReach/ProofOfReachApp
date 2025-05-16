import { createMocks } from 'node-mocks-http';
import handler from '../index';
import { prisma } from '../../../../../lib/prismaClient';
import crypto from 'crypto';

// Mock the authentication middleware
jest.mock('../../../../../utils/authMiddleware');

// Mock Prisma client
jest.mock('../../../../../lib/prismaClient', () => ({
  prisma: {
    $queryRaw: jest.fn(),
    $executeRaw: jest.fn()
  }
}));

// Mock crypto
jest.mock('crypto', () => ({
  randomBytes: jest.fn(() => ({
    toString: jest.fn(() => 'mock-random-bytes')
  })),
  randomUUID: jest.fn(() => 'mock-uuid')
}));

describe('API Keys Endpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/auth/api-keys', () => {
    it('should return an array of API keys', async () => {
      // Mock the database response with ISO string dates (as they would be serialized in JSON)
      const mockApiKeys = [
        {
          id: 'api-key-1',
          name: 'Test API Key 1',
          description: 'Description 1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastUsed: null,
          expiresAt: null,
          isActive: true,
          scopes: 'read',
          usageCount: 0
        },
        {
          id: 'api-key-2',
          name: 'Test API Key 2',
          description: 'Description 2',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastUsed: null,
          expiresAt: null,
          isActive: true,
          scopes: 'read,write',
          usageCount: 5
        }
      ];

      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce(mockApiKeys);

      const { req, res } = createMocks({
        method: 'GET'
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(200);
      // Use deep partial matcher to avoid strict date comparisons
      expect(JSON.parse(res._getData())).toEqual(expect.arrayContaining([
        expect.objectContaining({
          id: 'api-key-1',
          name: 'Test API Key 1'
        }),
        expect.objectContaining({
          id: 'api-key-2',
          name: 'Test API Key 2'
        })
      ]));
      expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
    });

    it('should handle errors', async () => {
      (prisma.$queryRaw as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      const { req, res } = createMocks({
        method: 'GET'
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      expect(JSON.parse(res._getData())).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/api-keys', () => {
    it('should create a new API key', async () => {
      const newApiKey = {
        id: 'mock-uuid',
        key: 'ak_mock-random-bytes',
        name: 'New API Key',
        description: 'New Description',
        createdAt: new Date().toISOString(),
        expiresAt: null,
        scopes: 'read'
      };

      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([newApiKey]);

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          name: 'New API Key',
          description: 'New Description',
          scopes: 'read'
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(201);
      expect(JSON.parse(res._getData())).toMatchObject({
        id: 'mock-uuid',
        key: 'ak_mock-random-bytes',
        name: 'New API Key',
        description: 'New Description',
        expiresAt: null,
        scopes: 'read'
      });
      expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
    });

    it('should handle validation errors', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {
          // Missing name field
          description: 'New Description'
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(422);
      expect(JSON.parse(res._getData())).toHaveProperty('error');
      expect(prisma.$queryRaw).not.toHaveBeenCalled();
    });

    it('should handle creation failures', async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([]);

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          name: 'New API Key',
          description: 'New Description'
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
      expect(JSON.parse(res._getData())).toHaveProperty('error');
      expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
    });
  });

  it('should reject invalid methods', async () => {
    const { req, res } = createMocks({
      method: 'PUT'
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
    expect(JSON.parse(res._getData())).toHaveProperty('error');
  });
});