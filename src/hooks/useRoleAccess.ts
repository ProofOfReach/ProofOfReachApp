/**
 * Role Access Custom Hook
 * 
 * This hook provides convenient access to role-based permissions and capabilities
 * throughout the application. It integrates with the unified role service and
 * centralized access control system.
 */

import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { unifiedRoleService } from '../lib/unifiedRoleService';
import { 
  accessControl, 
  checkPermission, 
  checkRouteAccess, 
  getRoleCapabilities 
} from '../lib/accessControl';
import { UserRoleType } from '../types/role';

/**
 * Custom hook for checking role-based access and permissions
 */
export function useRoleAccess() {
  const router = useRouter();
  const currentRole = unifiedRoleService.getCurrentRoleFromLocalContext();
  const availableRoles = unifiedRoleService.getAvailableRoles();
  
  // Check if the current role can perform a specific action
  const can = useCallback((permission: keyof typeof accessControl.permissions) => {
    return checkPermission(permission, currentRole);
  }, [currentRole]);
  
  // Check if the current role can access a route
  const canAccess = useCallback((route: string) => {
    return checkRouteAccess(route, currentRole);
  }, [currentRole]);
  
  // Check if the current role can access current route
  const canAccessCurrentRoute = useMemo(() => {
    return checkRouteAccess(router.pathname, currentRole);
  }, [router.pathname, currentRole]);
  
  // Get all capabilities for the current role
  const capabilities = useMemo(() => {
    return getRoleCapabilities(currentRole);
  }, [currentRole]);
  
  // Check if user has a specific role
  const hasRole = useCallback((role: UserRoleType) => {
    return currentRole === role;
  }, [currentRole]);
  
  // Check if user has any of the specified roles
  const hasPermission = useCallback((roles: UserRoleType[]) => {
    return roles.includes(currentRole);
  }, [currentRole]);
  
  // Switch to a different role (if available)
  const switchRole = useCallback(async (newRole: UserRoleType, preservePath = false) => {
    // Make sure the role is available before switching
    if (!availableRoles.includes(newRole)) {
      return false;
    }
    
    // Store current role for event dispatching
    const previousRole = currentRole;
    
    // Update role in local context
    const success = unifiedRoleService.setCurrentRoleInLocalContext(newRole);
    
    if (success) {
      // Dispatch role switched event for components to update
      const event = new CustomEvent('roleSwitched', { 
        detail: {
          from: previousRole,
          to: newRole,
          timestamp: new Date().toISOString(),
          path: router.pathname
        }
      });
      document.dispatchEvent(event);
      
      // If preservePath is false, navigate to role-specific dashboard
      if (!preservePath) {
        // Determine target path based on new role
        let targetPath = '/dashboard/user';
        
        if (newRole === 'publisher') {
          targetPath = '/dashboard/publisher';
        } else if (newRole === 'advertiser') {
          targetPath = '/dashboard/advertiser';
        } else if (newRole === 'admin') {
          targetPath = '/dashboard/admin';
        } else if (newRole === 'stakeholder') {
          targetPath = '/dashboard/stakeholder';
        }
        
        // Use Next.js Router for client-side navigation without page refresh
        try {
          // Add options to avoid full page reload and maintain smooth UX
          await router.push(targetPath, undefined, { 
            shallow: true,
            scroll: false
          });
        } catch (routerError) {
          console.error('Error during Next.js router navigation:', routerError);
          // No fallback needed as the role has already been updated in context
        }
      }
    }
    
    return success;
  }, [availableRoles, router, currentRole]);
  
  return {
    // For backward compatibility with existing components
    role: currentRole,
    
    // New standardized naming
    currentRole,
    availableRoles,
    can,
    canAccess,
    canAccessCurrentRoute,
    capabilities,
    switchRole,
    hasRole,
    hasPermission,
    
    // Additional convenience functions
    isAdmin: currentRole === 'admin',
    isPublisher: currentRole === 'publisher',
    isAdvertiser: currentRole === 'advertiser',
    isStakeholder: currentRole === 'stakeholder',
    isUser: currentRole === 'user',
  };
}

export default useRoleAccess;