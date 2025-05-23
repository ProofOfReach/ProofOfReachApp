import { useContext } from 'react';
import { AuthStateContext, UserRole } from '../types/auth';
import { createContext } from 'react';
import { logger } from '../lib/logger';

// Create auth context with default values 
export const AuthContext = createContext<AuthStateContext | null>(null);

/**
 * Default empty auth state to use when context is not available
 * This prevents errors on public pages where no auth is needed
 */
const defaultAuthState: AuthStateContext = {
  authState: {
    isLoggedIn: false,
    pubkey: '',
    isTestMode: false,
    availableRoles: [],
    currentRole: 'viewer'
  },
  login: async () => {
    logger.debug('Auth context not available - login ignored');
    return null;
  },
  logout: async () => {
    logger.debug('Auth context not available - logout ignored');
  },
  refreshRoles: async () => {
    logger.debug('Auth context not available - refreshRoles ignored');
    return null;
  },
  hasRole: () => false,
  addRole: async () => false,
  removeRole: async () => false,
  updateUserRole: async () => null,
  isLoading: false,
  isLoggedIn: false,
  hasPermission: () => false,
  assignRole: async () => null
};

/**
 * Hook for accessing authentication state and methods
 * 
 * @returns The auth context with state and methods
 * @returns Default empty auth state if used outside AuthProviderRefactored
 */
export const useAuthRefactored = (): AuthStateContext => {
  const authContext = useContext(AuthContext);
  
  if (!authContext) {
    // Log at debug level instead of error since this is expected on public pages
    logger.debug('useAuthRefactored called outside of AuthProviderRefactored');
    return defaultAuthState;
  }
  
  return authContext;
};

/**
 * Helper hook to check if the user has a specific role
 * 
 * @param role - The role to check
 * @returns Whether the user has the role
 */
export const useHasRole = (role: UserRole): boolean => {
  const { hasRole } = useAuthRefactored() as any;
  return hasRole(role);
};

/**
 * Helper hook to check if the user is authenticated
 * 
 * @returns Whether the user is authenticated
 */
export const useIsAuthenticated = (): boolean => {
  const { authState } = useAuthRefactored() as any;
  return authState?.isLoggedIn || false;
};

/**
 * Helper hook to get the user's public key
 * 
 * @returns The user's public key or empty string if not authenticated
 */
export const useUserPubkey = (): string => {
  const { authState } = useAuthRefactored() as any;
  return authState?.isLoggedIn ? authState.pubkey : '';
};

/**
 * Helper hook to check if the user is in test mode
 * 
 * @returns Whether the user is in test mode
 */
export const useIsTestMode = (): boolean => {
  const { authState } = useAuthRefactored() as any;
  return authState?.isTestMode || false;
};

/**
 * Helper hook to get the user's available roles
 * 
 * @returns The user's available roles or empty array if not authenticated
 */
export const useAvailableRoles = (): UserRole[] => {
  const { authState } = useAuthRefactored() as any;
  return authState?.isLoggedIn ? authState.availableRoles : [];
};