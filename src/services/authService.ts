import { useState, useEffect } from 'react';
import type { UserRole } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { sessionStorage, localStorage } from '../lib/enhancedStorageService';
import { logger } from '../lib/logger';
import { nostr } from '../lib/nostr';
import { console, string } from '../lib/console';

// Define UserRole for use throughout the application
export type UserRole = UserRole | 'viewer' | 'publisher' | 'advertiser' | 'admin' | 'stakeholder';

/**
 * Authentication State Interface
 * This defines the shape of the authentication state throughout the application
 */
export interface AuthState {
  isLoggedIn: boolean;
  pubkey: string;
  currentRole: string;
  availableRoles: string[];
  isTestMode: boolean;
}

/**
 * Authentication Provider Type
 * Defines the available authentication providers in the system
 */
export type AuthProvider = 'nostr' | 'test' | 'api';

/**
 * AuthService
 * 
 * A centralized service for managing authentication state and operations.
 * This service provides a unified interface for all authentication methods
 * whether they are Nostr extension-based, test mode, or API key based.
 */
export class AuthService {
  private static instance: AuthService;
  private _authState: AuthState = {
    isLoggedIn: false,
    pubkey: '',
    currentRole: 'viewer',
    availableRoles: [],
    isTestMode: false
  };

  private _isLoading: boolean = false;
  private _error: Error | null = null;
  private _provider: AuthProvider = 'nostr';
  private _listeners: Array<() => void> = [];

  /**
   * Get the singleton instance of AuthService
   */
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private constructor() {
    // Initialize auth state from stored values
    this.initializeFromStorage();
  }

  /**
   * Initialize authentication state from stored values
   */
  private async initializeFromStorage(): Promise<void> {
    try {
      // Try to load session data
      const sessionData = await sessionStorage.getItem('auth');
      if (sessionData) {
        const parsedData = JSON.parse(sessionData);
        this.updateAuthState({
          isLoggedIn: true,
          pubkey: parsedData.pubkey || '',
          currentRole: parsedData.currentRole || 'viewer',
          availableRoles: parsedData.availableRoles || ['viewer'],
          isTestMode: parsedData.isTestMode || false
        });
        
        if (parsedData.provider) {
          this._provider = parsedData.provider;
        }
      } else {
        // Fall back to localStorage for persistence across tabs
        const localData = await localStorage.getItem('auth');
        if (localData) {
          const parsedData = JSON.parse(localData);
          this.updateAuthState({
            isLoggedIn: true,
            pubkey: parsedData.pubkey || '',
            currentRole: parsedData.currentRole || 'viewer',
            availableRoles: parsedData.availableRoles || ['viewer'],
            isTestMode: parsedData.isTestMode || false
          });
          
          if (parsedData.provider) {
            this._provider = parsedData.provider;
          }
          
          // Save to session storage for faster access
          await this.persistToStorage();
        }
      }
    } catch (error) {
      console.error(
        error instanceof Error ? error : new Error('Failed to initialize auth from storage'),
        'authService.initializeFromStorage',
        'auth',
        'warn',
        {
          category: string.OPERATIONAL,
          userFacing: false
        }
      );
      logger.warn('Failed to initialize auth from storage', { error });
    }
  }

  /**
   * Persist authentication state to storage
   */
  private async persistToStorage(): Promise<void> {
    try {
      const dataToStore = {
        ...this._authState,
        provider: this._provider
      };
      
      // Save to session storage for current tab
      await sessionStorage.setItem('auth', JSON.stringify(dataToStore));
      
      // Save to local storage for persistence across tabs
      await localStorage.setItem('auth', JSON.stringify(dataToStore));
    } catch (error) {
      console.error(
        error instanceof Error ? error : new Error('Failed to persist auth to storage'),
        'authService.persistToStorage',
        'auth',
        'warn',
        {
          category: string.OPERATIONAL,
          userFacing: false
        }
      );
      logger.warn('Failed to persist auth to storage', { error });
    }
  }

