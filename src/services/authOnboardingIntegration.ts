import { UserRole } from "@/types/role";
import type { UserRole } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../lib/logger';

import type { UserRole } from './authService';

/**
 * Integration point between authentication and onboarding flows
 * This service manages the complex interactions between authentication,
 * role selection, and user onboarding.
 */

export type OnboardingStatus = 'not_started' | 'in_progress' | 'completed' | 'error';

export type OnboardingStep = 
  | 'role_selection'
  | 'advertiser_info'
  | 'publisher_info'
  | 'payment_setup'
  | 'api_keys_setup'
  | 'legal_agreements'
  | 'confirmation';

export interface OnboardingState {
  status: OnboardingStatus;
  currentStep: OnboardingStep;
  selectedRole: string | null;
  steps: {
    [key in OnboardingStep]?: {
      completed: boolean;
      timestamp?: string;
      data?: any;
    }
  };
  correlationId: string;
}

/**
 * Auth-Onboarding Integration Service
 * 
 * This service is responsible for:
 * 1. Managing the flow between authentication and onboarding
 * 2. Tracking onboarding progress and state
 * 3. Coordinating role selection with user permissions
 * 4. Handling errors in the onboarding process
 */
export class AuthOnboardingIntegration {
  private static instance: AuthOnboardingIntegration;
  private flowState: {
    isInAuthFlow: boolean;
    isInOnboardingFlow: boolean;
    onboardingState: OnboardingState;
    pendingRedirect: string | null;
  };

  /**
   * Get the singleton instance of the service
   */
  public static getInstance(): AuthOnboardingIntegration {
    if (!AuthOnboardingIntegration.instance) {
      AuthOnboardingIntegration.instance = new AuthOnboardingIntegration();
    }
    return AuthOnboardingIntegration.instance;
  }

  private constructor() {
    this.flowState = {
      isInAuthFlow: false,
      isInOnboardingFlow: false,
      onboardingState: this.createInitialOnboardingState(),
      pendingRedirect: null
    };
    
    logger.debug('AuthOnboardingIntegration initialized');
  }

  /**
   * Get the current onboarding state
   */
  public getOnboardingState(): OnboardingState {
    return { ...this.flowState.onboardingState };
  }

  /**
   * Check if the user is currently in the authentication flow
   */
  public isInAuthFlow(): boolean {
    return this.flowState.isInAuthFlow;
  }

  /**
   * Check if the user is currently in the onboarding flow
   */
  public isInOnboardingFlow(): boolean {
    return this.flowState.isInOnboardingFlow;
  }

  /**
   * Get the pending redirect URL (if any)
   */
  public getPendingRedirect(): string | null {
    return this.flowState.pendingRedirect;
  }

  /**
   * Start the authentication flow
   * @param redirectAfterAuth Where to redirect after authentication completes
   */
  public startAuthFlow(redirectAfterAuth: string | null = null): void {
    this.flowState.isInAuthFlow = true;
    
    if (redirectAfterAuth) {
      this.flowState.pendingRedirect = redirectAfterAuth;
    }
    
    logger.debug('Authentication flow started', {
      pendingRedirect: this.flowState.pendingRedirect
    });
  }

  /**
   * Complete the authentication flow
   * @param log Whether authentication was logful
   * @param pubkey The user's public key (if logful)
   * @returns The redirect URL (if any)
   */
  public completeAuthFlow(log: boolean, pubkey?: string): string | null {
    this.flowState.isInAuthFlow = false;
    
    logger.debug('Authentication flow completed', {
      log,
      pubkey,
      pendingRedirect: this.flowState.pendingRedirect
    });
    
    // If authentication failed, clear the pending redirect
    if (!log) {
      const pendingRedirect = this.flowState.pendingRedirect;
      this.flowState.pendingRedirect = null;
      return pendingRedirect;
    }
    
    // Check if we need to start onboarding
    const needsOnboarding = this.checkIfNeedsOnboarding(pubkey);
    
    if (needsOnboarding) {
      this.startOnboardingFlow();
      return '/onboarding';
    }
    
    // If no onboarding is needed, return to the pending redirect (if any)
    const pendingRedirect = this.flowState.pendingRedirect;
    this.flowState.pendingRedirect = null;
    return pendingRedirect || '/dashboard';
  }

