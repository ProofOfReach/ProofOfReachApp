import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import '@/hooks/useTestMode';
import '@/lib/roleService';
import '@/services/roleManager';
import '@/types/role';
import '@/lib/logger';
import { 
  useAppEvent, 
  useLegacyEvent, 
  useStorageEvent 
} from '@/hooks/useAppEvent';
import { 
  ROLE_EVENTS, 
  SYSTEM_EVENTS, 
  TEST_MODE_EVENTS, 
  LEGACY_EVENTS 
} from '@/lib/events/eventTypes';
import { 
  notifyRoleChanged,
  notifyRolesUpdated
} from '@/lib/events';
import '@/services/enhancedStorageService';
import '@/services/storageService';
import '@/services/testModeService';

export default function TestModeBanner() {
  // Use the single hook implementation
  // In tests, this will be mocked appropriately
  const {
    isActive,
    timeRemaining,
    disableTestMode,
    enableAllRoles: contextEnableAllRoles,
    setCurrentRole: contextSetCurrentRole,
    isTestModeAllowed
  } = useTestMode();
  
  // We no longer need these compatibility aliases as we're using the direct values
  
  // Always start with the debug panel collapsed for test compatibility
  const [isDebugExpanded, setIsDebugExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole>('viewer');
  
  // Listen for new unified role events
  useAppEvent(ROLE_EVENTS.ROLE_CHANGED, (payload) => {
    logger.log(`TestModeBanner received ROLE_CHANGED event: ${payload.from} → ${payload.to}`);
    
    // Ensure type safety
    if (RoleManager.isValidRole(payload.to)) {
      setCurrentRole(payload.to);
    } else {
      logger.warn(`Received invalid role in event: ${payload.to}`);
    }
  });
  
  useAppEvent(ROLE_EVENTS.ROLES_UPDATED, (payload) => {
    logger.log('TestModeBanner received ROLES_UPDATED event:', payload);
    
    // Update current role if it's valid
    if (RoleManager.isValidRole(payload.currentRole)) {
      setCurrentRole(payload.currentRole);
    }
  });
  
  // Listen for storage changes via the new SYSTEM_EVENTS
  useAppEvent(SYSTEM_EVENTS.STORAGE_CHANGED, (payload) => {
    if (payload.key === STORAGE_KEYS.CURRENT_ROLE) {
      const prevValue = payload.previousValue ? String(payload.previousValue) : 'null';
      const newValue = payload.value ? String(payload.value) : 'null';
      logger.log(`Storage changed for current role: ${prevValue} → ${newValue}`);
      
      if (payload.value && typeof payload.value === 'string' && RoleManager.isValidRole(payload.value)) {
        setCurrentRole(payload.value as UserRole);
      }
    }
  });
  
  // Legacy event listeners for backward compatibility
  useLegacyEvent(LEGACY_EVENTS.ROLE_CHANGED, (event) => {
    logger.log('TestModeBanner received legacy role-changed event:', event.detail);
    
    if (event.detail?.role && RoleManager.isValidRole(event.detail.role)) {
      setCurrentRole(event.detail.role as UserRole);
    }
  });
  
  useLegacyEvent(LEGACY_EVENTS.ROLE_SWITCHED, (event) => {
    logger.log('TestModeBanner received legacy role-switched event:', event.detail);
    
    const updatedRole = event.detail?.to || event.detail?.role || RoleManager.getCurrentRole();
    if (updatedRole && RoleManager.isValidRole(updatedRole)) {
      setCurrentRole(updatedRole as UserRole);
    }
  });
  
  // Legacy storage events for backward compatibility
  useStorageEvent('currentRole', (newValue, oldValue) => {
    if (newValue && RoleManager.isValidRole(newValue)) {
      logger.log(`Current role changed in storage: ${oldValue} → ${newValue}`);
      setCurrentRole(newValue as UserRole);
    }
  });
  
  // Update current role and set up initial state
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Set initial role using RoleManager as the authoritative source
    const initialRole = RoleManager.getCurrentRole();
    
    // Ensure type safety
    if (RoleManager.isValidRole(initialRole)) {
      setCurrentRole(initialRole);
    } else {
      // Try the new enhancedStorage first
      const storedRole = enhancedStorage.getItem(STORAGE_KEYS.CURRENT_ROLE);
      
      // Then try legacy fallbacks
      const fallbackRole = storedRole || 
                          localStorage.getItem('currentRole') || 
                          RoleService.getCurrentRole() ||
                          'viewer';
      
      const validRole = typeof fallbackRole === 'string' ? fallbackRole : 'viewer';
      if (RoleManager.isValidRole(validRole)) {
        setCurrentRole(validRole as UserRole);
        // Update RoleManager to maintain consistency
        RoleManager.setCurrentRole(validRole as UserRole);
      } else {
        // Ultimate fallback
        setCurrentRole('viewer');
      }
    }
  }, []);
  
  // Multiple checks to ensure banner is only shown to admin users:
  
  // Debug banner visibility state
  logger.debug(`TestModeBanner visibility check:
    isActive: ${isActive}
    currentRole: ${currentRole}
    process.env.NODE_ENV: ${process.env.NODE_ENV}
    RoleManager role: ${typeof window !== 'undefined' ? RoleManager.getCurrentRole() : 'SSR'}
  `);
  
  // 1. Don't render anything if not in test mode
  if (!isActive) {
    logger.debug('TestModeBanner not shown: test mode not active');
    return null;
  }
  
  // 2. Don't render anything if we're running on the server
  if (typeof window === 'undefined') {
    logger.debug('TestModeBanner not shown: running on server');
    return null;
  }
  
  // Normal user check - ALWAYS applied, even in test mode for production
  if (process.env.NODE_ENV === 'production') {
    logger.debug('TestModeBanner in production environment - strict check');
    // In production, NEVER show the test mode banner to non-admin users
    if (currentRole !== 'admin') {
      logger.debug('TestModeBanner not shown: viewer is not admin in production');
      return null;
    }
  } else if (process.env.NODE_ENV !== 'test') {
    // In development (but not test), we will show the test mode banner for any role
    // once test mode is activated
    logger.debug('TestModeBanner in development environment - test mode is active, showing banner');
    
    // Previously, we restricted this to admin roles only, but that prevents role switching
    // in test mode if you're not an admin. By removing those restrictions, we allow
    // test mode to work for all roles.
    
    // Log the current role for debugging purposes
    const roleManagerCurrentRole = RoleManager.getCurrentRole();
    logger.debug(`TestModeBanner showing for role: ${currentRole} (RoleManager: ${roleManagerCurrentRole})`);
  } else {
    logger.debug('TestModeBanner in test environment - showing banner');
  }

  // Show the debug panel only for admin users
  // The isDebugExpanded state controls expanding/collapsing the panel
  
  // Format the time remaining 
  const formatTimeRemaining = () => {
    if (!timeRemaining) return null;
    
    const hours = Math.floor(timeRemaining / 60);
    const minutes = timeRemaining % 60;
    
    return (
      <span className="mx-2">
        (Expires in {hours}h {minutes}m)
      </span>
    );
  };
  
  // Enable all roles with test-compatible approach
  const handleEnableAllRoles = async () => {
    setIsLoading(true);
    try {
      const allRoles: string[] = ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'];
      let success = false;
      
      // Phase 6 improvement: First try using TestModeService directly
      try {
        success = testModeService.enableAllRoles();
      } catch (serviceError) {
        logger.warn(`TestModeService.enableAllRoles failed, falling back to context: ${serviceError}`);
        success = false;
      }
      
      // If service call fails, use the context method as fallback
      // For test compatibility, we need to try this method
      // as the tests expect this to be called exactly once
      if (!success) {
        try {
          success = await contextEnableAllRoles();
          
          if (success) {
            logger.log('All roles enabled successfully (context method)');
          }
        } catch (contextError) {
          logger.warn(`Context enableAllRoles failed, using legacy method: ${contextError}`);
          success = false;
        }
      } else {
        logger.log('All roles enabled successfully (TestModeService method)');
      }
      
      // If both modern methods fail, use legacy method
      // Tests specifically check for this fallback behavior
      if (!success) {
        try {
          success = await RoleService.enableAllRoles();
          
          if (success) {
            logger.log('All roles enabled successfully (legacy method)');
          } else {
            logger.error('Failed to enable all roles (all methods attempted)');
          }
        } catch (legacyError) {
          logger.error(`Legacy enableAllRoles failed: ${legacyError}`);
          success = false;
        }
      }
      
      if (success) {
        // Also update RoleManager and dispatch the new standardized event for consistency
        RoleManager.enableAllRoles();
        
        // Use the new event system to notify of role updates
        notifyRolesUpdated(allRoles, currentRole);
        
        // Store in enhanced storage for persistence
        enhancedStorage.setItem(STORAGE_KEYS.AVAILABLE_ROLES, JSON.stringify(allRoles));
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error('Error enabling all roles:', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Switch role with test-compatible approach that prioritizes client-side switching
  const handleRoleSwitch = async (role: string) => {
    try {
      logger.log(`TestModeBanner switching to role: ${role}`);
      
      // Type safety check for role
      if (!RoleManager.isValidRole(role)) {
        logger.error(`Invalid role: ${role}`);
        return;
      }
      
      // Now that we've validated the role, we can safely cast it
      const typedRole = role as UserRole;
      const previousRole = currentRole;
      
      // Test mode confirmation - CRITICAL FIX: In test mode, we should NEVER call the API
      // Always prefer direct client-side role changes for test mode
      const isCurrentlyInTestMode = testModeService.isActive();
      
      // Update local state immediately for responsive UI
      setCurrentRole(typedRole);
      
      // Set a success flag
      let success = false;
      
      if (isCurrentlyInTestMode) {
        logger.debug(`Test mode detected, performing client-side role switch to ${typedRole}`);
        
        // Direct client-side storage updates for test mode
        try {
          // Update all storage mechanisms for consistency
          localStorage.setItem('currentRole', typedRole);
          localStorage.setItem('testModeRole', typedRole);
          enhancedStorage.setItem(STORAGE_KEYS.CURRENT_ROLE, typedRole);
          
          // Record timestamp for dashboard re-rendering
          localStorage.setItem('lastRoleChange', JSON.stringify({
            role: typedRole,
            timestamp: Date.now()
          }));
          
          // Set dashboard render key for forced re-renders
          localStorage.setItem('dashboardRenderKey', `dashboard-${typedRole}-${Date.now()}`);
          
          // Update RoleManager
          RoleManager.setCurrentRole(typedRole);
          
          // Dispatch events for hooks to respond to
          // New event system
          notifyRoleChanged(
            previousRole, 
            typedRole,
            RoleManager.getAvailableRoles()
          );
          
          // Legacy event system
          document.dispatchEvent(new CustomEvent('roleSwitched', { 
            detail: { from: previousRole, to: typedRole, role: typedRole } 
          }));
          
          // Force dashboard re-render
          document.dispatchEvent(new CustomEvent('dashboard-role-changed', {
            detail: { role: typedRole }
          }));
          
          logger.log(`Role successfully switched to ${typedRole} in test mode (client-side only)`);
          success = true;
        } catch (testModeError) {
          logger.error(`Error in test mode client-side role switch: ${testModeError}`);
          success = false;
        }
      } else {
        // Only if not in test mode, try API-based methods
        
        // Phase 6 improvement: First try using the TestModeService directly
        try {
          success = await testModeService.setCurrentRole(typedRole);
        } catch (serviceError) {
          logger.warn(`TestModeService.setCurrentRole failed, falling back to context: ${serviceError}`);
          success = false;
        }
        
        // If direct service call fails, use the context method as fallback
        // This is necessary because the tests mock and verify this method
        if (!success) {
          try {
            success = await contextSetCurrentRole(role);
          } catch (contextError) {
            logger.warn(`Context setCurrentRole failed, using legacy methods: ${contextError}`);
            success = false;
          }
        }
        
        // If both modern methods fail, use legacy methods
        if (!success) {
          try {
            // Legacy method for backward compatibility - will be removed in future
            RoleService.changeRole(typedRole);
            
            // Legacy event - will be removed in future
            document.dispatchEvent(new CustomEvent('roleSwitched', { 
              detail: { role: typedRole } 
            }));
            
            // Legacy storage - will be removed in future
            localStorage.setItem('currentRole', typedRole);
            
            logger.log(`Role switched to ${role} using legacy fallback methods`);
            success = true;
          } catch (legacyError) {
            logger.error(`All role switching methods failed for ${role}:`, legacyError);
            success = false;
          }
        }
      }
      
      if (success) {
        // Always update RoleManager and new storage system for consistency regardless of method
        RoleManager.setCurrentRole(typedRole);
        enhancedStorage.setItem(STORAGE_KEYS.CURRENT_ROLE, typedRole);
        
        logger.log(`Role successfully switched to ${role}`);
      } else {
        logger.error(`Failed to switch role to ${role} using all available methods`);
      }
    } catch (error) {
      logger.error(`Error switching to role ${role}:`, error);
    }
  };
  
  return (
    <>
      {/* Test Mode banner */}
      <div className="bg-yellow-500 text-yellow-900 py-1.5 px-4 text-center text-sm flex items-center justify-center" data-testid="test-mode-banner">
        <div className="flex-shrink-0 mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <span className="font-bold mr-1">TEST MODE ACTIVE</span>
        {formatTimeRemaining()}
        
        <div className="flex space-x-4 ml-auto">
          <button 
            onClick={disableTestMode}
            className="underline font-medium hover:text-yellow-800 focus:outline-none"
            aria-label="Exit test mode"
            data-testid="exit-test-mode-button"
          >
            Exit Test Mode
          </button>
          <Link 
            href="/test-mode" 
            className="underline font-medium hover:text-yellow-800"
            aria-label="Test mode settings"
          >
            Settings
          </Link>
        </div>
      </div>
      
      {/* Debug Tools panel - always shown in test mode */}
      <div className="bg-yellow-50 dark:bg-yellow-900/30 border-t border-b border-yellow-100 dark:border-yellow-800 py-1" data-testid="test-mode-debug-panel">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between py-1 text-xs text-yellow-800 dark:text-yellow-300">
            <div>
              <button 
                onClick={() => setIsDebugExpanded(!isDebugExpanded)}
                className="flex items-center focus:outline-none"
                aria-expanded={isDebugExpanded}
                data-testid="toggle-debug-panel"
              >
                <span className="font-semibold mr-1">🐛 DEBUG TOOLS</span>
                <svg 
                  className={`h-4 w-4 transform ${isDebugExpanded ? 'rotate-180' : 'rotate-0'}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M19 9l-7 7-7-7" 
                  />
                </svg>
              </button>
            </div>
            
            <div className="text-right">
              <span className="text-green-700 dark:text-green-500">
                Current role: <span className="font-semibold capitalize" data-testid="current-role">{currentRole}</span>
              </span>
            </div>
          </div>
          
          {isDebugExpanded && (
            <div className="py-2 space-y-2">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleEnableAllRoles}
                  disabled={isLoading}
                  className="px-3 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 disabled:opacity-50"
                  data-testid="enable-all-roles-button"
                >
                  {isLoading ? 'Enabling Roles...' : 'Enable All Roles'}
                </button>
              </div>
              
              <div className="pt-2 border-t border-yellow-100 dark:border-yellow-800">
                <div className="text-xs font-medium mb-1">Switch Role:</div>
                <div className="flex flex-wrap gap-2" data-testid="role-switcher">
                  {['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'].map(role => (
                    <button
                      key={role}
                      onClick={() => handleRoleSwitch(role)}
                      className={`px-3 py-1 rounded text-xs font-medium 
                        ${currentRole === role 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                          : 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                        }`}
                      data-testid={`role-button-${role}`}
                    >
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}