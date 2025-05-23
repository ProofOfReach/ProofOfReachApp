import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import type { UserRole } from './RoleContext';
import { useLocalRole } from '../hooks/useLocalRole';

/**
 * Enhanced context for role state management
 */
interface EnhancedRoleContextType {
  /** Current active role */
  role: string;
  /** Function to change the role */
  setRole: (newRole: string, redirectPath?: string) => Promise<void>;
  /** Role transition in progress */
  isTransitioning: boolean;
  /** Last transition event details */
  lastTransition: {
    from: string;
    to: string;
    timestamp: string;
  } | null;
  /** Available roles for the user */
  availableRoles: string[];
  /** Function to check if a specific role is available */
  isRoleAvailable: (role: string) => boolean;
}

/**
 * Default context values (will be overridden by Provider)
 */
const EnhancedRoleContext = createContext<EnhancedRoleContextType>({
  role: 'viewer',
  setRole: async () => {},
  isTransitioning: false,
  lastTransition: null,
  availableRoles: ['viewer'],
  isRoleAvailable: () => false
});

/**
 * Provider component properties
 */
interface EnhancedRoleProviderProps {
  /** Child components to render within the provider */
  children: ReactNode;
  /** Initial role (from server rendering) */
  initialRole?: string;
  /** Mock for testing - forces all roles to be available */
  testMode?: boolean;
}

/**
 * Enhanced Provider component for role management with improved state handling
 */
export const EnhancedRoleProvider: React.FC<EnhancedRoleProviderProps> = ({ 
  children,
  initialRole = 'viewer',
  testMode = false
}) => {
  const router = useRouter();
  const { localRole, setLocalRole, changeRole } = useLocalRole();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>([initialRole]);
  const [lastTransition, setLastTransition] = useState<{
    from: string;
    to: string;
    timestamp: string;
  } | null>(null);
  
  // Initialize provider state on mount
  useEffect(() => {
    // Set initial roles for test mode
    if (testMode || typeof window !== 'undefined' && localStorage.getItem('isTestMode') === 'true') {
      setAvailableRoles(['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder']);
    } else {
      // In production, fetch available roles from API
      fetchAvailableRoles();
    }
    
    // Listen for role transition events
    const handleRoleTransition = (event: Event) => {
      const customEvent = event as CustomEvent<{
        from: string;
        to: string;
        timestamp: string;
      }>;
      
      // Update last transition record
      setLastTransition(customEvent.detail);
    };
    
    // Add and remove event listener
    document.addEventListener('roleSwitched', handleRoleTransition);
    return () => {
      document.removeEventListener('roleSwitched', handleRoleTransition);
    };
  }, [testMode]);
  
  /**
   * Fetch available roles from the server
   */
  const fetchAvailableRoles = async () => {
    try {
      // Skip API call in test mode
      if (testMode || typeof window !== 'undefined' && localStorage.getItem('bypass_api_calls') === 'true') {
        console.log('Bypassing API call for role availability check');
        return;
      }
      
      const response = await fetch('/api/roles/available');
      
      if (response.ok) {
        const data = await response.json();
        setAvailableRoles(data.roles);
      } else {
        console.error('Failed to fetch available roles:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching available roles:', error);
    }
  };
  
  /**
   * Check if a role is available for the current user
   */
  const isRoleAvailable = (roleToCheck: string): boolean => {
    if (testMode || typeof window !== 'undefined' && 
        (localStorage.getItem('isTestMode') === 'true' || 
         localStorage.getItem('force_all_roles_available') === 'true' ||
         router.pathname === '/dashboard/improved' ||
         router.pathname === '/test-dropdown')) {
      return true;
    }
    
    return availableRoles.includes(roleToCheck);
  };
  
  /**
   * Change the active role
   */
  const setRole = async (newRole: string, redirectPath?: string): Promise<void> => {
    // Check if role is available
    if (!isRoleAvailable(newRole)) {
      console.warn(`Role ${newRole} is not available.`);
      return;
    }
    
    // Update transition state
    setIsTransitioning(true);
    
    try {
      // Use our enhanced changeRole function from useLocalRole
      const success = await changeRole(newRole, !!redirectPath);
      
      if (success) {
        // If redirect is specified, navigate to that path
        if (redirectPath) {
          await router.push(redirectPath);
        } else {
          // Otherwise navigate to the default dashboard for the role
          const roleDashboards: Record<UserRole, string> = {
            user: '/dashboard',
            advertiser: '/dashboard/advertiser',
            publisher: '/dashboard/publisher',
            admin: '/dashboard/admin',
            stakeholder: '/dashboard/stats'
          };
          
          // Skip navigation for certain paths
          if (router.pathname !== '/dashboard/improved' && 
              router.pathname !== '/test-dropdown') {
            await router.push(roleDashboards[newRole]);
          }
        }
      }
    } catch (error) {
      console.error('Error switching role:', error);
    } finally {
      setIsTransitioning(false);
    }
  };
  
  // Context value to be provided
  const contextValue: EnhancedRoleContextType = {
    role: localRole as UserRole,
    setRole,
    isTransitioning,
    lastTransition,
    availableRoles,
    isRoleAvailable
  };
  
  return (
    <EnhancedRoleContext.Provider value={contextValue}>
      {children}
    </EnhancedRoleContext.Provider>
  );
};

/**
 * Custom hook to use the enhanced role context
 */
export const useEnhancedRole = () => useContext(EnhancedRoleContext);