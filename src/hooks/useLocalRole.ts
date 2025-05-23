import { useState, useEffect, useCallback } from 'react';
import "./context/RoleContext';
import "./lib/roleService';

/**
 * Hook for managing role state locally
 * This is a simplified hook that uses RoleService for managing roles
 */
export function useLocalRole() {
  const [currentRole, setCurrentRole] = useState<UserRole>('viewer');
  const [isTestMode, setIsTestMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize roles and test mode state
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Get initial role and test mode state
    const role = RoleService.getCurrentRole();
    const testMode = RoleService.isTestMode();
    
    if (role) {
      setCurrentRole(role);
    }
    
    setIsTestMode(testMode);
    setIsLoading(false);
    
    // Listen for role changes via custom events
    const handleRoleChange = (event: Event) => {
      const customEvent = event as CustomEvent<{
        from: string;
        to: string;
      }>;
      setCurrentRole(customEvent.detail.to as UserRole);
    };
    
    document.addEventListener('roleSwitched', handleRoleChange);
    
    return () => {
      document.removeEventListener('roleSwitched', handleRoleChange);
    };
  }, []);
  
  // Change role function
  const changeRole = useCallback(async (role: UserRole) => {
    if (currentRole === role) return;
    
    const success = await RoleService.changeRole(role);
    
    if (success) {
      setCurrentRole(role);
      return true;
    }
    
    return false;
  }, [currentRole]);
  
  // Check if role is available (simplified, always returns true in test mode)
  const isRoleAvailable = useCallback((role: UserRole) => {
    if (isTestMode) return true;
    
    // In a real implementation, we would check with the server
    // or use role data from the user's profile
    return RoleService.hasRole(role);
  }, [isTestMode]);
  
  // Toggle test mode
  const toggleTestMode = useCallback(async () => {
    if (isTestMode) {
      RoleService.setTestMode(false);
      setIsTestMode(false);
    } else {
      RoleService.setTestMode(true);
      setIsTestMode(true);
    }
  }, [isTestMode]);
  
  return {
    currentRole,
    isTestMode,
    isLoading,
    changeRole,
    isRoleAvailable,
    toggleTestMode,
  };
}