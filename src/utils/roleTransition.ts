/**
 * Role Transition Utilities
 * 
 * This module provides utility functions for handling role transitions
 * with proper events and state management.
 * 
 * This is a production-ready implementation with proper error handling,
 * browser compatibility, and redirectless navigation using Next.js router.
 */

import type { UserRole } from '../types/role';
import { logger } from '../lib/logger';
import { unifiedRoleService } from '../lib/unifiedRoleService';
import Router from 'next/router'; // Import Next.js router for programmatic navigation
import { accessControl } from '../lib/accessControl';

/**
 * Custom event for role switching
 */
export interface RoleSwitchedEvent {
  from: string;
  to: string;
  timestamp: string;
  path?: string;
}

/**
 * Role transition state record - stored in sessionStorage
 */
export interface RoleTransitionState {
  transitioning: boolean;
  fromRole: string | null;
  toRole: string | null;
  startTime: string;
  targetPath?: string;
  completed: boolean;
}

// Key used for storing role transition state in sessionStorage
const ROLE_TRANSITION_STATE_KEY = 'role_transition_state';

// Key used for storing role user preferences in localStorage
const ROLE_PREFERENCES_KEY = 'role_preferences';

/**
 * Dispatch a role switched event
 * This allows components to respond to role changes
 * 
 * @param from Previous role
 * @param to New role
 * @param path Optional URL path that was navigated to
 */
export function dispatchRoleSwitchedEvent(from: string, to: string, path?: string): void {
  if (typeof window === 'undefined') {
    return; // Server-side rendering, no events
  }

  try {
    const detail: RoleSwitchedEvent = {
      from,
      to,
      timestamp: new Date().toISOString(),
      path
    };

    logger.info(`Role switched from ${from} to ${to}`);
    
    // Create and dispatch a custom event
    const event = new CustomEvent('roleSwitched', { detail });
    document.dispatchEvent(event);
  } catch (error) {
    logger.error('Error dispatching role switched event:', error);
  }
}

/**
 * Check if a role transition is allowed based on available roles and permissions
 * 
 * @param currentRole Current user role
 * @param targetRole Target role to transition to
 * @param availableRoles List of roles available to the user
 * @returns True if transition is allowed, false otherwise
 */
export function isRoleTransitionAllowed(
  currentRole: string,
  targetRole: string,
  availableRoles: string[]
): boolean {
  // Same role is always allowed (no-op)
  if (currentRole === targetRole) {
    return true;
  }
  
  // Use the centralized access control module to check if role is available
  if (!accessControl.isRoleAvailable(targetRole, availableRoles)) {
    return false;
  }
  
  // Admins and stakeholders can switch to any role they have
  if (currentRole === 'admin' || currentRole === 'stakeholder') {
    return true;
  }
  
  // Users can transition to any role they have
  return true;
}

/**
 * Get the default dashboard path for a given role
 * 
 * @param role User role
 * @returns Dashboard path for that role
 */
export function getRoleDashboardPath(role: string): string {
  return accessControl.getRoleDashboardPath(role);
}

/**
 * Transition to a new role with proper state management
 * 
 * @param currentRole Current user role
 * @param newRole Role to transition to
 * @param preservePath Whether to stay on current page (true) or redirect to role dashboard (false)
 * @returns Promise resolving to success status
 */
export async function transitionToRole(
  currentRole: string,
  newRole: string,
  preservePath = false
): Promise<boolean> {
  try {
    if (typeof window === 'undefined') {
      return false; // Server-side rendering, can't transition
    }

    // Don't transition if role is the same
    if (currentRole === newRole) {
      return true;
    }

    // Start the transition process
    setRoleTransitionState({
      transitioning: true,
      fromRole: currentRole,
      toRole: newRole,
      startTime: new Date().toISOString(),
      completed: false
    });

    // Get user pubkey from localStorage
    const userId = localStorage.getItem('nostr_pubkey');
    const isTestMode = localStorage.getItem('isTestMode') === 'true';

    // Store new role in localStorage before changing context
    localStorage.setItem('userRole', newRole);
    
    // Critical for test mode: Set force_role_refresh to true
    localStorage.setItem('force_role_refresh', 'true');
    
    // Use the unified role service to update the role
    // Get user pubkey if available
    const pubkey = userId || 'unknown';
    
    // Update the current role using the unified role service
    // If userId is available, use server-based method, otherwise use local context
    if (userId && !userId.startsWith('test_')) {
      // For non-test users with known IDs, update on server
      const serverSuccess = await unifiedRoleService.setCurrentRole(userId, newRole);
      if (!serverSuccess) {
        logger.warn(`Failed to set current role to ${newRole} for user ${pubkey} on server`);
        clearRoleTransitionState();
        return false;
      }
    } else {
      // Otherwise just update local context
      const localSuccess = unifiedRoleService.setCurrentRole(newRole as UserRole) as boolean;
      if (!localSuccess) {
        logger.warn(`Failed to set current role to ${newRole} for user ${pubkey} in local context`);
        clearRoleTransitionState();
        return false;
      }
    }
    
    // Determine the target path
    let targetPath = preservePath ? undefined : getRoleDashboardPath(newRole);
    
    // Update transition state with target path
    if (targetPath) {
      updateRoleTransitionState({ targetPath });
    }
    
    // Dispatch event for components to respond
    dispatchRoleSwitchedEvent(currentRole, newRole, targetPath);
    
    // If we're not preserving the path, navigate to the new role's dashboard
    if (targetPath) {
      // Use Next.js Router for client-side navigation without page refresh
      try {
        // Add options to avoid full page reload and maintain scroll position
        await Router.push(targetPath, undefined, { 
          shallow: true, 
          scroll: false 
        });
      } catch (routerError) {
        logger.error('Error during Next.js router navigation:', routerError);
        // Fallback to traditional navigation if Router fails
        window.location.href = targetPath;
        // Mark the transition as completed even though we're doing a full page navigation
        completeRoleTransition();
        return true;
      }
    }
    
    // Mark the transition as completed
    completeRoleTransition();
    return true;
  } catch (error) {
    logger.error('Error during role transition:', error);
    clearRoleTransitionState();
    return false;
  }
}

