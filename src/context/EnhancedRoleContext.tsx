import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { RoleType, UserRoleData } from '../lib/enhancedRoleService';
import { logger } from '../lib/logger';

// Define the context state interface
interface EnhancedRoleContextState {
  // Current user role data
  roleData: UserRoleData | null;
  // Loading state
  isLoading: boolean;
  // Error state
  error: Error | null;
  // Currently active role
  currentRole: RoleType | 'viewer';
  // Available roles for the user
  availableRoles: RoleType[];
  // Whether the user is in test mode
  isTestUser: boolean;
  
  // Actions
  changeRole: (role: RoleType | 'viewer') => Promise<void>;
  enableTestMode: () => Promise<void>;
  loadRoleData: (userId: string) => Promise<void>;
  refreshRoleData: () => Promise<void>;
  // Admin actions
  enableAllRoles: () => Promise<void>;
  toggleTestMode: (enabled: boolean) => Promise<void>;
}

// Create the context with a default value
const EnhancedRoleContext = createContext<EnhancedRoleContextState | undefined>(undefined);

// Context provider props
interface EnhancedRoleProviderProps {
  children: ReactNode;
  initialUserId?: string;
}

// Provider component
export const EnhancedRoleProvider: React.FC<EnhancedRoleProviderProps> = ({ 
  children, 
  initialUserId 
}) => {
  // State for role data
  const [roleData, setRoleData] = useState<UserRoleData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Convenience getters for role data
  const currentRole = roleData?.currentRole || 'viewer';
  const availableRoles = roleData?.availableRoles || [];
  const isTestUser = roleData?.isTestUser || false;

  // Function to load role data from the API
  const loadRoleData = async (userId: string): Promise<void> => {
    // Skip API calls in test mode
    if (typeof window !== 'undefined' && localStorage.getItem('test-mode') === 'true') {
      logger.debug('Test mode detected in localStorage, skipping API call');
      // Simulate test user data
      const testData: UserRoleData = {
        id: userId || 'test-user',
        currentRole: 'admin',
        availableRoles: ['admin', 'advertiser', 'publisher', 'developer', 'stakeholder'],
        isTestUser: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setRoleData(testData);
      setIsLoading(false);
      return;
    }

    if (!userId) {
      setRoleData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/enhanced-roles/get-roles?userId=${encodeURIComponent(userId)}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          // If user doesn't exist, create one with default roles via test-mode endpoint
          const createResponse = await fetch('/api/enhanced-roles/test-mode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
          });
          
          if (!createResponse.ok) {
            throw new Error('Failed to create new user and role data');
          }
          
          const data = await createResponse.json();
          setRoleData(data.data);
        } else {
          throw new Error(`API error: ${response.status}`);
        }
      } else {
        const data = await response.json();
        setRoleData(data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error loading role data'));
      logger.log('Error loading role data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to change the user's role
  const changeRole = async (role: RoleType | 'viewer'): Promise<void> => {
    if (!roleData) {
      setError(new Error('No user role data available'));
      return;
    }

    // For test mode with localStorage
    if (typeof window !== 'undefined' && localStorage.getItem('test-mode') === 'true') {
      logger.debug(`Test mode detected, changing role to ${role} locally`);
      setRoleData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          currentRole: role
        };
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/enhanced-roles/change-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: roleData.id, role })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to change role');
      }

      const data = await response.json();
      setRoleData(data.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error changing role'));
      logger.log('Error changing role:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to enable test mode for the current user
  const enableTestMode = async (): Promise<void> => {
    const userId = roleData?.id;
    
    if (!userId) {
      setError(new Error('No user ID available to enable test mode'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/enhanced-roles/toggle-test-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId,
          enabled: true 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to enable test mode');
      }

      // Store test mode in localStorage for client-side test mode
      if (typeof window !== 'undefined') {
        localStorage.setItem('test-mode', 'true');
      }

      const data = await response.json();
      setRoleData(data.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error enabling test mode'));
      logger.log('Error enabling test mode:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to refresh the current role data
  const refreshRoleData = async (): Promise<void> => {
    if (!roleData?.id) {
      logger.debug('No user ID to refresh role data');
      return;
    }
    
    await loadRoleData(roleData.id);
  };

  // Function to enable all roles for the current user (admin only)
  const enableAllRoles = async (): Promise<void> => {
    const userId = roleData?.id;
    
    if (!userId) {
      setError(new Error('No user ID available to enable all roles'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/enhanced-roles/enable-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to enable all roles');
      }

      const data = await response.json();
      setRoleData(data.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error enabling all roles'));
      logger.log('Error enabling all roles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to toggle test mode for the current user
  const toggleTestMode = async (enabled: boolean): Promise<void> => {
    const userId = roleData?.id;
    
    if (!userId) {
      setError(new Error('No user ID available to toggle test mode'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/enhanced-roles/toggle-test-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, enabled })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to toggle test mode');
      }

      // Update localStorage to match the server state
      if (typeof window !== 'undefined') {
        if (enabled) {
          localStorage.setItem('test-mode', 'true');
        } else {
          localStorage.removeItem('test-mode');
        }
      }

      const data = await response.json();
      setRoleData(data.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error toggling test mode'));
      logger.log('Error toggling test mode:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load role data when initialUserId changes or on mount
  useEffect(() => {
    if (initialUserId) {
      loadRoleData(initialUserId);
    } else {
      setIsLoading(false);
    }
  }, [initialUserId]);

  // Context value
  const contextValue: EnhancedRoleContextState = {
    roleData,
    isLoading,
    error,
    currentRole,
    availableRoles,
    isTestUser,
    changeRole,
    enableTestMode,
    loadRoleData,
    refreshRoleData,
    enableAllRoles,
    toggleTestMode
  };

  return (
    <EnhancedRoleContext.Provider value={contextValue}>
      {children}
    </EnhancedRoleContext.Provider>
  );
};

// Custom hook to use the context
export const useEnhancedRole = (): EnhancedRoleContextState => {
  const context = useContext(EnhancedRoleContext);
  
  if (context === undefined) {
    throw new Error('useEnhancedRole must be used within an EnhancedRoleProvider');
  }
  
  return context;
};