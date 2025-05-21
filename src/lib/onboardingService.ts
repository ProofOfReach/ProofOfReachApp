import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { UserRoleType } from '@/types/role';
import { errorService } from '@/lib/errorService';
import { ErrorCategory } from '@/types/errors';

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
    // If we're running in the browser, we need to call the API instead of accessing Prisma directly
    if (typeof window !== 'undefined') {
      try {
        // Make an API call to check onboarding status
        const response = await fetch(`/api/onboarding/status?pubkey=${encodeURIComponent(pubkey)}&role=${encodeURIComponent(role)}`);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }
        
        const data = await response.json();
        return !!data.isComplete;
      } catch (error) {
        // Report the error
        errorService.reportError(
          error instanceof Error ? error : `API error checking onboarding status`,
          'onboardingService.isOnboardingComplete.clientSide',
          'api',
          'warning',
          {
            data: { pubkey, role },
            category: ErrorCategory.OPERATIONAL,
            userFacing: false
          }
        );
        
        // Log for debugging
        logger.debug(`Client-side error checking onboarding status for ${pubkey} with role ${role}, treating as not complete`);
        
        // If there's any error during the check, safely assume onboarding is not complete
        return false;
      }
    }
    
    // Server-side code path
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
      // Report the error to the central error service but continue
      errorService.reportError(
        error instanceof Error ? error : `Database error checking onboarding status`,
        'onboardingService.isOnboardingComplete.serverSide',
        'api',
        'warning',
        {
          data: { pubkey, role },
          category: ErrorCategory.OPERATIONAL,
          userFacing: false
        }
      );
      
      // Log for debugging
      logger.debug(`Error or no record found for ${pubkey} with role ${role}, treating as not complete`);
      
      // If there's any error during the check, safely assume onboarding is not complete
      return false;
    }
  },

  /**
   * Mark onboarding as complete for a user and role
   * @param pubkey The user's public key
   * @param role The role to mark as complete
   */
  markOnboardingComplete: async (pubkey: string, role: UserRoleType): Promise<void> => {
    const correlationId = `onboarding-completion-${pubkey}-${role}`;
    
    // If we're running in the browser, use the API instead
    if (typeof window !== 'undefined') {
      try {
        // Call API to mark onboarding complete
        const response = await fetch('/api/onboarding/complete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ pubkey, role }),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: response.statusText }));
          throw new Error(errorData.error || 'Failed to mark onboarding complete');
        }
        
        // Successfully marked complete
        return;
      } catch (error) {
        // Report client-side error
        errorService.reportError(
          error instanceof Error ? error : 'Error marking onboarding complete (client-side)',
          'onboardingService.markOnboardingComplete.clientSide',
          'api',
          'error',
          {
            data: { pubkey, role },
            category: ErrorCategory.OPERATIONAL,
            userFacing: true,
            correlationId
          }
        );
        
        logger.error('Client-side error marking onboarding complete', {
          error: error instanceof Error ? error.message : 'Unknown error',
          pubkey,
          role
        });
        
        // Re-throw the error so the UI can handle it
        throw error;
      }
    }
    
    // Server-side implementation
    try {
      // Get the user record first
      let user;
      try {
        user = await prisma.user.findUnique({
          where: { nostrPubkey: pubkey }
        });
      } catch (userError) {
        // Report the error
        errorService.reportError(
          userError instanceof Error ? userError : 'Error finding user for onboarding completion',
          'onboardingService.markOnboardingComplete.findUser',
          'api',
          'warning',
          {
            data: { pubkey, role },
            category: ErrorCategory.OPERATIONAL,
            userFacing: false,
            correlationId
          }
        );
        
        logger.warn(`Error finding user for onboarding completion: ${userError instanceof Error ? userError.message : 'Unknown error'}`);
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
          // Report the error using our service
          errorService.reportError(
            createError instanceof Error ? createError : 'Could not create onboarding record',
            'onboardingService.markOnboardingComplete.createRecord',
            'api',
            'warning',
            {
              data: { pubkey, role },
              category: ErrorCategory.OPERATIONAL,
              userFacing: false,
              correlationId,
              details: 'Attempted to create minimal onboarding record without user ID'
            }
          );
          
          logger.warn(`Could not create onboarding record: ${createError instanceof Error ? createError.message : 'Unknown error'}`);
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
        // Report the error using our service
        errorService.reportError(
          upsertError instanceof Error ? upsertError : 'Error upserting onboarding record',
          'onboardingService.markOnboardingComplete.upsertRecord',
          'api',
          'warning',
          {
            data: { pubkey, role, userId: user.id },
            category: ErrorCategory.OPERATIONAL,
            userFacing: false,
            correlationId
          }
        );
        
        logger.warn(`Error upserting onboarding record: ${upsertError instanceof Error ? upsertError.message : 'Unknown error'}`);
      }
    } catch (error) {
      // Report the main function error
      errorService.reportError(
        error instanceof Error ? error : 'Error in markOnboardingComplete',
        'onboardingService.markOnboardingComplete',
        'api',
        'error',
        {
          data: { pubkey, role },
          category: ErrorCategory.OPERATIONAL,
          userFacing: false,
          correlationId
        }
      );
      
      logger.error('Error in markOnboardingComplete', {
        error: error instanceof Error ? error.message : 'Unknown error',
        pubkey,
        role
      });
      
      // Re-throw the error so it can be handled appropriately
      throw error;
    }
  },

  /**
   * Reset onboarding status for a user and role
   * @param pubkey The user's public key
   * @param role The role to reset onboarding for (optional - if not provided, resets all roles)
   */
  resetOnboardingStatus: async (pubkey: string, role?: UserRoleType): Promise<void> => {
    const correlationId = `onboarding-reset-${pubkey}-${role || 'all'}`;
    
    // Handle client-side scenario
    if (typeof window !== 'undefined') {
      try {
        // Make API call to reset onboarding status
        const endpoint = role 
          ? `/api/onboarding/reset?pubkey=${encodeURIComponent(pubkey)}&role=${encodeURIComponent(role)}`
          : `/api/onboarding/reset?pubkey=${encodeURIComponent(pubkey)}`;
          
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: response.statusText }));
          throw new Error(errorData.error || 'Failed to reset onboarding status');
        }
        
        return;
      } catch (error) {
        // Report client-side error
        errorService.reportError(
          error instanceof Error ? error : 'Error resetting onboarding status (client-side)',
          'onboardingService.resetOnboardingStatus.clientSide',
          'api',
          'error',
          {
            data: { pubkey, role },
            category: ErrorCategory.OPERATIONAL,
            userFacing: true,
            correlationId
          }
        );
        
        logger.error('Client-side error resetting onboarding status', {
          error: error instanceof Error ? error.message : 'Unknown error',
          pubkey,
          role
        });
        
        // Re-throw for caller handling
        throw error;
      }
    }
    
    // Server-side implementation
    try {
      // Try to get the user, but don't block if there's an error
      let user;
      try {
        user = await prisma.user.findUnique({
          where: { nostrPubkey: pubkey }
        });
      } catch (userError) {
        // Report error to the monitoring system
        errorService.reportError(
          userError instanceof Error ? userError : 'Error finding user for onboarding reset',
          'onboardingService.resetOnboardingStatus.findUser',
          'api', 
          'warning',
          {
            data: { pubkey, role },
            category: ErrorCategory.OPERATIONAL,
            userFacing: false,
            correlationId
          }
        );
        
        logger.warn(`Error finding user for reset: ${userError instanceof Error ? userError.message : 'Unknown error'}`);
      }

      if (!user) {
        logger.warn(`User with pubkey ${pubkey} not found when resetting onboarding status`);
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
          // Report the error but continue
          errorService.reportError(
            roleError instanceof Error ? roleError : 'Could not reset onboarding for role',
            'onboardingService.resetOnboardingStatus.resetRole',
            'api',
            'info', // Less critical since we'll try fallback
            {
              data: { pubkey, role },
              category: ErrorCategory.OPERATIONAL,
              userFacing: false,
              correlationId,
              details: 'The onboarding record might not exist yet, trying fallback creation'
            }
          );
          
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
            // Report the error
            errorService.reportError(
              createError instanceof Error ? createError : 'Could not create onboarding record',
              'onboardingService.resetOnboardingStatus.createRecord',
              'api',
              'warning',
              {
                data: { pubkey, role },
                category: ErrorCategory.OPERATIONAL,
                userFacing: false,
                correlationId
              }
            );
            
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
          // Report the error
          errorService.reportError(
            updateError instanceof Error ? updateError : 'Could not reset all onboarding records',
            'onboardingService.resetOnboardingStatus.resetAll',
            'api',
            'warning',
            {
              data: { pubkey },
              category: ErrorCategory.OPERATIONAL,
              userFacing: false,
              correlationId
            }
          );
          
          logger.warn(`Could not reset onboarding records, might not exist yet: ${updateError instanceof Error ? updateError.message : 'Unknown error'}`);
        }
      }
    } catch (error) {
      // Report the main function error
      errorService.reportError(
        error instanceof Error ? error : 'Error in resetOnboardingStatus',
        'onboardingService.resetOnboardingStatus',
        'api',
        'error',
        {
          data: { pubkey, role },
          category: ErrorCategory.OPERATIONAL,
          userFacing: false,
          correlationId
        }
      );
      
      logger.error('Error in resetOnboardingStatus', { 
        error: error instanceof Error ? error.message : 'Unknown error', 
        pubkey, 
        role 
      });
      
      // Re-throw for appropriate handling
      throw error;
    }
  },

  /**
   * Save the current step in the onboarding process
   * @param pubkey The user's public key
   * @param role The role being onboarded
   * @param step The current step in the onboarding process
   */
  saveOnboardingStep: async (pubkey: string, role: UserRoleType, step: string): Promise<void> => {
    const correlationId = `onboarding-step-${pubkey}-${role}-${step}`;
    
    // Client-side implementation for browser environment
    if (typeof window !== 'undefined') {
      try {
        // Call API endpoint to save step
        const response = await fetch('/api/onboarding/step', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ pubkey, role, step }),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: response.statusText }));
          throw new Error(errorData.error || 'Failed to save onboarding step');
        }
        
        return;
      } catch (error) {
        // Report client-side error
        errorService.reportError(
          error instanceof Error ? error : 'Error saving onboarding step (client-side)',
          'onboardingService.saveOnboardingStep.clientSide',
          'api',
          'warning',
          {
            data: { pubkey, role, step },
            category: ErrorCategory.OPERATIONAL,
            userFacing: false,
            correlationId
          }
        );
        
        logger.warn(`Client-side error saving onboarding step: ${error instanceof Error ? error.message : 'Unknown error'}`);
        // Don't throw error to avoid disrupting the flow - step saving is non-critical
        return;
      }
    }
    
    // Server-side implementation
    try {
      // Try to get the user, but don't block the entire operation if it fails
      let user;
      try {
        user = await prisma.user.findUnique({
          where: { nostrPubkey: pubkey }
        });
      } catch (userError) {
        // Report the error
        errorService.reportError(
          userError instanceof Error ? userError : 'Error finding user when saving onboarding step',
          'onboardingService.saveOnboardingStep.findUser',
          'api',
          'warning',
          {
            data: { pubkey, role, step },
            category: ErrorCategory.OPERATIONAL,
            userFacing: false,
            correlationId
          }
        );
        
        logger.warn(`Error finding user when saving step: ${userError instanceof Error ? userError.message : 'Unknown error'}`);
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
        // Report the error
        errorService.reportError(
          dbError instanceof Error ? dbError : 'Error saving onboarding step to database',
          'onboardingService.saveOnboardingStep.upsert',
          'api',
          'warning',
          {
            data: { pubkey, role, step, userId: user?.id },
            category: ErrorCategory.OPERATIONAL,
            userFacing: false,
            correlationId
          }
        );
        
        logger.warn(`Error saving onboarding step to database: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
      }
    } catch (error) {
      // Report the main error
      errorService.reportError(
        error instanceof Error ? error : 'Error in saveOnboardingStep',
        'onboardingService.saveOnboardingStep',
        'api',
        'error',
        {
          data: { pubkey, role, step },
          category: ErrorCategory.OPERATIONAL,
          userFacing: false,
          correlationId
        }
      );
      
      logger.error('Error in saveOnboardingStep', { 
        error: error instanceof Error ? error.message : 'Unknown error', 
        pubkey,
        role, 
        step 
      });
    }
  },

  /**
   * Get the appropriate redirect URL after login
   * @param pubkey The user's public key
   * @param role The user's current role
   * @returns Promise resolving to the URL to redirect to
   */
  getPostLoginRedirectUrl: async (pubkey: string, role: UserRoleType): Promise<string> => {
    const correlationId = `onboarding-redirect-${pubkey}-${role}`;
    
    try {
      // Force redirect to onboarding after login for consistent flow
      if (typeof window !== 'undefined') {
        logger.info(`Post-login redirect: Directing user ${pubkey.substring(0, 8)}... to onboarding flow`);
        
        // Add debug information to help troubleshoot redirect issues
        if (process.env.NODE_ENV === 'development') {
          logger.debug('Setting onboarding redirect with params:', {
            pubkey: pubkey.substring(0, 8) + '...',
            role,
            timestamp: Date.now()
          });
        }
        
        // Add timestamp and role parameters to avoid caching issues
        return `/onboarding?timestamp=${Date.now()}&role=${role}`;
      }
      
      // If we're on the server, check onboarding status
      try {
        // Check if onboarding is complete for this role
        const isComplete = await onboardingService.isOnboardingComplete(pubkey, role);
        
        if (!isComplete) {
          logger.info(`Server-side redirect: User ${pubkey.substring(0, 8)}... needs onboarding for role ${role}`);
          return '/onboarding';
        }
        
        // If onboarding is complete, redirect to the appropriate dashboard
        logger.info(`Server-side redirect: User ${pubkey.substring(0, 8)}... has completed onboarding for role ${role}`);
        
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
      } catch (serverCheckError) {
        logger.warn('Server-side onboarding check failed, defaulting to onboarding page', {
          error: serverCheckError instanceof Error ? serverCheckError.message : 'Unknown error'
        });
        return '/onboarding';
      }
    } catch (error) {
      // Report error through the central system
      errorService.reportError(
        error instanceof Error ? error : 'Error getting post-login redirect URL',
        'onboardingService.getPostLoginRedirectUrl',
        'api',
        'warning',
        {
          data: { pubkey, role },
          category: ErrorCategory.OPERATIONAL,
          userFacing: false,
          correlationId,
          details: 'Defaulting to /onboarding as fallback redirect'
        }
      );
      
      logger.error('Error getting post-login redirect URL', { 
        error: error instanceof Error ? error.message : 'Unknown error', 
        pubkey, 
        role 
      });
      
      // If there's an error, default to the onboarding page to be safe
      return '/onboarding';
    }
  }
};

export default onboardingService;