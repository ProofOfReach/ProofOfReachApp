import { useAuth } from './useAuth';
import { AuthState, UserRole } from '../types/auth';
import { logger } from '../lib/logger';

// Default implementations for hooks that might throw errors in test environments  
const defaultUseRole = () => ({
  role: null,
  availableRoles: [],
  isRoleAvailable: (role: string) => false,
  isChangingRole: false,
  setRole: async () => {},
  clearRole: () => {},
});

// Import hooks that might throw errors in test environments
let useAuthRefactored = () => null;
let useRoleHook = () => null;

// Only attempt to import these if we're not in a test environment
// This prevents errors when the providers aren't available
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
  try {
    const { useAuthRefactored: importedAuthHook } = require('./useAuthRefactored');
    const { useRole: importedRoleHook } = require('../context/NewRoleContextRefactored');
    useAuthRefactored = importedAuthHook;
    useRole = importedRoleHook;
  } catch (error) {
    logger.error('Error importing refactored hooks:', error);
  }
}

// Set this flag to control which auth system to use
// In production, this would be controlled via an environment variable or feature flag
const USE_REFACTORED_AUTH = true;

/**
 * This hook provides a unified interface to both auth systems,
 * allowing for a smooth transition between them.
 * 
 * Components can use this hook without knowing which system is active.
 */
