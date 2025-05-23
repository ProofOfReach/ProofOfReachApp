/**
 * Mock for NewRoleContextRefactored
 */
import React, { createContext, ReactNode, useContext } from 'react';

export const ALL_ROLES = ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'] as const;
export type UserRole = typeof ALL_ROLES[number];

// Create a mock context with simplified implementation
const mockContext = createContext<any>({
  role: 'advertiser',
  setRole: jest.fn(),
  availableRoles: ALL_ROLES,
  isRoleAvailable: jest.fn().mockReturnValue(true),
  hasPermission: jest.fn().mockReturnValue(true),
  checkPermission: jest.fn().mockReturnValue(true),
  hasCapability: jest.fn().mockReturnValue(true),
  getRoleCapabilities: jest.fn().mockReturnValue({
    canAccessDashboard: true,
    canCreateAds: true,
    canManageAdSpaces: true,
    canViewAnalytics: true,
    canManageAPIKeys: true,
    canManageWallet: true,
  }),
});

/**
 * Mock Provider with the necessary context values for testing
 */
export const RoleProviderRefactored: React.FC<{ 
  children: ReactNode; 
  initialRole?: string;
}> = ({ children, initialRole = 'advertiser' }) => {
  const [role, setRole] = React.useState<UserRole>(initialRole as UserRole);
  
  const mockSetRole = jest.fn().mockImplementation((newRole: string) => {
    setRole(newRole as UserRole);
    // Update localStorage to mimic the real implementation
    localStorage.setItem('userRole', newRole);
    return Promise.resolve({ log: true });
  });
  
  const contextValue = {
    currentRole: role,
    setCurrentRole: mockSetRole,
    availableRoles: ALL_ROLES,
    isRoleAvailable: jest.fn().mockReturnValue(true),
    hasPermission: jest.fn().mockReturnValue(true),
    checkPermission: jest.fn().mockReturnValue(true),
    hasCapability: jest.fn().mockReturnValue(true),
    getRoleCapabilities: jest.fn().mockReturnValue({
      canAccessDashboard: true,
      canCreateAds: true,
      canManageAdSpaces: true,
      canViewAnalytics: true,
      canManageAPIKeys: true,
      canManageWallet: true,
    }),
  };
  
  return <mockContext.Provider value={contextValue}>{children}</mockContext.Provider>;
};

export const useNewRole = jest.fn().mockReturnValue({
  currentRole: 'advertiser',
  hasPermission: jest.fn().mockReturnValue(true),
  setCurrentRole: jest.fn(),
  checkPermission: jest.fn().mockReturnValue(true),
  isRoleAvailable: jest.fn().mockReturnValue(true),
  hasCapability: jest.fn().mockReturnValue(true),
  getRoleCapabilities: jest.fn().mockReturnValue({
    canAccessDashboard: true,
    canCreateAds: true,
    canManageAdSpaces: true,
    canViewAnalytics: true,
    canManageAPIKeys: true,
    canManageWallet: true,
  }),
});

export const NewRoleContextRefactored = mockContext;