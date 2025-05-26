/**
 * Role Service - Simple role management for dashboard functionality
 */

export class RoleService {
  static changeRole(newRole: string) {
    // Store the role change in localStorage for immediate UI updates
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedRole', newRole);
      
      // Trigger a page refresh to apply the role change
      window.location.reload();
    }
  }

  static getCurrentRole(): string {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedRole') || 'viewer';
    }
    return 'viewer';
  }

  static clearRole() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('selectedRole');
    }
  }
}

// Default export for compatibility
export default RoleService;