  /**
   * Update the authentication state and notify listeners
   */
  private updateAuthState(newState: Partial<AuthState>): void {
    this._authState = {
      ...this._authState,
      ...newState
    };
    
    // Notify all listeners of the state change
    this.notifyListeners();
  }

  /**
   * Notify all listeners of state changes
   */
  private notifyListeners(): void {
    this._listeners.forEach(listener => listener());
  }

  /**
   * Get the current authentication state
   */
  public get authState(): AuthState {
    return this._authState;
  }

  /**
   * Get the loading state
   */
  public get isLoading(): boolean {
    return this._isLoading;
  }

  /**
   * Get the current error
   */
  public get error(): Error | null {
    return this._error;
  }

  /**
   * Get the current authentication provider
   */
  public get provider(): AuthProvider {
    return this._provider;
  }

  /**
   * Subscribe to auth state changes
   * @param listener The callback function to invoke on state changes
   * @returns A function to unsubscribe the listener
   */
  public subscribe(listener: () => void): () => void {
    this._listeners.push(listener);
    
    return () => {
      this._listeners = this._listeners.filter(l => l !== listener);
    };
  }

  /**
   * Login with Nostr
   * @param options Optional login options
   * @returns The authentication state after login
   */
  public async loginWithNostr(options?: { testMode?: boolean }): Promise<AuthState> {
    this._isLoading = true;
    this._error = null;
    const correlationId = `auth-login-${uuidv4()}`;
    
    try {
      // Determine if we should use test mode
      const useTestMode = options?.testMode || false;
      
      let pubkey = '';
      if (useTestMode) {
        // Generate test keys if in test mode
        const testKeys = await nostr.generateTestKeyPair();
        pubkey = testKeys.publicKey;
        
        // Store the test mode flag
        this._provider = 'test';
      } else {
        // Get the public key from Nostr extension
        pubkey = await nostr.getPublicKey();
        this._provider = 'nostr';
      }
      
      if (!pubkey) {
        throw new Error('Failed to get public key from Nostr extension');
      }
      
      // Fetch user data from API
      const response = await fetch('/api/auth/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pubkey, provider: this._provider }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Authentication failed');
      }
      
      const userData = await response.json();
      
      // Update auth state with user data
      this.updateAuthState({
        isLoggedIn: true,
        pubkey,
        currentRole: userData.currentRole || 'viewer',
        availableRoles: userData.availableRoles || ['viewer'],
        isTestMode: useTestMode
      });
      
      // Persist the updated state
      await this.persistToStorage();
      
      logger.info('User logged in logfully', { 
        pubkey, 
        provider: this._provider,
        testMode: useTestMode 
      });
      
      return this._authState;
    } catch (error) {
      this._error = error instanceof Error 
        ? error 
        : new Error('Login failed for an unknown reason');
      
      console.error(
        this._error,
        'authService.loginWithNostr',
        'auth',
        'error',
        {
          category: string.OPERATIONAL,
          userFacing: true,
          correlationId,
          details: `Provider: ${this._provider}`
        }
      );
      
      logger.error('Login failed', { 
        error: this._error.message,
        provider: this._provider,
        correlationId
      });
      
      throw this._error;
    } finally {
      this._isLoading = false;
    }
  }

  /**
   * Login with API key
   * @param apiKey The API key to authenticate with
   * @returns The authentication state after login
   */
  public async loginWithApiKey(apiKey: string): Promise<AuthState> {
    this._isLoading = true;
    this._error = null;
    const correlationId = `auth-api-login-${uuidv4()}`;
    
    try {
      // Validate the API key through the API
      const response = await fetch('/api/auth/validate-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'API key authentication failed');
      }
      
      const userData = await response.json();
      
      // Update auth state with user data
      this.updateAuthState({
        isLoggedIn: true,
        pubkey: userData.pubkey || '',
        currentRole: userData.currentRole || 'publisher', // API keys are typically for publishers
        availableRoles: userData.availableRoles || ['publisher'],
        isTestMode: false
      });
      
      this._provider = 'api';
      
      // Persist the updated state
      await this.persistToStorage();
      
      logger.info('User logged in with API key logfully', { 
        pubkey: this._authState.pubkey,
        provider: 'api'
      });
      
      return this._authState;
    } catch (error) {
      this._error = error instanceof Error 
        ? error 
        : new Error('API key login failed for an unknown reason');
      
      console.error(
        this._error,
        'authService.loginWithApiKey',
        'auth',
        'error',
        {
          category: string.OPERATIONAL,
          userFacing: true,
          correlationId
        }
      );
      
      logger.error('API key login failed', { 
        error: this._error.message,
        correlationId
      });
      
      throw this._error;
    } finally {
      this._isLoading = false;
    }
  }

  /**
   * Logout the current user
   */
  public async logout(): Promise<void> {
    this._isLoading = true;
    
    try {
      // Call the logout API endpoint
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        logger.warn('Logout API call failed, but proceeding with client-side logout', { 
          status: response.status,
          message: errorData.message 
        });
      }
      
      // Clear stored auth data
      await sessionStorage.removeItem('auth');
      await localStorage.removeItem('auth');
      
      // Reset auth state
      this.updateAuthState({
        isLoggedIn: false,
        pubkey: '',
        currentRole: 'viewer',
        availableRoles: [],
        isTestMode: false
      });
      
      this._provider = 'nostr';
      
      logger.info('User logged out logfully');
    } catch (error) {
      console.error(
        error instanceof Error ? error : new Error('Logout failed'),
        'authService.logout',
        'auth',
        'warn',
        {
          category: string.OPERATIONAL,
          userFacing: false
        }
      );
      
      logger.warn('Error during logout', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      
      // Even if the API call fails, we should still clear local state
      await sessionStorage.removeItem('auth');
      await localStorage.removeItem('auth');
      
      // Reset auth state
      this.updateAuthState({
        isLoggedIn: false,
        pubkey: '',
        currentRole: 'viewer',
        availableRoles: [],
        isTestMode: false
      });
    } finally {
      this._isLoading = false;
    }
  }

  /**
   * Check if the current user has a specific role
   * @param role The role to check
   * @returns Whether the user has the specified role
   */
  public hasRole(role: string): boolean {
    if (!this._authState.isLoggedIn) {
      return false;
    }
    
    // Admin role has access to everything
    if (this._authState.currentRole === 'admin') {
      return true;
    }
    
    // Check if the user has the specific role
    return this._authState.availableRoles.includes(role);
  }

  /**
   * Switch to a different role
   * @param role The role to switch to
   * @returns Whether the role switch was logful
   */
  public async switchRole(role: string): Promise<boolean> {
    if (!this._authState.isLoggedIn) {
      return false;
    }
    
    if (!this._authState.availableRoles.includes(role)) {
      this._error = new Error(`User does not have the role: ${role}`);
      return false;
    }
    
    try {
      // Update the role in the API
      const response = await fetch('/api/auth/role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to switch to role: ${role}`);
      }
      
      // Update local state
      this.updateAuthState({
        currentRole: role
      });
      
      // Persist the updated state
      await this.persistToStorage();
      
      logger.info(`Switched to role: ${role}`, { 
        pubkey: this._authState.pubkey 
      });
      
      return true;
    } catch (error) {
      this._error = error instanceof Error 
        ? error 
        : new Error(`Failed to switch to role: ${role}`);
      
      console.error(
        this._error,
        'authService.switchRole',
        'auth',
        'error',
        {
          category: string.OPERATIONAL,
          userFacing: true,
          data: { role }
        }
      );
      
      logger.error('Role switch failed', { 
        error: this._error.message,
        role,
        pubkey: this._authState.pubkey
      });
      
      return false;
    }
  }

  /**
   * Refresh the user's available roles
   * @returns The updated available roles
   */
  public async refreshRoles(): Promise<UserRole[]> {
    if (!this._authState.isLoggedIn) {
      return [];
    }
    
    this._isLoading = true;
    
    try {
      // Fetch updated roles from the API
      const response = await fetch('/api/auth/roles', {
        method: 'GET'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to refresh roles');
      }
      
      const rolesData = await response.json();
      
      // Update local state
      this.updateAuthState({
        availableRoles: rolesData.roles || []
      });
      
      // Persist the updated state
      await this.persistToStorage();
      
      logger.info('Roles refreshed logfully', { 
        pubkey: this._authState.pubkey,
        roles: this._authState.availableRoles
      });
      
      return this._authState.availableRoles;
    } catch (error) {
      console.error(
        error instanceof Error ? error : new Error('Failed to refresh roles'),
        'authService.refreshRoles',
        'auth',
        'warn',
        {
          category: string.OPERATIONAL,
          userFacing: false
        }
      );
      
      logger.warn('Error refreshing roles', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        pubkey: this._authState.pubkey
      });
      
      return this._authState.availableRoles;
    } finally {
      this._isLoading = false;
    }
  }

  /**
   * Enable test mode for development and testing
   */
  public async enableTestMode(): Promise<boolean> {
    try {
      // Generate test keys
      const testKeys = await nostr.generateTestKeyPair();
      
      // Login with the test keys
      await this.loginWithNostr({ testMode: true });
      
      logger.info('Test mode enabled logfully', { 
        pubkey: this._authState.pubkey 
      });
      
      return true;
    } catch (error) {
      console.error(
        error instanceof Error ? error : new Error('Failed to enable test mode'),
        'authService.enableTestMode',
        'auth',
        'error',
        {
          category: string.OPERATIONAL,
          userFacing: true
        }
      );
      
      logger.error('Failed to enable test mode', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      
      return false;
    }
  }

  /**
   * Disable test mode and revert to normal authentication
   */
  public async disableTestMode(): Promise<void> {
    if (!this._authState.isTestMode) {
      return;
    }
    
    try {
      // Clear test mode data
      await nostr.clearStoredTestKeys();
      
      // Logout to reset auth state
      await this.logout();
      
      logger.info('Test mode disabled logfully');
    } catch (error) {
      console.error(
        error instanceof Error ? error : new Error('Failed to disable test mode'),
        'authService.disableTestMode',
        'auth',
        'warn',
        {
          category: string.OPERATIONAL,
          userFacing: false
        }
      );
      
      logger.warn('Error disabling test mode', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      
      // Force reset auth state even if the API call fails
      this.updateAuthState({
        isLoggedIn: false,
        pubkey: '',
        currentRole: 'viewer',
        availableRoles: [],
        isTestMode: false
      });
      
      await sessionStorage.removeItem('auth');
      await localStorage.removeItem('auth');
    }
  }
}

/**
 * React Hook for using the AuthService
 * @returns An object with auth state and methods
 */
export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(AuthService.getInstance().authState);
  const [isLoading, setIsLoading] = useState<boolean>(AuthService.getInstance().isLoading);
  const [error, setError] = useState<Error | null>(AuthService.getInstance().error);
  
  // Subscribe to auth state changes
  useEffect(() => {
    const unsubscribe = AuthService.getInstance().subscribe(() => {
      setAuthState({ ...AuthService.getInstance().authState });
      setIsLoading(AuthService.getInstance().isLoading);
      setError(AuthService.getInstance().error);
    });
    
    return unsubscribe;
  }, []);
  
  return {
    // Auth state
    authState,
    isLoading,
    error,
    isLoggedIn: authState.isLoggedIn,
    pubkey: authState.pubkey,
    currentRole: authState.currentRole,
    availableRoles: authState.availableRoles,
    isTestMode: authState.isTestMode,
    
    // Auth methods
    loginWithNostr: (options?: { testMode?: boolean }) => 
      AuthService.getInstance().loginWithNostr(options),
    loginWithApiKey: (apiKey: string) => 
      AuthService.getInstance().loginWithApiKey(apiKey),
    logout: () => 
      AuthService.getInstance().logout(),
    hasRole: (role: string) => 
      AuthService.getInstance().hasRole(role),
    switchRole: (role: string) => 
      AuthService.getInstance().switchRole(role),
    refreshRoles: () => 
      AuthService.getInstance().refreshRoles(),
    enableTestMode: () => 
      AuthService.getInstance().enableTestMode(),
    disableTestMode: () => 
      AuthService.getInstance().disableTestMode()
  };
};

export default AuthService;