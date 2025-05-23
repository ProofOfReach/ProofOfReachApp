import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthRefactored } from '../hooks/useAuthRefactored';
import type { UserRole } from '../types/role';
import { logger } from '../lib/logger';

/**
 * Interface for the context value
 * This provides clear typing for consumers of the context
 */
interface RoleContextType {
  role: string;
  setRole: (role: string, targetPath?: string) => Promise<boolean>;
  availableRoles: string[];
  isRoleAvailable: (role: string) => boolean;
  clearRole: () => void;
  isChangingRole: boolean;
}

/**
 * Environment-specific configuration
 * In a production application, these would come from environment variables
 */
const isDevEnvironment = process.env.NODE_ENV === 'development'; // Only true in development mode
const ALL_ROLES: string[] = ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder', 'developer'];

/**
 * Create the context with sensible default values
 */
const RoleContextRefactored = createContext<RoleContextType>({
  role: 'advertiser',
  setRole: async () => false,
  availableRoles: ['advertiser'],
  isRoleAvailable: () => false,
  clearRole: () => {},
  isChangingRole: false,
});

// Cache configuration
const ROLE_CACHE_KEY = 'roleData';
const ROLES_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Props for the provider component
 */
interface RoleProviderProps {
  children: ReactNode;
  initialRole?: string;
  queryClient?: QueryClient;
}

/**
 * Configure the query client with appropriate defaults
 */
const defaultQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: ROLES_CACHE_TTL,
      gcTime: ROLES_CACHE_TTL,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Role data interface for consistent data structure
 */
interface RoleDataType {
  availableRoles: string[];
  currentRole: string; // Will be cast to UserRole after validation
  timestamp: number;
}

/**
 * Provider component that manages role state and transitions
 */
