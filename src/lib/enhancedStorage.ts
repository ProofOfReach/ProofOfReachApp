import { UserRole } from '@/types/role';
import { logger } from './logger';

/**
 * Storage Keys - Centralized storage key definitions
 */
export const STORAGE_KEYS = {
  USER_ROLE: 'userRole',
  AVAILABLE_ROLES: 'cachedAvailableRoles',
  ROLE_CACHE_TIMESTAMP: 'roleCacheTimestamp',
  TEST_MODE: 'isTestMode',
  NOSTR_TEST_PK: 'nostr_test_pk',
  NOSTR_TEST_SK: 'nostr_test_sk',
  SIMULATE_DEV_DOMAIN: 'SIMULATE_DEV_DOMAIN',
  PREVENT_AUTO_LOGIN: 'prevent_auto_login'
};

/**
 * System Events - Application event types
 */
export const SYSTEM_EVENTS = {
  ROLE_CHANGED: 'roleChanged',
  ROLES_UPDATED: 'rolesUpdated',
  STORAGE_CHANGED: 'system:storage-changed'
};

/**
 * Enhanced Storage Service - Provides advanced storage operations
 */
export class EnhancedStorage {
  /**
   * Get item from localStorage with error handling
   */
  static getItem(key: string): string | null {
    try {
      if (typeof window === 'undefined') return null;
      return localStorage.getItem(key);
    } catch (error) {
      logger.log(`Error reading from localStorage key: ${key}`, error);
      return null;
    }
  }

  /**
   * Set item in localStorage with error handling
   */
  static setItem(key: string, value: string): boolean {
    try {
      if (typeof window === 'undefined') return false;
      localStorage.setItem(key, value);
      
      // Dispatch storage change event
      window.dispatchEvent(new CustomEvent(SYSTEM_EVENTS.STORAGE_CHANGED, {
        detail: { key, value, storageType: 'localStorage', namespace: 'nostr-ads' }
      }));
      
      return true;
    } catch (error) {
      logger.log(`Error writing to localStorage key: ${key}`, error);
      return false;
    }
  }

  /**
   * Remove item from localStorage
   */
  static removeItem(key: string): boolean {
    try {
      if (typeof window === 'undefined') return false;
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      logger.log(`Error removing from localStorage key: ${key}`, error);
      return false;
    }
  }

  /**
   * Get JSON data from localStorage
   */
  static getJSON<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = this.getItem(key);
      if (!item) return defaultValue || null;
      return JSON.parse(item);
    } catch (error) {
      logger.log(`Error parsing JSON from localStorage key: ${key}`, error);
      return defaultValue || null;
    }
  }

  /**
   * Set JSON data to localStorage
   */
  static setJSON(key: string, value: any): boolean {
    try {
      return this.setItem(key, JSON.stringify(value));
    } catch (error) {
      logger.log(`Error stringifying JSON for localStorage key: ${key}`, error);
      return false;
    }
  }

  /**
   * Get user role from storage
   */
  static getUserRole(): UserRole {
    return (this.getItem(STORAGE_KEYS.USER_ROLE) as UserRole) || 'viewer';
  }

  /**
   * Set user role in storage
   */
  static setUserRole(role: UserRole): boolean {
    return this.setItem(STORAGE_KEYS.USER_ROLE, role);
  }

  /**
   * Get available roles from cache
   */
  static getAvailableRoles(): UserRole[] {
    return this.getJSON<UserRole[]>(STORAGE_KEYS.AVAILABLE_ROLES, ['viewer']) || ['viewer'];
  }

  /**
   * Set available roles cache
   */
  static setAvailableRoles(roles: UserRole[]): boolean {
    return this.setJSON(STORAGE_KEYS.AVAILABLE_ROLES, roles);
  }

  /**
   * Check if test mode is enabled
   */
  static isTestMode(): boolean {
    return this.getItem(STORAGE_KEYS.TEST_MODE) === 'true';
  }

  /**
   * Set test mode status
   */
  static setTestMode(enabled: boolean): boolean {
    return this.setItem(STORAGE_KEYS.TEST_MODE, enabled.toString());
  }
}

// Export default instance for backwards compatibility
export const enhancedStorage = EnhancedStorage;

/**
 * Role notification functions
 */
export function notifyRoleChanged(newRole: UserRole): void {
  try {
    window.dispatchEvent(new CustomEvent(SYSTEM_EVENTS.ROLE_CHANGED, {
      detail: { newRole }
    }));
  } catch (error) {
    logger.log('Error dispatching role changed event:', error);
  }
}

export function notifyRolesUpdated(roles: UserRole[]): void {
  try {
    window.dispatchEvent(new CustomEvent(SYSTEM_EVENTS.ROLES_UPDATED, {
      detail: { roles }
    }));
  } catch (error) {
    logger.log('Error dispatching roles updated event:', error);
  }
}

export function triggerRoleRefresh(): void {
  try {
    localStorage.setItem('force_role_refresh', 'true');
    window.location.reload();
  } catch (error) {
    logger.log('Error triggering role refresh:', error);
  }
}

/**
 * Test mode utilities
 */
export function getTestModeStatus(): boolean {
  return EnhancedStorage.isTestMode();
}

export default EnhancedStorage;