/**
 * Set the role transition state in sessionStorage
 * 
 * @param state Role transition state
 */
export function setRoleTransitionState(state: RoleTransitionState): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    sessionStorage.setItem(ROLE_TRANSITION_STATE_KEY, JSON.stringify(state));
  } catch (error) {
    logger.error('Error setting role transition state:', error);
  }
}

/**
 * Update the existing role transition state
 * 
 * @param partialState Partial role transition state to update
 */
export function updateRoleTransitionState(partialState: Partial<RoleTransitionState>): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    const currentState = getRoleTransitionState();
    if (currentState) {
      setRoleTransitionState({
        ...currentState,
        ...partialState
      });
    }
  } catch (error) {
    logger.error('Error updating role transition state:', error);
  }
}

/**
 * Get the current role transition state from sessionStorage
 * 
 * @returns Role transition state or null if not transitioning
 */
export function getRoleTransitionState(): RoleTransitionState | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    const stateJson = sessionStorage.getItem(ROLE_TRANSITION_STATE_KEY);
    if (stateJson) {
      return JSON.parse(stateJson) as RoleTransitionState;
    }
  } catch (error) {
    logger.error('Error getting role transition state:', error);
  }
  
  return null;
}

/**
 * Clear the role transition state
 */
export function clearRoleTransitionState(): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    sessionStorage.removeItem(ROLE_TRANSITION_STATE_KEY);
  } catch (error) {
    logger.error('Error clearing role transition state:', error);
  }
}

/**
 * Mark the role transition as completed
 */
export function completeRoleTransition(): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    const currentState = getRoleTransitionState();
    if (currentState) {
      setRoleTransitionState({
        ...currentState,
        transitioning: false,
        completed: true
      });
    }
  } catch (error) {
    logger.error('Error completing role transition:', error);
  }
}

/**
 * Check if a role transition is in progress
 * 
 * @returns True if a role transition is in progress
 */
export function isRoleTransitioning(): boolean {
  const state = getRoleTransitionState();
  return !!state && state.transitioning;
}

/**
 * Save user role preferences
 * 
 * @param role User role
 * @param preferences Preferences object
 */
export function saveRolePreferences(role: string, preferences: Record<string, any>): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    // Get existing preferences
    const allPreferences = getRolePreferencesForAllRoles();
    
    // Update preferences for the specified role
    allPreferences[role] = {
      ...(allPreferences[role] || {}),
      ...preferences
    };
    
    // Save back to localStorage
    localStorage.setItem(ROLE_PREFERENCES_KEY, JSON.stringify(allPreferences));
  } catch (error) {
    logger.error('Error saving role preferences:', error);
  }
}

/**
 * Get user preferences for a specific role
 * 
 * @param role User role
 * @returns Preferences object for the role
 */
export function getRolePreferences(role: string): Record<string, any> {
  if (typeof window === 'undefined') {
    return {};
  }
  
  try {
    const allPreferences = getRolePreferencesForAllRoles();
    return allPreferences[role] || {};
  } catch (error) {
    logger.error('Error getting role preferences:', error);
    return {};
  }
}

/**
 * Get preferences for all roles
 * 
 * @returns Record of preferences by role
 */
export function getRolePreferencesForAllRoles(): Record<UserRole, Record<string, any>> {
  if (typeof window === 'undefined') {
    return {} as Record<UserRole, Record<string, any>>;
  }
  
  try {
    const preferencesJson = localStorage.getItem(ROLE_PREFERENCES_KEY);
    if (preferencesJson) {
      return JSON.parse(preferencesJson) as Record<UserRole, Record<string, any>>;
    }
  } catch (error) {
    logger.error('Error getting all role preferences:', error);
  }
  
  return {} as Record<UserRole, Record<string, any>>;
}

/**
 * Check if the current route is allowed for a role
 * 
 * @param role User role
 * @param route Current route path
 * @returns True if route is allowed for role
 */
export function isRouteAllowedForRole(role: string, route: string): boolean {
  return accessControl.checkRouteAccess(route, role);
}

/**
 * Add a role switched event listener
 * 
 * @param callback Function to call when role is switched
 * @returns Cleanup function to remove the listener
 */
export function addRoleSwitchedListener(
  callback: (event: CustomEvent<RoleSwitchedEvent>) => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {}; // Server-side rendering, return no-op
  }

  try {
    // Type assertion for custom event
    const typedCallback = ((event: Event) => {
      callback(event as CustomEvent<RoleSwitchedEvent>);
    }) as EventListener;
    
    // Add event listener
    document.addEventListener('roleSwitched', typedCallback);
    
    // Return cleanup function
    return () => {
      document.removeEventListener('roleSwitched', typedCallback);
    };
  } catch (error) {
    logger.error('Error setting up role switched listener:', error);
    return () => {}; // Return no-op on error
  }
}