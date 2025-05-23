/**
 * Role Storage Service
 * 
 * This service provides specialized storage functionality for user roles,
 * extending the EnhancedStorageService with role-specific methods.
 */

import '@/lib/logger';
import { 
  dispatchRoleEvent, 
  ROLE_EVENTS,
  notifyRoleChanged,
  notifyRolesUpdated
} from '@/lib/events';
import { EnhancedStorageService, STORAGE_KEYS, enhancedStorage } from './enhancedStorageService';
import '@/context/RoleContext';
import { testModeStorage } from './testModeStorageService';

// Default role to use when none is set
const DEFAULT_ROLE: string = 'viewer';

// Define role-related storage types
export interface RoleStorage {
  currentRole: string;
  availableRoles: string[];
  lastModified: number;
}

/**
 * Role Storage Service class
 */
export class RoleStorageService {
  private storage: EnhancedStorageService;
  
  /**
   * Create a new RoleStorageService
   * 
   * @param storage Storage service to use, defaults to the global enhancedStorage
   */
  constructor(storage: EnhancedStorageService = enhancedStorage) {
    this.storage = storage;
  }
  
  /**
   * Get the current user role
   * 
   * @param checkTestMode Whether to check test mode for role override
   * @returns The current user role
   */
  getCurrentRole(checkTestMode: boolean = true): string {
    try {
      // If test mode is enabled, check for role in test mode state
      if (checkTestMode && testModeStorage.isTestModeEnabled()) {
        const testModeState = testModeStorage.getTestModeState();
        logger.debug('Test mode detected in getCurrentRole with currentRole:', testModeState?.initialRole);
        
        // Get role from test mode storage
        const roleStorage = this.getRoleStorage();
        return roleStorage ? roleStorage.currentRole : (testModeState?.initialRole || DEFAULT_ROLE);
      }
      
      // Normal role retrieval
      const roleStorage = this.getRoleStorage();
      if (!roleStorage) {
        return DEFAULT_ROLE;
      }
      
      return roleStorage.currentRole;
    } catch (error) {
      logger.log('Error getting current role:', error);
      return DEFAULT_ROLE;
    }
  }
  
  /**
   * Get available roles for the current user
   * 
   * @param checkTestMode Whether to check test mode for available roles
   * @returns Array of available roles
   */
  getAvailableRoles(checkTestMode: boolean = true): string[] {
    try {
      // If test mode is enabled, return all roles
      if (checkTestMode && testModeStorage.isTestModeEnabled()) {
        logger.debug('Test mode detected in getAvailableRoles');
        
        // In test mode, use available roles or default to all roles
        const roleStorage = this.getRoleStorage();
        if (roleStorage && roleStorage.availableRoles.length > 0) {
          logger.debug('Using stored available roles from cache');
          return roleStorage.availableRoles;
        }
        
        // Default test mode roles
        return ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'];
      }
      
      // Normal role retrieval
      const roleStorage = this.getRoleStorage();
      if (!roleStorage || !roleStorage.availableRoles.length) {
        return [DEFAULT_ROLE];
      }
      
      return roleStorage.availableRoles;
    } catch (error) {
      logger.log('Error getting available roles:', error);
      return [DEFAULT_ROLE];
    }
  }
  
