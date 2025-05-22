import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import toggleTestModeHandler from '../toggle-test-mode';
import { hasRole, toggleTestMode } from '@/lib/enhancedRoleService';

// Mock dependencies
jest.mock('@/lib/enhancedRoleService', () => ({
  hasRole: jest.fn(),
  toggleTestMode: jest.fn()
}));

jest.mock('@/utils/authMiddleware', () => ({
  authMiddleware: (handler: any) => async (req: any, res: any) => {
    // Pass a test user ID
    return handler(req, res, 'test-admin-user');
  }
}));

describe('Toggle Test Mode API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 405 for non-POST methods', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET'
    });

    await toggleTestModeHandler(req, res);

    expect(res.statusCode).toBe(405);
    expect(JSON.parse(res._getData())).toMatchObject({
      message: 'Method not allowed'
    });
  });

  it('should return 400 if userId is missing', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        enabled: true
      }
    });

    await toggleTestModeHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res._getData())).toMatchObject({
      message: 'Missing required fields: userId'
    });
  });

  it('should return 400 if enabled is not a boolean', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        userId: 'user-123',
        enabled: 'not-a-boolean'
      }
    });

    await toggleTestModeHandler(req, res);

    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res._getData())).toMatchObject({
      message: 'Invalid value for enabled, must be a boolean'
    });
  });

  it('should return 403 if user is not an admin', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        userId: 'user-123',
        enabled: true
      }
    });

    // Mock hasRole to return false (not an admin)
    (hasRole as jest.Mock).mockResolvedValue(false);

    await toggleTestModeHandler(req, res);

    expect(hasRole).toHaveBeenCalledWith('test-admin-user', 'admin');
    expect(res.statusCode).toBe(403);
    expect(JSON.parse(res._getData())).toMatchObject({
      message: 'Forbidden: Only admins can toggle test mode'
    });
  });

  it('should return 404 if user is not found', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        userId: 'non-existent-user',
        enabled: true
      }
    });

    // Mock hasRole to return true (is an admin)
    (hasRole as jest.Mock).mockResolvedValue(true);
    // Mock toggleTestMode to return null (user not found)
    (toggleTestMode as jest.Mock).mockResolvedValue(null);

    await toggleTestModeHandler(req, res);

    expect(hasRole).toHaveBeenCalledWith('test-admin-user', 'admin');
    expect(toggleTestMode).toHaveBeenCalledWith('non-existent-user', true);
    expect(res.statusCode).toBe(404);
    expect(JSON.parse(res._getData())).toMatchObject({
      message: 'User not found'
    });
  });

  it('should toggle test mode successfully', async () => {
    const mockUserId = 'user-123';
    const mockUserData = {
      id: mockUserId,
      currentRole: 'admin',
      availableRoles: ['admin', 'advertiser', 'publisher'],
      isTestUser: true
    };

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        userId: mockUserId,
        enabled: true
      }
    });

    // Mock hasRole to return true (is an admin)
    (hasRole as jest.Mock).mockResolvedValue(true);
    // Mock toggleTestMode to return mock user data
    (toggleTestMode as jest.Mock).mockResolvedValue(mockUserData);

    await toggleTestModeHandler(req, res);

    expect(hasRole).toHaveBeenCalledWith('test-admin-user', 'admin');
    expect(toggleTestMode).toHaveBeenCalledWith(mockUserId, true);
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res._getData())).toMatchObject({
      message: 'Test mode enabled successfully for user user-123',
      data: mockUserData
    });
  });

  it('should handle errors gracefully', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        userId: 'user-123',
        enabled: true
      }
    });

    // Mock hasRole to return true (is an admin)
    (hasRole as jest.Mock).mockResolvedValue(true);
    // Mock toggleTestMode to throw an error
    (toggleTestMode as jest.Mock).mockRejectedValue(new Error('Database error'));

    await toggleTestModeHandler(req, res);

    expect(hasRole).toHaveBeenCalledWith('test-admin-user', 'admin');
    expect(toggleTestMode).toHaveBeenCalledWith('user-123', true);
    expect(res.statusCode).toBe(500);
    expect(JSON.parse(res._getData())).toMatchObject({
      message: 'Database error'
    });
  });
});