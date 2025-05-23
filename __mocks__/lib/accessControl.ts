/**
 * Mock implementation of accessControl module for testing
 */

import type { UserRole as UserRoleType } from '../../src/types/auth';

// Mock of role-based permissions
export const PERMISSIONS = {
  CREATE_ADS: {
    allowedRoles: ['advertiser', 'admin'] as UserRoleType[],
    description: 'Create new ad campaigns'
  },
  EDIT_ADS: {
    allowedRoles: ['advertiser', 'admin'] as UserRoleType[],
    description: 'Edit existing ad campaigns'
  },
  APPROVE_ADS: {
    allowedRoles: ['publisher', 'admin'] as UserRoleType[],
    description: 'Approve or reject ad submissions'
  },
  VIEW_ALL_ADS: {
    allowedRoles: ['admin'] as UserRoleType[],
    description: 'View all ads in the system'
  },
  MANAGE_AD_PLACEMENTS: {
    allowedRoles: ['publisher', 'admin'] as UserRoleType[],
    description: 'Manage ad placements on publisher sites'
  },
  RECEIVE_PAYMENTS: {
    allowedRoles: ['publisher', 'advertiser', 'admin'] as UserRoleType[],
    description: 'Receive payments from the platform'
  },
  MANAGE_USERS: {
    allowedRoles: ['admin'] as UserRoleType[],
    description: 'Manage user accounts'
  },
  MANAGE_ROLES: {
    allowedRoles: ['admin'] as UserRoleType[],
    description: 'Assign and change user roles'
  },
  MANAGE_SYSTEM: {
    allowedRoles: ['admin'] as UserRoleType[],
    description: 'Manage system settings and configuration'
  },
  VIEW_ANALYTICS: {
    allowedRoles: ['advertiser', 'publisher', 'admin', 'stakeholder', 'user'] as UserRoleType[],
    description: 'View analytics dashboards'
  },
  VIEW_FINANCIAL_REPORTS: {
    allowedRoles: ['stakeholder', 'admin'] as UserRoleType[],
    description: 'View financial reports and forecasts'
  },
  MANAGE_API_KEYS: {
    allowedRoles: ['admin', 'publisher', 'advertiser'] as UserRoleType[],
    description: 'Create and manage API keys'
  },
  USE_API: {
    allowedRoles: ['user', 'advertiser', 'publisher', 'admin', 'stakeholder'] as UserRoleType[],
    description: 'Use the API with appropriate authentication'
  },
  MANAGE_CAMPAIGNS: {
    allowedRoles: ['advertiser', 'admin'] as UserRoleType[],
    description: 'Manage advertising campaigns'
  },
  VIEW_PUBLISHER_STATS: {
    allowedRoles: ['publisher', 'admin'] as UserRoleType[],
    description: 'View publisher statistics'
  }
};

// Define route access permissions
export const ROUTE_PERMISSIONS: Record<string, UserRoleType[]> = {
  '/dashboard': ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'],
  '/dashboard/advertiser': ['advertiser', 'admin'],
  '/dashboard/ads/create': ['advertiser', 'admin'],
  '/dashboard/publisher': ['publisher', 'admin'],
  '/dashboard/admin': ['admin'],
};

export const ROLES = {
  USER: 'user' as UserRoleType,
  ADVERTISER: 'advertiser' as UserRoleType,
  PUBLISHER: 'publisher' as UserRoleType,
  ADMIN: 'admin' as UserRoleType,
  STAKEHOLDER: 'stakeholder' as UserRoleType,
};

// Mock implementation of permission checking
export function checkPermission() {
  return true;
}

// Mock implementation of route access checking
export function checkRouteAccess() {
  return true;
}

// Mock implementation of role capabilities
export function getRoleCapabilities(role: UserRoleType): Record<string, boolean> {
  const capabilities: Record<string, boolean> = {
    canCreateAds: role === 'advertiser' || role === 'admin',
    canManageOwnAds: role === 'advertiser' || role === 'admin',
    canApproveAds: role === 'publisher' || role === 'admin',
    canViewAnalytics: true, // All roles can view analytics in tests
    canManageRoles: role === 'admin',
    canViewFinancialReports: role === 'stakeholder' || role === 'admin',
    canManageSystem: role === 'admin',
  };
  
  return capabilities;
}

export const accessControl = {
  permissions: PERMISSIONS,
  routes: ROUTE_PERMISSIONS,
  roles: ROLES,
  checkPermission: jest.fn().mockReturnValue(true),
  checkRouteAccess: jest.fn().mockReturnValue(true),
  getRoleCapabilities: jest.fn().mockImplementation((role: UserRoleType) => ({
    canCreateAds: role === 'advertiser' || role === 'admin',
    canManageOwnAds: role === 'advertiser' || role === 'admin',
    canApproveAds: role === 'publisher' || role === 'admin',
    canViewAnalytics: true,
    canManageRoles: role === 'admin',
    canViewFinancialReports: role === 'stakeholder' || role === 'admin',
    canManageSystem: role === 'admin',
  })),
  isValidRole: jest.fn().mockReturnValue(true),
  validateRoles: jest.fn().mockImplementation((roles) => roles)
};

export default accessControl;