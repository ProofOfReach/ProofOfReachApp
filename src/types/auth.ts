import { UserRole } from "@/types/role";
/**
 * Authentication Types
 * 
 * This file contains TypeScript type definitions related to authentication.
 */

// Import the standardized UserRole from role.ts
import type { UserRole } from './role';

// Re-export for backwards compatibility (to be removed in future)
export type UserRole = UserRole;

/**
 * Authentication state
 */
export interface AuthState {
  /**
   * Whether the user is logged in
   */
  isLoggedIn: boolean;
  
  /**
   * The user's Nostr public key
   */
  pubkey: string;
  
  /**
   * Whether the user is in test mode
   */
  isTestMode: boolean;
  
  /**
   * Available roles for the user
   */
  availableRoles: string[];
}

/**
 * Authentication state context
 */
export interface AuthStateContext {
  /**
   * Authentication state
   */
  authState: AuthState | null;
  
  /**
   * Function to attempt login
   */
  login: (pubkey: UserRole, signedMessage: string) => Promise<AuthState>;
  
  /**
   * Function to log out
   */
  logout: () => Promise<void>;
  
  /**
   * Function to check if the user has a specific role
   */
  hasRole: (role: string) => boolean;
  
  /**
   * Function to refresh the user's roles
   */
  refreshRoles: (pubkey: string) => Promise<AuthState>;
  
  /**
   * Function to add a role to the user
   */
  addRole: (pubkey: UserRole, role: string) => Promise<boolean>;
  
  /**
   * Function to remove a role from the user
   */
  removeRole: (pubkey: UserRole, role: string) => Promise<boolean>;
  
  /**
   * Whether authentication is being checked
   */
  isLoading: boolean;
}

/**
 * Response from login API
 */
export interface LoginResponse {
  log: boolean;
  isLoggedIn: boolean;
  pubkey: string;
  isTestMode: boolean;
  availableRoles: string[];
}

/**
 * Response from auth check API
 */
export interface CheckAuthResponse {
  isLoggedIn: boolean;
  pubkey?: string;
  isTestMode?: boolean;
  availableRoles?: string[];
}

/**
 * Response from logout API
 */
export interface LogoutResponse {
  log: boolean;
  message: string;
}

/**
 * Response from refresh roles API
 */
export interface RefreshRolesResponse {
  log: boolean;
  message?: string;
  availableRoles: string[];
  isTestMode?: boolean;
}

/**
 * Response from add role API
 */
export interface AddRoleResponse {
  log: boolean;
  message?: string;
}

/**
 * Response from remove role API
 */
export interface RemoveRoleResponse {
  log: boolean;
  message?: string;
}