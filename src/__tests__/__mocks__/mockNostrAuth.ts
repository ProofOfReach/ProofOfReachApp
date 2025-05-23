// This file mocks the auth context for testing
import { AuthState } from '../../hooks/useAuth';
import type { UserRole } from '../../types/role';

// Create a properly typed auth state
const mockAuthState: AuthState = {
  pubkey: 'test-pubkey-123456789',
  isTestMode: true,
  isLoggedIn: true,
  availableRoles: ['viewer', 'advertiser', 'publisher'] as UserRole[],
  profile: {
    name: 'Test User',
    displayName: 'Test',
    avatar: '',
  }
};

const mockNostrAuth = {
  auth: mockAuthState,
  login: jest.fn().mockResolvedValue(true),
  logout: jest.fn().mockResolvedValue(undefined),
  refreshRoles: jest.fn().mockResolvedValue(['viewer', 'advertiser', 'publisher'] as UserRole[]),
  addRole: jest.fn().mockResolvedValue(true),
  removeRole: jest.fn().mockResolvedValue(true),
};

export default mockNostrAuth;