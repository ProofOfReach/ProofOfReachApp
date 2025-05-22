import React, { useState, useEffect } from 'react';
import { RoleService } from '@/lib/roleService';
import { useTestMode } from '@/hooks/useTestMode';
import { RoleManager } from '@/services/roleManager';
import { enhancedStorage } from '@/services/enhancedStorageService';
import { STORAGE_KEYS } from '@/services/storageService';
import { UserRoleType } from '@/types/role';
import { notifyRolesUpdated } from '@/lib/events';
import { useAppEvent } from '@/hooks/useAppEvent';
import { ROLE_EVENTS } from '@/lib/events/eventTypes';
import { logger } from '@/lib/logger';
import Link from 'next/link';

/**
 * Debug component for toggling test mode and enabling all roles
 * Only shown in non-production environments
 * Updated to use the new storage and event systems
 */
const DebugRoleEnabler: React.FC = () => {
  const testModeData = useTestMode();
  const { isActive, enableTestMode, disableTestMode, currentRole: testModeCurrentRole } = testModeData;
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRoleType>('viewer');
  
  // Listen for role changes using the new event system
  useAppEvent(ROLE_EVENTS.ROLE_CHANGED, (payload) => {
    logger.log(`DebugRoleEnabler received role change event: ${payload.from} → ${payload.to}`);
    if (RoleManager.isValidRole(payload.to)) {
      setCurrentRole(payload.to);
    }
  });
  
  // Initialize current role from the authoritative source
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Get initial role from RoleManager
    const initialRole = RoleManager.getCurrentRole();
    
    if (RoleManager.isValidRole(initialRole)) {
      setCurrentRole(initialRole);
    } else {
      // Try enhanced storage next
      const storedRole = enhancedStorage.getItem(STORAGE_KEYS.CURRENT_ROLE);
      
      // Then try legacy storage as fallback
      const fallbackRole = storedRole || 
                          localStorage.getItem('currentRole') || 
                          'viewer';
      
      const validRole = typeof fallbackRole === 'string' ? fallbackRole : 'viewer';
      if (RoleManager.isValidRole(validRole)) {
        setCurrentRole(validRole as UserRoleType);
      }
    }
  }, []);
  
  // Enable all roles with the new event system
  const handleEnableAllRoles = async () => {
    setIsLoading(true);
    try {
      // Update RoleManager (source of truth)
      const success = RoleManager.enableAllRoles();
      
      if (success) {
        // Get all available roles
        const allRoles = ['user', 'advertiser', 'publisher', 'admin', 'stakeholder'];
        
        // Store in enhanced storage
        enhancedStorage.setItem(STORAGE_KEYS.AVAILABLE_ROLES, JSON.stringify(allRoles));
        
        // Dispatch event using the new event system
        notifyRolesUpdated(allRoles as UserRoleType[], currentRole);
        
        // For backward compatibility
        const legacySuccess = await RoleService.enableAllRoles();
        
        logger.log('All roles enabled successfully');
      } else {
        // Fallback to legacy method if RoleManager fails
        const legacySuccess = await RoleService.enableAllRoles();
        if (legacySuccess) {
          logger.log('All roles enabled using legacy method');
        } else {
          logger.error('Failed to enable all roles');
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logger.error('Error enabling all roles:', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Enhanced visibility checks
  
  // 1. Don't render in production environment at all
  if (process.env.NODE_ENV === 'production') {
    logger.debug('DebugRoleEnabler not shown: production environment');
    return null;
  }
  
  // 2. In development, only show to admin users (stricter check)
  if (process.env.NODE_ENV !== 'test') {
    // Log the current states for debugging
    logger.debug(`DebugRoleEnabler visibility check:
      currentRole: ${currentRole}
      testModeCurrentRole: ${testModeCurrentRole}
      RoleManager role: ${RoleManager.getCurrentRole()}
      process.env.NODE_ENV: ${process.env.NODE_ENV}
    `);
    
    // First check the component's state
    if (currentRole !== 'admin') {
      logger.debug('DebugRoleEnabler not shown: component state says user is not admin');
      return null;
    }
    
    // Then verify with RoleManager as the authoritative source
    const roleManagerCurrentRole = RoleManager.getCurrentRole();
    if (roleManagerCurrentRole !== 'admin') {
      logger.debug('DebugRoleEnabler not shown: RoleManager says user is not admin');
      return null;
    }
    
    // Add a third check using the useTestMode hook data directly
    if (testModeCurrentRole !== 'admin') {
      logger.debug('DebugRoleEnabler not shown: useTestMode hook says user is not admin');
      return null;
    }
  }
  
  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/30 border-t border-b border-yellow-100 dark:border-yellow-800 py-1">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between py-1 text-xs text-yellow-800 dark:text-yellow-300">
          <div>
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center focus:outline-none"
              aria-expanded={isExpanded}
              data-testid="debug-expandable"
            >
              <span className="font-semibold mr-1">🐛 DEBUG</span>
              <svg 
                className={`h-4 w-4 transform ${isExpanded ? 'rotate-180' : 'rotate-0'}`} 
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
            <span className={isActive ? 'text-green-700 dark:text-green-500' : 'text-gray-600 dark:text-gray-400'}>
              Current role: <span className="font-semibold capitalize" data-testid="debug-current-role">{currentRole}</span>
            </span>
          </div>
        </div>
        
        {isExpanded && (
          <div className="py-2 space-y-2 flex flex-wrap gap-2">
            <Link
              href="/test-mode"
              className="px-3 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200"
              data-testid="debug-test-mode-link"
            >
              Test Mode Settings
            </Link>
            
            <button
              onClick={handleEnableAllRoles}
              disabled={isLoading}
              className="px-3 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 disabled:opacity-50"
              data-testid="debug-enable-roles"
            >
              {isLoading ? 'Enabling Roles...' : 'Enable All Roles'}
            </button>
            
            {!isActive && (
              <button
                onClick={() => enableTestMode()}
                className="px-3 py-1 rounded text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200"
                data-testid="debug-enable-test-mode"
              >
                Enable Test Mode
              </button>
            )}
            
            {isActive && (
              <button
                onClick={() => disableTestMode()}
                className="px-3 py-1 rounded text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200"
                data-testid="debug-disable-test-mode"
              >
                Disable Test Mode
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugRoleEnabler;