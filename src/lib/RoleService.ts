import { UserRole } from '@/types/role';
import { logger } from './logger';

/**
 * Role Service - Manages user role operations and transitions
 */
export class RoleService {
  static async getCurrentRole(): Promise<UserRole> {
    try {
      const storedRole = localStorage.getItem('userRole');
      return (storedRole as UserRole) || 'viewer';
    } catch (error) {
      logger.log('Error getting current role:', error);
      return 'viewer';
    }
  }

  static async setRole(role: UserRole): Promise<boolean> {
    try {
      localStorage.setItem('userRole', role);
      return true;
    } catch (error) {
      logger.log('Error setting role:', error);
      return false;
    }
  }

  static async getAvailableRoles(): Promise<UserRole[]> {
    try {
      const cachedRoles = localStorage.getItem('cachedAvailableRoles');
      if (cachedRoles) {
        return JSON.parse(cachedRoles);
      }
      return ['viewer', 'advertiser', 'publisher'];
    } catch (error) {
      logger.log('Error getting available roles:', error);
      return ['viewer'];
    }
  }

  static async switchRole(newRole: UserRole): Promise<boolean> {
    try {
      await this.setRole(newRole);
      // Trigger role change event
      window.dispatchEvent(new CustomEvent('roleChanged', { 
        detail: { newRole } 
      }));
      return true;
    } catch (error) {
      logger.log('Error switching role:', error);
      return false;
    }
  }

  static isValidRole(role: string): role is UserRole {
    return ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'].includes(role);
  }

  // Test mode functionality
  static isTestMode(): boolean {
    try {
      return localStorage.getItem('isTestMode') === 'true';
    } catch {
      return false;
    }
  }

  static setTestMode(enabled: boolean): void {
    try {
      localStorage.setItem('isTestMode', enabled.toString());
    } catch (error) {
      logger.log('Error setting test mode:', error);
    }
  }

  static changeRole(role: UserRole): Promise<boolean> {
    return this.switchRole(role);
  }

  static hasRole(role: UserRole): boolean {
    try {
      const currentRole = localStorage.getItem('userRole');
      return currentRole === role;
    } catch {
      return false;
    }
  }

  static enableAllRoles(): void {
    try {
      const allRoles = ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'];
      localStorage.setItem('cachedAvailableRoles', JSON.stringify(allRoles));
    } catch (error) {
      logger.log('Error enabling all roles:', error);
    }
  }
}

// Export default instance
export default RoleService;