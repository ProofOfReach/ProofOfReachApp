/**
 * Mock implementation of AuthProviderRefactored for testing
 */

import React, { ReactNode, createContext } from 'react';
import type { UserRole as UserRoleType } from '../../src/types/auth';

// Import the mock hook to ensure consistency
import useAuthRefactoredMock from '../useAuthRefactoredMock';

// Get the mock data from the hook
const mockAuthContextValue = {
  authState: {
    loading: false,
    isAuthenticated: true,
    user: {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
      image: null,
      nostrPubkey: 'npub_test123456789',
      activeRole: 'advertiser',
    },
    session: {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      token: 'mock-session-token',
    },
    availableRoles: ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'],
    currentRole: 'advertiser',
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
};

// Create the context - must match exactly what's used in the actual AuthProviderRefactored
export const AuthContextRefactored = createContext<ReturnType<typeof useAuthRefactoredMock>>(mockAuthContextValue as any);

// Create the provider component
export const AuthProviderRefactored: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <AuthContextRefactored.Provider value={mockAuthContextValue as any}>
      {children}
    </AuthContextRefactored.Provider>
  );
};

export default AuthProviderRefactored;