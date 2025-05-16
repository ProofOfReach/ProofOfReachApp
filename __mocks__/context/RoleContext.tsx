/**
 * RoleContext Mock for Jest Tests
 */

import React, { ReactNode } from 'react';

// Type aliases for backward compatibility
export type UserRole = 'user' | 'advertiser' | 'publisher' | 'admin' | 'stakeholder';

// Mock implementation of useRole
export const useRole = jest.fn().mockReturnValue({
  role: 'advertiser',
  setRole: jest.fn().mockResolvedValue(true),
  availableRoles: ['user', 'advertiser', 'publisher', 'admin', 'stakeholder'],
  isRoleAvailable: jest.fn().mockReturnValue(true),
  clearRole: jest.fn(),
  isChangingRole: false
});

// Mock implementation of RoleProvider
export const RoleProvider: React.FC<{ children: ReactNode; initialRole?: UserRole }> = ({ children }) => {
  return <>{children}</>;
};

// Mock implementation of RoleProviderWithQueryClient
export const RoleProviderWithQueryClient: React.FC<{ children: ReactNode; initialRole?: UserRole }> = ({ children }) => {
  return <>{children}</>;
};

// Mock implementation of constants
export const ROLES = {
  USER: 'user' as UserRole,
  ADVERTISER: 'advertiser' as UserRole,
  PUBLISHER: 'publisher' as UserRole,
  ADMIN: 'admin' as UserRole,
  STAKEHOLDER: 'stakeholder' as UserRole,
};

// Mock implementation of utility functions
export function isValidRole(role: string): role is UserRole {
  return ['user', 'advertiser', 'publisher', 'admin', 'stakeholder'].includes(role as UserRole);
}

// Mock permission checking functions
export function hasPermission(role: UserRole, permission: string): boolean {
  if (role === 'admin') return true;
  if (role === 'advertiser' && permission.includes('AD')) return true;
  if (role === 'publisher' && permission.includes('PUBLISH')) return true;
  return false;
}

// Mock route access checking functions
export function canAccessRoute(role: UserRole, route: string): boolean {
  if (role === 'admin') return true;
  if (route.includes('/dashboard')) return true;
  return false;
}

// Mock role capabilities function
export function getRoleCapabilities(role: UserRole): any {
  return {
    canCreateAds: role === 'advertiser' || role === 'admin',
    canManageOwnAds: role === 'advertiser' || role === 'admin', 
    canApproveAds: role === 'publisher' || role === 'admin',
    canViewAnalytics: true,
    canManageRoles: role === 'admin',
    canViewFinancialReports: role === 'stakeholder' || role === 'admin',
    canManageSystem: role === 'admin'
  };
}

// Mock role access control hook
export const useRoleWithAccess = jest.fn().mockReturnValue({
  role: 'advertiser',
  currentRole: 'advertiser',
  availableRoles: ['user', 'advertiser', 'publisher', 'admin', 'stakeholder'],
  can: jest.fn().mockReturnValue(true),
  canAccess: jest.fn().mockReturnValue(true),
  canAccessCurrentRoute: true,
  capabilities: {
    canCreateAds: true,
    canManageOwnAds: true, 
    canApproveAds: false,
    canViewAnalytics: true,
    canManageRoles: false,
    canViewFinancialReports: false,
    canManageSystem: false
  },
  switchRole: jest.fn().mockResolvedValue(true),
  hasRole: jest.fn().mockImplementation((r) => r === 'advertiser'),
  hasPermission: jest.fn().mockReturnValue(true),
  isAdvertiser: true,
  isPublisher: false,
  isAdmin: false,
  isStakeholder: false,
  isUser: false
});

// Mock accessControl export
export const accessControl = {
  permissions: {},
  routes: {},
  roles: ROLES,
  checkPermission: jest.fn().mockReturnValue(true),
  checkRouteAccess: jest.fn().mockReturnValue(true),
  getRoleCapabilities: jest.fn().mockImplementation((role) => getRoleCapabilities(role)),
  isValidRole: jest.fn().mockImplementation((role) => isValidRole(role)),
  validateRoles: jest.fn().mockImplementation((roles) => roles)
};

export default {
  useRole,
  RoleProvider,
  RoleProviderWithQueryClient,
  ROLES,
  isValidRole,
  useRoleWithAccess,
  hasPermission,
  canAccessRoute,
  getRoleCapabilities,
  accessControl
};