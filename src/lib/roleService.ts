import { UserRole } from '../context/RoleContext';
import { getTestModeStatus } from '../context/TestModeContext';

/**
 * Role Service - Centralized service for managing user roles
 * 
 * This service provides methods for:
 * - Getting the current user role
 * - Changing the user role (with support for both test and production mode)
 * - Clearing local state during logout
 * 
 * It maintains state in localStorage for persistence and uses custom events
 * for cross-component communication.
 */
export class RoleService {
  // Local storage keys
  private static readonly ROLE_KEY = 'currentRole';
  
  /**
   * Get the current user role from localStorage
   */
  public static getCurrentRole(): UserRole | null {
    if (typeof window === 'undefined') return null;
    
    const role = localStorage.getItem(this.ROLE_KEY);
    return role as UserRole || null;
  }
  
  /**
   * Clear all local state (used during logout)
   */
  public static clearLocalState(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(this.ROLE_KEY);
    // Don't clear test mode during logout to preserve developer preference
    
    // Dispatch event to notify components
    const event = new CustomEvent('roleSwitched', {
      detail: {
        from: this.getCurrentRole() || 'user',
        to: 'user' // Default back to user role
      }
    });
    document.dispatchEvent(event);
  }
  
  /**
   * Change the current user role
   * 
   * @param role The new role to set
   * @param skipSave If true, don't save to localStorage (useful for temporary changes)
   * @returns Promise that resolves to true if successful
   */
  public static async changeRole(
    role: UserRole, 
    skipSave: boolean = false
  ): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    
    const currentRole = this.getCurrentRole() || 'user';
    
    // If we're in test mode, just update localStorage and dispatch event
    if (getTestModeStatus()) {
      if (!skipSave) {
        localStorage.setItem(this.ROLE_KEY, role);
      }
      
      // Dispatch custom event for role change
      document.dispatchEvent(
        new CustomEvent('roleSwitched', {
          detail: {
            from: currentRole,
            to: role,
          },
        })
      );
      
      // Also dispatch the new standardized event
      window.dispatchEvent(
        new CustomEvent('role-changed', {
          detail: { role }
        })
      );
      
      return true;
    } else {
      // In production mode, call the API to change roles
      try {
        const response = await fetch('/api/roles', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ role }),
        });
        
        if (!response.ok) {
          console.error('Failed to update role via API:', await response.text());
          return false;
        }
        
        // Only save locally if API call succeeded
        if (!skipSave) {
          localStorage.setItem(this.ROLE_KEY, role);
        }
        
        // Dispatch custom events for role change (both legacy and new)
        document.dispatchEvent(
          new CustomEvent('roleSwitched', {
            detail: {
              from: currentRole,
              to: role,
            },
          })
        );
        
        window.dispatchEvent(
          new CustomEvent('role-changed', {
            detail: { role }
          })
        );
        
        return true;
      } catch (error) {
        console.error('Error updating role:', error);
        return false;
      }
    }
  }
  
  /**
   * Enable all roles for the current user (test mode only)
   */
  public static async enableAllRoles(): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    
    // In test mode, just set all roles to true in localStorage
    if (getTestModeStatus()) {
      try {
        // Store available roles in cache using the new standardized approach
        const allRoles = ['user', 'advertiser', 'publisher', 'admin', 'stakeholder']; 
        localStorage.setItem('cachedAvailableRoles', JSON.stringify(allRoles));
        localStorage.setItem('roleCacheTimestamp', Date.now().toString());
        
        // Legacy approach for backward compatibility
        localStorage.setItem('user_role_user', 'true');
        localStorage.setItem('user_role_advertiser', 'true');
        localStorage.setItem('user_role_publisher', 'true');
        localStorage.setItem('user_role_admin', 'true');
        localStorage.setItem('user_role_stakeholder', 'true');
        
        // Dispatch a standardized event to notify all roles have been updated
        window.dispatchEvent(new CustomEvent('roles-updated', {
          detail: { availableRoles: allRoles }
        }));
        
        return true;
      } catch (error) {
        console.error('Error enabling all roles in test mode:', error);
        return false;
      }
    } else {
      // In production mode, call the API to enable all roles
      try {
        const response = await fetch('/api/roles/enable-all', {
          method: 'POST',
        });
        
        if (!response.ok) {
          console.error('Failed to enable all roles via API:', await response.text());
          return false;
        }
        
        return true;
      } catch (error) {
        console.error('Error enabling all roles:', error);
        return false;
      }
    }
  }
  
  /**
   * Check if a user has a specific role
   */
  public static hasRole(role: UserRole): boolean {
    if (typeof window === 'undefined') return false;
    
    // In test mode, check localStorage directly
    if (getTestModeStatus()) {
      return localStorage.getItem(`user_role_${role}`) === 'true';
    } else {
      // For production, we would rely on the cached role value
      // This would be enhanced to check with the server in a real implementation
      return this.getCurrentRole() === role;
    }
  }
}