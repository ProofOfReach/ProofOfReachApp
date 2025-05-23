/**
 * Role Access Custom Hook
 * 
 * This hook provides convenient access to role-based permissions and capabilities
 * throughout the application. It integrates with the unified role service and
 * centralized access control system.
 */

import { useCallback, useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import "./services/roleManager';
import "./types/role';
import "./lib/logger';

/**
 * Permission check result with additional context
 */
export interface PermissionCheckResult {
  isAllowed: boolean;
  currentRole: UserRoleType;
  requiredRole?: UserRoleType;
  message?: string;
}

/**
 * Role capabilities interface
 */
export interface RoleCapabilities {
  [capability: string]: boolean;
}

/**
 * Hook for role-based access control
 * Provides a comprehensive API for checking permissions and capabilities
 * based on the user's current role
 */
export function useRoleAccess() {
  const router = useRouter();
  const [currentRole, setCurrentRole] = useState<UserRoleType>('viewer');
  const [availableRoles, setAvailableRoles] = useState<UserRoleType[]>(['viewer']);
  const [capabilities, setCapabilities] = useState<RoleCapabilities>({});

  // Initialize role state from RoleManager on mount
  useEffect(() => {
    try {
      const role = RoleManager.getCurrentRole();
      const roles = RoleManager.getAvailableRoles();
      
      setCurrentRole(role);
      setAvailableRoles(roles);
      
      // Initialize capabilities based on current role
      updateCapabilitiesForRole(role);
      
      // Listen for role changes
      const handleRoleChange = (event: CustomEvent) => {
        if (event.detail && event.detail.to) {
          const newRole = event.detail.to as UserRoleType;
          setCurrentRole(newRole);
          updateCapabilitiesForRole(newRole);
        }
      };
      
      document.addEventListener('roleSwitched', handleRoleChange as EventListener);
      
      return () => {
        document.removeEventListener('roleSwitched', handleRoleChange as EventListener);
      };
    } catch (error) {
      logger.logger.error('Error initializing useRoleAccess hook:', error);
    }
  }, []);
  
  /**
   * Update capabilities based on role
   */
  const updateCapabilitiesForRole = (role: UserRoleType) => {
    // Define capabilities for each role
    const roleCapabilities: Record<UserRoleType, RoleCapabilities> = {
      viewer: {
        viewContent: true,
        createComment: true,
        editOwnProfile: true,
        viewPublicAds: true,
        // Viewers have limited capabilities
      },
      advertiser: {
        viewContent: true,
        createComment: true,
        editOwnProfile: true,
        viewPublicAds: true,
        createCampaign: true,
        editOwnCampaign: true,
        viewCampaignStats: true,
        manageBudget: true,
        // Advertisers can manage their campaigns
      },
      publisher: {
        viewContent: true,
        createComment: true,
        editOwnProfile: true,
        viewPublicAds: true,
        createAdSpace: true,
        editOwnAdSpace: true,
        viewPublisherStats: true,
        managePayouts: true,
        // Publishers can manage their ad spaces
      },
      admin: {
        // Admins can do everything
        viewContent: true,
        createComment: true,
        editOwnProfile: true,
        viewPublicAds: true,
        createCampaign: true,
        editOwnCampaign: true,
        editAnyCampaign: true,
        viewCampaignStats: true,
        manageBudget: true,
        createAdSpace: true,
        editOwnAdSpace: true,
        editAnyAdSpace: true,
        viewPublisherStats: true,
        managePayouts: true,
        manageUsers: true,
        viewSystemStats: true,
        manageSettings: true,
        accessAdminPanel: true,
      },
      stakeholder: {
        // Stakeholders can view analytics but not change content
        viewContent: true,
        viewPublicAds: true,
        viewCampaignStats: true,
        viewPublisherStats: true,
        viewSystemStats: true,
      },
      developer: {
        // Developers have admin capabilities plus development tools
        viewContent: true,
        createComment: true,
        editOwnProfile: true,
        viewPublicAds: true,
        createCampaign: true,
        editOwnCampaign: true,
        editAnyCampaign: true,
        viewCampaignStats: true,
        manageBudget: true,
        createAdSpace: true,
        editOwnAdSpace: true,
        editAnyAdSpace: true,
        viewPublisherStats: true,
        managePayouts: true,
        manageUsers: true,
        viewSystemStats: true,
        manageSettings: true,
        accessAdminPanel: true,
        accessDeveloperTools: true,
        runTests: true,
      }
    };
    
    setCapabilities(roleCapabilities[role] || {});
  };

  /**
   * Check if the current role has a specific capability
   */
  const hasCapability = useCallback((capability: string): boolean => {
    return capabilities[capability] === true;
  }, [capabilities]);

  /**
   * Check if current role matches or exceeds required role level
   */
  const checkRole = useCallback((requiredRole: UserRoleType): PermissionCheckResult => {
    const roleHierarchy: Record<UserRoleType, number> = {
      viewer: 1,
      advertiser: 2,
      publisher: 2,
      stakeholder: 3,
      admin: 4,
      developer: 5
    };
    
    const currentRoleLevel = roleHierarchy[currentRole] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0;
    
    const isAllowed = currentRoleLevel >= requiredRoleLevel;
    
    return {
      isAllowed,
      currentRole,
      requiredRole,
      message: isAllowed ? undefined : `Requires ${requiredRole} role (current: ${currentRole})`
    };
  }, [currentRole]);

  /**
   * Check if the current route is accessible to the current role
   */
  const checkRouteAccess = useCallback((): PermissionCheckResult => {
    if (!router.pathname) return { isAllowed: true, currentRole };
    
    // Define route access rules
    const routeAccessRules: Record<string, UserRoleType> = {
      '/dashboard/admin': 'admin',
      '/dashboard/admin/users': 'admin',
      '/dashboard/admin/settings': 'admin',
      '/dashboard/advertiser': 'advertiser',
      '/dashboard/publisher': 'publisher',
      '/dashboard/stakeholder': 'stakeholder',
      '/dashboard/developer': 'developer',
    };
    
    // Check for exact route matches
    for (const route in routeAccessRules) {
      if (router.pathname === route || router.pathname.startsWith(`${route}/`)) {
        // Get current role directly to ensure we have the latest value
        const role = RoleManager.getCurrentRole();
        // Use the current role from the state or RoleManager as a fallback
        const effectiveRole = currentRole || role;
        
        // Use the role hierarchy to check access
        const roleHierarchy: Record<UserRoleType, number> = {
          viewer: 1,
          advertiser: 2,
          publisher: 2,
          stakeholder: 3,
          admin: 4,
          developer: 5
        };
        
        const currentRoleLevel = roleHierarchy[effectiveRole] || 0;
        const requiredRoleLevel = roleHierarchy[routeAccessRules[route]] || 0;
        
        const isAllowed = currentRoleLevel >= requiredRoleLevel;
        
        return {
          isAllowed,
          currentRole: effectiveRole,
          requiredRole: routeAccessRules[route],
          message: isAllowed ? undefined : `Requires ${routeAccessRules[route]} role (current: ${effectiveRole})`
        };
      }
    }
    
    // Default to allowing access
    return { isAllowed: true, currentRole };
  }, [router.pathname, currentRole]);

  /**
   * Redirect to appropriate page if current route is not accessible
   */
  const enforceRouteAccess = useCallback(() => {
    const access = checkRouteAccess();
    
    if (!access.isAllowed) {
      logger.warn(`Access denied to route ${router.pathname}. ${access.message}`);
      
      // Redirect to appropriate page based on role
      const roleDefaultRoutes: Record<UserRoleType, string> = {
        viewer: '/dashboard',
        advertiser: '/dashboard/advertiser',
        publisher: '/dashboard/publisher',
        stakeholder: '/dashboard/stakeholder',
        admin: '/dashboard/admin',
        developer: '/dashboard/developer'
      };
      
      const redirectTo = roleDefaultRoutes[currentRole] || '/dashboard';
      router.push(redirectTo);
      
      return false;
    }
    
    return true;
  }, [checkRouteAccess, currentRole, router]);

  /**
   * Set the current role with proper validation
   */
  const setRole = useCallback(async (role: UserRoleType): Promise<boolean> => {
    try {
      if (availableRoles.includes(role)) {
        const success = await RoleManager.setCurrentRole(role);
        if (success) {
          setCurrentRole(role);
          updateCapabilitiesForRole(role);
          return true;
        }
      }
      return false;
    } catch (error) {
      logger.logger.error('Error setting role:', error);
      return false;
    }
  }, [availableRoles]);

  // Combine all role access functionality
  return {
    // Current state
    currentRole,
    availableRoles,
    capabilities,
    
    // Permission checks
    hasCapability,
    checkRole,
    checkRouteAccess,
    enforceRouteAccess,
    
    // Actions
    setRole
  };
}

export default useRoleAccess;