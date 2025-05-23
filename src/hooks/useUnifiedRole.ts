/**
 * Unified Role Hook
 * 
 * This hook provides access to the unified role system for React components.
 * It integrates with the unifiedRoleService and offers an easy-to-use interface
 * for role-based permission checking.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { UserRole } from '../types/auth';
import { unifiedRoleService, isValidRole } from '../lib/unifiedRoleService';
import { logger } from '../lib/logger';
import { transitionToRole, addRoleSwitchedListener } from '../utils/roleTransition';

/**
 * Custom hook for unified role management
 * @returns Object with role state and methods
 */
export const useUnifiedRole = () => {
  // State for the current role
  const [currentRole, setCurrentRole] = useState<UserRole>('viewer');
  
  // State for available roles
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>(['viewer']);
  
  // State for loading/transitioning status
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  
  // Flag for test mode
  const [isTestMode, setIsTestMode] = useState<boolean>(false);
  
  // Initialize role state
  useEffect(() => {
    let isMounted = true;
    
    const initRoles = async () => {
      try {
        // Check for test mode
        const testMode = typeof window !== 'undefined' && 
          (localStorage.getItem('isTestMode') === 'true' || 
           (window.location.hostname === 'localhost' && localStorage.getItem('isTestMode') !== 'false'));
        
        if (testMode && isMounted) {
          setIsTestMode(true);
          
          // In test mode, all roles are available
          setAvailableRoles(['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder']);
          
          // Use role from localStorage or default to advertiser
          const localRole = localStorage.getItem('viewerRole');
          setCurrentRole(isValidRole(localRole) ? localRole as UserRole : 'advertiser');
          
          return;
        }
        
        // For real users, get data from the unified role service
        const userId = typeof window !== 'undefined' && localStorage.getItem('nostr_pubkey');
        
        if (!userId) {
          // No user logged in
          if (isMounted) {
            setAvailableRoles(['viewer']);
            setCurrentRole('viewer');
          }
          return;
        }
        
        // Get available roles
        const roles = await unifiedRoleService.getUserRoles(userId);
        
        if (isMounted) {
          setAvailableRoles(roles);
        }
        
        // Get current role
        const activeRole = await unifiedRoleService.getCurrentRole(userId);
        
        if (isMounted) {
          setCurrentRole(activeRole);
        }
      } catch (error) {
        logger.logger.error('Error initializing role state:', error);
        
        // Default to basic viewer role
        if (isMounted) {
          setAvailableRoles(['viewer']);
          setCurrentRole('viewer');
        }
      }
    };
    
    initRoles();
    
    // Listen for role switched events
    const cleanup = addRoleSwitchedListener((event) => {
      if (isMounted) {
        setCurrentRole(event.detail.to);
        setIsTransitioning(false);
      }
    });
    
    return () => {
      isMounted = false;
      cleanup();
    };
  }, []);
  
  /**
   * Change to a new role
   * @param newRole Role to change to
   * @param preservePath Whether to stay on current page
   * @returns Promise resolving to success status
   */
  const changeRole = useCallback(
    async (newRole: UserRole, preservePath = false): Promise<boolean> => {
      // Validate the role
      if (!isValidRole(newRole)) {
        logger.warn(`Attempted to set invalid role: ${newRole}`);
        return false;
      }
      
      // Check if role is available
      if (!availableRoles.includes(newRole)) {
        logger.warn(`Role ${newRole} is not available for this user`);
        return false;
      }
      
      // Skip if already in this role
      if (newRole === currentRole) {
        return true;
      }
      
      // Set transitioning state
      setIsTransitioning(true);
      
      // Perform the transition
      const success = await transitionToRole(currentRole, newRole, preservePath);
      
      // Update local state if we're staying on the same page
      if (success && preservePath) {
        setCurrentRole(newRole);
      }
      
      // Reset transitioning state if the transition failed
      if (!success) {
        setIsTransitioning(false);
      }
      
      return success;
    },
    [currentRole, availableRoles]
  );
  
  /**
   * Check if a role is available for the current user
   * @param role Role to check
   * @returns Whether the role is available
   */
  const isRoleAvailable = useCallback(
    (role: UserRole): boolean => {
      return availableRoles.includes(role);
    },
    [availableRoles]
  );
  
  // Return stable API
  return useMemo(
    () => ({
      role: currentRole,
      availableRoles,
      isTransitioning,
      isTestMode,
      setRole: changeRole,
      isRoleAvailable
    }),
    [currentRole, availableRoles, isTransitioning, isTestMode, changeRole, isRoleAvailable]
  );
};

export default useUnifiedRole;