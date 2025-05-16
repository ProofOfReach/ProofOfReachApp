/**
 * Authentication Types
 * 
 * This file contains TypeScript type definitions related to authentication.
 */

/**
 * User roles
 */
export type UserRole = 'user' | 'advertiser' | 'publisher' | 'admin' | 'stakeholder';

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
  availableRoles: UserRole[];
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
  login: (pubkey: string, signedMessage: string) => Promise<AuthState>;
  
  /**
   * Function to log out
   */
  logout: () => Promise<void>;
  
  /**
   * Function to check if the user has a specific role
   */
  hasRole: (role: UserRole) => boolean;
  
  /**
   * Function to refresh the user's roles
   */
  refreshRoles: (pubkey: string) => Promise<AuthState>;
  
  /**
   * Function to add a role to the user
   */
  addRole: (pubkey: string, role: UserRole) => Promise<boolean>;
  
  /**
   * Function to remove a role from the user
   */
  removeRole: (pubkey: string, role: UserRole) => Promise<boolean>;
  
  /**
   * Whether authentication is being checked
   */
  isLoading: boolean;
}

/**
 * Response from login API
 */
export interface LoginResponse {
  success: boolean;
  isLoggedIn: boolean;
  pubkey: string;
  isTestMode: boolean;
  availableRoles: UserRole[];
}

/**
 * Response from auth check API
 */
export interface CheckAuthResponse {
  isLoggedIn: boolean;
  pubkey?: string;
  isTestMode?: boolean;
  availableRoles?: UserRole[];
}

/**
 * Response from logout API
 */
export interface LogoutResponse {
  success: boolean;
  message: string;
}

/**
 * Response from refresh roles API
 */
export interface RefreshRolesResponse {
  availableRoles: UserRole[];
}

/**
 * Response from add role API
 */
export interface AddRoleResponse {
  success: boolean;
  message?: string;
}

/**
 * Response from remove role API
 */
export interface RemoveRoleResponse {
  success: boolean;
  message?: string;
}