import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { User, Shield, Edit3, DollarSign, Lock } from 'react-feather';
import '@/types/role';
import '@/lib/roleService';
import '@/services/roleManager';
import '@/components/icons/MegaphoneIcon';
import '@/utils/roleEvents';
import '@/context/TestModeContext';
import '@/services/enhancedStorageService';
import '@/services/storageService';
import '@/lib/logger';
import { 
  useAppEvent, 
  useLegacyEvent 
} from '@/hooks/useAppEvent';
import { 
  ROLE_EVENTS, 
  SYSTEM_EVENTS, 
  TEST_MODE_EVENTS 
} from '@/lib/events/eventTypes';
import { 
  notifyRoleChanged,
  notifyRolesUpdated
} from '@/lib/events';

interface RoleDropdownProps {
  skipNavigation?: boolean;
  className?: string;
  onRoleChange?: (role: string) => void;
}

/**
 * A dropdown component for switching between user roles
 * Only displays roles that the user has access to
 */
const RoleDropdown: React.FC<RoleDropdownProps> = ({
  skipNavigation = false,
  className = '',
  onRoleChange
}) => {
  const router = useRouter();
  const [currentRole, setCurrentRole] = useState<UserRole>('viewer');
  const [isChanging, setIsChanging] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>(['viewer']);
  const [isLoading, setIsLoading] = useState(true);
  const isTestMode = typeof window !== 'undefined' && localStorage.getItem('testMode') === 'true';
  
  // Type guard to validate roles
  const isUserRole = (role: string): role is UserRole => {
    return ['viewer', 'advertiser', 'publisher', 'admin'].includes(role);
  };
  
  // Role icons with appropriate colors
  const roleIcons = {
    viewer: <User className="w-5 h-5 text-blue-500" />,
    advertiser: <MegaphoneIcon className="w-5 h-5 text-orange-500" />,
    publisher: <Edit3 className="w-5 h-5 text-green-500" />,
    admin: <Shield className="w-5 h-5 text-purple-500" />,
    stakeholder: <DollarSign className="w-5 h-5 text-green-500" />
  };
  
  // Convert role names to more user-friendly display names
  const getRoleDisplayName = (role: string): string => {
    switch (role) {
      case 'viewer':
        return 'Viewer';
      case 'advertiser':
        return 'Advertiser';
      case 'publisher':
        return 'Publisher';
      case 'admin':
        return 'Admin';
      case 'stakeholder':
        return 'Stakeholder';
      default:
        return role.charAt(0).toUpperCase() + role.slice(1);
    }
  };
  
  // Fetch available roles and set initial role on mount
  // Create a storage event listener
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Function to handle localStorage changes from other components/tabs
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'cachedAvailableRoles' || event.key === 'roleCacheTimestamp' || event.key === 'isTestMode') {
        console.log('Storage changed, reloading roles:', event.key);
        fetchRolesFromCache();
      }
    };
    
    // Add event listener
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Function to fetch roles from cache or API
  const fetchRolesFromCache = () => {
    if (typeof window === 'undefined') return;
    
    console.log('Fetching roles from cache...');
    
    // Get current role from localStorage first (since that's what TestModeBanner uses)
    const storedRole = localStorage.getItem('currentRole');
    const serviceRole = RoleService.getCurrentRole();
    const currentRoleValue = storedRole || serviceRole || 'viewer';
    
    // Always update current role to maintain consistency
    setCurrentRole(currentRoleValue as UserRole);
    
    // Check for cached available roles using enhanced storage
    let cachedRoles;
    try {
      cachedRoles = enhancedStorage.getItem(STORAGE_KEYS.AVAILABLE_ROLES);
      logger.debug(`Retrieved cached roles from enhanced storage: ${cachedRoles}`);
    } catch (error) {
      // Fallback to localStorage for backward compatibility
      cachedRoles = localStorage.getItem('cachedAvailableRoles');
      logger.debug(`Falling back to localStorage for roles: ${cachedRoles}`);
    }
    
    // Use both React context and utility function for consistent test mode detection
    const isTestModeActive = isTestMode || getTestModeStatus() || localStorage.getItem('bypass_api_calls') === 'true';
    
    if (isTestModeActive) {
      // In test mode, we want to show all roles but still highlight the current one
      logger.log('Test mode detected in fetchRolesFromCache with currentRole:', currentRoleValue);
      
      // Show all roles and highlight the current one using all valid roles
      const allRoles: string[] = ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder']; 
      setAvailableRoles(allRoles);
      
      // Broadcast the current state for other components
      window.dispatchEvent(new CustomEvent('roles-updated', {
        detail: { 
          availableRoles: allRoles,
          currentRole: currentRoleValue,
          isTestMode: true
        }
      }));
      
      setIsLoading(false);
      return;
    } 
    
    if (cachedRoles) {
      try {
        logger.debug('Using cached roles:', cachedRoles);
        let parsedRoles = typeof cachedRoles === 'string' ? JSON.parse(cachedRoles) : cachedRoles;
        
        // Ensure we only use valid UserRole values through the RoleManager
        const validRoles: string[] = Array.isArray(parsedRoles) 
          ? parsedRoles.filter(isUserRole)
          : ['viewer'];
        
        // Only show roles the user is authorized to use (from the cache)
        setAvailableRoles(validRoles);
      } catch (error) {
        logger.log('Error parsing cached roles:', error);
        setAvailableRoles(['viewer']);
      }
    } else {
      // If no cache, use RoleManager to get available roles
      logger.debug('No cached roles found, using RoleManager');
      const managerRoles = RoleManager.getAvailableRoles();
      setAvailableRoles(managerRoles);
    }
    
    setIsLoading(false);
  };
  
  // Function to fetch roles from API
  const fetchRolesFromAPI = async () => {
    if (typeof window === 'undefined') return;
    
    setIsLoading(true);
    try {
      // Get current role using RoleManager (source of truth)
      let currentRoleValue: string;
      
      try {
        // Try to get from enhanced storage first
        const storedRole = enhancedStorage.getItem<UserRole | null>(STORAGE_KEYS.CURRENT_ROLE);
        currentRoleValue = storedRole && isUserRole(storedRole) ? storedRole : RoleManager.getCurrentRole() || 'viewer';
      } catch (error) {
        // Fallback to RoleManager
        currentRoleValue = RoleManager.getCurrentRole() || 'viewer';
        logger.warn('Error retrieving role from enhanced storage, falling back to RoleManager:', error);
      }
      
      // Always update current role to maintain consistency
      setCurrentRole(currentRoleValue);
      
      // Use both the React hook isTestMode and the utility function for non-React code
      // This ensures consistency across all components
      const isTestModeActive = isTestMode || getTestModeStatus() || enhancedStorage.getItem(STORAGE_KEYS.BYPASS_API_CALLS) === 'true';
      
      // In test mode, we show all roles but still highlight the current one
      if (isTestModeActive) {
        logger.log('Test mode active in fetchRolesFromAPI - currentRole:', currentRoleValue);
        const allRoles: string[] = ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'];
        
        // Use the enhancedStorage to save roles consistently
        try {
          enhancedStorage.setItem(STORAGE_KEYS.AVAILABLE_ROLES, JSON.stringify(allRoles));
          enhancedStorage.setItem(STORAGE_KEYS.ROLE_CACHE_TIMESTAMP, Date.now().toString());
        } catch (error) {
          logger.log('Error storing roles in enhanced storage:', error);
          // Fallback to localStorage for backward compatibility
          localStorage.setItem('cachedAvailableRoles', JSON.stringify(allRoles));
          localStorage.setItem('roleCacheTimestamp', Date.now().toString());
        }
        
        // Always highlight the current role in test mode
        setAvailableRoles(allRoles);
        setIsLoading(false);
        
        // Notify using the new event system for better type safety
        notifyRolesUpdated(allRoles, currentRoleValue);
        
        // For backward compatibility, also dispatch the old event
        window.dispatchEvent(new CustomEvent('roles-updated', {
          detail: { 
            availableRoles: allRoles,
            currentRole: currentRoleValue,
            isTestMode: true
          }
        }));
        return;
      }
      
      // Check for cached available roles using enhanced storage first
      let cachedRoles, cacheTimestamp, cacheAge = Infinity;
      
      try {
        cachedRoles = enhancedStorage.getItem(STORAGE_KEYS.AVAILABLE_ROLES);
        cacheTimestamp = enhancedStorage.getItem(STORAGE_KEYS.ROLE_CACHE_TIMESTAMP);
        cacheAge = cacheTimestamp ? Date.now() - parseInt(cacheTimestamp, 10) : Infinity;
      } catch (error) {
        // Fallback to localStorage for backward compatibility
        logger.warn('Error retrieving from enhanced storage, falling back to localStorage', 
          error instanceof Error ? error.message : 'Unknown error');
        cachedRoles = localStorage.getItem('cachedAvailableRoles');
        cacheTimestamp = localStorage.getItem('roleCacheTimestamp');
        cacheAge = cacheTimestamp ? Date.now() - parseInt(cacheTimestamp, 10) : Infinity;
      }
      
      // Use cache if it's less than 15 minutes old
      if (cachedRoles && cacheAge < 15 * 60 * 1000) {
        try {
          logger.debug('Using cached roles within time limit:', cachedRoles);
          let parsedRoles = typeof cachedRoles === 'string' ? JSON.parse(cachedRoles) : cachedRoles;
          
          // Ensure we only use valid UserRole values
          const validRoles: string[] = Array.isArray(parsedRoles) 
            ? parsedRoles.filter(isUserRole)
            : ['viewer'];
            
          // Only show exactly what was cached (after type validation)
          setAvailableRoles(validRoles);
          setIsLoading(false);
          return;
        } catch (error) {
          logger.log('Error parsing cached roles:', error);
          // Continue to fetch roles from API
        }
      }
      
      // Try to fetch from API
      try {
        logger.debug('Fetching roles from API...');
        const response = await fetch('/api/roles');
        if (response.ok) {
          const data = await response.json();
          
          // Use the availableRoles array which contains only the roles this user is authorized to use
          let fetchedRoles = data.availableRoles || ['viewer'];
          
          logger.debug('Roles from API:', fetchedRoles);
          
          // Filter to ensure we only use valid UserRole values
          const validRoles: string[] = Array.isArray(fetchedRoles) 
            ? fetchedRoles.filter(isUserRole)
            : ['viewer'];
          
          // Use exactly what the API returns (after type validation)
          setAvailableRoles(validRoles);
          
          // Use enhanced storage to save roles
          try {
            enhancedStorage.setItem(STORAGE_KEYS.AVAILABLE_ROLES, JSON.stringify(validRoles));
            enhancedStorage.setItem(STORAGE_KEYS.ROLE_CACHE_TIMESTAMP, Date.now().toString());
            
            // Dispatch storage changed event using SYSTEM_EVENTS
            window.dispatchEvent(new CustomEvent(SYSTEM_EVENTS.STORAGE_CHANGED, {
              detail: {
                key: STORAGE_KEYS.AVAILABLE_ROLES,
                value: JSON.stringify(validRoles),
                storageType: 'enhanced'
              }
            }));
          } catch (error) {
            logger.log('Error storing roles in enhanced storage:', error);
            // Fallback to localStorage for backward compatibility
            localStorage.setItem('cachedAvailableRoles', JSON.stringify(validRoles));
            localStorage.setItem('roleCacheTimestamp', Date.now().toString());
          }
          
          // Notify using the new event system
          notifyRolesUpdated(validRoles, currentRole);
          
          // Broadcast legacy roles-updated event for backward compatibility
          window.dispatchEvent(new CustomEvent('roles-updated', {
            detail: { availableRoles: validRoles }
          }));
        } else {
          logger.log('Failed to fetch available roles:', await response.text());
          // Fallback to user role only for security reasons
          setAvailableRoles(['viewer']);
          
          // Notify about failure - only store valid roles for security
          notifyRolesUpdated(['viewer'], currentRole);
        }
      } catch (error) {
        logger.log('Error fetching roles from API:', error);
        // Fallback to user role only for security reasons
        setAvailableRoles(['viewer']);
        
        // Try to get roles from RoleManager as fallback
        try {
          const managerRoles = RoleManager.getAvailableRoles();
          if (managerRoles && managerRoles.length) {
            setAvailableRoles(managerRoles);
            notifyRolesUpdated(managerRoles, currentRole);
          }
        } catch (fallbackError) {
          logger.log('Error getting roles from RoleManager:', fallbackError);
          notifyRolesUpdated(['viewer'], currentRole);
        }
      }
    } catch (error) {
      logger.log('Error in role loading process:', error);
      setAvailableRoles(['viewer']);
      notifyRolesUpdated(['viewer'], currentRole);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initial fetch of roles
  // Handle role changed events
  useAppEvent(ROLE_EVENTS.ROLE_CHANGED, (data: any) => {
    logger.debug('Role changed event detected via new event system', data);
    if (data?.to) {
      setCurrentRole(data.to);
      fetchRolesFromCache();
    }
  });
  
  // Handle roles updated events
  useAppEvent(ROLE_EVENTS.ROLES_UPDATED, (data: any) => {
    logger.debug('Roles updated event detected via new event system', data);
    if (data?.availableRoles) {
      // Only update if we have valid roles
      const validRoles = data.availableRoles.filter(isUserRole);
      if (validRoles.length > 0) {
        setAvailableRoles(validRoles);
      }
    }
    if (data?.currentRole) {
      setCurrentRole(data.currentRole);
    }
  });
  
  // Handle test mode state changes
  useAppEvent(TEST_MODE_EVENTS.STATE_CHANGED, () => {
    logger.debug('Test mode state changed event detected via new event system');
    // Refresh roles whenever test mode status changes
    fetchRolesFromAPI();
  });
  
  // Handle legacy events
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Legacy event handlers for backward compatibility
    const handleLegacyRoleUpdate = () => {
      logger.debug('Legacy role update event detected');
      fetchRolesFromCache();
    };
    
    const handleLegacyRoleChanged = (event: CustomEvent) => {
      logger.debug('Legacy role changed event detected', event.detail);
      if (event.detail?.role) {
        setCurrentRole(event.detail.role as UserRole);
        fetchRolesFromCache();
      }
    };
    
    const handleLegacyRolesUpdated = (event: CustomEvent) => {
      logger.debug('Legacy roles updated event detected', event.detail);
      if (event.detail?.availableRoles) {
        // Only update if we have valid roles
        const validRoles = event.detail.availableRoles.filter(isUserRole);
        if (validRoles.length > 0) {
          setAvailableRoles(validRoles);
        }
      }
    };
    
    const handleLegacyTestModeUpdate = (event: CustomEvent) => {
      logger.debug('Legacy test mode update event detected', event.detail);
      // Refresh roles whenever test mode status changes
      fetchRolesFromAPI();
    };
    
    // Add legacy event listeners for backward compatibility
    window.addEventListener('test-role-update', handleLegacyRoleUpdate);
    window.addEventListener('role-changed', handleLegacyRoleChanged as EventListener);
    window.addEventListener('roles-updated', handleLegacyRolesUpdated as EventListener);
    window.addEventListener('test-mode-update', handleLegacyTestModeUpdate as EventListener);
    
    // Initial fetch
    fetchRolesFromAPI();
    
    // Cleanup - unsubscribe from both modern and legacy event systems
    return () => {
      // Remove legacy event listeners
      window.removeEventListener('test-role-update', handleLegacyRoleUpdate);
      window.removeEventListener('role-changed', handleLegacyRoleChanged as EventListener);
      window.removeEventListener('roles-updated', handleLegacyRolesUpdated as EventListener);
      window.removeEventListener('test-mode-update', handleLegacyTestModeUpdate as EventListener);
    };
  }, []);
  
  // Handle role change
  const handleRoleChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = event.target.value as UserRole;
    
    if (newRole === currentRole) return;
    
    setIsChanging(true);
    
    try {
      let log = false;
      
      // Check if in test mode (using both context and utility function for consistency)
      const isTestModeActive = isTestMode || getTestModeStatus() || enhancedStorage.getItem('bypass_api_calls') === 'true';
      
      // In test mode, use the RoleManager and event system for role changes
      if (isTestModeActive) {
        logger.log(`Changing role in test mode: ${currentRole} -> ${newRole}`);
        
        try {
          // 1. Store using EnhancedStorageService
          enhancedStorage.setItem(STORAGE_KEYS.CURRENT_ROLE, newRole);
          
          // 2. Notify about role change using the new event system
          notifyRoleChanged(currentRole, newRole, availableRoles);
          
          // Legacy events for backward compatibility
          // 3. Standard legacy event
          window.dispatchEvent(new CustomEvent('role-changed', {
            detail: { role: newRole, from: currentRole, to: newRole }
          }));
          
          // 4. Legacy event for backward compatibility
          document.dispatchEvent(new CustomEvent('roleSwitched', { 
            detail: { role: newRole } 
          }));
          
          // 5. Trigger a global role refresh legacy event
          window.dispatchEvent(new CustomEvent('role-switched', {
            detail: { from: currentRole, to: newRole }
          }));
          
          // 6. Publish to all windows (for multi-tab support)
          try {
            // Use enhanced storage instead of direct localStorage
            const roleChangeData = JSON.stringify({
              role: newRole,
              timestamp: Date.now()
            });
            
            enhancedStorage.setItem(STORAGE_KEYS.LAST_ROLE_CHANGE, roleChangeData);
          } catch (e) {
            logger.warn('Failed to update role change data in storage:', e);
          }
        } catch (storageError) {
          logger.log('Error using enhanced storage system:', storageError);
          
          // Fallback to direct localStorage if enhanced storage fails
          localStorage.setItem('currentRole', newRole);
          
          window.dispatchEvent(new CustomEvent('role-changed', {
            detail: { role: newRole, from: currentRole, to: newRole }
          }));
          
          logger.debug('Used fallback role change method');
        }
        
        log = true;
      } else {
        // Use the RoleService for normal operation
        log = await RoleService.changeRole(newRole);
      }
      
      if (log) {
        // Update local state
        setCurrentRole(newRole);
        
        // If onRoleChange prop is provided, call it
        if (onRoleChange) {
          onRoleChange(newRole);
        }
        
        logger.log('Role switched logfully:', { from: currentRole, to: newRole });
        
        // Trigger role events using modern event system
        notifyRoleChanged(currentRole, newRole, availableRoles);
        
        // For backward compatibility
        triggerRoleRefresh();
        
        // Navigate to the main dashboard if needed
        if (!skipNavigation) {
          // With the flattened URL structure, we always navigate to the main dashboard
          router.push('/dashboard');
        }
      } else {
        logger.log('Failed to change role');
        // Reset to previous role on failure
        event.target.value = currentRole;
      }
    } catch (error) {
      logger.log('Error changing role:', error);
      event.target.value = currentRole;
    } finally {
      setIsChanging(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className={className}>
        <div className="relative">
          <div className="appearance-none block w-full pl-10 pr-8 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm">
            <div className="animate-pulse flex items-center">
              <div className="h-4 w-20 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
          </div>
          <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3 pointer-events-none">
            <div className="animate-pulse h-5 w-5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={className}>
      <div className="relative">
        <select
          value={currentRole}
          onChange={handleRoleChange}
          disabled={isChanging}
          aria-label="Select role"
          className={`appearance-none block w-full pl-10 pr-8 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border rounded-md shadow-sm focus:ring focus:ring-opacity-50 disabled:opacity-50 ${
            isTestMode 
              ? 'border-yellow-400 focus:border-yellow-500 focus:ring-yellow-500 dark:border-yellow-600' 
              : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500 dark:border-gray-600'
          }`}
        >
          {availableRoles.map((role) => (
            <option key={role} value={role}>
              {getRoleDisplayName(role)}
            </option>
          ))}
        </select>
        {/* Display current role icon */}
        <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3 pointer-events-none">
          {roleIcons[currentRole as keyof typeof roleIcons]}
        </div>
        {/* Custom dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      
      {isChanging && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 animate-pulse">
          Changing role...
        </div>
      )}
    </div>
  );
};

export default RoleDropdown;