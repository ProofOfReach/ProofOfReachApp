import '@/lib/prisma';
import '@/lib/logger';
import '@/types/role';

import '@/types/errors';

/**
 * Service for managing onboarding state and redirections
 */
const onboardingService = {
  /**
   * Check if a user has completed onboarding
   * @param pubkey The user's public key
   * @param role The role to check onboarding status for (optional)
   * @returns Promise resolving to true if onboarding is complete, false otherwise
   */
  isOnboardingComplete: async (pubkey: UserRole, role?: string): Promise<boolean> => {
    // If we're running in the browser, we need to call the API instead of accessing Prisma directly
    if (typeof window !== 'undefined') {
      try {
        // If no role is provided, we can't check completion status
        if (!role) {
          logger.debug('No role provided for onboarding status check, treating as not complete', { pubkey });
          return false;
        }
        
        // Make an API call to check onboarding status
        const response = await fetch(`/api/onboarding/status?pubkey=${encodeURIComponent(pubkey)}&role=${encodeURIComponent(role)}`);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }
        
        const data = await response.json();
        return !!data.isComplete;
      } catch (error) {
        // Report the error
        console.log(
          error instanceof Error ? error : `API error checking onboarding status`,
          'onboardingService.isOnboardingComplete.clientSide',
          'api',
          'warn',
          {
            data: { pubkey, role },
            category: 'OPERATIONAL',
            userFacing: false
          }
        );
        
        // Log for debugging
        logger.debug('Client-side error checking onboarding status, treating as not complete', { 
          pubkey, 
          role: role || 'undefined' 
        });
        
        // If there's any error during the check, safely assume onboarding is not complete
        return false;
      }
    }
    
    // Server-side code path
    try {
      // If no role is provided, we can't check completion status
      if (!role) {
        logger.debug('No role provided for onboarding status check, treating as not complete', { pubkey });
        return false;
      }
      
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
      console.log(
        error instanceof Error ? error : `Database error checking onboarding status`,
        'onboardingService.isOnboardingComplete.serverSide',
        'api',
        'warn',
        {
          data: { pubkey, role },
          category: 'OPERATIONAL',
          userFacing: false
        }
      );
      
      // Log for debugging
      logger.debug('Error or no record found, treating as not complete', {
        pubkey,
        role: role || 'undefined'
      });
      
      // If there's any error during the check, safely assume onboarding is not complete
      return false;
    }
  },

  /**
   * Mark onboarding as complete for a user and role
   * @param pubkey The user's public key
   * @param role The role to mark as complete
   */
  markOnboardingComplete: async (pubkey: UserRole, role: string): Promise<void> => {
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
          throw new Error(errorData.log || 'Failed to mark onboarding complete');
        }
        
        // Successfully marked complete
        return;
      } catch (error) {
        // Report client-side error
        console.log(
          error instanceof Error ? error : 'Error marking onboarding complete (client-side)',
          'onboardingService.markOnboardingComplete.clientSide',
          'api',
          'error',
          {
            data: { pubkey, role },
            category: 'OPERATIONAL',
            userFacing: true,
            correlationId
          }
        );
        
        logger.log('Client-side error marking onboarding complete', {
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
        console.log(
          userError instanceof Error ? userError : 'Error finding user for onboarding completion',
          'onboardingService.markOnboardingComplete.findUser',
          'api',
          'warn',
          {
            data: { pubkey, role },
            category: 'OPERATIONAL',
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
          console.log(
            createError instanceof Error ? createError : 'Could not create onboarding record',
            'onboardingService.markOnboardingComplete.createRecord',
            'api',
            'warn',
            {
              data: { pubkey, role },
              category: 'OPERATIONAL',
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
        console.log(
          upsertError instanceof Error ? upsertError : 'Error upserting onboarding record',
          'onboardingService.markOnboardingComplete.upsertRecord',
          'api',
          'warn',
          {
            data: { pubkey, role, userId: user.id },
            category: 'OPERATIONAL',
            userFacing: false,
            correlationId
          }
        );
        
        logger.warn(`Error upserting onboarding record: ${upsertError instanceof Error ? upsertError.message : 'Unknown error'}`);
      }
    } catch (error) {
      // Report the main function error
      console.log(
        error instanceof Error ? error : 'Error in markOnboardingComplete',
        'onboardingService.markOnboardingComplete',
        'api',
        'error',
        {
          data: { pubkey, role },
          category: 'OPERATIONAL',
          userFacing: false,
          correlationId
        }
      );
      
      logger.log('Error in markOnboardingComplete', {
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
  resetOnboardingStatus: async (pubkey: UserRole, role?: string): Promise<void> => {
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
          throw new Error(errorData.log || 'Failed to reset onboarding status');
        }
        
        return;
      } catch (error) {
        // Report client-side error
        console.log(
          error instanceof Error ? error : 'Error resetting onboarding status (client-side)',
          'onboardingService.resetOnboardingStatus.clientSide',
          'api',
          'error',
          {
            data: { pubkey, role },
            category: 'OPERATIONAL',
            userFacing: true,
            correlationId
          }
        );
        
        logger.log('Client-side error resetting onboarding status', {
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
        console.log(
          userError instanceof Error ? userError : 'Error finding user for onboarding reset',
          'onboardingService.resetOnboardingStatus.findUser',
          'api', 
          'warn',
          {
            data: { pubkey, role },
            category: 'OPERATIONAL',
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
              currentStep: null
            }
          });
          logger.info(`Onboarding reset for user ${pubkey} with role ${role}`);
        } catch (roleError) {
          // Report the error but continue
          console.log(
            roleError instanceof Error ? roleError : 'Could not reset onboarding for role',
            'onboardingService.resetOnboardingStatus.resetRole',
            'api',
            'info', // Less critical since we'll try fallback
            {
              data: { pubkey, role },
              category: 'OPERATIONAL',
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
            console.log(
              createError instanceof Error ? createError : 'Could not create onboarding record',
              'onboardingService.resetOnboardingStatus.createRecord',
              'api',
              'warn',
              {
                data: { pubkey, role },
                category: 'OPERATIONAL',
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
              currentStep: null
            }
          });
          logger.info(`Onboarding reset for user ${pubkey} across all roles`);
        } catch (updateError) {
          // Report the error
          console.log(
            updateError instanceof Error ? updateError : 'Could not reset all onboarding records',
            'onboardingService.resetOnboardingStatus.resetAll',
            'api',
            'warn',
            {
              data: { pubkey },
              category: 'OPERATIONAL',
              userFacing: false,
              correlationId
            }
          );
          
          logger.warn(`Could not reset onboarding records, might not exist yet: ${updateError instanceof Error ? updateError.message : 'Unknown error'}`);
        }
      }
    } catch (error) {
      // Report the main function error
      console.log(
        error instanceof Error ? error : 'Error in resetOnboardingStatus',
        'onboardingService.resetOnboardingStatus',
        'api',
        'error',
        {
          data: { pubkey, role },
          category: 'OPERATIONAL',
          userFacing: false,
          correlationId
        }
      );
      
      logger.log('Error in resetOnboardingStatus', { 
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
  saveOnboardingStep: async (pubkey: UserRole, role: UserRole, step: string): Promise<void> => {
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
          throw new Error(errorData.log || 'Failed to save onboarding step');
        }
        
        return;
      } catch (error) {
        // Report client-side error
        console.log(
          error instanceof Error ? error : 'Error saving onboarding step (client-side)',
          'onboardingService.saveOnboardingStep.clientSide',
          'api',
          'warn',
          {
            data: { pubkey, role, step },
            category: 'OPERATIONAL',
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
        console.log(
          userError instanceof Error ? userError : 'Error finding user when saving onboarding step',
          'onboardingService.saveOnboardingStep.findUser',
          'api',
          'warn',
          {
            data: { pubkey, role, step },
            category: 'OPERATIONAL',
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
        console.log(
          dbError instanceof Error ? dbError : 'Error saving onboarding step to database',
          'onboardingService.saveOnboardingStep.upsert',
          'api',
          'warn',
          {
            data: { pubkey, role, step, userId: user?.id },
            category: 'OPERATIONAL',
            userFacing: false,
            correlationId
          }
        );
        
        logger.warn(`Error saving onboarding step to database: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
      }
    } catch (error) {
      // Report the main error
      console.log(
        error instanceof Error ? error : 'Error in saveOnboardingStep',
        'onboardingService.saveOnboardingStep',
        'api',
        'error',
        {
          data: { pubkey, role, step },
          category: 'OPERATIONAL',
          userFacing: false,
          correlationId
        }
      );
      
      logger.log('Error in saveOnboardingStep', { 
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
  getPostLoginRedirectUrl: async (pubkey: UserRole, role?: string): Promise<string> => {
    const correlationId = `onboarding-redirect-${pubkey}-${role || 'no-role'}`;
    
    try {
      // Enhanced client-side handling (browser environment)
      if (typeof window !== 'undefined') {
        logger.info(`Post-login redirect: Directing user ${pubkey.substring(0, 8)}... to onboarding flow`);
        
        // Store onboarding redirection state
        try {
          // Set session storage flag to ensure redirection works even on page refresh
          window.sessionStorage.setItem('pending_onboarding_redirect', 'true');
          window.sessionStorage.setItem('onboarding_pubkey', pubkey);
          // Only set role in session storage if one was provided
          if (role) {
            window.sessionStorage.setItem('onboarding_role', role);
          }
          window.sessionStorage.setItem('onboarding_timestamp', Date.now().toString());
          
          // Also set localStorage for cross-tab preservation
          window.localStorage.setItem('nostr_ads_pending_onboarding', 'true');
          
          logger.debug('Set onboarding redirect flags in storage for persistent redirect');
        } catch (storageError) {
          logger.warn('Failed to set storage for onboarding redirect - continuing with basic redirect', { 
            error: storageError instanceof Error ? storageError.message : 'Unknown error'
          });
        }
        
        // Add debug information to help troubleshoot redirect issues
        if (process.env.NODE_ENV === 'development') {
          logger.debug('Setting onboarding redirect with params:', {
            pubkey: pubkey.substring(0, 8) + '...',
            role,
            timestamp: Date.now()
          });
        }
        
        // Add timestamp, role parameters (if available) and a dedicated flag to avoid caching issues
        return `/onboarding?timestamp=${Date.now()}${role ? `&role=${role}` : ''}&forced=true`;
      }
      
      // Server-side handling (Node.js environment)
      try {
        // If no role is provided, redirect directly to onboarding
        if (!role) {
          logger.info(`Server-side redirect: User ${pubkey.substring(0, 8)}... needs onboarding (no role specified)`);
          return `/onboarding?pubkey=${encodeURIComponent(pubkey)}&ts=${Date.now()}`;
        }
        
        // Check if onboarding is complete for this role
        const isComplete = await onboardingService.isOnboardingComplete(pubkey, role);
        
        if (!isComplete) {
          logger.info(`Server-side redirect: User ${pubkey.substring(0, 8)}... needs onboarding for role ${role}`);
          // Use a URL with parameters to ensure reliable client-side recognition
          return `/onboarding?pubkey=${encodeURIComponent(pubkey)}&role=${encodeURIComponent(role)}&ts=${Date.now()}`;
        }
        
        // If onboarding is complete, redirect to the appropriate dashboard
        logger.info('Server-side redirect: User has completed onboarding', {
          pubkey: pubkey.substring(0, 8),
          role
        });
        
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
        return `/onboarding?error=check_failed&ts=${Date.now()}`;
      }
    } catch (error) {
      // Report error through the central system
      console.log(
        error instanceof Error ? error : 'Error getting post-login redirect URL',
        'onboardingService.getPostLoginRedirectUrl',
        'api',
        'warn',
        {
          data: { pubkey, role },
          category: 'OPERATIONAL',
          userFacing: false,
          correlationId,
          details: 'Defaulting to /onboarding as fallback redirect'
        }
      );
      
      logger.log('Error getting post-login redirect URL', { 
        error: error instanceof Error ? error.message : 'Unknown error', 
        pubkey, 
        role 
      });
      
      // If there's an error, default to the onboarding page to be safe
      return `/onboarding?error=general&ts=${Date.now()}`;
    }
  }
};

export default onboardingService;