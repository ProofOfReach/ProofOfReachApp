/**
 * Centralized role type definitions
 * This file contains all role-related types for consistent usage across the application
 */

/**
 * Valid user roles in the system
 * - viewer: Basic user who can view content and ads
 * - advertiser: Can create and manage ads
 * - publisher: Can monetize content through ads
 * - admin: Has full system access
 * - stakeholder: Has access to business metrics
 * - developer: Has access to technical metrics and API information
 */
export type UserRole = 'viewer' | 'advertiser' | 'publisher' | 'admin' | 'stakeholder' | 'developer';

/**
 * Role permission mapping
 * Defines what each role is allowed to do
 */
export interface RolePermissions {
  viewDashboard: boolean;
  createAds: boolean;
  manageAds: boolean;
  monetizeContent: boolean;
  viewAnalytics: boolean;
  accessAdminPanel: boolean;
  viewFinancialData: boolean;
  viewTechnicalData: boolean;
  manageUsers: boolean;
  manageSettings: boolean;
  manageApiKeys: boolean;
}

/**
 * Role information including display name and description
 */
export interface RoleInfo {
  id: string;
  displayName: string;
  description: string;
  permissions: RolePermissions;
  uiIcon?: string; // For UI representation
}

/**
 * Role assignment status
 */
export interface UserRoleStatus {
  role: string;
  isActive: boolean;
  isTestRole: boolean;
  assignedAt?: Date;
}

/**
 * User role context - what the application knows about user roles
 */
export interface UserRoleContext {
  // Current active role
  currentRole: string;
  
  // All roles assigned to the user
  availableRoles: string[];
  
  // Detailed role information with permission status
  roleDetails: Record<UserRole, UserRoleStatus>;
  
  // Session information
  isAuthenticated: boolean;
  isTestMode: boolean;
  
  // Actions
  setCurrentRole: (role: string) => Promise<boolean>;
}

/**
 * Error types specific to role operations
 */
export enum RoleErrorType {
  NOT_AUTHENTICATED = 'NOT_AUTHENTICATED',
  ROLE_NOT_FOUND = 'ROLE_NOT_FOUND',
  ROLE_NOT_ASSIGNED = 'ROLE_NOT_ASSIGNED',
  INVALID_ROLE = 'INVALID_ROLE',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  DATABASE_ERROR = 'DATABASE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Structured error response for role operations
 */
export interface RoleError {
  type: RoleErrorType;
  message: string;
  status: number;
  details?: any;
}

/**
 * Response structure for role API endpoints
 */
export interface RoleResponse<T = any> {
  log: boolean;
  data?: T;
  error?: RoleError;
}