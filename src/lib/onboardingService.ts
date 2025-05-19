import { UserRole } from '@/types/auth';
import { logger } from './logger';

/**
 * Service for managing onboarding state and redirections
 */
export const OnboardingService = {
  /**
   * Check if a user has completed onboarding
   * @param pubkey The user's public key
   * @param role The role to check onboarding status for
   * @returns Promise resolving to true if onboarding is complete, false otherwise
   */
  isOnboardingComplete: async (pubkey: string, role: UserRole): Promise<boolean> => {
    try {
      // Check localStorage first for client-side onboarding status
      if (typeof window !== 'undefined') {
        const key = `nostr-ads:onboarding:${pubkey}:${role}`;
        return localStorage.getItem(key) === 'complete';
      }
      return false;
    } catch (error) {
      logger.error('Error checking onboarding status:', error);
      return false;
    }
  },

  /**
   * Mark onboarding as complete for a user and role
   * @param pubkey The user's public key
   * @param role The role to mark as complete
   */
  markOnboardingComplete: async (pubkey: string, role: UserRole): Promise<void> => {
    try {
      if (typeof window !== 'undefined') {
        const key = `nostr-ads:onboarding:${pubkey}:${role}`;
        localStorage.setItem(key, 'complete');
        logger.log(`Onboarding marked complete for role: ${role}`);
      }
    } catch (error) {
      logger.error('Error marking onboarding complete:', error);
    }
  },

  /**
   * Reset onboarding status for a user and role
   * @param pubkey The user's public key
   * @param role The role to reset onboarding for (optional - if not provided, resets all roles)
   */
  resetOnboardingStatus: async (pubkey: string, role?: UserRole): Promise<void> => {
    try {
      if (typeof window !== 'undefined') {
        if (role) {
          // Reset specific role
          const key = `nostr-ads:onboarding:${pubkey}:${role}`;
          localStorage.removeItem(key);
          logger.log(`Onboarding reset for role: ${role}`);
        } else {
          // Reset all roles
          const rolesToReset: UserRole[] = ['viewer', 'publisher', 'advertiser', 'admin'];
          rolesToReset.forEach(r => {
            const key = `nostr-ads:onboarding:${pubkey}:${r}`;
            localStorage.removeItem(key);
          });
          logger.log('Onboarding reset for all roles');
        }
      }
    } catch (error) {
      logger.error('Error resetting onboarding status:', error);
    }
  },

  /**
   * Get the appropriate redirect URL after login
   * @param pubkey The user's public key
   * @param role The user's current role
   * @returns Promise resolving to the URL to redirect to
   */
  getPostLoginRedirectUrl: async (pubkey: string, role: UserRole): Promise<string> => {
    try {
      // Check if user has completed onboarding for their role
      const isComplete = await OnboardingService.isOnboardingComplete(pubkey, role);
      
      if (!isComplete) {
        // Direct to onboarding if not complete
        return '/onboarding';
      }
      
      // Otherwise, redirect to the appropriate dashboard
      switch (role) {
        case 'viewer':
          return '/dashboard/viewer';
        case 'publisher':
          return '/dashboard/publisher';
        case 'advertiser':
          return '/dashboard/advertiser';
        case 'admin':
          return '/dashboard/admin';
        default:
          return '/dashboard';
      }
    } catch (error) {
      logger.error('Error getting post-login redirect URL:', error);
      return '/dashboard'; // Fallback to dashboard on error
    }
  }
};

export default OnboardingService;