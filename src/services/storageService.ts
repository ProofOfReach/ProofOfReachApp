/**
 * Storage Service
 * 
 * A centralized service for managing application storage needs.
 * Provides consistent error handling and type safety.
 */

import { UserRole } from '../types/core';
import { logger } from '../lib/logger';
import RoleManager from './roleManager';

// Define storage key constants to avoid string duplication
export const STORAGE_KEYS = {
  TEST_MODE_STATE: 'testModeState',
  CURRENT_ROLE: 'currentRole',
  AVAILABLE_ROLES: 'cachedAvailableRoles',
  ROLE_CACHE_TIMESTAMP: 'roleCacheTimestamp',
  BYPASS_API_CALLS: 'bypass_api_calls',
  THEME: 'theme',
  LAST_ROLE_CHANGE: 'lastRoleChange',
} as const;

// Define the shape of test mode state
export type TestModeState = {
  isActive: boolean;
  expiryTime: number | null;
  currentRole: string;
  availableRoles: string[];
  lastUpdated: number;
};

// Define storage type options
type StorageType = 'session' | 'local';

/**
 * Storage Service for consistent storage operations
 */
export class StorageService {
  /**
   * Get an item from storage with type safety
   */
  static getItem<T>(key: string, storageType: StorageType = 'local'): T | null {
    try {
      if (typeof window === 'undefined') return null;
      
      const storage = storageType === 'session' ? sessionStorage : localStorage;
      const value = storage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      // Log as debug instead of error since this is expected on public pages
      console.debug(`Error getting item ${key} from ${storageType} storage:`, error);
      return null;
    }
  }
  
