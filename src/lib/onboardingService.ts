import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { UserRoleType } from '@/types/role';

/**
 * Service for managing onboarding state and redirections
 */
const onboardingService = {
  /**
   * Check if a user has completed onboarding
   * @param pubkey The user's public key
   * @param role The role to check onboarding status for
   * @returns Promise resolving to true if onboarding is complete, false otherwise
   */
  isOnboardingComplete: async (pubkey: string, role: UserRoleType): Promise<boolean> => {
    try {
      // First, check if user exists - this check is optional as we'll handle missing 
      // user cases gracefully later
      try {
        const user = await prisma.user.findUnique({
          where: { nostrPubkey: pubkey }
        });

        if (!user) {
          logger.debug(`User with pubkey ${pubkey} not found when checking onboarding status, may be a new account`);
          // New account - don't exit early, continue to check onboarding record
        }
      } catch (userError) {
        // Just log the error but continue
        logger.debug(`Error checking user existence: ${userError instanceof Error ? userError.message : 'Unknown error'}`);
      }

      try {
        // Check if there's an onboarding record for this user and role
        const onboardingRecord = await prisma.userOnboarding.findUnique({
          where: {
            userPubkey_role: {
              userPubkey: pubkey,
              role: role
            }
          }
        });

        return !!onboardingRecord?.isComplete;
      } catch (dbError) {
        // If there's an error finding the onboarding record, it probably doesn't exist
        logger.debug(`No onboarding record found for ${pubkey} with role ${role}, treating as not complete`);
        return false;
      }
    } catch (error) {
      logger.error('Error checking onboarding completion status', { 
        error, 
        pubkey, 
        role 
      });
      
      // Instead of throwing, return false to indicate onboarding is not complete
      // This makes the function more resilient during login flows
      return false;
    }
  },

  /**
   * Mark onboarding as complete for a user and role
   * @param pubkey The user's public key
   * @param role The role to mark as complete
   */
  markOnboardingComplete: async (pubkey: string, role: UserRoleType): Promise<void> => {
    try {
      // First, find the user by their pubkey
      const user = await prisma.user.findUnique({
        where: { nostrPubkey: pubkey }
      });

      if (!user) {
        logger.warn(`User with pubkey ${pubkey} not found when marking onboarding complete`);
        return; // Return silently instead of throwing
      }

      // Upsert the onboarding record (create if it doesn't exist, update if it does)
      await prisma.userOnboarding.upsert({
        where: {
          userPubkey_role: {
            userPubkey: pubkey,
            role
          }
        },
        update: {
          isComplete: true,
          completedAt: new Date()
        },
        create: {
          userPubkey: pubkey,
          role,
          isComplete: true,
          completedAt: new Date(),
          userId: user.id
        }
      });

      logger.info(`Onboarding marked complete for user ${pubkey} with role ${role}`);
    } catch (error) {
      logger.error('Error marking onboarding as complete', { 
        error, 
        pubkey, 
        role 
      });
      // Log but don't throw error to prevent disrupting the flow
    }
  },

  /**
   * Reset onboarding status for a user and role
   * @param pubkey The user's public key
   * @param role The role to reset onboarding for (optional - if not provided, resets all roles)
   */
  resetOnboardingStatus: async (pubkey: string, role?: UserRoleType): Promise<void> => {
    try {
      // First, find the user by their pubkey
      const user = await prisma.user.findUnique({
        where: { nostrPubkey: pubkey }
      });

      if (!user) {
        logger.warn(`User with pubkey ${pubkey} not found when resetting onboarding status`);
        return; // Return silently instead of throwing
      }

      if (role) {
        try {
          // Reset specific role
          await prisma.userOnboarding.update({
            where: {
              userPubkey_role: {
                userPubkey: pubkey,
                role
              }
            },
            data: {
              isComplete: false,
              completedAt: null,
              lastStep: null
            }
          });
          logger.info(`Onboarding reset for user ${pubkey} with role ${role}`);
        } catch (roleError) {
          // The record might not exist yet, which is fine
          logger.warn(`Could not reset onboarding for role ${role}, might not exist yet.`);
        }
      } else {
        try {
          // Reset all roles
          await prisma.userOnboarding.updateMany({
            where: {
              userPubkey: pubkey
            },
            data: {
              isComplete: false,
              completedAt: null,
              lastStep: null
            }
          });
          logger.info(`Onboarding reset for user ${pubkey} across all roles`);
        } catch (updateError) {
          // No records might exist yet, which is fine
          logger.warn(`Could not reset onboarding records, might not exist yet.`);
        }
      }
    } catch (error) {
      logger.error('Error resetting onboarding status', { 
        error, 
        pubkey, 
        role 
      });
      // Log but don't throw error to prevent disrupting the flow
    }
  },

  /**
   * Save the current step in the onboarding process
   * @param pubkey The user's public key
   * @param role The role being onboarded
   * @param step The current step in the onboarding process
   */
  saveOnboardingStep: async (pubkey: string, role: UserRoleType, step: string): Promise<void> => {
    try {
      // First, find the user by their pubkey
      const user = await prisma.user.findUnique({
        where: { nostrPubkey: pubkey }
      });

      if (!user) {
        logger.warn(`User with pubkey ${pubkey} not found when saving onboarding step`);
        // Try to create the onboarding record anyway, in case the user was just created
        // and there's a race condition between DB operations
      }

      try {
        // Upsert the onboarding record
        await prisma.userOnboarding.upsert({
          where: {
            userPubkey_role: {
              userPubkey: pubkey,
              role
            }
          },
          update: {
            lastStep: step
          },
          create: {
            userPubkey: pubkey,
            role,
            lastStep: step,
            isComplete: false,
            userId: user?.id || '' // Use empty string if user ID not found
          }
        });
        
        logger.info(`Saved onboarding step "${step}" for user ${pubkey} with role ${role}`);
      } catch (dbError) {
        logger.warn(`Error saving onboarding step to database: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
        // Continue execution even if DB operation fails
      }
    } catch (error) {
      logger.error('Error saving onboarding step', { 
        error, 
        pubkey, 
        role, 
        step 
      });
      // Don't throw here, failing to save the step shouldn't break the onboarding flow
      logger.warn(`Failed to save onboarding step: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Get the appropriate redirect URL after login
   * @param pubkey The user's public key
   * @param role The user's current role
   * @returns Promise resolving to the URL to redirect to
   */
  getPostLoginRedirectUrl: async (pubkey: string, role: UserRoleType): Promise<string> => {
    try {
      // Check if onboarding is complete for this role
      const isComplete = await onboardingService.isOnboardingComplete(pubkey, role);
      
      if (!isComplete) {
        // If onboarding is not complete, redirect to onboarding
        return '/onboarding';
      }
      
      // If onboarding is complete, redirect to the appropriate dashboard
      switch (role) {
        case 'viewer':
          return '/dashboard'; // Generic dashboard for viewers
        case 'publisher':
          return '/dashboard/publisher'; // Publisher-specific dashboard
        case 'advertiser':
          return '/dashboard/advertiser'; // Advertiser-specific dashboard
        case 'admin':
          return '/admin'; // Admin dashboard
        default:
          return '/dashboard'; // Default fallback
      }
    } catch (error) {
      logger.error('Error getting post-login redirect URL', { 
        error, 
        pubkey, 
        role 
      });
      // If there's an error, default to the onboarding page to be safe
      return '/onboarding';
    }
  }
};

export default onboardingService;