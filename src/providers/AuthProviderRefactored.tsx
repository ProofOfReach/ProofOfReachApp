import { ReactNode, useEffect, useState, useCallback, useRef } from 'react';
import { AuthContext } from '../hooks/useAuthRefactored';
import { AuthService } from '../services/authService';
import { AuthState, AuthStateContext, UserRole } from '../types/auth';
import { logger } from '../lib/logger';

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication provider component
 * 
 * This component provides authentication state and methods to all children
 * using React Context
 */
export const AuthProviderRefactored: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Use a ref to maintain a single instance of auth service to prevent recreation on renders
  const authServiceRef = useRef<AuthService>(new AuthService());
  
  /**
   * Function to check if the user has a specific role
   */
  const hasRole = useCallback((role: string): boolean => {
    if (!authState || !authState.isLoggedIn) {
      return false;
    }
    
    return authState.availableRoles.includes(role);
  }, [authState]);
  
  /**
   * Function to attempt login
   * 
   * @param pubkey - The Nostr public key
   * @param secondParam - Can be either a signed message string or a boolean indicating test mode
   * @returns The authentication state
   */
  const login = useCallback(async (pubkey: UserRole, secondParam: string | boolean): Promise<AuthState> => {
    setIsLoading(true);
    try {
      // Determine if this is a test mode login
      const isTestMode = typeof secondParam === 'boolean' ? secondParam : 
                       (typeof secondParam === 'string' && secondParam === 'true');
      
      let newAuthState: AuthState;
      
      if (isTestMode) {
        // Use the login method but indicate it's a test login
        newAuthState = await authServiceRef.current.login(pubkey, 'TEST_MODE');
      } else {
        // Regular login with signed message
        newAuthState = await authServiceRef.current.login(pubkey, secondParam as string);
      }
      
      setAuthState(newAuthState);
      logger.log('Login logful, roles:', newAuthState.availableRoles);
      setIsLoading(false);
      return newAuthState;
    } catch (error) {
      setIsLoading(false);
      logger.log('Login error:', error);
      throw error;
    }
  }, []);
  
  /**
   * Function to log out
   */
  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      // The logout method now handles redirection directly, 
      // cleaning localStorage and redirecting to /login
      await authServiceRef.current.logout();
      setAuthState(null);
      logger.log('Logout logful');
      
      // No need to clean localStorage or navigate here as authService.logout does that now
      // This prevents double cleanup or competing navigation attempts
      
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      logger.log('Logout error:', error);
      
      // Even on error, we should remove the auth state
      setAuthState(null);
      
      // Force redirect to login page even on error
      if (typeof window !== 'undefined') {
        logger.log('Forcing redirect to login page after logout error');
        window.location.href = '/login';
      }
    }
  }, []);
  
  /**
   * Function to refresh the user's roles
   */
  const refreshRoles = useCallback(async (pubkey: string): Promise<AuthState> => {
    setIsLoading(true);
    try {
      const newAuthState = await authServiceRef.current.refreshRoles(pubkey);
      setAuthState(newAuthState);
      logger.log('Roles refreshed, new roles:', newAuthState.availableRoles);
      setIsLoading(false);
      return newAuthState;
    } catch (error) {
      setIsLoading(false);
      logger.log('Refresh roles error:', error);
      throw error;
    }
  }, []);
  
  /**
   * Function to add a role to the user
   */
  const addRole = useCallback(async (pubkey: UserRole, role: string): Promise<boolean> => {
    // Skip if no auth state or not the current user
    if (!authState || !authState.isLoggedIn || authState.pubkey !== pubkey) {
      return false;
    }
    
    // Skip if role already exists
    if (authState.availableRoles.includes(role)) {
      return true;
    }
    
    setIsLoading(true);
    try {
      // Make API call to add role
      const response = await fetch(`/api/users/roles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          pubkey,
          role 
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add role');
      }
      
      const data = await response.json();
      
      if (data.log) {
        // Update local state
        setAuthState(prevState => {
          if (!prevState) return null;
          return {
            ...prevState,
            availableRoles: [...prevState.availableRoles, role],
          };
        });
        
        logger.log(`Role ${role} added logfully`);
        setIsLoading(false);
        return true;
      }
      
      setIsLoading(false);
      return false;
    } catch (error) {
      setIsLoading(false);
      logger.log('Add role error:', error);
      return false;
    }
  }, [authState]);
  
  /**
   * Function to remove a role from the user
   */
  const removeRole = useCallback(async (pubkey: UserRole, role: string): Promise<boolean> => {
    // Skip if no auth state or not the current user
    if (!authState || !authState.isLoggedIn || authState.pubkey !== pubkey) {
      return false;
    }
    
    // Skip if role doesn't exist
    if (!authState.availableRoles.includes(role)) {
      return true;
    }
    
    setIsLoading(true);
    try {
      // Make API call to remove role
      const response = await fetch(`/api/users/roles`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          pubkey,
          role 
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove role');
      }
      
      const data = await response.json();
      
      if (data.log) {
        // Update local state
        setAuthState(prevState => {
          if (!prevState) return null;
          return {
            ...prevState,
            availableRoles: prevState.availableRoles.filter(r => r !== role),
          };
        });
        
        logger.log(`Role ${role} removed logfully`);
        setIsLoading(false);
        return true;
      }
      
      setIsLoading(false);
      return false;
    } catch (error) {
      setIsLoading(false);
      logger.log('Remove role error:', error);
      return false;
    }
  }, [authState]);
  
  /**
   * Check authentication status on mount
   */
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const authStatus = await authServiceRef.current.checkAuth();
        
        // Only update state if we got a valid auth status back
        if (authStatus) {
          setAuthState(authStatus);
          
          // If we have a test mode user, we might want to set localStorage 
          // to help with persistence (matching old implementation)
          if (authStatus.isTestMode && typeof window !== 'undefined') {
            localStorage.setItem('isTestMode', 'true');
          }
        } else {
          // If no auth status was returned, treat as logged out
          setAuthState(null);
        }
      } catch (error) {
        // Log the error but don't crash
        logger.log('Auth check error:', error);
        // Set auth state to null to avoid infinite loading states
        setAuthState(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);
  
  /**
   * The value to provide to consumers
   */
  const authContextValue: AuthStateContext = {
    authState,
    login,
    logout,
    hasRole,
    refreshRoles,
    addRole,
    removeRole,
    isLoading,
  };
  
  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};