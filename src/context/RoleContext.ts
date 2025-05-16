/**
 * RoleContext Module (Compatibility Layer)
 * 
 * This file serves as a compatibility layer for the refactoring process.
 * It re-exports the new types and implementations to maintain backward
 * compatibility with existing code that imports from the old location.
 * 
 * This approach allows for incremental refactoring without breaking existing code.
 * 
 * WARNING: This file is deprecated and will be removed in a future release.
 * All new code should import directly from the centralized modules.
 */

// Import types from the centralized type definitions
import { UserRoleType, RoleCapabilities } from '../types/role';

// Import the new implementations
import { useRoleRefactored, RoleProviderRefactored, RoleProviderRefactoredWithQueryClient } from './NewRoleContextRefactored';
import { useRoleAccess } from '../hooks/useRoleAccess';
import { accessControl } from '../lib/accessControl';

// Re-export the types with old names for backward compatibility
export type UserRole = UserRoleType;

// Re-export the new hooks with old names
export const useRole = useRoleRefactored;
export const RoleProvider = RoleProviderRefactored;
export const RoleProviderWithQueryClient = RoleProviderRefactoredWithQueryClient;

// Export the new access control hook as an alternative
export const useRoleWithAccess = useRoleAccess;

/**
 * @deprecated Use accessControl.roles from src/lib/accessControl.ts instead
 */
export const ROLES = {
  VIEWER: 'viewer' as UserRole,
  ADVERTISER: 'advertiser' as UserRole,
  PUBLISHER: 'publisher' as UserRole,
  ADMIN: 'admin' as UserRole,
  STAKEHOLDER: 'stakeholder' as UserRole,
};

/**
 * @deprecated Use accessControl.isValidRole from src/lib/accessControl.ts instead
 */
export function isValidRole(role: string): role is UserRole {
  return accessControl.isValidRole(role as any);
}

/**
 * Check if a role has a specific permission
 * @deprecated Use accessControl.checkPermission or useRoleAccess hook instead
 */
export function hasPermission(role: UserRole, permission: string): boolean {
  return accessControl.checkPermission(permission as any, role);
}

/**
 * Check if a role can access a specific route
 * @deprecated Use accessControl.checkRouteAccess or useRoleAccess hook instead
 */
export function canAccessRoute(role: UserRole, route: string): boolean {
  return accessControl.checkRouteAccess(route, role);
}

/**
 * Get all capabilities for a specific role
 * @deprecated Use accessControl.getRoleCapabilities or useRoleAccess hook instead
 */
export function getRoleCapabilities(role: UserRole): RoleCapabilities {
  // Convert the object returned by accessControl to the expected RoleCapabilities type
  const capabilities = accessControl.getRoleCapabilities(role) as Record<string, boolean>;
  
  // Create a properly-typed object that matches RoleCapabilities
  return {
    canCreateAds: capabilities['CREATE_ADS'] || role === 'advertiser' || role === 'admin',
    canManageOwnAds: capabilities['EDIT_ADS'] || role === 'advertiser' || role === 'admin',
    canApproveAds: capabilities['APPROVE_ADS'] || role === 'publisher' || role === 'admin',
    canViewAnalytics: capabilities['VIEW_ANALYTICS'] || true,  // Almost all roles can view analytics
    canManageRoles: capabilities['MANAGE_ROLES'] || role === 'admin',
    canViewFinancialReports: capabilities['VIEW_FINANCIAL_REPORTS'] || role === 'stakeholder' || role === 'admin',
    canManageSystem: capabilities['MANAGE_SYSTEM'] || role === 'admin'
  };
}

/**
 * @deprecated Use accessControl.isRoleAvailable from src/lib/accessControl.ts instead
 */
export function isRoleAvailable(role: UserRole, availableRoles: UserRole[]): boolean {
  return accessControl.isRoleAvailable(role, availableRoles);
}

/**
 * @deprecated Use accessControl.getRoleDashboardPath from src/lib/accessControl.ts instead
 */
export function getRoleDashboardPath(role: UserRole): string {
  return accessControl.getRoleDashboardPath(role);
}

/**
 * @deprecated Use accessControl.getAllRoles from src/lib/accessControl.ts instead
 */
export function getAllRoles(): UserRole[] {
  return accessControl.getAllRoles();
}

// Export all components for backward compatibility
export default {
  useRole,
  RoleProvider,
  RoleProviderWithQueryClient,
  useRoleWithAccess,
  ROLES,
  isValidRole,
  hasPermission,
  canAccessRoute,
  getRoleCapabilities,
  isRoleAvailable,
  getRoleDashboardPath,
  getAllRoles,
  accessControl
};