/**
 * Production Role Manager
 * 
 * Centralized role management system that consolidates all role-related functionality
 * and provides a single source of truth for user roles and permissions.
 */

import { UserRole } from '@/types/role';

export class RoleManager {
  private static instance: RoleManager;
  
  private constructor() {}
  
  public static getInstance(): RoleManager {
    if (!RoleManager.instance) {
      RoleManager.instance = new RoleManager();
    }
    return RoleManager.instance;
  }
  
  /**
   * Get current user role from all possible sources
   */
  getCurrentRole(): UserRole {
    if (typeof window === 'undefined') return 'viewer';
    
    // Check test mode first
    if (this.isTestMode()) {
      return localStorage.getItem('userRole') as UserRole || 'admin';
    }
    
    // Production mode - get from localStorage
    return localStorage.getItem('userRole') as UserRole || 'viewer';
  }
  
  /**
   * Set user role with proper validation
   */
  setRole(role: UserRole): boolean {
    if (typeof window === 'undefined') return false;
    
    const validRoles: UserRole[] = ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'];
    
    if (!validRoles.includes(role)) {
      console.error(`Invalid role: ${role}`);
      return false;
    }
    
    // In test mode, always allow all roles
    if (this.isTestMode()) {
      localStorage.setItem('userRole', role);
      localStorage.setItem('currentRole', role);
      this.notifyRoleChange(role);
      return true;
    }
    
    // Production mode - check available roles
    const availableRoles = this.getAvailableRoles();
    if (!availableRoles.includes(role)) {
      console.error(`Role ${role} not available for user`);
      return false;
    }
    
    localStorage.setItem('userRole', role);
    localStorage.setItem('currentRole', role);
    this.notifyRoleChange(role);
    return true;
  }
  
  /**
   * Get available roles for current user
   */
  getAvailableRoles(): UserRole[] {
    if (typeof window === 'undefined') return ['viewer'];
    
    // Test mode has all roles
    if (this.isTestMode()) {
      return ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'];
    }
    
    // Production mode - get from cache or API
    try {
      const cached = localStorage.getItem('cachedAvailableRoles');
      if (cached) {
        return JSON.parse(cached) as UserRole[];
      }
    } catch (error) {
      console.error('Error parsing cached roles:', error);
    }
    
    return ['viewer']; // Default fallback
  }
  
  /**
   * Check if user is in test mode
   */
  isTestMode(): boolean {
    if (typeof window === 'undefined') return false;
    
    const isTestMode = localStorage.getItem('isTestMode') === 'true';
    const hasTestKey = localStorage.getItem('nostr_pubkey')?.startsWith('pk_test_');
    
    return isTestMode || Boolean(hasTestKey);
  }
  
  /**
   * Initialize test mode with all roles
   */
  enableTestMode(): void {
    if (typeof window === 'undefined') return;
    
    const allRoles: UserRole[] = ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'];
    
    localStorage.setItem('isTestMode', 'true');
    localStorage.setItem('cachedAvailableRoles', JSON.stringify(allRoles));
    localStorage.setItem('roleCacheTimestamp', Date.now().toString());
    localStorage.setItem('userRole', 'admin');
    localStorage.setItem('currentRole', 'admin');
    
    // Set individual role flags
    allRoles.forEach(role => {
      localStorage.setItem(`is${role.charAt(0).toUpperCase() + role.slice(1)}`, 'true');
    });
    
    this.notifyRoleChange('admin');
  }
  
  /**
   * Check if a specific role is available to the user
   */
  isRoleAvailable(role: UserRole): boolean {
    return this.getAvailableRoles().includes(role);
  }
  
  /**
   * Notify components of role changes
   */
  private notifyRoleChange(newRole: UserRole): void {
    if (typeof window === 'undefined') return;
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('roleChanged', {
      detail: { role: newRole, timestamp: Date.now() }
    }));
    
    // Also dispatch storage event for cross-tab communication
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'userRole',
      newValue: newRole,
      oldValue: localStorage.getItem('userRole')
    }));
  }
  
  /**
   * Clear all role data (for logout)
   */
  clearRoles(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentRole');
    localStorage.removeItem('cachedAvailableRoles');
    localStorage.removeItem('roleCacheTimestamp');
    localStorage.removeItem('isTestMode');
    
    const allRoles: UserRole[] = ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'];
    allRoles.forEach(role => {
      localStorage.removeItem(`is${role.charAt(0).toUpperCase() + role.slice(1)}`);
    });
  }
}

// Export singleton instance
export const roleManager = RoleManager.getInstance();