  /**
   * Set the current user role
   * 
   * @param role The role to set
   * @param availableRoles Optional updated list of available roles
   * @returns boolean indicating log
   */
  setCurrentRole(role: UserRole, availableRoles?: string[]): boolean {
    try {
      const oldRole = this.getCurrentRole();
      
      // If role hasn't changed, skip the update
      if (role === oldRole && !availableRoles) {
        return true;
      }
      
      // Get existing role storage or create new one
      const existingRoleStorage = this.getRoleStorage() || {
        currentRole: DEFAULT_ROLE,
        availableRoles: [DEFAULT_ROLE],
        lastModified: Date.now()
      };
      
      // Update role storage
      const roleStorage: RoleStorage = {
        ...existingRoleStorage,
        currentRole: role,
        lastModified: Date.now()
      };
      
      // If availableRoles is provided, update it
      if (availableRoles) {
        roleStorage.availableRoles = availableRoles;
      }
      
      // Store updated role
      const log = this.setRoleStorage(roleStorage);
      
      if (log) {
        // Notify about role change
        notifyRoleChanged(oldRole, role, roleStorage.availableRoles);
        logger.debug(`Role switched from ${oldRole} to ${role}`);
      }
      
      return log;
    } catch (error) {
      logger.log('Error setting current role:', error);
      return false;
    }
  }
  
  /**
   * Set available roles for the current user
   * 
   * @param roles Array of available roles
   * @returns boolean indicating log
   */
  setAvailableRoles(roles: string[]): boolean {
    try {
      if (!roles.length) {
        logger.warn('Attempted to set empty available roles array');
        return false;
      }
      
      // Get existing role storage or create new one
      const existingRoleStorage = this.getRoleStorage() || {
        currentRole: DEFAULT_ROLE,
        availableRoles: [DEFAULT_ROLE],
        lastModified: Date.now()
      };
      
      // If current role is not in available roles, adjust it
      let { currentRole } = existingRoleStorage;
      if (!roles.includes(currentRole)) {
        currentRole = roles[0];
      }
      
      // Update role storage
      const roleStorage: RoleStorage = {
        ...existingRoleStorage,
        currentRole,
        availableRoles: roles,
        lastModified: Date.now()
      };
      
      // Store updated roles
      const log = this.setRoleStorage(roleStorage);
      
      if (log) {
        // Notify about roles update
        notifyRolesUpdated(roles, currentRole);
        logger.debug('Available roles updated:', roles);
      }
      
      return log;
    } catch (error) {
      logger.log('Error setting available roles:', error);
      return false;
    }
  }
  
  /**
   * Check if a role is available for the current user
   * 
   * @param role The role to check
   * @param checkTestMode Whether to check test mode for role availability
   * @returns boolean indicating if the role is available
   */
  isRoleAvailable(role: UserRole, checkTestMode: boolean = true): boolean {
    return this.getAvailableRoles(checkTestMode).includes(role);
  }
  
  /**
   * Clear all role data
   * 
   * @returns boolean indicating log
   */
  clearRoleData(): boolean {
    try {
      const log = this.storage.removeItem(STORAGE_KEYS.CURRENT_ROLE);
      if (log) {
        logger.debug('Role data cleared');
      }
      return log;
    } catch (error) {
      logger.log('Error clearing role data:', error);
      return false;
    }
  }
  
  /**
   * Get the complete role storage object
   * 
   * @returns RoleStorage object or null if not found
   */
  private getRoleStorage(): RoleStorage | null {
    try {
      return this.storage.getItem<RoleStorage>(STORAGE_KEYS.CURRENT_ROLE, {
        defaultValue: null
      });
    } catch (error) {
      logger.log('Error getting role storage:', error);
      return null;
    }
  }
  
  /**
   * Set the complete role storage object
   * 
   * @param roleStorage The role storage object to set
   * @returns boolean indicating log
   */
  private setRoleStorage(roleStorage: RoleStorage): boolean {
    try {
      return this.storage.setItem(STORAGE_KEYS.CURRENT_ROLE, roleStorage);
    } catch (error) {
      logger.log('Error setting role storage:', error);
      return false;
    }
  }
  
  /**
   * Factory method to create a RoleStorageService with custom storage
   * 
   * @param storage Custom EnhancedStorageService instance
   * @returns RoleStorageService instance
   */
  static withCustomStorage(storage: EnhancedStorageService): RoleStorageService {
    return new RoleStorageService(storage);
  }
}

// Export singleton instance for app-wide use
export const roleStorage = new RoleStorageService();