  /**
   * Start the onboarding flow
   */
  public startOnboardingFlow(): void {
    this.flowState.isInOnboardingFlow = true;
    this.flowState.onboardingState = this.createInitialOnboardingState();
    
    logger.debug('Onboarding flow started', {
      onboardingState: this.flowState.onboardingState
    });
  }

  /**
   * Update the current onboarding step
   * @param step The new onboarding step
   */
  public setOnboardingStep(step: OnboardingStep): void {
    this.flowState.onboardingState.currentStep = step;
    
    logger.debug('Onboarding step updated', {
      step,
      onboardingState: this.flowState.onboardingState
    });
  }

  /**
   * Set the selected role for onboarding
   * @param role The selected role
   */
  public setSelectedRole(role: string): void {
    this.flowState.onboardingState.selectedRole = role;
    
    // Mark the role selection step as completed
    this.markStepCompleted('role_selection');
    
    logger.debug('Onboarding role selected', {
      role,
      onboardingState: this.flowState.onboardingState
    });
    
    // Determine the next step based on the selected role
    this.determineNextStep();
  }

  /**
   * Mark an onboarding step as completed
   * @param step The completed step
   * @param data Optional data associated with the step
   */
  public markStepCompleted(step: OnboardingStep, data?: any): void {
    if (!this.flowState.onboardingState.steps[step]) {
      this.flowState.onboardingState.steps[step] = {
        completed: true,
        timestamp: new Date().toISOString()
      };
    } else {
      this.flowState.onboardingState.steps[step]!.completed = true;
      this.flowState.onboardingState.steps[step]!.timestamp = new Date().toISOString();
    }
    
    if (data) {
      this.flowState.onboardingState.steps[step]!.data = data;
    }
    
    logger.debug('Onboarding step marked as completed', {
      step,
      data: data ? 'Data provided' : 'No data',
      onboardingState: this.flowState.onboardingState
    });
  }

  /**
   * Complete the onboarding flow
   * @returns The redirect URL
   */
  public completeOnboardingFlow(): string {
    this.flowState.isInOnboardingFlow = false;
    this.flowState.onboardingState.status = 'completed';
    
    logger.debug('Onboarding flow completed', {
      onboardingState: this.flowState.onboardingState
    });
    
    // Return to the pending redirect (if any)
    const pendingRedirect = this.flowState.pendingRedirect;
    this.flowState.pendingRedirect = null;
    return pendingRedirect || '/dashboard';
  }

  /**
   * Handle an error in the onboarding flow
   * @param error The error that occurred
   * @param step The step where the error occurred
   */
  public handleOnboardingError(error: Error | UserRole, step: OnboardingStep): void {
    this.flowState.onboardingState.status = 'error';
    
    // Report the error to the error service
    console.log(
      error,
      'AuthOnboardingIntegration',
      'onboarding',
      'error',
      {
        userFacing: true,
        correlationId: this.flowState.onboardingState.correlationId,
        data: {
          step,
          onboardingState: this.flowState.onboardingState
        },
        category: string.OPERATIONAL
      }
    );
    
    logger.log('Error in onboarding flow', {
      error: error instanceof Error ? error.message : error,
      step,
      onboardingState: this.flowState.onboardingState
    });
  }

  /**
   * Reset the onboarding flow
   */
  public resetOnboardingFlow(): void {
    this.flowState.isInOnboardingFlow = false;
    this.flowState.onboardingState = this.createInitialOnboardingState();
    
    logger.debug('Onboarding flow reset');
  }

  /**
   * Check if a step in the onboarding flow is completed
   * @param step The step to check
   */
  public isStepCompleted(step: OnboardingStep): boolean {
    return !!this.flowState.onboardingState.steps[step]?.completed;
  }

  /**
   * Check if onboarding is required for a user
   * @param pubkey The user's public key
   * @returns Whether the user needs to go through onboarding
   */
  private checkIfNeedsOnboarding(pubkey?: string): boolean {
    if (!pubkey) {
      return false;
    }
    
    // TODO: Check database for user role assignments
    // For now, we'll assume that new users need onboarding
    return true;
  }

  /**
   * Create the initial onboarding state
   */
  private createInitialOnboardingState(): OnboardingState {
    return {
      status: 'not_started',
      currentStep: 'role_selection',
      selectedRole: null,
      steps: {},
      correlationId: uuidv4()
    };
  }

