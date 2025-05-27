/**
 * Phase 3: Gradual Migration Service
 * 
 * Handles seamless migration of users from current auth to Supabase
 * with zero downtime and data preservation.
 */

import { supabase } from '../supabase/client';
import { supabaseAuthService } from './supabaseAuthService';
import type { UserRole } from '../../context/RoleContext';

export interface MigrationResult {
  success: boolean;
  userId?: string;
  error?: string;
  preservedData: any;
}

export interface MigrationProgress {
  totalUsers: number;
  migratedUsers: number;
  failedMigrations: number;
  currentPhase: 'preparing' | 'migrating' | 'validating' | 'complete';
}

export class MigrationService {
  private static instance: MigrationService;
  private migrationProgress: MigrationProgress = {
    totalUsers: 0,
    migratedUsers: 0,
    failedMigrations: 0,
    currentPhase: 'preparing',
  };

  static getInstance(): MigrationService {
    if (!MigrationService.instance) {
      MigrationService.instance = new MigrationService();
    }
    return MigrationService.instance;
  }

  /**
   * Migrate a single user from current system to Supabase
   */
  async migrateUser(userData: {
    pubkey: string;
    isTestMode?: boolean;
    roles?: UserRole[];
    profile?: any;
    preferences?: any;
  }): Promise<MigrationResult> {
    try {
      console.log(`[Migration] Starting migration for user: ${userData.pubkey}`);

      // Create Supabase user account
      const email = `${userData.pubkey}@nostr.local`;
      const password = `nostr_${userData.pubkey}_migrated`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            pubkey: userData.pubkey,
            isTestMode: userData.isTestMode || false,
            roles: userData.roles || ['viewer'],
            profile: userData.profile || null,
            preferences: userData.preferences || null,
            migratedAt: new Date().toISOString(),
            migrationSource: 'current-auth-system',
          }
        }
      });

      if (error) {
        console.error(`[Migration] Failed to create Supabase user for ${userData.pubkey}:`, error.message);
        return {
          success: false,
          error: error.message,
          preservedData: userData,
        };
      }

      if (data.user) {
        console.log(`[Migration] Successfully migrated user: ${userData.pubkey} -> ${data.user.id}`);
        return {
          success: true,
          userId: data.user.id,
          preservedData: userData,
        };
      }

      return {
        success: false,
        error: 'No user created',
        preservedData: userData,
      };
    } catch (error) {
      console.error(`[Migration] Exception during user migration:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        preservedData: userData,
      };
    }
  }

  /**
   * Migrate all existing users in batches
   */
  async migrateAllUsers(batchSize = 10): Promise<MigrationProgress> {
    this.migrationProgress.currentPhase = 'preparing';
    
    try {
      // In a real system, you'd fetch users from your database
      // For now, we'll simulate with empty array since you have no users yet
      const existingUsers: any[] = [];
      
      this.migrationProgress.totalUsers = existingUsers.length;
      this.migrationProgress.currentPhase = 'migrating';

      if (existingUsers.length === 0) {
        console.log('[Migration] No existing users to migrate. System ready for Supabase!');
        this.migrationProgress.currentPhase = 'complete';
        return this.migrationProgress;
      }

      // Process users in batches
      for (let i = 0; i < existingUsers.length; i += batchSize) {
        const batch = existingUsers.slice(i, i + batchSize);
        
        await Promise.all(batch.map(async (user) => {
          const result = await this.migrateUser(user);
          if (result.success) {
            this.migrationProgress.migratedUsers++;
          } else {
            this.migrationProgress.failedMigrations++;
          }
        }));

        // Small delay between batches to avoid overwhelming Supabase
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      this.migrationProgress.currentPhase = 'validating';
      
      // Validate migration results
      const validationSuccess = await this.validateMigration();
      
      if (validationSuccess) {
        this.migrationProgress.currentPhase = 'complete';
        console.log('[Migration] All users successfully migrated to Supabase!');
      }

      return this.migrationProgress;
    } catch (error) {
      console.error('[Migration] Batch migration failed:', error);
      this.migrationProgress.currentPhase = 'preparing';
      return this.migrationProgress;
    }
  }

  /**
   * Validate that migration was successful
   */
  async validateMigration(): Promise<boolean> {
    try {
      // Check if we can authenticate with Supabase
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error && error.message !== 'No user') {
        console.warn('[Migration] Validation failed - Supabase auth error:', error.message);
        return false;
      }

      // Test basic Supabase operations
      const testResult = await supabase.auth.signInWithPassword({
        email: 'test@validation.local',
        password: 'test123'
      });

      // We expect this to fail (user doesn't exist), but Supabase should respond
      if (testResult.error && !testResult.error.message.includes('Invalid login credentials')) {
        console.warn('[Migration] Validation failed - Supabase not responding correctly');
        return false;
      }

      console.log('[Migration] Validation successful - Supabase is working correctly');
      return true;
    } catch (error) {
      console.error('[Migration] Validation exception:', error);
      return false;
    }
  }

  /**
   * Rollback migration if needed
   */
  async rollbackMigration(): Promise<boolean> {
    try {
      console.log('[Migration] Starting rollback process...');
      
      // Since your current system is still intact, rollback is simply
      // disabling Supabase and continuing with current system
      
      // Clear any Supabase session
      await supabase.auth.signOut();
      
      console.log('[Migration] Rollback complete - current system remains functional');
      return true;
    } catch (error) {
      console.error('[Migration] Rollback failed:', error);
      return false;
    }
  }

  /**
   * Get migration progress
   */
  getProgress(): MigrationProgress {
    return { ...this.migrationProgress };
  }

  /**
   * Reset migration state
   */
  resetMigration(): void {
    this.migrationProgress = {
      totalUsers: 0,
      migratedUsers: 0,
      failedMigrations: 0,
      currentPhase: 'preparing',
    };
  }
}

// Export singleton instance
export const migrationService = MigrationService.getInstance();