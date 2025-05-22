/**
 * User Role Type Definitions
 * 
 * This file contains type definitions for the role system to ensure consistent
 * typing across the application.
 * 
 * By centralizing these definitions, we ensure type safety and allow for easier
 * refactoring in the future.
 */

/**
 * Available user roles in the system
 * This matches the Prisma schema's UserRole enum
 * 
 * @note This should be kept in sync with src/lib/roles/types.ts UserRoleType definition
 */
export type UserRoleType = 'viewer' | 'advertiser' | 'publisher' | 'admin' | 'stakeholder' | 'developer';

/**
 * Role data structure for consistent storage and retrieval
 */
export interface RoleData {
  /** The currently active role for the user */
  currentRole: UserRoleType;
  /** All roles available to this user */
  availableRoles: UserRoleType[];
  /** Timestamp of when this data was last updated */
  timestamp: number;
}

/**
 * Extended role access capabilities
 * Provides specific permission checks for various actions
 */
export interface RoleCapabilities {
  /** Check if the user can create ads */
  canCreateAds: boolean;
  /** Check if the user can manage their own ads */
  canManageOwnAds: boolean;
  /** Check if the user can approve ads */
  canApproveAds: boolean;
  /** Check if the user can view analytics */
  canViewAnalytics: boolean;
  /** Check if the user can manage user roles */
  canManageRoles: boolean;
  /** Check if the user can view financial reports */
  canViewFinancialReports: boolean;
  /** Check if the user can manage system settings */
  canManageSystem: boolean;
}

/**
 * Check if a string is a valid UserRoleType
 */
export function isValidUserRole(role: string): role is UserRoleType {
  return ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'].includes(role as UserRoleType);
}

/**
 * Filter a list of roles to only include valid roles
 */
export function filterValidRoles(roles: string[]): UserRoleType[] {
  return roles.filter(isValidUserRole);
}

/**
 * Get a safe default role if the provided role is invalid
 */
export function getDefaultRole(): UserRoleType {
  return 'viewer';
}

const roleDefaults = {
  isValidUserRole,
  filterValidRoles,
  getDefaultRole
};

export default roleDefaults;