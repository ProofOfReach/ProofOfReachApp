import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';

/**
 * Define the possible user roles
 * Using TypeScript's union types ensures type safety throughout the application
 */
export type UserRole = 'viewer' | 'advertiser' | 'publisher' | 'admin' | 'stakeholder';

/**
 * Interface for the context value
 * This provides clear typing for consumers of the context
 */
interface RoleContextType {
  role: string;
  setRole: (role: UserRole, targetPath?: string) => Promise<boolean>;
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
const ALL_ROLES: string[] = ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'];

/**
 * Create the context with sensible default values
 */
const RoleContext = createContext<RoleContextType>({
  role: 'viewer',
  setRole: async () => false,
  availableRoles: ['viewer'],
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
export const RoleProvider: React.FC<RoleProviderProps> = ({ 
  children, 
  initialRole,
  queryClient = defaultQueryClient
}) => {
  const router = useRouter();
  const { auth, refreshRoles } = useAuth();
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
   * Ensure a role is valid, or return 'viewer' as fallback
   */
  const ensureValidRole = (role: string): string => {
    return isValidRole(role) ? role : 'viewer';
  };
  
  /**
   * Fetch and maintain role data using React Query
   * This provides caching, deduplication, and background updates
   */
  const { data: roleData, refetch } = useQuery<RoleDataType>({
    queryKey: [ROLE_CACHE_KEY],
    staleTime: 0, // Force refresh every time
    cacheTime: 0, // Don't cache results 
    queryFn: async () => {
      // Check for test mode from multiple sources
      const isTestModeEnabled = auth?.isTestMode || 
        (typeof window !== 'undefined' && localStorage.getItem('isTestMode') === 'true') ||
        (typeof window !== 'undefined' && localStorage.getItem('nostr_test_pk')?.startsWith('pk_test_'));
      
      console.log('Role context test mode check:', {
        authTestMode: auth?.isTestMode,
        isTestModeStorage: typeof window !== 'undefined' ? localStorage.getItem('isTestMode') : 'n/a',
        testPubkey: typeof window !== 'undefined' ? localStorage.getItem('nostr_test_pk') : 'n/a',
        isTestModeEnabled,
        isDevEnvironment
      });
      
      // In development environment or test mode, always provide all roles
      if (isDevEnvironment || isTestModeEnabled) {
        console.log('Test mode detected - enabling all roles');
        const storedRole = localStorage.getItem('userRole') || localStorage.getItem('currentRole');
        
        return {
          availableRoles: ALL_ROLES,
          currentRole: isValidRole(storedRole || '') ? storedRole! : 'admin',
          timestamp: Date.now()
        };
      }
      
      // Production mode - use authorized roles from the server
      // Make sure to capture all available roles
      console.log("Available roles from auth:", auth?.availableRoles);
      const availableRoles = auth?.availableRoles || ['viewer'];
      const storedRole = localStorage.getItem('userRole');
      
      // Ensure the role is both valid and authorized
      const currentRole = storedRole && isValidRole(storedRole) && availableRoles.includes(storedRole as UserRole)
        ? storedRole
        : 'viewer';
        
      // Make sure all available roles are properly stored
      if (auth?.isTestMode) {
        console.log("Test mode detection in queryFn");
        return {
          availableRoles: ALL_ROLES,
          currentRole,
          timestamp: Date.now()
        };
      }
        
      return {
        availableRoles,
        currentRole,
        timestamp: Date.now()
      };
    },
    initialData: () => {
      // Force test mode detection from multiple sources
      const isTestMode = auth?.isTestMode || 
        (typeof window !== 'undefined' && localStorage.getItem('isTestMode') === 'true') ||
        (typeof window !== 'undefined' && localStorage.getItem('nostr_test_pk')?.startsWith('pk_test_'));
      
      console.log("Initial data test mode check:", {
        authTestMode: auth?.isTestMode,
        isTestModeStorage: typeof window !== 'undefined' ? localStorage.getItem('isTestMode') : null,
        testPubkey: typeof window !== 'undefined' ? localStorage.getItem('nostr_test_pk') : null,
        isTestMode,
        isDevEnvironment
      });
      
      if (isTestMode || isDevEnvironment) {
        console.log("Initial data: Test mode or dev mode detected - enabling all roles");
        const storedRole = localStorage.getItem('userRole') || localStorage.getItem('currentRole');
        return {
          availableRoles: ALL_ROLES,
          currentRole: isValidRole(storedRole || '') ? storedRole! : 'admin',
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
              : 'viewer';
              
            return {
              availableRoles,
              currentRole,
              timestamp
            };
          }
        } catch (error) {
          console.log('Error reading roles from cache:', error);
        }
      }
      
      // Default fallback data - if auth has availableRoles, use those
      return {
        availableRoles: auth?.availableRoles || ['viewer'],
        currentRole: initialRole || 'viewer',
        timestamp: 0
      };
    },
    enabled: !!auth, // Only run when auth is available
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
      console.log(`Attempting role change to: ${newRole}`);
      
      // In development or test mode, always allow all roles
      if (isDevEnvironment || auth?.isTestMode) {
        localStorage.setItem('userRole', newRole);
        
        // For test mode, ensure roles are refreshed
        if (auth?.isTestMode) {
          await refreshRoles();
        }
        
        return { log: true, targetPath };
      }
      
      // In production, check if the role is available
      if (!isRoleAvailable(newRole)) {
        console.warn(`Role ${newRole} is not available. Aborting.`);
        return { log: false, targetPath };
      }
      
      localStorage.setItem('userRole', newRole);
      return { log: true, targetPath };
    },
    onMutate: () => {
      setIsChangingRole(true);
    },
    onSettled: (data, error) => {
      // Set flag to prevent running onSuccess logic on errors
      if (error || !data?.log) {
        setIsChangingRole(false);
        return;
      }
      
      const targetRole = data.targetPath.split('/').pop() as UserRole;
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
          console.log('Navigation error:', error);
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
        console.log('Error saving roles to cache:', error);
      }
    }
  }, [roleData]);
  
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
        router.replace('/dashboard/viewer');
      }
    }
  }, [router.pathname, router.isReady]);
  
  /**
   * Public API for changing roles
   */
  const setRole = async (newRole: UserRole, targetPath?: string): Promise<boolean> => {
    if (ensureValidRole(roleData?.currentRole || '') === newRole) {
      return true; // Already in this role
    }
    
    try {
      const result = await setRoleMutation.mutateAsync({ 
        newRole, 
        targetPath: targetPath || `/dashboard/${newRole}`
      });
      return result.log;
    } catch (error) {
      console.log('Error changing role:', error);
      return false;
    }
  };
  
  /**
   * Check if a role is available to the current user
   */
  const isRoleAvailable = (roleToCheck: string): boolean => {
    // Check for test mode from multiple sources
    const isTestModeEnabled = auth?.isTestMode || 
      (typeof window !== 'undefined' && localStorage.getItem('isTestMode') === 'true') ||
      (typeof window !== 'undefined' && localStorage.getItem('nostr_pubkey')?.startsWith('pk_test_'));
    
    if (isDevEnvironment || isTestModeEnabled) {
      console.log(`Test mode detected, all roles are available: ${roleToCheck}`);
      return true;
    }
    
    // Viewer role is always available
    if (roleToCheck === 'viewer') {
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
    
    // Check if we're in test mode when clearing roles
    const isTestModeEnabled = auth?.isTestMode || 
      (typeof window !== 'undefined' && localStorage.getItem('isTestMode') === 'true') ||
      (typeof window !== 'undefined' && localStorage.getItem('nostr_test_pk')?.startsWith('pk_test_'));
    
    const availableRoles = (isDevEnvironment || isTestModeEnabled) ? ALL_ROLES : ['viewer'];
    
    client.setQueryData<RoleDataType>([ROLE_CACHE_KEY], {
      availableRoles,
      currentRole: 'viewer',
      timestamp: Date.now()
    });
  };
  
  /**
   * Get the current role, ensuring it's a valid UserRole
   */
  const getCurrentRole = (): string => {
    return ensureValidRole(roleData?.currentRole || 'viewer');
  };
  
  // Force test mode roles to be available immediately
  const isTestModeActive = auth?.isTestMode || 
    (typeof window !== 'undefined' && localStorage.getItem('isTestMode') === 'true') ||
    (typeof window !== 'undefined' && localStorage.getItem('nostr_test_pk')?.startsWith('pk_test_'));
  
  console.log('Role context test mode check:', {
    isTestModeActive,
    isDevEnvironment,
    roleDataAvailableRoles: roleData?.availableRoles,
    shouldShowAllRoles: isDevEnvironment || isTestModeActive
  });
  
  const finalAvailableRoles = (isDevEnvironment || isTestModeActive) ? ALL_ROLES : (roleData?.availableRoles || ['viewer']);
  
  console.log('Final available roles:', finalAvailableRoles);
  
  /**
   * Create the context value with all required properties
   */
  const contextValue: RoleContextType = {
    role: getCurrentRole(),
    setRole,
    availableRoles: finalAvailableRoles,
    isRoleAvailable,
    clearRole,
    isChangingRole
  };

  // Force refresh if we detect test mode but don't have all roles
  React.useEffect(() => {
    const isTestModeEnabled = auth?.isTestMode || 
      (typeof window !== 'undefined' && localStorage.getItem('isTestMode') === 'true') ||
      (typeof window !== 'undefined' && localStorage.getItem('nostr_test_pk')?.startsWith('pk_test_'));
    
    if ((isDevEnvironment || isTestModeEnabled) && roleData?.availableRoles?.length === 1 && roleData.availableRoles[0] === 'viewer') {
      console.log('Force refreshing roles for test mode');
      refetch();
    }
  }, [auth?.isTestMode, roleData?.availableRoles, refetch]);
  
  return (
    <RoleContext.Provider value={contextValue}>
      {children}
    </RoleContext.Provider>
  );
};

/**
 * Convenience wrapper that provides the QueryClient
 */
export const RoleProviderWithQueryClient: React.FC<Omit<RoleProviderProps, 'queryClient'>> = (props) => {
  return (
    <QueryClientProvider client={defaultQueryClient}>
      <RoleProvider {...props} />
    </QueryClientProvider>
  );
};

/**
 * Custom hook for using the role context
 * This provides a clean, consistent API for components
 */
export const defaultUseRole = () => useContext(RoleContext);

export default RoleContext;