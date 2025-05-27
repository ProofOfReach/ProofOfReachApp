/**
 * Phase 2: Hybrid Authentication Hook
 * 
 * Safely runs both current and Supabase authentication systems in parallel
 * during the migration process, with fallback to current system.
 */

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabaseAuthService } from '../lib/auth/supabaseAuthService';
import type { UserRole } from '../context/RoleContext';
import type { AuthState } from './useAuth';

interface HybridAuthState extends AuthState {
  supabaseReady: boolean;
  migrationPhase: 'current' | 'parallel' | 'supabase';
}

export function useHybridAuth() {
  const currentAuth = useAuth();
  const [supabaseState, setSupabaseState] = useState(supabaseAuthService.state);
  const [hybridState, setHybridState] = useState<HybridAuthState | null>(null);

  // Feature flag for enabling Supabase (can be controlled via environment variable)
  const enableSupabase = process.env.NEXT_PUBLIC_ENABLE_SUPABASE_AUTH === 'true';

  useEffect(() => {
    // Subscribe to Supabase auth changes
    const unsubscribe = supabaseAuthService.subscribe((state) => {
      setSupabaseState(state);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    // Sync Supabase with current auth when current auth changes
    if (enableSupabase && currentAuth.auth?.isLoggedIn && currentAuth.auth?.pubkey) {
      supabaseAuthService.syncWithCurrentAuth(currentAuth.auth);
    }

    // Update hybrid state based on current auth (primary) and Supabase (secondary)
    if (currentAuth.auth) {
      setHybridState({
        ...currentAuth.auth,
        supabaseReady: enableSupabase && supabaseState.isAuthenticated,
        migrationPhase: enableSupabase ? 'parallel' : 'current',
      });
    } else {
      setHybridState(null);
    }
  }, [currentAuth.auth, supabaseState, enableSupabase]);

  const hybridLogin = async (pubkey: UserRole, isTest = false): Promise<boolean> => {
    // Always use current auth system as primary
    const success = await currentAuth.login(pubkey, isTest);
    
    // If successful and Supabase is enabled, also authenticate with Supabase
    if (success && enableSupabase) {
      try {
        await supabaseAuthService.loginWithPubkey(pubkey, isTest);
        console.log('[Hybrid Auth] Both systems authenticated successfully');
      } catch (error) {
        console.warn('[Hybrid Auth] Supabase auth failed, continuing with current system:', error);
      }
    }
    
    return success;
  };

  const hybridLogout = async (): Promise<void> => {
    // Logout from both systems
    await currentAuth.logout();
    
    if (enableSupabase) {
      try {
        await supabaseAuthService.logout();
        console.log('[Hybrid Auth] Logged out from both systems');
      } catch (error) {
        console.warn('[Hybrid Auth] Supabase logout failed:', error);
      }
    }
  };

  const updateRoles = async (roles: UserRole[]): Promise<boolean> => {
    // Update roles in current system
    let success = false;
    
    if (currentAuth.addRole && currentAuth.removeRole) {
      // Add new roles
      for (const role of roles) {
        try {
          await currentAuth.addRole(role);
          success = true;
        } catch (error) {
          console.warn(`[Hybrid Auth] Failed to add role ${role}:`, error);
        }
      }
    }

    // Also update in Supabase if enabled
    if (enableSupabase && success) {
      try {
        await supabaseAuthService.updateUserRoles(roles);
        console.log('[Hybrid Auth] Roles updated in both systems');
      } catch (error) {
        console.warn('[Hybrid Auth] Supabase role update failed:', error);
      }
    }

    return success;
  };

  return {
    // Hybrid state (current system is authoritative)
    auth: hybridState,
    
    // Authentication methods
    login: hybridLogin,
    logout: hybridLogout,
    
    // Role management
    refreshRoles: currentAuth.refreshRoles,
    updateRoles,
    
    // Migration status
    isSupabaseReady: enableSupabase && supabaseState.isAuthenticated,
    migrationPhase: hybridState?.migrationPhase || 'current',
    
    // Individual system states for debugging
    currentAuth: currentAuth.auth,
    supabaseAuth: supabaseState,
  };
}

// Migration utility to check if user should be migrated to Supabase
export function shouldMigrateUser(authState: AuthState | null): boolean {
  if (!authState?.isLoggedIn) return false;
  
  // Could add logic here for gradual migration:
  // - Migrate test users first
  // - Migrate based on user creation date
  // - Migrate based on feature flags
  
  return authState.isTestMode; // Start with test users for safety
}

// Utility to verify both systems are in sync
export async function verifyAuthSync(): Promise<{
  inSync: boolean;
  currentAuth: any;
  supabaseAuth: any;
  differences: string[];
}> {
  const currentState = useAuth();
  const supabaseState = supabaseAuthService.state;
  
  const differences: string[] = [];
  
  if (currentState.auth?.isLoggedIn !== supabaseState.isAuthenticated) {
    differences.push('Authentication status mismatch');
  }
  
  if (currentState.auth?.pubkey !== supabaseState.pubkey) {
    differences.push('User pubkey mismatch');
  }
  
  if (currentState.auth?.isTestMode !== supabaseState.isTestMode) {
    differences.push('Test mode status mismatch');
  }
  
  return {
    inSync: differences.length === 0,
    currentAuth: currentState.auth,
    supabaseAuth: supabaseState,
    differences,
  };
}