/**
 * Authentication Service
 * 
 * This service handles all authentication-related functionality
 * and separates business logic from UI components.
 */

import { 
  AuthState,
  CheckAuthResponse, 
  LoginResponse, 
  LogoutResponse, 
  RefreshRolesResponse,
  AddRoleResponse,
  RemoveRoleResponse,
  UserRole
} from '../types/auth';
import { logger } from '../lib/logger';
import { safeFetch, safeJsonFetch } from '../lib/api-utils';

export class AuthService {
  private readonly API_BASE_URL = '/api';

  /**
   * Check if the public key is a test key
   * 
   * @param pubkey - The Nostr public key
   * @returns Whether the key is a test key
   */
  private isTestPublicKey(pubkey: string): boolean {
    return pubkey.startsWith('pk_test_') || pubkey === 'test-pubkey';
  }

  /**
   * Login with a Nostr public key and signed message
   * 
   * @param pubkey - The Nostr public key
   * @param signedMessage - The signed message for verification
   * @returns The authentication state
   */
  async login(pubkey: string, signedMessage: string): Promise<AuthState> {
    try {
      // Check if this is a test mode login (from AuthProviderRefactored's indicator)
      const isTestModeLogin = signedMessage === 'TEST_MODE';
      
      // For test pubkeys or explicit test mode logins, we can create a synthetic authState directly
      // This avoids making a network request for test logins
      if (this.isTestPublicKey(pubkey) || isTestModeLogin) {
        logger.log(`Test login for ${pubkey}, bypassing API`);
        
        // Determine roles based on the pubkey suffix
        let availableRoles: UserRole[] = [];
        
        if (pubkey === 'pk_test_advertiser') {
          availableRoles = ['advertiser'];
        } else if (pubkey === 'pk_test_publisher') {
          availableRoles = ['publisher'];
        } else if (pubkey === 'pk_test_admin') {
          availableRoles = ['admin', 'advertiser', 'publisher', 'stakeholder'];
        } else {
          // Default test user gets all roles
          availableRoles = ['advertiser', 'publisher', 'admin', 'stakeholder'];
        }
        
        // Set cookies directly in browser
        if (typeof window !== 'undefined') {
          document.cookie = `nostr_pubkey=${pubkey}; path=/; max-age=86400`;
          document.cookie = `auth_token=test_token_${pubkey}; path=/; max-age=86400`;
        }
        
        return {
          isLoggedIn: true,
          pubkey,
          isTestMode: true,
          availableRoles,
        };
      }
      
      // For non-test pubkeys, use the API with our new safeFetch utility
      // Only works in browser environment
      if (typeof window === 'undefined') {
        throw new Error('Direct login only supported in browser environment');
      }
      
      const loginData = await safeJsonFetch<LoginResponse>('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pubkey, signedMessage }),
        credentials: 'include', // Important for cookies
      });
      
      // If the request failed or returned null, handle gracefully
      if (!loginData) {
        throw new Error('Network error: Could not connect to authentication service. Please check your connection and try again.');
      }
      
      return {
        isLoggedIn: loginData.isLoggedIn,
        pubkey: loginData.pubkey,
        isTestMode: loginData.isTestMode || false,
        availableRoles: loginData.availableRoles || [],
      };
    } catch (error) {
      logger.error('Auth service login error:', error);
      throw error;
    }
  }

  /**
   * Check the current authentication status
   * 
   * @returns The authentication state or null if not authenticated
   */
  async checkAuth(): Promise<AuthState | null> {
    try {
      // Check for special logout flag first - This is now a comprehensive check
      // that blocks ALL auto-login attempts when present
      if (typeof window !== 'undefined') {
        const preventAutoLogin = localStorage.getItem('prevent_auto_login') === 'true';
        
        // If prevent_auto_login is set, we should return null and block ALL authentication attempts
        if (preventAutoLogin) {
          logger.log('Auth check bypassed due to prevent_auto_login flag');
          // Make sure no auth cookies exist by clearing them
          document.cookie = 'nostr_pubkey=; path=/; max-age=0';
          document.cookie = 'auth_token=; path=/; max-age=0';
          document.cookie = 'auth_session=; path=/; max-age=0';
          document.cookie = 'nostr_auth_session=; path=/; max-age=0';
          return null;
        }
        
        // Only continue with auth checks if prevent_auto_login isn't set
        // Check for test mode in localStorage
        const isTestMode = localStorage.getItem('isTestMode') === 'true';
        const testPubkey = localStorage.getItem('nostr_test_pk');

        if (isTestMode && testPubkey) {
          logger.log('Test mode detected in localStorage, skipping API call');
          
          // For test mode, provide all roles by default
          const ALL_ROLES: UserRole[] = ['advertiser', 'publisher', 'admin', 'stakeholder'];
          
          // Set cookies directly to ensure consistency
          document.cookie = `nostr_pubkey=${testPubkey}; path=/; max-age=86400`;
          document.cookie = `auth_token=test_token_${testPubkey}; path=/; max-age=86400`;
          
          return {
            isLoggedIn: true,
            pubkey: testPubkey,
            isTestMode: true,
            availableRoles: ALL_ROLES,
          };
        }

        // If not in localStorage, check for cookies directly, but only if not prevented
        // Simple function to get cookie by name
        const getCookie = (name: string) => {
          const value = `; ${document.cookie}`;
          const parts = value.split(`; ${name}=`);
          if (parts.length === 2) return parts.pop()?.split(';').shift();
          return undefined;
        };
        
        // Only check for cookies if not prevented by logout flag
        // This is redundant with the check above, but provides defense in depth
        if (localStorage.getItem('prevent_auto_login') === 'true') {
          logger.log('Auth check bypassed due to prevent_auto_login flag (cookie check)');
          return null;
        }
        
        // Check for test login cookies
        const testPubkeyFromCookie = getCookie('nostr_pubkey');
        if (testPubkeyFromCookie && this.isTestPublicKey(testPubkeyFromCookie)) {
          logger.log('Found test pubkey in cookies:', testPubkeyFromCookie);
          
          // For test mode, provide all roles by default
          const ALL_ROLES: UserRole[] = ['advertiser', 'publisher', 'admin', 'stakeholder'];
          
          // Also set the test mode in localStorage for future checks
          localStorage.setItem('isTestMode', 'true');
          localStorage.setItem('nostr_test_pk', testPubkeyFromCookie);
          
          return {
            isLoggedIn: true,
            pubkey: testPubkeyFromCookie,
            isTestMode: true,
            availableRoles: ALL_ROLES,
          };
        }
      }
      
      // For server-side or when no test cookies found, use the API
      // Skip API call on server side - cookies should be used directly there
      if (typeof window === 'undefined') {
        // On server side, we can't make client-side fetch calls
        // The API route will handle cookies directly
        return null;
      }
      
      // Final check for the prevent_auto_login flag before making API calls
      // This provides a third layer of defense against auto-login after logout
      if (typeof window !== 'undefined' && localStorage.getItem('prevent_auto_login') === 'true') {
        logger.log('Auth check bypassed due to prevent_auto_login flag (before API calls)');
        return null;
      }
      
      // Check if we should bypass API calls
      if (typeof window !== 'undefined' && localStorage.getItem('bypass_api_calls') === 'true') {
        logger.log('Bypassing API call for auth check due to bypass_api_calls flag');
        
        // Get test data directly from localStorage
        const testPubkey = localStorage.getItem('nostr_test_pk');
        if (testPubkey) {
          // Parse cached available roles
          let availableRoles: UserRole[] = ['viewer' as UserRole];
          try {
            const cachedRoles = localStorage.getItem('cachedAvailableRoles');
            if (cachedRoles) {
              availableRoles = JSON.parse(cachedRoles) as UserRole[];
            }
          } catch (e) {
            logger.error('Error parsing cached roles:', e);
          }
          
          return {
            isLoggedIn: true,
            pubkey: testPubkey,
            isTestMode: true,
            availableRoles,
          };
        }
        
        return null;
      }
      
      // Use safeJsonFetch to get the response directly as JSON and handle errors
      const authData = await safeJsonFetch<CheckAuthResponse>('/api/auth/check', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for cookies
      });
      
      // If the request failed or returned null, handle gracefully
      if (!authData) {
        return null;
      }
      
      // If auth data is valid, return the authentication state
      if (authData.isLoggedIn && authData.pubkey) {
        return {
          isLoggedIn: authData.isLoggedIn,
          pubkey: authData.pubkey,
          isTestMode: authData.isTestMode || false,
          availableRoles: authData.availableRoles || [],
        };
      }
      
      // Otherwise, return null to indicate not authenticated
      return null;
    } catch (error) {
      logger.error('Auth service check error:', error);
      
      // Try localStorage again as a fallback in case of network errors
      if (typeof window !== 'undefined') {
        const isTestMode = localStorage.getItem('isTestMode') === 'true';
        const testPubkey = localStorage.getItem('nostr_test_pk');

        if (isTestMode && testPubkey) {
          logger.log('Test mode detected in localStorage after failed API call');
          
          // For test mode, provide all roles by default
          const ALL_ROLES: UserRole[] = ['advertiser', 'publisher', 'admin', 'stakeholder'];
          
          return {
            isLoggedIn: true,
            pubkey: testPubkey,
            isTestMode: true,
            availableRoles: ALL_ROLES,
          };
        }
      }
      
      // Return null for auth state, but don't rethrow to prevent app crashes
      return null;
    }
  }

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    try {
      // For browser environment, clear all authentication data directly
      if (typeof window !== 'undefined') {
        // Clear cookies by setting expiration in the past
        document.cookie = 'nostr_pubkey=; path=/; max-age=0';
        document.cookie = 'auth_token=; path=/; max-age=0';
        document.cookie = 'auth_session=; path=/; max-age=0';
        document.cookie = 'nostr_auth_session=; path=/; max-age=0';
        
        // Instead of clearing all localStorage which might remove user preferences,
        // remove only auth-related items
        localStorage.removeItem('userRole');
        localStorage.removeItem('isTestMode');
        localStorage.removeItem('nostr_test_pk');
        localStorage.removeItem('nostr_test_npub');
        localStorage.removeItem('nostr_test_nsec');
        localStorage.removeItem('cachedAvailableRoles');
        localStorage.removeItem('roleCacheTimestamp');
        localStorage.removeItem('force_role_refresh');
        
        // Add a special flag to prevent auto-login
        localStorage.setItem('prevent_auto_login', 'true');
        
        logger.log('Cleared auth cookies and localStorage directly');
        
        // Redirect to homepage instead of login page
        window.location.replace('/');
        return; // Early return to prevent API call
      }
      
      // Server-side logout is a no-op
      if (typeof window === 'undefined') {
        return;
      }
      
      // If we somehow get here, try the API as a fallback using our safe API utilities
      const logoutData = await safeJsonFetch<LogoutResponse>('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!logoutData || !logoutData.success) {
        logger.warn('API logout reported failure, but cookies were cleared');
      }
    } catch (error) {
      logger.error('Auth service logout error:', error);
      // Force redirect to login even on error
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }

  /**
   * Refresh the roles for a user
   * 
   * @param pubkey - The Nostr public key
   * @returns The updated authentication state
   */
  async refreshRoles(pubkey: string): Promise<AuthState> {
    try {
      // Check if API calls should be bypassed
      if (typeof window !== 'undefined' && localStorage.getItem('bypass_api_calls') === 'true') {
        logger.log('Bypassing API call for refreshRoles due to bypass_api_calls flag');
        
        // Provide all roles for test mode by default
        const ALL_ROLES: UserRole[] = ['advertiser', 'publisher', 'admin', 'stakeholder'];
        
        // Store in localStorage for consistency
        if (typeof window !== 'undefined') {
          localStorage.setItem('cachedAvailableRoles', JSON.stringify(ALL_ROLES));
          localStorage.setItem('roleCacheTimestamp', Date.now().toString());
          
          // Set default role if not already set
          if (!localStorage.getItem('userRole')) {
            localStorage.setItem('userRole', 'advertiser');
          }
        }
        
        return {
          isLoggedIn: true,
          pubkey,
          isTestMode: true,
          availableRoles: ALL_ROLES,
        };
      }
      
      // Special handling for test mode
      if (this.isTestPublicKey(pubkey)) {
        logger.log('Test mode detected in refreshRoles, providing all roles directly');
        
        // For test mode, provide all roles by default
        const ALL_ROLES: UserRole[] = ['advertiser', 'publisher', 'admin', 'stakeholder'];
        
        // Also store in localStorage for consistency
        if (typeof window !== 'undefined') {
          localStorage.setItem('cachedAvailableRoles', JSON.stringify(ALL_ROLES));
          localStorage.setItem('roleCacheTimestamp', Date.now().toString());
          
          // Store default role if none is set
          if (!localStorage.getItem('userRole')) {
            localStorage.setItem('userRole', 'advertiser');
          }
        }
        
        // Try to enable all roles via API, but don't fail if it doesn't work
        try {
          await this.enableTestModeRoles(pubkey);
        } catch (enableError) {
          logger.warn('Failed to enable test roles via API, continuing with client-side roles', enableError);
        }
        
        return {
          isLoggedIn: true,
          pubkey,
          isTestMode: true,
          availableRoles: ALL_ROLES,
        };
      }
      
      // Use safe API utilities for network request
      const refreshData = await safeJsonFetch<RefreshRolesResponse>(`/api/auth/refresh-roles?pubkey=${encodeURIComponent(pubkey)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      // If the request failed or returned null, handle gracefully
      if (!refreshData) {
        throw new Error('Failed to refresh roles');
      }
      
      if (!refreshData.success) {
        throw new Error(refreshData.message || 'Failed to refresh roles');
      }
      
      // Cache the roles in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('cachedAvailableRoles', JSON.stringify(refreshData.availableRoles));
        localStorage.setItem('roleCacheTimestamp', Date.now().toString());
      }
      
      return {
        isLoggedIn: true,
        pubkey,
        isTestMode: refreshData.isTestMode || false,
        availableRoles: refreshData.availableRoles || [],
      };
    } catch (error) {
      logger.error('Auth service refreshRoles error:', error);
      
      // For test mode, provide roles directly as fallback
      if (this.isTestPublicKey(pubkey)) {
        const ALL_ROLES: UserRole[] = ['advertiser', 'publisher', 'admin', 'stakeholder'];
        
        return {
          isLoggedIn: true,
          pubkey,
          isTestMode: true,
          availableRoles: ALL_ROLES,
        };
      }
      
      // Try to use cached roles from localStorage
      if (typeof window !== 'undefined') {
        try {
          const cachedRoles = localStorage.getItem('cachedAvailableRoles');
          if (cachedRoles) {
            const availableRoles = JSON.parse(cachedRoles) as UserRole[];
            logger.log('Using cached roles from localStorage');
            
            return {
              isLoggedIn: true,
              pubkey,
              isTestMode: false,
              availableRoles,
            };
          }
        } catch (e) {
          logger.error('Error parsing cached roles:', e);
        }
      }
      
      throw new Error('Failed to refresh roles and no cached roles available');
    }
  }

  /**
   * Enable roles for test accounts
   * 
   * @param pubkey - The Nostr public key
   * @returns Whether the operation was successful
   */
  async enableTestModeRoles(pubkey: string): Promise<boolean> {
    // This method should only be used for test public keys
    if (!this.isTestPublicKey(pubkey)) {
      logger.warn(`Attempted to enable test roles for non-test pubkey: ${pubkey}`);
      return false;
    }
    
    try {
      const enableData = await safeJsonFetch<{ success: boolean }>('/api/auth/enable-test-roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pubkey }),
        credentials: 'include',
      });
      
      // If the request failed or returned null, handle gracefully
      if (!enableData) {
        return false;
      }
      
      return enableData.success === true;
    } catch (error) {
      logger.error('Error enabling test roles:', error);
      return false;
    }
  }
}