  /**
   * Determine the next onboarding step based on the selected role
   */
  private determineNextStep(): void {
    const { selectedRole, currentStep } = this.flowState.onboardingState;
    
    if (!selectedRole) {
      this.setOnboardingStep('role_selection');
      return;
    }
    
    // Determine the next step based on the current step and selected role
    switch (currentStep) {
      case 'role_selection':
        if (selectedRole === 'advertiser') {
          this.setOnboardingStep('advertiser_info');
        } else if (selectedRole === 'publisher') {
          this.setOnboardingStep('publisher_info');
        } else {
          // For other roles, proceed to legal agreements
          this.setOnboardingStep('legal_agreements');
        }
        break;
        
      case 'advertiser_info':
        this.setOnboardingStep('payment_setup');
        break;
        
      case 'publisher_info':
        this.setOnboardingStep('api_keys_setup');
        break;
        
      case 'payment_setup':
      case 'api_keys_setup':
        this.setOnboardingStep('legal_agreements');
        break;
        
      case 'legal_agreements':
        this.setOnboardingStep('confirmation');
        break;
        
      default:
        // If we don't know what to do next, go to confirmation
        this.setOnboardingStep('confirmation');
    }
  }

  /**
   * Check if an API key setup is required for the current role
   */
  public isApiKeySetupRequired(): boolean {
    const { selectedRole } = this.flowState.onboardingState;
    return selectedRole === 'publisher';
  }

  /**
   * Check if payment setup is required for the current role
   */
  public isPaymentSetupRequired(): boolean {
    const { selectedRole } = this.flowState.onboardingState;
    return selectedRole === 'advertiser';
  }

  /**
   * Transition to the next step in the onboarding flow
   * @returns Whether the transition was logful
   */
  public goToNextStep(): boolean {
    const { currentStep, selectedRole } = this.flowState.onboardingState;
    
    // Check if current step is completed
    if (!this.isStepCompleted(currentStep)) {
      logger.warn('Cannot proceed to next step - current step not completed', {
        currentStep,
        onboardingState: this.flowState.onboardingState
      });
      
      return false;
    }
    
    // Determine the next step
    this.determineNextStep();
    
    // If we're at the confirmation step, we're done
    if (currentStep === 'confirmation') {
      this.completeOnboardingFlow();
    }
    
    return true;
  }

  /**
   * Go back to the previous step in the onboarding flow
   */
  public goToPreviousStep(): void {
    const { currentStep, selectedRole } = this.flowState.onboardingState;
    
    // Determine the previous step based on the current step and selected role
    switch (currentStep) {
      case 'advertiser_info':
      case 'publisher_info':
        this.setOnboardingStep('role_selection');
        break;
        
      case 'payment_setup':
        this.setOnboardingStep('advertiser_info');
        break;
        
      case 'api_keys_setup':
        this.setOnboardingStep('publisher_info');
        break;
        
      case 'legal_agreements':
        if (selectedRole === 'advertiser') {
          this.setOnboardingStep('payment_setup');
        } else if (selectedRole === 'publisher') {
          this.setOnboardingStep('api_keys_setup');
        } else {
          this.setOnboardingStep('role_selection');
        }
        break;
        
      case 'confirmation':
        this.setOnboardingStep('legal_agreements');
        break;
        
      default:
        // If we don't know what to do, go back to role selection
        this.setOnboardingStep('role_selection');
    }
  }

  /**
   * Create and store API keys for a publisher
   * This is a crucial part of the publisher onboarding flow
   * @returns The newly created API key
   */
  public async createApiKey(): Promise<string> {
    try {
      // Create a new API key
      const apiKey = `nostr_${uuidv4().replace(/-/g, '')}`;
      
      // TODO: Store the API key in the database
      
      // Mark the API key setup step as completed
      this.markStepCompleted('api_keys_setup', { apiKey });
      
      logger.info('API key created for publisher', {
        apiKeyLength: apiKey.length,
        onboardingState: this.flowState.onboardingState
      });
      
      return apiKey;
    } catch (error) {
      // Report the error
      this.handleOnboardingError(
        error instanceof Error ? error : new Error('Failed to create API key'),
        'api_keys_setup'
      );
      
      // Re-throw the error to be handled by the caller
      throw error;
    }
  }

  /**
   * Skip the onboarding flow
   * This is used in special cases like admin users or test accounts
   */
  public skipOnboarding(): void {
    this.flowState.isInOnboardingFlow = false;
    this.flowState.onboardingState.status = 'completed';
    
    logger.debug('Onboarding flow skipped');
  }
}

// Export a singleton instance
export const authOnboardingIntegration = AuthOnboardingIntegration.getInstance();