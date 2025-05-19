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
      // Simplified check for onboarding complete status
      // We'll just check if there's an onboarding record with isComplete=true
      const onboardingRecord = await prisma.userOnboarding.findUnique({
        where: {
          userPubkey_role: {
            userPubkey: pubkey,
            role: role
          }
        }
      });
      
      return !!onboardingRecord?.isComplete;
    } catch (error) {
      // If there's any error during the check, safely assume onboarding is not complete
      logger.debug(`Error or no record found for ${pubkey} with role ${role}, treating as not complete`);
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
      // Get the user record first
      let user;
      try {
        user = await prisma.user.findUnique({
          where: { nostrPubkey: pubkey }
        });
      } catch (userError) {
        logger.warn(`Error finding user for onboarding completion: ${userError instanceof Error ? userError.message : 'Unknown error'}`);
        // We'll continue without the user record and try to create a minimal onboarding record
      }

      if (!user) {
        logger.warn(`User with pubkey ${pubkey} not found, creating minimal onboarding record`);
        
        // Create a simple record directly without user ID reference
        try {
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
              userId: '' // Empty string as placeholder
            }
          });
        } catch (createError) {
          logger.warn(`Could not create onboarding record: ${createError instanceof Error ? createError.message : 'Unknown error'}`);
          // We'll continue anyway to provide a smooth flow
        }
        return;
      }

      // If we have a valid user, try to upsert the record
      try {
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
      } catch (upsertError) {
        logger.warn(`Error upserting onboarding record: ${upsertError instanceof Error ? upsertError.message : 'Unknown error'}`);
        // Continue to provide a smooth flow
      }
    } catch (error) {
      logger.error('Error in markOnboardingComplete', {
        error: error instanceof Error ? error.message : 'Unknown error',
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
      // Try to get the user, but don't block if there's an error
      let user;
      try {
        user = await prisma.user.findUnique({
          where: { nostrPubkey: pubkey }
        });
      } catch (userError) {
        logger.warn(`Error finding user for reset: ${userError instanceof Error ? userError.message : 'Unknown error'}`);
        // Continue without the user record
      }

      if (!user) {
        logger.warn(`User with pubkey ${pubkey} not found when resetting onboarding status`);
        // Continue anyway to try the reset operation
      }

      if (role) {
        try {
          // Reset specific role with both field names for compatibility
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
              lastStep: null,
              currentStep: null // Support both field names
            }
          });
          logger.info(`Onboarding reset for user ${pubkey} with role ${role}`);
        } catch (roleError) {
          // The record might not exist yet, which is fine
          logger.warn(`Could not reset onboarding for role ${role}, might not exist yet.`);
          
          // Try creation instead of update as a fallback
          try {
            await prisma.userOnboarding.upsert({
              where: {
                userPubkey_role: {
                  userPubkey: pubkey,
                  role
                }
              },
              update: {
                isComplete: false,
                completedAt: null,
                lastStep: null,
                currentStep: null
              },
              create: {
                userPubkey: pubkey,
                role,
                isComplete: false,
                userId: user?.id || '' // Use empty string if user ID not found
              }
            });
            logger.info(`Created fresh onboarding record for user ${pubkey} with role ${role}`);
          } catch (createError) {
            logger.warn(`Could not create onboarding record: ${createError instanceof Error ? createError.message : 'Unknown error'}`);
          }
        }
      } else {
        try {
          // Reset all roles with both field names for compatibility
          await prisma.userOnboarding.updateMany({
            where: {
              userPubkey: pubkey
            },
            data: {
              isComplete: false,
              completedAt: null,
              lastStep: null,
              currentStep: null // Support both field names
            }
          });
          logger.info(`Onboarding reset for user ${pubkey} across all roles`);
        } catch (updateError) {
          // No records might exist yet, which is fine
          logger.warn(`Could not reset onboarding records, might not exist yet: ${updateError instanceof Error ? updateError.message : 'Unknown error'}`);
        }
      }
    } catch (error) {
      logger.error('Error in resetOnboardingStatus', { 
        error: error instanceof Error ? error.message : 'Unknown error', 
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
      // Try to get the user, but don't block the entire operation if it fails
      let user;
      try {
        user = await prisma.user.findUnique({
          where: { nostrPubkey: pubkey }
        });
      } catch (userError) {
        logger.warn(`Error finding user when saving step: ${userError instanceof Error ? userError.message : 'Unknown error'}`);
        // Continue without the user record
      }

      if (!user) {
        logger.warn(`User with pubkey ${pubkey} not found when saving onboarding step - will create minimal record`);
      }

      try {
        // Upsert the onboarding record, attempting both lastStep and currentStep fields
        // for maximum compatibility
        await prisma.userOnboarding.upsert({
          where: {
            userPubkey_role: {
              userPubkey: pubkey,
              role
            }
          },
          update: {
            lastStep: step,
            currentStep: step // Try both fields
          },
          create: {
            userPubkey: pubkey,
            role,
            lastStep: step,
            currentStep: step, // Try both fields
            isComplete: false,
            userId: user?.id || '' // Use empty string if user ID not found
          }
        });
        
        logger.info(`Saved onboarding step "${step}" for user ${pubkey} with role ${role}`);
      } catch (dbError) {
        logger.warn(`Error saving onboarding step to database: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
        // We'll continue anyway to ensure the UI flow isn't disrupted
      }
    } catch (error) {
      logger.error('Error in saveOnboardingStep', { 
        error: error instanceof Error ? error.message : 'Unknown error', 
        pubkey,
        role, 
        step 
      });
      // Log but don't throw - the UI should still work even if steps aren't saved
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