export const RoleProviderRefactored: React.FC<RoleProviderProps> = ({ 
  children, 
  initialRole,
  queryClient = defaultQueryClient
}) => {
  const router = useRouter();
  const { authState, refreshRoles } = useAuthRefactored() as any;
  const [isChangingRole, setIsChangingRole] = useState(false);
  
  // Use the query client for caching operations
  const client = useQueryClient();
  
  /**
   * Validate that a role is a valid UserRole
   * Enforces type safety for roles from external sources
   */
  const isValidRole = (role: string): role is UserRole => {
    return ALL_ROLES.includes(role as UserRole);
  };

  /**
   * Ensure a role is valid, or return 'advertiser' as fallback
   */
  const ensureValidRole = (role: string): string => {
    return isValidRole(role) ? role : 'advertiser';
  };
  
  /**
   * Fetch and maintain role data using React Query
   * This provides caching, deduplication, and background updates
   */
  const { data: roleData, refetch } = useQuery<RoleDataType>({
    queryKey: [ROLE_CACHE_KEY],
    queryFn: async () => {
      // In development environment, always provide all roles
      if (isDevEnvironment) {
        logger.log('Development mode: All roles available');
        const storedRole = localStorage.getItem('userRole');
        
        return {
          availableRoles: ALL_ROLES,
          currentRole: isValidRole(storedRole || '') ? storedRole! : 'advertiser',
          timestamp: Date.now()
        };
      }
      
      // For test mode, directly use all roles without API calls
      if (authState?.isTestMode) {
        logger.log('Test mode: Using all roles directly (no API calls)');
        const storedRole = localStorage.getItem('userRole');
        
        // For test mode, we always use all roles without making API calls
        // This avoids "Failed to fetch" errors
        return {
          availableRoles: ALL_ROLES,
          currentRole: isValidRole(storedRole || '') ? storedRole! : 'advertiser',
          timestamp: Date.now()
        };
      }
      
      // Production mode - use authorized roles from the server
      // Make sure to capture all available roles
      logger.log("Available roles from auth:", authState?.availableRoles);
      const availableRoles = authState?.availableRoles || ['advertiser'];
      const storedRole = localStorage.getItem('userRole');
      
      // Ensure the role is both valid and authorized
      const currentRole = storedRole && isValidRole(storedRole) && availableRoles.includes(storedRole as UserRole)
        ? storedRole
        : 'advertiser';
        
      // Return the roles
      return {
        availableRoles: authState?.isTestMode ? ALL_ROLES : availableRoles,
        currentRole,
        timestamp: Date.now()
      };
    },
    initialData: () => {
      // Check for test mode first
      const isTestMode = authState?.isTestMode || (typeof window !== 'undefined' && localStorage.getItem('isTestMode') === 'true');
      
      if (isTestMode || isDevEnvironment) {
        logger.log("Test mode or dev mode in initialData");
        const storedRole = localStorage.getItem('userRole');
        return {
          availableRoles: ALL_ROLES,
          currentRole: isValidRole(storedRole || '') ? storedRole! : 'advertiser',
          timestamp: Date.now()
        };
      }
      
      // Only attempt to use cached data on the client
      if (typeof window !== 'undefined') {
        try {
          const cachedRoles = localStorage.getItem('cachedAvailableRoles');
          const timestamp = parseInt(localStorage.getItem('roleCacheTimestamp') || '0', 10);
          const storedRole = localStorage.getItem('userRole');
          
          // Check if cache is valid (not expired)
          const isCacheValid = Date.now() - timestamp < ROLES_CACHE_TTL;
          
          if (cachedRoles && isCacheValid) {
            const availableRoles = JSON.parse(cachedRoles) as UserRole[];
            
            // Validate the role
            const currentRole = storedRole && isValidRole(storedRole) 
              ? storedRole
              : 'advertiser';
              
            return {
              availableRoles,
              currentRole,
              timestamp
            };
          }
        } catch (error) {
          logger.error('Error reading roles from cache:', error);
        }
      }
      
      // Default fallback data - if auth has availableRoles, use those
      return {
        availableRoles: authState?.availableRoles || ['advertiser'],
        currentRole: initialRole || 'advertiser',
        timestamp: 0
      };
    },
    enabled: !!authState, // Only run when auth is available
  });
  
  /**
   * Create a mutation for changing roles
   * Using React Query's mutation API provides automatic error handling and state management
   */
  const setRoleMutation = useMutation({
    mutationFn: async ({ 
      newRole, 
      targetPath = `/dashboard/${newRole}`
    }: { 
      newRole: string; 
      targetPath?: string;
    }) => {
      logger.log(`Attempting role change to: ${newRole}`);
      
      // In development or test mode, always allow all roles
      if (isDevEnvironment || authState?.isTestMode) {
        localStorage.setItem('userRole', newRole);
        
        // No need to refresh roles for test mode - we directly set them in localStorage
        return { success: true, targetPath };
      }
      
      // In production, check if the role is available
      if (!isRoleAvailable(newRole)) {
        logger.warn(`Role ${newRole} is not available. Aborting.`);
        return { success: false, targetPath };
      }
      
      localStorage.setItem('userRole', newRole);
      return { success: true, targetPath };
    },
    onMutate: () => {
      setIsChangingRole(true);
    },
    onSettled: (data, error) => {
      // Set flag to prevent running onSuccess logic on errors
      if (error || !data?.success) {
        setIsChangingRole(false);
        return;
      }
      
      // Ensure the path segment is a valid role or use current role as fallback
      const pathSegment = data.targetPath?.split('/').pop();
      const targetRole = isValidRole(pathSegment || '') ? pathSegment as UserRole : getCurrentRole();
      const newPath = data.targetPath;
      
      // Update client cache with new role first
      client.setQueryData<RoleDataType>([ROLE_CACHE_KEY], old => ({
        ...old!,
        currentRole: targetRole,
        timestamp: Date.now()
      }));
      
      // Skip navigation if we're already on this path
      if (router.pathname === newPath) {
        setIsChangingRole(false);
        return;
      }
      
      // Use Next.js router's push method with shallow option for client-side navigation
      router.push(newPath, undefined, { shallow: true })
        .then(() => {
          // Reset changing flag only after navigation completes
          setIsChangingRole(false);
        })
        .catch(error => {
          logger.error('Navigation error:', error);
          setIsChangingRole(false);
        });
    }
  });
  
  /**
   * Update local storage when role data changes
   */
  useEffect(() => {
    if (roleData) {
      try {
        localStorage.setItem('cachedAvailableRoles', JSON.stringify(roleData.availableRoles));
        localStorage.setItem('roleCacheTimestamp', roleData.timestamp.toString());
        localStorage.setItem('userRole', roleData.currentRole);
      } catch (error) {
        logger.error('Error saving roles to cache:', error);
      }
    }
  }, [roleData]);
  
  /**
   * Check for force refresh flag from test mode login
   */
  useEffect(() => {
    const forceRefresh = localStorage.getItem('force_role_refresh');
    if (forceRefresh === 'true') {
      // Check for test mode
      const isTestMode = localStorage.getItem('isTestMode') === 'true';
      if (isTestMode) {
        logger.log('Force refreshing role data after test mode login');
        // Use the global ALL_ROLES constant to match the rest of the file
        // This ensures consistency in available roles
        
        // Get the current role from localStorage
        const storedRole = localStorage.getItem('userRole');
        const currentRole = storedRole && isValidRole(storedRole) ? storedRole : 'advertiser';
        
        logger.log(`Setting current role to: ${currentRole}`);
        
        // Update role data in the query cache
        client.setQueryData<RoleDataType>([ROLE_CACHE_KEY], {
          availableRoles: ALL_ROLES,
          currentRole: currentRole as UserRole,
          timestamp: Date.now()
        });
        
        // Trigger a refetch to ensure we have the latest data
        refetch();
        
        // Clear the flag
        localStorage.removeItem('force_role_refresh');
      }
    }
  }, [client, refetch]);
  
  /**
   * Handle legacy dashboard URLs only
   * We've removed the automatic role syncing with URL to avoid update loops
   */
  useEffect(() => {
    if (!router.isReady || isChangingRole || !roleData) return;
    
    // Only handle the redirect case for the legacy dashboard URL
    // We're no longer trying to auto-detect roles from URLs to avoid infinite update cycles
    if (router.pathname === '/dashboard') {
      // Only redirect once
      const hasRedirected = sessionStorage.getItem('dashboard_redirected');
      if (!hasRedirected) {
        sessionStorage.setItem('dashboard_redirected', 'true');
        router.replace('/dashboard/advertiser');
      }
    }
  }, [router.pathname, router.isReady, isChangingRole, roleData]);
  
  /**
   * Public API for changing roles
   */
  const setRole = async (newRole: string, targetPath?: string): Promise<boolean> => {
    if (ensureValidRole(roleData?.currentRole || '') === newRole) {
      return true; // Already in this role
    }
    
    try {
      const result = await setRoleMutation.mutateAsync({ 
        newRole, 
        targetPath: targetPath || `/dashboard/${newRole}`
      });
      return result.success;
    } catch (error) {
      logger.error('Error changing role:', error);
      return false;
    }
  };
  
  /**
   * Check if a role is available to the current user
   */
  const isRoleAvailable = (roleToCheck: string): boolean => {
    // In development or test mode, all roles are available
    if (isDevEnvironment || authState?.isTestMode) {
      return true;
    }
    
    // Check against authorized roles
    return roleData?.availableRoles.includes(roleToCheck) || false;
  };
  
  /**
   * Clear role data (used during logout)
   */
  const clearRole = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('cachedAvailableRoles');
    localStorage.removeItem('roleCacheTimestamp');
    
    client.setQueryData<RoleDataType>([ROLE_CACHE_KEY], {
      availableRoles: ['advertiser'],
      currentRole: 'advertiser',
      timestamp: Date.now()
    });
  };
  
  /**
   * Get the current role, ensuring it's a valid UserRole
   */
  const getCurrentRole = (): string => {
    return ensureValidRole(roleData?.currentRole || 'advertiser');
  };
  
  /**
   * Create the context value with all required properties
   */
  const contextValue: RoleContextType = {
    role: getCurrentRole(),
    setRole,
    availableRoles: roleData?.availableRoles || ['advertiser'],
    isRoleAvailable,
    clearRole,
    isChangingRole
  };
  
  return (
    <RoleContextRefactored.Provider value={contextValue}>
      {children}
    </RoleContextRefactored.Provider>
  );
};

/**
 * Convenience wrapper that provides the QueryClient
 */
export const RoleProviderRefactoredWithQueryClient: React.FC<Omit<RoleProviderProps, 'queryClient'>> = (props) => {
  return (
    <QueryClientProvider client={defaultQueryClient}>
      <RoleProviderRefactored {...props} />
    </QueryClientProvider>
  );
};

/**
 * Custom hook for using the role context
 * This provides a clean, consistent API for components
 */
export const useRole = () => useContext(RoleContextRefactored);

export default RoleContextRefactored;