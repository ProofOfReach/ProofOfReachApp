/**
 * Mock implementation of useAuthRefactored hook for testing
 */

import { UserRoleType } from '../src/types/role';

const useAuthRefactoredMock = () => ({
  authState: {
    loading: false,
    isAuthenticated: true,
    user: {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
      image: null,
      nostrPubkey: 'npub_test123456789',
      activeRole: 'advertiser' as UserRoleType,
    },
    session: {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      token: 'mock-session-token',
    },
    availableRoles: ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'] as UserRoleType[],
    currentRole: 'advertiser' as UserRoleType,
    isTestMode: true,
    error: null,
  },
  login: jest.fn().mockResolvedValue({ success: true }),
  logout: jest.fn().mockResolvedValue({ success: true }),
  register: jest.fn().mockResolvedValue({ success: true, userId: 'test-user-id' }),
  refreshSession: jest.fn().mockResolvedValue({ success: true }),
  updateUserRole: jest.fn().mockResolvedValue({ success: true }),
  refreshRoles: jest.fn().mockResolvedValue(['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder']),
  getUserRoles: jest.fn().mockReturnValue(['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder']),
  hasRole: jest.fn().mockImplementation((role) => ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'].includes(role)),
  enableTestMode: jest.fn().mockResolvedValue(true),
  disableTestMode: jest.fn().mockResolvedValue(true),
});

export default useAuthRefactoredMock;