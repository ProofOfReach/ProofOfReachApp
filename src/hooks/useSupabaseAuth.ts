/**
 * Phase 4: Full Supabase Authentication Hook
 * 
 * Complete replacement of current auth system with enterprise-grade Supabase
 * authentication for your decentralized ad marketplace.
 */

import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase/client';
import type { UserRole } from '../context/RoleContext';

export interface SupabaseAuthState {
  pubkey: string;
  isLoggedIn: boolean;
  isTestMode: boolean;
  availableRoles: UserRole[];
  profile: {
    name?: string;
    displayName?: string;
    avatar?: string;
  } | null;
  user: any | null;
  session: any | null;
}

// Supabase Auth Context
export const SupabaseAuthContext = createContext<{
  auth: SupabaseAuthState | null;
  user: any | null;
  session: any | null;
  login: (pubkey: UserRole, isTest?: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  signUp: (credentials: any) => Promise<any>;
  signInWithPassword: (credentials: any) => Promise<any>;
  signOut: () => Promise<void>;
  refreshRoles: () => Promise<UserRole[]>;
  addRole: (role: string) => Promise<boolean>;
  removeRole: (role: string) => Promise<boolean>;
}>({
  auth: null,
  user: null,
  session: null,
  login: async () => false,
  logout: async () => {},
  signUp: async () => ({ data: null, error: null }),
  signInWithPassword: async () => ({ data: null, error: null }),
  signOut: async () => {},
  refreshRoles: async () => ['viewer'],
  addRole: async () => false,
  removeRole: async () => false,
});

// Supabase Auth Hook
export const useSupabaseAuth = () => useContext(SupabaseAuthContext);

// Supabase Auth Provider Implementation
export const useSupabaseAuthProvider = () => {
  const [auth, setAuth] = useState<SupabaseAuthState | null>(null);

  // Initialize and check authentication status
  useEffect(() => {
    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[Supabase Auth] State change:', event);
        if (session?.user) {
          await updateAuthFromSession(session);
        } else {
          setAuth(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const updateAuthFromSession = async (session: any) => {
    const user = session.user;
    const metadata = user.user_metadata || {};

    setAuth({
      pubkey: metadata.pubkey || '',
      isLoggedIn: true,
      isTestMode: metadata.isTestMode || false,
      availableRoles: metadata.roles || ['viewer'],
      profile: metadata.profile || null,
      user,
    });
  };

  const checkAuth = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.warn('[Supabase Auth] Error checking auth:', error.message);
        setAuth(null);
        return;
      }

      if (user) {
        const metadata = user.user_metadata || {};
        setAuth({
          pubkey: metadata.pubkey || '',
          isLoggedIn: true,
          isTestMode: metadata.isTestMode || false,
          availableRoles: metadata.roles || ['viewer'],
          profile: metadata.profile || null,
          user,
        });
      } else {
        setAuth(null);
      }
    } catch (error) {
      console.error('[Supabase Auth] Auth check failed:', error);
      setAuth(null);
    }
  };

  const login = async (pubkey: UserRole, isTest = false): Promise<boolean> => {
    try {
      const email = `${pubkey}@nostr.local`;
      const password = `nostr_${pubkey}_auth`;

      // Try to sign in first
      let { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // If user doesn't exist, create them
      if (error && error.message.includes('Invalid login credentials')) {
        console.log('[Supabase Auth] Creating new user for pubkey:', pubkey);
        
        const signUpResult = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              pubkey,
              isTestMode: isTest,
              roles: isTest ? ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'] : ['viewer'],
              profile: {
                name: `User ${pubkey.slice(0, 8)}`,
                displayName: `User ${pubkey.slice(0, 8)}`,
                avatar: null,
              },
            }
          }
        });

        if (signUpResult.error) {
          console.error('[Supabase Auth] Sign up error:', signUpResult.error.message);
          return false;
        }

        data = signUpResult.data;
      } else if (error) {
        console.error('[Supabase Auth] Sign in error:', error.message);
        return false;
      }

      if (data.user) {
        console.log('[Supabase Auth] Login successful');
        
        // Store test mode preference
        if (isTest) {
          localStorage.setItem('isTestMode', 'true');
        } else {
          localStorage.removeItem('isTestMode');
        }
        
        return true;
      }

      return false;
    } catch (error) {
      console.error('[Supabase Auth] Login failed:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.warn('[Supabase Auth] Logout error:', error.message);
      } else {
        console.log('[Supabase Auth] Logout successful');
        localStorage.removeItem('isTestMode');
        setAuth(null);
      }
    } catch (error) {
      console.error('[Supabase Auth] Logout failed:', error);
    }
  };

  const refreshRoles = async (): Promise<UserRole[]> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.roles) {
        return user.user_metadata.roles;
      }
      return ['viewer'];
    } catch (error) {
      console.error('[Supabase Auth] Error refreshing roles:', error);
      return ['viewer'];
    }
  };

  const addRole = async (role: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const currentRoles = user.user_metadata?.roles || ['viewer'];
      const updatedRoles = [...new Set([...currentRoles, role])];

      const { error } = await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          roles: updatedRoles,
        }
      });

      if (error) {
        console.error('[Supabase Auth] Error adding role:', error.message);
        return false;
      }

      // Update local state
      if (auth) {
        setAuth({
          ...auth,
          availableRoles: updatedRoles,
        });
      }

      return true;
    } catch (error) {
      console.error('[Supabase Auth] Error adding role:', error);
      return false;
    }
  };

  const removeRole = async (role: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const currentRoles = user.user_metadata?.roles || ['viewer'];
      const updatedRoles = currentRoles.filter((r: string) => r !== role);

      // Ensure at least viewer role remains
      if (updatedRoles.length === 0) {
        updatedRoles.push('viewer');
      }

      const { error } = await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          roles: updatedRoles,
        }
      });

      if (error) {
        console.error('[Supabase Auth] Error removing role:', error.message);
        return false;
      }

      // Update local state
      if (auth) {
        setAuth({
          ...auth,
          availableRoles: updatedRoles,
        });
      }

      return true;
    } catch (error) {
      console.error('[Supabase Auth] Error removing role:', error);
      return false;
    }
  };

  return {
    auth,
    user: auth?.user || null,
    session: auth?.session || null,
    login,
    logout,
    signUp: async (credentials: any) => {
      return await supabase.auth.signUp(credentials);
    },
    signInWithPassword: async (credentials: any) => {
      return await supabase.auth.signInWithPassword(credentials);
    },
    signOut: async () => {
      await logout();
    },
    refreshRoles,
    addRole,
    removeRole,
  };
};