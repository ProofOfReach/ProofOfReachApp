/**
 * Phase 2: Supabase Authentication Service
 * 
 * Runs alongside current authentication system for safe parallel operation
 * during the migration process.
 */

import { supabase } from '../supabase/client';
import type { UserRole } from '../../context/RoleContext';

export interface SupabaseAuthState {
  isAuthenticated: boolean;
  user: any | null;
  pubkey: string | null;
  roles: UserRole[];
  isTestMode: boolean;
}

export class SupabaseAuthService {
  private static instance: SupabaseAuthService;
  private authState: SupabaseAuthState = {
    isAuthenticated: false,
    user: null,
    pubkey: null,
    roles: ['viewer'],
    isTestMode: false,
  };

  private listeners: Array<(state: SupabaseAuthState) => void> = [];

  static getInstance(): SupabaseAuthService {
    if (!SupabaseAuthService.instance) {
      SupabaseAuthService.instance = new SupabaseAuthService();
    }
    return SupabaseAuthService.instance;
  }

  constructor() {
    this.initializeAuthListener();
  }

  private initializeAuthListener() {
    // Listen for Supabase auth state changes
    supabase.auth.onAuthStateChange((event: any, session: any) => {
      console.log('[Supabase Auth] State change:', event, session?.user?.id);
      
      if (session?.user) {
        this.updateAuthState({
          isAuthenticated: true,
          user: session.user,
          pubkey: session.user.user_metadata?.pubkey || null,
          roles: session.user.user_metadata?.roles || ['viewer'],
          isTestMode: session.user.user_metadata?.isTestMode || false,
        });
      } else {
        this.updateAuthState({
          isAuthenticated: false,
          user: null,
          pubkey: null,
          roles: ['viewer'],
          isTestMode: false,
        });
      }
    });
  }

  private updateAuthState(newState: SupabaseAuthState) {
    this.authState = { ...newState };
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.authState));
  }

  subscribe(listener: (state: SupabaseAuthState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  get state(): SupabaseAuthState {
    return { ...this.authState };
  }

  /**
   * Check current authentication status
   */
  async checkAuth(): Promise<SupabaseAuthState> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.warn('[Supabase Auth] Error checking auth:', error.message);
        return this.authState;
      }

      if (user) {
        this.updateAuthState({
          isAuthenticated: true,
          user,
          pubkey: user.user_metadata?.pubkey || null,
          roles: user.user_metadata?.roles || ['viewer'],
          isTestMode: user.user_metadata?.isTestMode || false,
        });
      }

      return this.authState;
    } catch (error) {
      console.warn('[Supabase Auth] Network error during auth check:', error);
      return this.authState;
    }
  }

  /**
   * Login with Nostr pubkey using Supabase
   */
  async loginWithPubkey(pubkey: string, isTestMode = false): Promise<boolean> {
    try {
      // For Supabase, we'll use a special email format for Nostr users
      const email = `${pubkey}@nostr.local`;
      const password = `nostr_${pubkey}_auth`; // Deterministic password based on pubkey

      // First try to sign in
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
              isTestMode,
              roles: isTestMode ? ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'] : ['viewer'],
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
        console.log('[Supabase Auth] Login successful for pubkey:', pubkey);
        return true;
      }

      return false;
    } catch (error) {
      console.error('[Supabase Auth] Login failed:', error);
      return false;
    }
  }

  /**
   * Logout from Supabase
   */
  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.warn('[Supabase Auth] Logout error:', error.message);
      } else {
        console.log('[Supabase Auth] Logout successful');
      }
    } catch (error) {
      console.warn('[Supabase Auth] Network error during logout:', error);
    }
  }

  /**
   * Update user roles in Supabase
   */
  async updateUserRoles(roles: UserRole[]): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return false;

      const { error } = await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          roles,
        }
      });

      if (error) {
        console.error('[Supabase Auth] Error updating roles:', error.message);
        return false;
      }

      return true;
    } catch (error) {
      console.error('[Supabase Auth] Network error updating roles:', error);
      return false;
    }
  }

  /**
   * Sync current auth state with existing system
   */
  async syncWithCurrentAuth(currentAuthState: any): Promise<void> {
    if (!currentAuthState?.isLoggedIn || !currentAuthState?.pubkey) {
      return;
    }

    // If current system is authenticated but Supabase isn't, sync them
    if (!this.authState.isAuthenticated) {
      console.log('[Supabase Auth] Syncing with current auth system');
      await this.loginWithPubkey(currentAuthState.pubkey, currentAuthState.isTestMode);
    }
  }
}

// Export singleton instance
export const supabaseAuthService = SupabaseAuthService.getInstance();