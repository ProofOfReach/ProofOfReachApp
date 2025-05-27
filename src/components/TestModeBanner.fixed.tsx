import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTestMode } from '@/hooks/useTestMode';
import { logger } from '@/lib/logger';
import { UserRole } from '@/types/role';
import { RoleManager } from '@/services/roleManager';
import { STORAGE_KEYS } from '@/lib/constants';
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

/**
 * TestModeBanner Component
 * 
 * This component provides a user interface for test mode features,
 * including role switching and debug tools.
 */
export default function TestModeBanner() {
  // Use test mode hook for functionality
  const {
    isActive,
    timeRemaining,
    disableTestMode,
    enableAllRoles: contextEnableAllRoles,
    setCurrentRole: contextSetCurrentRole,
    isTestModeAllowed
  } = useTestMode();
  
  // State for UI controls
  const [isDebugExpanded, setIsDebugExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole>('viewer');
  
  // Role change event handler
  useAppEvent(ROLE_EVENTS.ROLE_CHANGED, (payload) => {
    logger.log(`TestModeBanner received ROLE_CHANGED event: ${payload.from} → ${payload.to}`);
    
    if (RoleManager.isValidRole(payload.to)) {
      setCurrentRole(payload.to);
    }
  });
  
  // Roles updated event handler
  useAppEvent(ROLE_EVENTS.ROLES_UPDATED, (payload) => {
    logger.log('TestModeBanner received ROLES_UPDATED event:', payload);
    
    if (RoleManager.isValidRole(payload.currentRole)) {
      setCurrentRole(payload.currentRole);
    }
  });
  
  // Storage change event handler
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
  
  // Legacy event handlers
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
  
  // Legacy storage event handler
  useStorageEvent('currentRole', (newValue, oldValue) => {
    if (newValue && RoleManager.isValidRole(newValue)) {
      logger.log(`Current role changed in storage: ${oldValue} → ${newValue}`);
      setCurrentRole(newValue as UserRole);
    }
  });
  
  // Initialize role state
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Get current role from various sources
    const initialRole = RoleManager.getCurrentRole();
    
    if (RoleManager.isValidRole(initialRole)) {
      setCurrentRole(initialRole);
    } else {
      // Try fallbacks
      const storedRole = enhancedStorage.getItem(STORAGE_KEYS.CURRENT_ROLE);
      const fallbackRole = storedRole || 
                          localStorage.getItem('currentRole') || 
                          RoleService.getCurrentRole() ||
                          'viewer';
      
      const validRole = typeof fallbackRole === 'string' ? fallbackRole : 'viewer';
      
      if (RoleManager.isValidRole(validRole)) {
        setCurrentRole(validRole as UserRole);
        RoleManager.setCurrentRole(validRole as UserRole);
      } else {
        setCurrentRole('viewer');
      }
    }
  }, []);
  
  // Visibility checks
  logger.debug(`TestModeBanner visibility check:
    isActive: ${isActive}
    currentRole: ${currentRole}
    process.env.NODE_ENV: ${process.env.NODE_ENV}
    RoleManager role: ${typeof window !== 'undefined' ? RoleManager.getCurrentRole() : 'SSR'}
  `);
  
  // Don't render if not in test mode
  if (!isActive) {
    logger.debug('TestModeBanner not shown: test mode not active');
    return null;
  }
  
  // Don't render on server
  if (typeof window === 'undefined') {
    logger.debug('TestModeBanner not shown: running on server');
    return null;
  }
  
  // In production, only show to admin users
  if (process.env.NODE_ENV === 'production' && currentRole !== 'admin') {
    logger.debug('TestModeBanner not shown: user is not admin in production');
    return null;
  }
  
  // Format time remaining
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
  
  // Enable all roles handler
  const handleEnableAllRoles = async () => {
    setIsLoading(true);
    try {
      const allRoles: string[] = ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'];
      
      // In test mode, use direct client-side updates
      if (testModeService.isActive()) {
        // Set isTestMode flag
        localStorage.setItem('isTestMode', 'true');
        
        // Update available roles
        localStorage.setItem('cachedAvailableRoles', JSON.stringify(allRoles));
        enhancedStorage.setItem(STORAGE_KEYS.AVAILABLE_ROLES, JSON.stringify(allRoles));
        
        // Update RoleManager
        RoleManager.enableAllRoles();
        
        // Emit events
        notifyRolesUpdated(allRoles, currentRole);
        
        logger.log('All roles enabled logfully (client-side)');
      } 
      // Try service methods
      else {
        let log = false;
        
        try {
          log = testModeService.enableAllRoles();
          if (log) {
            logger.log('All roles enabled logfully (service)');
          }
        } catch (error) {
          logger.warn(`Service method failed: ${error}`);
          
          try {
            log = await contextEnableAllRoles();
            if (log) {
              logger.log('All roles enabled logfully (context)');
            }
          } catch (error) {
            logger.warn(`Context method failed: ${error}`);
            
            try {
              log = await RoleService.enableAllRoles();
              if (log) {
                logger.log('All roles enabled logfully (legacy)');
              }
            } catch (error) {
              logger.log(`Legacy method failed: ${error}`);
            }
          }
        }
      }
    } catch (error) {
      logger.log('Error enabling all roles:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Role switch handler
  const handleRoleSwitch = async (role: string) => {
    try {
      logger.log(`TestModeBanner switching to role: ${role}`);
      
      // Validate role
      if (!RoleManager.isValidRole(role)) {
        logger.log(`Invalid role: ${role}`);
        return;
      }
      
      // Cast to type
      const typedRole = role as UserRole;
      const previousRole = currentRole;
      
      // Update component state
      setCurrentRole(typedRole);
      
      // Special handling for test mode
      if (testModeService.isActive()) {
        logger.debug(`Using client-side role switch for test mode: ${typedRole}`);
        
        // Update all storage locations
        localStorage.setItem('currentRole', typedRole);
        localStorage.setItem('testModeRole', typedRole);
        enhancedStorage.setItem(STORAGE_KEYS.CURRENT_ROLE, typedRole);
        
        // For dashboard re-renders
        localStorage.setItem('lastRoleChange', JSON.stringify({
          role: typedRole,
          timestamp: Date.now()
        }));
        
        // Force dashboard re-render key
        localStorage.setItem('dashboardRenderKey', `dashboard-${typedRole}-${Date.now()}`);
        
        // Update RoleManager
        RoleManager.setCurrentRole(typedRole);
        
        // Emit events
        notifyRoleChanged(previousRole, typedRole, RoleManager.getAvailableRoles());
        
        // Legacy event
        document.dispatchEvent(new CustomEvent('roleSwitched', { 
          detail: { from: previousRole, to: typedRole, role: typedRole } 
        }));
        
        // Dashboard role event
        document.dispatchEvent(new CustomEvent('dashboard-role-changed', {
          detail: { role: typedRole }
        }));
        
        logger.log(`Role switched to ${typedRole} (client-side)`);
      }
      // API-based role change
      else {
        try {
          const log = await contextSetCurrentRole(role);
          if (log) {
            logger.log(`Role switched to ${role} using API`);
          } else {
            logger.log(`Failed to switch role to ${role}`);
            
            // Fallback to legacy
            try {
              RoleService.changeRole(typedRole);
              localStorage.setItem('currentRole', typedRole);
              document.dispatchEvent(new CustomEvent('roleSwitched', { 
                detail: { role: typedRole } 
              }));
              logger.log(`Role switched to ${role} using legacy fallback methods`);
            } catch (error) {
              logger.log(`All role switching methods failed for ${role}:`, error);
            }
          }
        } catch (error) {
          logger.log(`Error switching role via API: ${error}`);
        }
      }
    } catch (error) {
      logger.log(`Error in handleRoleSwitch: ${error}`);
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
      
      {/* Debug Tools panel */}
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
          
          {/* Expanded debug panel */}
          {isDebugExpanded && (
            <div className="mt-2 pb-2 border-t border-yellow-100 dark:border-yellow-800 pt-2" data-testid="expanded-debug-panel">
              {/* Role switching controls */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold mb-2 text-yellow-900 dark:text-yellow-200">Switch Role</h4>
                <div className="flex flex-wrap gap-2">
                  {['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'].map(role => (
                    <button
                      key={role}
                      onClick={() => handleRoleSwitch(role)}
                      className={`px-3 py-1 text-xs rounded-full focus:outline-none transition-colors ${
                        currentRole === role
                          ? 'bg-yellow-600 text-white dark:bg-yellow-700'
                          : 'bg-yellow-200 text-yellow-900 hover:bg-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-100 dark:hover:bg-yellow-800/80'
                      }`}
                      data-testid={`switch-to-${role}-button`}
                      data-role={role}
                      aria-label={`Switch to ${role} role`}
                      aria-pressed={currentRole === role}
                    >
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Admin tools */}
              <div>
                <h4 className="text-xs font-semibold mb-2 text-yellow-900 dark:text-yellow-200">Admin Tools</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleEnableAllRoles}
                    className="px-3 py-1 text-xs rounded-full bg-yellow-200 text-yellow-900 hover:bg-yellow-300 focus:outline-none transition-colors dark:bg-yellow-900/50 dark:text-yellow-100 dark:hover:bg-yellow-800/80"
                    data-testid="enable-all-roles-button"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-yellow-900 dark:text-yellow-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      'Enable All Roles'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}