export function useAuthSwitch() {
  // Get the legacy auth system - this should be safe since it has fallbacks
  const legacyAuth = useAuth();
  const legacyRole = useRole();
  
  // Try to use refactored auth, falling back to defaults if not available
  let refactoredAuth: any = null;
  let refactoredRole: any = null;
  
  // Only try to use the refactored hooks outside of test environments
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
    try {
      refactoredAuth = useAuthRefactored() as any;
      refactoredRole = useRole();
    } catch (error) {
      logger.error('Error using refactored hooks:', error);
    }
  }
  
  // Safety check - when we're in test environment or the hooks aren't available, 
  // we always use the legacy auth system
  const useRefactoredAuth = USE_REFACTORED_AUTH && !!refactoredAuth && !!refactoredRole;
  
  // Create a safe login function that provides type safety for the login-new page
  const createSafeLoginFunction = (auth: any) => {
    // This function handles two different parameter formats for backward compatibility:
    // 1. (pubkey: string, signedMessage: string) - old signature
    // 2. (pubkey: string, isTestMode: boolean) - new signature
    return async (pubkey: string, secondParam: any) => {
      if (!auth || !auth.login) {
        logger.error('Login function not available');
        return null;
      }
      
      try {
        // Determine if this is test mode
        const isTestMode = typeof secondParam === 'boolean' ? secondParam : 
                         (typeof secondParam === 'string' && secondParam === 'true') || false;
        
        // For test mode, we directly set cookies and simulate auth state
        // Accept any kind of pubkey for test mode as long as isTestMode flag is set
        if (isTestMode) {
          logger.log(`Enhanced test login for ${pubkey}`);
          
          // Set cookies directly
          if (typeof window !== 'undefined') {
            document.cookie = `nostr_pubkey=${pubkey}; path=/; max-age=86400`;
            document.cookie = `auth_token=test_token_${pubkey}; path=/; max-age=86400`;
            
            // Store test mode flag
            localStorage.setItem('isTestMode', 'true');
            
            // Directly set role information for test mode
            const ALL_ROLES: string[] = ['advertiser', 'publisher', 'admin', 'stakeholder'] as UserRole[];
            localStorage.setItem('cachedAvailableRoles', JSON.stringify(ALL_ROLES));
            localStorage.setItem('roleCacheTimestamp', Date.now().toString());
            localStorage.setItem('userRole', 'advertiser' as UserRole); // Default role
            
            // Set role data directly in cache for role context
            // This matches what NewRoleContextRefactored uses
            const ROLE_CACHE_KEY = 'roleData';
            try {
              // Create or update the React Query cache
              let cache: Record<string, any> = {};
              
              // Try to get existing cache or create a new one
              if (window.localStorage.getItem('_REACT_QUERY_OFFLINE_CACHE')) {
                cache = JSON.parse(window.localStorage.getItem('_REACT_QUERY_OFFLINE_CACHE') || '{}');
              }
              
              // Update the cache with role data
              const cacheKey = `["${ROLE_CACHE_KEY}"]`;
              cache[cacheKey] = {
                state: {
                  data: {
                    availableRoles: ALL_ROLES,
                    currentRole: 'advertiser',
                    timestamp: Date.now()
                  },
                  dataUpdateCount: 1
                },
                queryKey: [ROLE_CACHE_KEY],
                queryHash: `["${ROLE_CACHE_KEY}"]`
              };
              
              // Save the updated cache
              window.localStorage.setItem('_REACT_QUERY_OFFLINE_CACHE', JSON.stringify(cache));
              
              // Also set a flag to force role context to refresh
              localStorage.setItem('force_role_refresh', 'true');
            } catch (e) {
              logger.error('Error updating React Query cache:', e);
            }
          }
          
          // All test users get all roles in this simplified auth
          return {
            isLoggedIn: true,
            pubkey,
            isTestMode: true,
            availableRoles: ['advertiser', 'publisher', 'admin', 'stakeholder']
          };
        }
        
        // Regular login flow - pass the parameters as they were received
        return await auth.login(pubkey, secondParam);
      } catch (error) {
        logger.error('Error in safe login:', error);
        return null;
      }
    };
  };
  
  // Create safe role handlers
  const createSafeRoleFunction = (role: any, functionName: string) => {
    return (...args: any[]) => {
      if (!role || !role[functionName]) {
        logger.error(`${functionName} function not available`);
        return null;
      }
      try {
        return role[functionName](...args);
      } catch (error) {
        logger.error(`Error in ${functionName}:`, error);
        return null;
      }
    };
  };
  
  // Return the appropriate one based on the flag and availability
  if (useRefactoredAuth) {
    // Map the refactored auth interface to a unified interface
    return {
      // Auth state
      isAuthenticated: refactoredAuth?.authState?.isLoggedIn || false,
      pubkey: refactoredAuth?.authState?.pubkey || '',
      isTestMode: refactoredAuth?.authState?.isTestMode || false,
      
      // Auth methods
      login: createSafeLoginFunction(refactoredAuth),
      logout: async () => { 
        if (refactoredAuth?.logout) await refactoredAuth.logout();
      },
      
      // Role state
      currentRole: refactoredRole?.role || null,
      availableRoles: refactoredRole?.availableRoles || [],
      isRoleAvailable: (role: string) => refactoredRole?.isRoleAvailable?.(role) || false,
      isChangingRole: refactoredRole?.isChangingRole || false,
      
      // Role methods
      setRole: createSafeRoleFunction(refactoredRole, 'setRole'),
      clearRole: createSafeRoleFunction(refactoredRole, 'clearRole'),
      
      // Role check methods
      hasRole: (role: string) => refactoredAuth?.hasRole?.(role) || false,
      
      // Loading state
      isLoading: refactoredAuth?.isLoading || false,
    };
  } else {
    // Map the legacy auth interface to a unified interface
    return {
      // Auth state
      isAuthenticated: !!legacyAuth.auth?.pubkey,
      pubkey: legacyAuth.auth?.pubkey || '',
      isTestMode: legacyAuth.auth?.isTestMode || false,
      
      // Auth methods
      login: legacyAuth.login,
      logout: legacyAuth.logout,
      
      // Role state
      currentRole: legacyRole.role,
      availableRoles: legacyRole.availableRoles,
      isRoleAvailable: legacyRole.isRoleAvailable,
      isChangingRole: legacyRole.isChangingRole,
      
      // Role methods
      setRole: legacyRole.setRole,
      clearRole: legacyRole.clearRole,
      
      // Role check methods
      hasRole: (role: string) => {
        // Use the legacyRole context's implementation for consistency
        return legacyRole.isRoleAvailable(role);
      },
      
      // Loading state - provide default value since it might not exist
      isLoading: (legacyAuth as any).isLoading || false,
    };
  }
}