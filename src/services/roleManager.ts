/**
 * Role Manager Service
 * 
 * A specialized service for handling role management functionality
 * that is fully decoupled from test mode concerns.
 */

import { UserRole, isValidUserRole } from '../types/role';
import { logger } from '../lib/logger';
import { StorageService, STORAGE_KEYS } from './storageService';
import { dispatchTestModeEvent, TEST_MODE_EVENTS } from '../lib/testModeEvents';
import { ROLE_EVENTS } from '../lib/events/eventTypes';

// Role data structure for storage
export interface RoleData {
  currentRole: string;
  availableRoles: string[];
  timestamp: number;
}

/**
 * Centralized service for role management across the application.
 * This service explicitly separates role management from test mode concerns.
 */
export class RoleManager {
  /**
   * Get the current user role from storage
   */
  static getCurrentRole(): string {
    // First check the dedicated current role storage
    const storedRole = StorageService.getItem<UserRole>(STORAGE_KEYS.CURRENT_ROLE);
    if (storedRole) {
      return storedRole;
    }
    
    // Fall back to legacy localStorage direct access for compatibility
    if (typeof window !== 'undefined') {
      const legacyRole = localStorage.getItem('userRole');
      if (legacyRole && isValidUserRole(legacyRole)) {
        return legacyRole;
      }
    }
    
    // Default to 'viewer' if no role is found
    return 'viewer';
  }
  
  /**
   * Set the current user role
   */
  static setCurrentRole(role: string): boolean {
    if (!isValidUserRole(role)) {
      logger.warn(`Attempted to set invalid role: ${role}`);
      return false;
    }
    
    try {
      // Store using the storage service
      StorageService.setItem(STORAGE_KEYS.CURRENT_ROLE, role);
      
      // For backward compatibility with old code
      if (typeof window !== 'undefined') {
        localStorage.setItem('userRole', role);
      }
      
      // Dispatch role change event
      if (typeof window !== 'undefined') {
        const prevRole = this.getCurrentRole();
        
        // Dispatch modern event
        const event = new CustomEvent(ROLE_EVENTS.ROLE_CHANGED, {
          detail: {
            from: prevRole,
            to: role,
          }
        });
        window.dispatchEvent(event);
        
        // For test mode integration (without creating direct dependency)
        dispatchTestModeEvent(TEST_MODE_EVENTS.ROLE_CHANGED, {
          from: prevRole,
          to: role,
          availableRoles: this.getAvailableRoles()
        });
        
        // Legacy events for backward compatibility
        window.dispatchEvent(new CustomEvent('role-changed', { 
          detail: { role, from: prevRole, to: role }
        }));
        document.dispatchEvent(new CustomEvent('roleSwitched', {
          detail: { role }
        }));
      }
      
      return true;
    } catch (error) {
      logger.log('Error setting current role:', error);
      return false;
    }
  }
  
  /**
   * Get the available roles for the current user
   */
  static getAvailableRoles(): string[] {
    const storedRoles = StorageService.getItem<UserRole[]>(STORAGE_KEYS.AVAILABLE_ROLES);
    if (storedRoles && Array.isArray(storedRoles)) {
      return storedRoles.filter(role => isValidUserRole(role));
    }
    
    // Fall back to legacy localStorage for compatibility
    if (typeof window !== 'undefined') {
      try {
        const legacyRoles = localStorage.getItem('cachedAvailableRoles');
        if (legacyRoles) {
          const parsedRoles = JSON.parse(legacyRoles);
          if (Array.isArray(parsedRoles)) {
            return parsedRoles.filter(role => isValidUserRole(role));
          }
        }
      } catch (error) {
        logger.log('Error parsing legacy available roles:', error);
      }
    }
    
    // Default to just viewer role if nothing is found
    return ['viewer'];
  }
  
  /**
   * Set the available roles for the current user
   */
  static setAvailableRoles(roles: string[]): boolean {
    if (!Array.isArray(roles)) {
      logger.warn('Attempted to set available roles with a non-array value');
      return false;
    }
    
    // Filter out invalid roles
    const validRoles = roles.filter(role => isValidUserRole(role));
    
    try {
      // Store using the storage service
      StorageService.setItem(STORAGE_KEYS.AVAILABLE_ROLES, validRoles);
      StorageService.setItem(STORAGE_KEYS.ROLE_CACHE_TIMESTAMP, Date.now());
      
      // For backward compatibility with old code
      if (typeof window !== 'undefined') {
        localStorage.setItem('cachedAvailableRoles', JSON.stringify(validRoles));
        localStorage.setItem('roleCacheTimestamp', Date.now().toString());
      }
      
      // Dispatch roles updated event
      if (typeof window !== 'undefined') {
        const event = new CustomEvent(ROLE_EVENTS.ROLES_UPDATED, {
          detail: {
            availableRoles: validRoles
          }
        });
        window.dispatchEvent(event);
        
        // For test mode integration (without creating direct dependency)
        dispatchTestModeEvent(TEST_MODE_EVENTS.ROLES_UPDATED, {
          availableRoles: validRoles,
          currentRole: this.getCurrentRole()
        });
      }
      
      return true;
    } catch (error) {
      logger.log('Error setting available roles:', error);
      return false;
    }
  }
  
  /**
   * Check if a given role is valid
   */
  static isValidRole(role: string): role is UserRole {
    return isValidUserRole(role);
  }
  
  /**
   * Check if a given role is available to the current user
   */
  static isRoleAvailable(role: string): boolean {
    const availableRoles = this.getAvailableRoles();
    return availableRoles.includes(role);
  }
  
  /**
   * Enable all roles for the current user (typically used in test mode)
   */
  static enableAllRoles(): boolean {
    const allRoles: string[] = ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'];
    return this.setAvailableRoles(allRoles);
  }
  
  /**
   * Add a role to the available roles if not already present
   */
  static addRole(role: string): boolean {
    if (!isValidUserRole(role)) {
      return false;
    }
    
    const availableRoles = this.getAvailableRoles();
    if (availableRoles.includes(role)) {
      return true; // Already has this role
    }
    
    return this.setAvailableRoles([...availableRoles, role]);
  }
  
  /**
   * Remove a role from the available roles
   */
  static removeRole(role: string): boolean {
    if (!isValidUserRole(role)) {
      return false;
    }
    
    const availableRoles = this.getAvailableRoles();
    if (!availableRoles.includes(role)) {
      return true; // Doesn't have this role anyway
    }
    
    const updatedRoles = availableRoles.filter(r => r !== role);
    
    // If current role is being removed, also update current role
    if (this.getCurrentRole() === role) {
      this.setCurrentRole(updatedRoles[0] || 'viewer');
    }
    
    return this.setAvailableRoles(updatedRoles);
  }
  
  /**
   * Clear all role data - used during logout
   */
  static clearRoleData(): void {
    StorageService.removeItem(STORAGE_KEYS.CURRENT_ROLE);
    StorageService.removeItem(STORAGE_KEYS.AVAILABLE_ROLES);
    StorageService.removeItem(STORAGE_KEYS.ROLE_CACHE_TIMESTAMP);
    
    // Also clear legacy storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userRole');
      localStorage.removeItem('cachedAvailableRoles');
      localStorage.removeItem('roleCacheTimestamp');
    }
  }
}

// Export the RoleManager class
export default RoleManager;