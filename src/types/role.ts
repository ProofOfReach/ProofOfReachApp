// Re-export UserRole from core types to maintain single source of truth
export type { UserRole } from './core';
import type { UserRole } from './core';

/**
 * Check if a string is a valid UserRole
 */
export function isValidUserRole(role: string): role is UserRole {
  return ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'].includes(role);
}

/**
 * Filter and return only valid roles from an array of strings
 */
export function filterValidRoles(roles: string[]): UserRole[] {
  return roles.filter(isValidUserRole);
}

export interface RoleCapabilities {
  canCreateAds: boolean;
  canManageOwnAds: boolean;
  canApproveAds: boolean;
  canViewAnalytics: boolean;
  canManageRoles: boolean;
  canViewFinancialReports: boolean;
  canManageSystem: boolean;
}

export interface TestModeState {
  isActive: boolean;
  expiryTime: number | null;
  currentRole: string;
  availableRoles: string[];
  lastUpdated: number;
}

export const STORAGE_KEYS = {
  TEST_MODE: 'testMode',
  USER_ROLE: 'userRole',
  AUTH_TOKEN: 'authToken',
  CURRENT_ROLE: 'currentRole',
  LAST_ROLE_CHANGE: 'lastRoleChange',
  BYPASS_API_CALLS: 'bypass_api_calls',
} as const;