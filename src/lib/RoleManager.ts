import { UserRole } from '@/types/role';
import { EnhancedStorage, STORAGE_KEYS, notifyRoleChanged } from './enhancedStorage';
import { logger } from './logger';

/**
 * Role Manager - Advanced role management and transitions
 */
export class RoleManager {
  private static instance: RoleManager;

  static getInstance(): RoleManager {
    if (!RoleManager.instance) {
      RoleManager.instance = new RoleManager();
    }
    return RoleManager.instance;
  }

  /**
   * Switch to a new role
   */
  async switchRole(newRole: UserRole): Promise<boolean> {
    try {
      const currentRole = EnhancedStorage.getUserRole();
      
      if (currentRole === newRole) {
        return true; // Already in this role
      }

      // Update storage
      const success = EnhancedStorage.setUserRole(newRole);
      
      if (success) {
        // Notify role change
        notifyRoleChanged(newRole);
        return true;
      }
      
      return false;
    } catch (error) {
      logger.log('Error switching role:', error);
      return false;
    }
  }

  /**
   * Get current role
   */
  getCurrentRole(): UserRole {
    return EnhancedStorage.getUserRole();
  }

  /**
   * Get available roles for user
   */
  getAvailableRoles(): UserRole[] {
    return EnhancedStorage.getAvailableRoles();
  }

  /**
   * Check if role is available for user
   */
  isRoleAvailable(role: UserRole): boolean {
    const availableRoles = this.getAvailableRoles();
    return availableRoles.includes(role);
  }

  /**
   * Validate role transition
   */
  canTransitionTo(fromRole: UserRole, toRole: UserRole): boolean {
    // All roles can transition to viewer
    if (toRole === 'viewer') return true;
    
    // Test mode allows all transitions
    if (EnhancedStorage.isTestMode()) return true;
    
    // Admin can transition to any role
    if (fromRole === 'admin') return true;
    
    // Default role transitions
    return this.isRoleAvailable(toRole);
  }

  /**
   * Reset to default role
   */
  resetToDefault(): boolean {
    return EnhancedStorage.setUserRole('viewer');
  }
}

// Export default instance
export default RoleManager.getInstance();