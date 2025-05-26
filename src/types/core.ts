/**
 * Core Type Definitions
 * Single source of truth for all application types
 * This prevents the cascading TypeScript error problem
 */

// Base User Role Type - The authoritative definition
export type UserRole = 'viewer' | 'advertiser' | 'publisher' | 'admin' | 'stakeholder';

// Type Guards
export function isValidUserRole(role: string): role is UserRole {
  return ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'].includes(role);
}

// Default role for fallback scenarios
export const DEFAULT_ROLE: UserRole = 'viewer';

// Role hierarchy for permission checking
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  viewer: 1,
  advertiser: 2,
  publisher: 3,
  admin: 4,
  stakeholder: 5
};

// Generic types for service responses
export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiResponse<T = any> extends ServiceResponse<T> {
  status: number;
}

// Storage and service types
export interface StorageData {
  [key: string]: any;
}

export interface RoleServiceConfig {
  apiUrl?: string;
  debug?: boolean;
  timeout?: number;
}

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface RoleAwareProps extends BaseComponentProps {
  requiredRole?: UserRole;
  allowedRoles?: UserRole[];
}

// Export everything for easy importing
// Note: Do not re-export role types to avoid circular dependencies