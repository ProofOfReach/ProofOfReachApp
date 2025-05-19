import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types/auth';
import { logger } from '@/lib/logger';
import { errorService } from '@/lib/errorService';
import { ApiError } from '@/utils/apiError';

/**
 * Service for managing onboarding state and redirections
 */
const OnboardingService = {
  /**
   * Check if a user has completed onboarding
   * @param pubkey The user's public key
   * @param role The role to check onboarding status for
   * @returns Promise resolving to true if onboarding is complete, false otherwise
   */
  isOnboardingComplete: async (pubkey: string, role: UserRole): Promise<boolean> => {
    try {
      if (!pubkey) {
        logger.warn('Cannot check onboarding status: No pubkey provided');
        return false;
      }

      const onboardingStatus = await prisma.userOnboarding.findFirst({
        where: {
          userPubkey: pubkey,
          role: role,
        },
      });

      return !!onboardingStatus?.isComplete;
    } catch (error) {
      errorService.reportError({
        error,
        context: {
          operation: 'isOnboardingComplete',
          pubkey,
          role,
        },
        message: 'Failed to check onboarding status',
      });
      
      // Default to false on error to ensure user can go through onboarding
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
      if (!pubkey) {
        logger.warn('Cannot complete onboarding: No pubkey provided');
        return;
      }

      await prisma.userOnboarding.upsert({
        where: {
          userPubkey_role: {
            userPubkey: pubkey,
            role: role,
          },
        },
        update: {
          isComplete: true,
          completedAt: new Date(),
        },
        create: {
          userPubkey: pubkey,
          role: role,
          isComplete: true,
          completedAt: new Date(),
        },
      });

      logger.debug(`Onboarding completed for user ${pubkey} with role ${role}`);
    } catch (error) {
      errorService.reportError({
        error,
        context: {
          operation: 'markOnboardingComplete',
          pubkey,
          role,
        },
        message: 'Failed to complete onboarding',
      });
    }
  },

  /**
   * Reset onboarding status for a user and role
   * @param pubkey The user's public key
   * @param role The role to reset onboarding for (optional - if not provided, resets all roles)
   */
  resetOnboardingStatus: async (pubkey: string, role?: UserRole): Promise<void> => {
    try {
      if (!pubkey) {
        logger.warn('Cannot reset onboarding: No pubkey provided');
        return;
      }

      if (role) {
        // Reset specific role
        await prisma.userOnboarding.upsert({
          where: {
            userPubkey_role: {
              userPubkey: pubkey,
              role: role,
            },
          },
          update: {
            isComplete: false,
            completedAt: null,
          },
          create: {
            userPubkey: pubkey,
            role: role,
            isComplete: false,
          },
        });

        logger.debug(`Onboarding reset for user ${pubkey} with role ${role}`);
      } else {
        // Reset all roles
        await prisma.userOnboarding.updateMany({
          where: {
            userPubkey: pubkey,
          },
          data: {
            isComplete: false,
            completedAt: null,
          },
        });

        logger.debug(`Onboarding reset for all roles of user ${pubkey}`);
      }
    } catch (error) {
      errorService.reportError({
        error,
        context: {
          operation: 'resetOnboardingStatus',
          pubkey,
          role,
        },
        message: 'Failed to reset onboarding status',
      });
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
      if (!pubkey) {
        logger.warn('Cannot determine redirect URL: No pubkey provided');
        return '/dashboard';
      }

      const onboardingComplete = await OnboardingService.isOnboardingComplete(pubkey, role);

      if (onboardingComplete) {
        // If onboarding is complete, redirect to the appropriate dashboard
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
      } else {
        // If onboarding is not complete, redirect to the onboarding page
        return '/onboarding';
      }
    } catch (error) {
      errorService.reportError({
        error,
        context: {
          operation: 'getPostLoginRedirectUrl',
          pubkey,
          role,
        },
        message: 'Failed to determine redirect URL',
      });
      
      // Default to dashboard on error
      return '/dashboard';
    }
  }
};

export default OnboardingService;