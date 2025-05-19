import { useState, useEffect, createContext, useContext } from 'react';
import UserManager from '../models/user';
import { UserRole } from '../context/RoleContext';

// Auth context state type
export interface AuthState {
  pubkey: string;
  isLoggedIn: boolean;
  isTestMode: boolean;
  availableRoles: UserRole[];
  profile: {
    name?: string;
    displayName?: string;
    avatar?: string;
  } | null;
}

// Create auth context
export const AuthContext = createContext<{
  auth: AuthState | null;
  login: (pubkey: string, isTest?: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshRoles: () => Promise<UserRole[]>;
  addRole: (role: UserRole) => Promise<boolean>;
  removeRole: (role: UserRole) => Promise<boolean>;
}>({
  auth: null,
  login: async () => false,
  logout: async () => {},
  refreshRoles: async () => ['viewer'],
  addRole: async () => false,
  removeRole: async () => false,
});

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

// Auth provider implementation
export const useAuthProvider = () => {
  const [auth, setAuth] = useState<AuthState | null>(null);

  // Initialize auth from stored credentials or API
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if already authenticated
        const response = await fetch('/api/auth/check');
        const data = await response.json();
        
        if (data.authenticated && data.pubkey) {
          // Check if this is a test mode pubkey
          const isTestMode = await UserManager.isTestMode(data.pubkey);
          
          // Get available roles for this user
          const userRoles = await UserManager.getUserRoles(data.pubkey);
          
          // Convert string[] to UserRole[]
          const availableRoles: UserRole[] = userRoles.filter(
            (role): role is UserRole => role === 'user' || role === 'advertiser' || role === 'publisher' || 
                                       role === 'admin' || role === 'stakeholder'
          );
          
          // In test mode, ensure all roles are available
          if (isTestMode) {
            console.log("Detected test mode, enabling all roles...");
            // Save test mode status to localStorage to help with persistence
            localStorage.setItem('isTestMode', 'true');
            // Call enhanced enableAllRolesForTestUser which now handles both enabling via API endpoints
            const success = await UserManager.enableAllRolesForTestUser(data.pubkey);
            console.log("Enable all roles result:", success ? "Success" : "Failed");
          } else {
            localStorage.removeItem('isTestMode');
          }
          
          // Get profile info
          const profile = await UserManager.getUserProfile(data.pubkey);
          
          setAuth({
            pubkey: data.pubkey,
            isLoggedIn: true,
            isTestMode,
            availableRoles: isTestMode ? ['user', 'advertiser', 'publisher', 'admin', 'stakeholder'] : availableRoles,
            profile: profile ? {
              name: profile.name,
              displayName: profile.displayName,
              avatar: profile.avatar,
            } : null,
          });
        } else {
          setAuth({
            pubkey: '',
            isLoggedIn: false,
            isTestMode: false,
            availableRoles: ['user'],
            profile: null,
          });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setAuth({
          pubkey: '',
          isLoggedIn: false,
          isTestMode: false,
          availableRoles: ['user'],
          profile: null,
        });
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (pubkey: string, isTest = false): Promise<boolean> => {
    try {
      // Actual login call to the API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pubkey, isTest }),
      });
      
      if (!response.ok) return false;
      
      // Get available roles for this user
      const userRoles = await UserManager.getUserRoles(pubkey);
      
      // Convert string[] to UserRole[]
      const availableRoles: UserRole[] = userRoles.filter(
        (role): role is UserRole => role === 'user' || role === 'advertiser' || role === 'publisher' || 
                                   role === 'admin' || role === 'stakeholder'
      );
      
      // In test mode, ensure all roles are available
      if (isTest) {
        console.log("Test mode login, enabling all roles...");
        // Save test mode status to localStorage to help with persistence
        localStorage.setItem('isTestMode', 'true');
        // Call enhanced enableAllRolesForTestUser which now handles both enabling via API endpoints
        const success = await UserManager.enableAllRolesForTestUser(pubkey);
        console.log("Enable all roles result:", success ? "Success" : "Failed");
      } else {
        localStorage.removeItem('isTestMode');
      }
      
      // Get profile info
      const profile = await UserManager.getUserProfile(pubkey);
      
      setAuth({
        pubkey,
        isLoggedIn: true,
        isTestMode: isTest,
        availableRoles: isTest ? ['user', 'advertiser', 'publisher', 'admin', 'stakeholder'] : availableRoles,
        profile: profile ? {
          name: profile.name,
          displayName: profile.displayName,
          avatar: profile.avatar,
        } : null,
      });
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      // Call backend logout endpoint to clear server-side session
      await fetch('/api/auth/logout', { method: 'POST' });
      
      // Clear all auth-related data from localStorage
      localStorage.removeItem('userRole');
      
      // Reset role to user in database via our new API
      try {
        await fetch('/api/user/role', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ role: 'user' }),
        });
      } catch (e) {
        console.error('Failed to reset role during logout:', e);
      }
      
      // Clean up test mode storage if present
      if (typeof window !== 'undefined') {
        if (localStorage.getItem('nostr_test_nsec')) {
          localStorage.removeItem('nostr_test_nsec');
        }
        if (localStorage.getItem('nostr_test_npub')) {
          localStorage.removeItem('nostr_test_npub');
        }
      }
      
      // Reset auth state completely
      setAuth({
        pubkey: '',
        isLoggedIn: false,
        isTestMode: false,
        availableRoles: ['user'],
        profile: null,
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  // Refresh roles
  const refreshRoles = async (): Promise<UserRole[]> => {
    if (!auth || !auth.isLoggedIn) return ['user'];
    
    try {
      // For test mode, always enable all roles
      if (auth.isTestMode) {
        console.log("Refreshing roles for test mode user...");
        const success = await UserManager.enableAllRolesForTestUser(auth.pubkey);
        console.log("Refresh roles result:", success ? "Success" : "Failed");
        
        const allRoles: UserRole[] = ['user', 'advertiser', 'publisher', 'admin', 'stakeholder'];
        
        setAuth({
          ...auth,
          availableRoles: allRoles,
        });
        
        return allRoles;
      }
      
      // For normal mode, get roles from API
      const userRoles = await UserManager.getUserRoles(auth.pubkey);
      
      // Convert string[] to UserRole[]
      const availableRoles: UserRole[] = userRoles.filter(
        (role): role is UserRole => role === 'user' || role === 'advertiser' || role === 'publisher' || 
                                   role === 'admin' || role === 'stakeholder'
      );
      
      setAuth({
        ...auth,
        availableRoles,
      });
      
      return availableRoles;
    } catch (error) {
      console.error('Failed to refresh roles:', error);
      return auth.availableRoles;
    }
  };
  
  // Add role
  const addRole = async (role: UserRole): Promise<boolean> => {
    if (!auth || !auth.isLoggedIn) return false;
    
    // Skip if role already exists
    if (auth.availableRoles.includes(role)) return true;
    
    // Add role via API
    const success = await UserManager.addRoleToUser(auth.pubkey, role);
    
    if (success) {
      setAuth({
        ...auth,
        availableRoles: [...auth.availableRoles, role],
      });
    }
    
    return success;
  };
  
  // Remove role
  const removeRole = async (role: UserRole): Promise<boolean> => {
    if (!auth || !auth.isLoggedIn) return false;
    
    // Can't remove the user role
    if (role === 'user') return false;
    
    // Skip if role doesn't exist
    if (!auth.availableRoles.includes(role)) return true;
    
    // Remove role via API
    const success = await UserManager.removeRoleFromUser(auth.pubkey, role);
    
    if (success) {
      setAuth({
        ...auth,
        availableRoles: auth.availableRoles.filter(r => r !== role),
      });
    }
    
    return success;
  };

  return { 
    auth, 
    login, 
    logout, 
    refreshRoles,
    addRole,
    removeRole,
  };
};

export default useAuth;