/**
 * Client-side onboarding service
 * This file provides a client-safe API for onboarding functionality
 */

import '@/types/role';
import '@/lib/logger';

// This service wraps the API calls needed for onboarding
// instead of directly importing server-side code
const clientOnboardingService = {
  /**
   * Get the current onboarding status for a user and role
   */
  async getOnboardingStatus(pubkey: UserRole, role: string) {
    try {
      const response = await fetch(`/api/onboarding/status?pubkey=${encodeURIComponent(pubkey)}&role=${encodeURIComponent(role)}`);
      if (!response.ok) {
        throw new Error(`Failed to get onboarding status: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      logger.log('Error getting onboarding status', { error, pubkey, role });
      return { isComplete: false, currentStep: null, lastStep: null };
    }
  },

  /**
   * Update the onboarding progress
   */
  async updateOnboardingProgress(pubkey: UserRole, role: UserRole, data: any) {
    try {
      const response = await fetch('/api/onboarding/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pubkey, role, ...data }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update onboarding progress: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      logger.log('Error updating onboarding progress', { error, pubkey, role });
      throw error;
    }
  },

  /**
   * Complete the onboarding process for a user and role
   */
  async completeOnboarding(pubkey: UserRole, role: string) {
    try {
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pubkey, role }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to complete onboarding: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      logger.log('Error completing onboarding', { error, pubkey, role });
      throw error;
    }
  },

  /**
   * Reset the onboarding process for a user and role
   */
  async resetOnboarding(pubkey: UserRole, role: string) {
    try {
      const response = await fetch('/api/onboarding/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pubkey, role }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to reset onboarding: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      logger.log('Error resetting onboarding', { error, pubkey, role });
      throw error;
    }
  }
};

export default clientOnboardingService;