  /**
   * Set an item in storage with JSON serialization
   */
  static setItem(key: string, value: any, storageType: StorageType = 'local'): boolean {
    try {
      if (typeof window === 'undefined') return false;
      
      const storage = storageType === 'session' ? sessionStorage : localStorage;
      storage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting item ${key} in ${storageType} storage:`, error);
      return false;
    }
  }
  
  /**
   * Remove an item from storage
   */
  static removeItem(key: string, storageType: StorageType = 'local'): boolean {
    try {
      if (typeof window === 'undefined') return false;
      
      const storage = storageType === 'session' ? sessionStorage : localStorage;
      storage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing item ${key} from ${storageType} storage:`, error);
      return false;
    }
  }
  
  /**
   * Check if an item exists in storage
   */
  static hasItem(key: string, storageType: StorageType = 'local'): boolean {
    try {
      if (typeof window === 'undefined') return false;
      
      const storage = storageType === 'session' ? sessionStorage : localStorage;
      return storage.getItem(key) !== null;
    } catch (error) {
      console.error(`Error checking for item ${key} in ${storageType} storage:`, error);
      return false;
    }
  }
  
  /**
   * Clear all items from a storage type
   */
  static clear(storageType: StorageType = 'local'): boolean {
    try {
      if (typeof window === 'undefined') return false;
      
      const storage = storageType === 'session' ? sessionStorage : localStorage;
      storage.clear();
      return true;
    } catch (error) {
      console.error(`Error clearing ${storageType} storage:`, error);
      return false;
    }
  }
  
  // Test mode specific methods
  
  /**
   * Get the full test mode state object
   */
  static getTestModeState(): TestModeState | null {
    return this.getItem<TestModeState>(STORAGE_KEYS.TEST_MODE_STATE, 'session');
  }
  
  /**
   * Save the full test mode state
   */
  static setTestModeState(state: TestModeState): boolean {
    return this.setItem(STORAGE_KEYS.TEST_MODE_STATE, state, 'session');
  }
  
  /**
   * Clear all test mode state
   */
  static clearTestModeState(): boolean {
    // Remove test mode state
    this.removeItem(STORAGE_KEYS.TEST_MODE_STATE, 'session');
    
    // Remove legacy test mode flags for compatibility
    this.removeItem('testModeExpiry', 'session');
    this.removeItem('testModeEnabled', 'session');
    this.removeItem(STORAGE_KEYS.BYPASS_API_CALLS);
    this.removeItem('isTestMode');
    
    return true;
  }
  
  /**
   * Check if test mode is currently active
   * This checks both the new state object and legacy flags for backward compatibility
   */
  static getCurrentRole(): string {
    // Server-side rendering check
    if (typeof window === 'undefined') return 'viewer';
    
    try {
      // Try using RoleManager first (most authoritative)
      try {
        const role = RoleManager.getCurrentRole();
        if (role && typeof role === 'string') {
          return role as UserRole;
        }
      } catch (e) {
        console.debug('Error getting role from RoleManager:', e);
      }
      
      // Try storage service next
      try {
        const storedRole = StorageService.getItem<string>(STORAGE_KEYS.CURRENT_ROLE);
        if (storedRole && typeof storedRole === 'string') {
          return storedRole as UserRole;
        }
      } catch (e) {
        console.debug('Error getting role from enhanced storage:', e);
      }
      
      // Finally try localStorage
      try {
        const localRole = localStorage?.getItem('currentRole');
        if (localRole && typeof localRole === 'string') {
          return localRole as UserRole;
        }
      } catch (e) {
        console.debug('Error getting role from localStorage:', e);
      }
    } catch (e) {
      console.error('Error in getCurrentRole:', e);
    }
    
    // In test mode, default to admin role for better testing experience
    if (this.isTestModeActive()) {
      return 'admin';
    }
    
    // Default to viewer role for production
    return 'viewer';
  }
  
  static isTestModeActive(): boolean {
    // Server-side rendering check first
    if (typeof window === 'undefined') {
      return false;
    }
    
    try {
      // First check if test mode is force disabled globally
      try {
        if (localStorage?.getItem('forceDisableTestMode') === 'true') {
          logger.debug('Test mode force disabled globally');
          return false;
        }
      } catch (e) {
        // Ignore localStorage errors
        logger.debug('Error checking forceDisableTestMode flag:', e as Record<string, any>);
      }
      
      // First check the new state object
      const testModeState = this.getTestModeState();
      if (testModeState) {
        // Enforce admin-only test mode
        const currentRole = this.getCurrentRole();
        const isAdmin = currentRole === 'admin';
        
        if (!isAdmin) {
          // Non-admin users should never see test mode
          logger.debug('Test mode denied: viewer role is not admin', { currentRole });
          return false;
        }
        
        const isActive = testModeState.isActive && 
          (testModeState.expiryTime === null || testModeState.expiryTime > Date.now());
        
        logger.debug('Test mode state check result:', { 
          isActive, 
          testModeState: JSON.stringify(testModeState),
          currentRole
        });
        
        return isActive;
      }
      
      // Only check legacy flags if user is in admin role
      const currentRole = this.getCurrentRole();
      const isAdminUser = currentRole === 'admin';
      
      if (!isAdminUser) {
        // Non-admin users should never see test mode
        logger.debug('Test mode legacy check denied: viewer role is not admin', { currentRole });
        return false;
      }
      
      // Check session storage legacy flags
      try {
        const testModeExpiry = sessionStorage?.getItem('testModeExpiry');
        if (testModeExpiry) {
          const expiryTime = parseInt(testModeExpiry, 10);
          const isActive = Date.now() < expiryTime;
          logger.debug('Test mode expiry check:', { isActive, expiryTime });
          return isActive;
        }
      } catch (e) {
        // Ignore session storage errors (could happen in some contexts)
        logger.debug('Error accessing sessionStorage:', e as Error);
      }
      
      // Check local storage legacy flags for dev environments only
      if (process.env.NODE_ENV === 'development') {
        try {
          const isTestMode = localStorage?.getItem('isTestMode') === 'true';
          const bypassApiCalls = localStorage?.getItem(STORAGE_KEYS.BYPASS_API_CALLS) === 'true';
          const isActive = isTestMode || bypassApiCalls;
          
          logger.debug('Legacy test mode flags check:', { 
            isTestMode, 
            bypassApiCalls, 
            isActive 
          });
          
          return isActive;
        } catch (e) {
          // Ignore localStorage errors
          logger.debug('Error accessing localStorage:', e);
        }
      }
    } catch (error) {
      logger.log('Error in isTestModeActive:', error);
    }
    
    // Default to false for production to prevent accidental test mode activation
    return false;
  }
  
  /**
   * Force disable test mode globally - this overrides all other settings
   */
  static forceDisableTestMode(): void {
    if (typeof window === 'undefined') return;
    
    try {
      // Clear all test mode state
      this.clearTestModeState();
      
      // Remove legacy flags
      try {
        localStorage?.removeItem('isTestMode');
        localStorage?.removeItem(STORAGE_KEYS.BYPASS_API_CALLS);
        sessionStorage?.removeItem('testModeExpiry');
      } catch (e) {
        // Ignore storage errors
        logger.debug('Error removing legacy test mode flags:', e);
      }
      
      // Set global disable flag
      localStorage?.setItem('forceDisableTestMode', 'true');
      logger.info('Test mode force disabled globally');
    } catch (error) {
      logger.log('Error in forceDisableTestMode:', error);
    }
  }
  
  /**
   * Create a default test mode state
   */
  static createDefaultTestModeState(): TestModeState {
    return {
      isActive: true,
      expiryTime: Date.now() + (4 * 60 * 60 * 1000), // 4 hours from now
      currentRole: 'admin', // Default to admin role for better test experience
      availableRoles: ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'],
      lastUpdated: Date.now()
    };
  }
  
  /**
   * Initialize test mode with defaults
   */
  static initializeTestMode(): TestModeState {
    const state = this.createDefaultTestModeState();
    this.setTestModeState(state);
    return state;
  }
}