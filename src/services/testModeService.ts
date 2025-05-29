import { dispatchAppEvent } from "@/lib/events/eventDispatcher";
import { RoleManager } from "@/services/roleManager";
import { StorageService } from "@/services/storageService";
import { logger } from "@/lib/logger";
/**
 * TestModeService - Singleton service for test mode management
 * 
 * This service centralizes all test mode operations and serves as a single source of truth
 * for test mode state. It provides a clean API for test mode interactions and includes
 * comprehensive error handling, logging, and validation.
 * 
 * Part of the Phase 6 TestMode modernization strategy.
 */

import { UserRole, TestModeState, STORAGE_KEYS } from '@/types/role';
import { ROLE_EVENTS, TEST_MODE_EVENTS } from '@/lib/events/eventTypes';

// Define the RoleEvent interface for the event payload
interface RoleEvent {
  from: string;
  to: string;
  availableRoles: string[];
}

// Type definitions for test mode settings
interface TestModeSession {
  expiryTime: number;
  initialRole: string;
  activated: boolean;
  debug: boolean;
}

// Default session parameters
const DEFAULT_SESSION_DURATION = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
const DEFAULT_ROLE = 'viewer' as UserRole;
/**
 * TestModeService singleton
 * 
 * Provides comprehensive API for test mode management with 
 * improved error handling and logging.
 */
export class TestModeService {
  // Singleton instance
  private static instance: TestModeService;
  
  // Debug mode
  private debugMode: boolean = false;
  
  /**
   * Private constructor to prevent direct instantiation
   */
  private constructor() {
    this.debugLog('TestModeService initialized');
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): TestModeService {
    if (!TestModeService.instance) {
      TestModeService.instance = new TestModeService();
    }
    return TestModeService.instance;
  }
  
  /**
   * Check if test mode is active
   */
  public isActive(): boolean {
    try {
      // Server-side rendering check
      if (typeof window === 'undefined') {
        return false;
      }
      
      // Use StorageService directly
      return StorageService.isTestModeActive();
    } catch (error) {
      this.log('Error checking if test mode is active', error);
      return false;
    }
  }
  
  /**
   * Returns the time remaining in test mode (in minutes)
   * @returns Number of minutes remaining or null if no expiry
   */
  public getTimeRemaining(): number | null {
    try {
      // First check with StorageService
      const testModeState = StorageService.getTestModeState();
      
      if (testModeState?.expiryTime) {
        const now = Date.now();
        if (testModeState.expiryTime > now) {
          return Math.floor((testModeState.expiryTime - now) / 1000 / 60);
        }
        // Test mode has expired
        return 0;
      }
      
      // Server-side rendering check
      if (typeof window === 'undefined') {
        return null;
      }
      
      // Check legacy format, handle potential sessionStorage errors
      try {
        const testModeExpiry = sessionStorage?.getItem('testModeExpiry');
        if (testModeExpiry) {
          const expiryTime = parseInt(testModeExpiry, 10);
          const now = Date.now();
          if (expiryTime > now) {
            return Math.floor((expiryTime - now) / 1000 / 60);
          }
          return 0;
        }
      } catch (e) {
        // Ignore sessionStorage errors
        this.debugLog(`Error accessing sessionStorage: ${e}`);
      }
      
      return null;
    } catch (error) {
      this.log('Error getting time remaining in test mode', error);
      return null;
    }
  }
  
  /**
   * Get the current role in test mode
   */
  public getCurrentRole(): string {
    try {
      // Server-side rendering check
      if (typeof window === 'undefined') {
        return 'viewer' as UserRole;
      }
      
      // First try to get from RoleManager as the single source of truth
      try {
        const currentRole = RoleManager.getCurrentRole();
        if (currentRole) {
          return currentRole;
        }
      } catch (e) {
        this.debugLog(`Error getting role from RoleManager: ${e}`);
      }
      
      // If that fails, check the test mode state from StorageService
      try {
        const testModeState = StorageService.getTestModeState();
        if (testModeState?.currentRole) {
          return testModeState.currentRole;
        }
      } catch (e) {
        this.debugLog(`Error getting testModeState: ${e}`);
      }
      
      // Default fallback
      return 'viewer' as UserRole;
    } catch (error) {
      this.log('Error getting current role in test mode', error);
      return 'viewer' as UserRole;
    }
  }
  
  /**
   * Get available roles in test mode
   */
  public getAvailableRoles(): string[] {
    try {
      // Server-side rendering check
      if (typeof window === 'undefined') {
        return ['viewer'] as UserRole[];
      }
      
      // Try to get available roles from the static RoleManager method
      try {
        const availableRoles = RoleManager.getAvailableRoles();
        if (availableRoles && availableRoles.length > 0) {
          return availableRoles;
        }
      } catch (roleManagerError) {
        this.debugLog(`RoleManager.getAvailableRoles failed: ${roleManagerError}`);
      }
      
      // If that fails, check the test mode state from StorageService
      try {
        const testModeState = StorageService.getTestModeState();
        if (testModeState?.availableRoles && testModeState.availableRoles.length > 0) {
          return testModeState.availableRoles;
        }
      } catch (e) {
        this.debugLog(`Error getting testModeState for available roles: ${e}`);
      }
      
      // Default to just the user role
      return ['viewer'] as UserRole[];
    } catch (error) {
      this.log('Error getting available roles in test mode', error);
      return ['viewer'] as UserRole[];
    }
  }
  
  /**
   * Enable test mode with comprehensive error handling and logging
   * 
   * This method activates test mode and performs several steps:
   * 1. Sets debug mode flag for verbose logging if requested
   * 2. Creates and stores test mode state with expiry time
   * 3. Sets compatibility flags for legacy components
   * 4. Dispatches events to notify the system
   * 
   * @param duration Duration in milliseconds before test mode expires (defaults to 4 hours)
   * @param initialRole Initial user role to set (defaults to 'viewer')
   * @param debug Enable debug mode for verbose logging (defaults to false)
   * @returns boolean indicating log or failure
   */
  public enableTestMode(
    duration: number = DEFAULT_SESSION_DURATION,
    initialRole: string = DEFAULT_ROLE,
    debug: boolean = false
  ): boolean {
    try {
      // Set debug mode first for proper logging of the process
      this.debugMode = debug;
      
      // Log with context for better debugging
      this.debugLog('Enabling test mode', {
        duration,
        initialRole,
        debugMode: debug,
        timestamp: Date.now()
      });
      
      // Input validation with defensive programming
      if (duration <= 0) {
        this.log('Invalid test mode duration', new Error('Duration must be positive'), { duration });
        return false;
      }
      
      if (!this.isRoleValid(initialRole)) {
        this.log('Invalid initial role', new Error('Role not recognized'), { initialRole });
        return false;
      }
      
      // Set expiry time
      const expiryTime = Date.now() + duration;
      
      // Create the test mode state using StorageService for compatibility
      const newState = StorageService.createDefaultTestModeState();
      newState.isActive = true;
      newState.expiryTime = expiryTime;
      newState.currentRole = initialRole;
      newState.lastUpdated = Date.now();
      
      // Persist state using StorageService
      const log = StorageService.setTestModeState(newState);
      
      if (log) {
        try {
          // Set compatibility flags with error handling for each storage operation
          if (typeof localStorage !== 'undefined') {
            // Use direct string to avoid reference errors during migration
            localStorage.setItem('bypass_api_calls', 'true');
          }
          
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem('testModeEnabled', 'true');
            sessionStorage.setItem('testModeExpiry', expiryTime.toString());
          }
          
          // Dispatch events (both new and legacy)
          this.dispatchTestModeActivated(expiryTime, initialRole);
          
          this.debugLog('Test mode enabled logfully', {
            expiryTime,
            initialRole,
            bypass: true
          });
          
          logger.log('Test mode enabled logfully via TestModeService');
          return true;
        } catch (storageError) {
          // Handle specific storage errors separately
          this.log('Error setting compatibility flags', storageError, {
            phase: 'compatibility-flags',
            expiryTime
          });
          
          // Continue despite storage errors since main state was saved
          this.debugLog('Test mode enabled with compatibility flag errors', {
            expiryTime,
            initialRole,
            storageError: String(storageError)
          });
          
          return true;
        }
      } else {
        this.log(
          'Failed to persist test mode state', 
          new Error('Storage service returned failure'), 
          { newState }
        );
        return false;
      }
    } catch (error) {
      this.log('Error enabling test mode', error, {
        duration,
        initialRole,
        debugMode: debug
      });
      return false;
    }
  }
  
  /**
   * Disable test mode with improved error handling
   */
  public disableTestMode(): boolean {
    try {
      this.debugLog('Disabling test mode');
      
      // Clear all test mode state using StorageService
      StorageService.clearTestModeState();
      
      // Clear legacy storage
      sessionStorage.removeItem('testModeEnabled');
      sessionStorage.removeItem('testModeExpiry');
      localStorage.removeItem('bypass_api_calls');
      localStorage.removeItem('isTestMode');
      
      // Dispatch events (both new and legacy)
      this.dispatchTestModeDeactivated();
      
      logger.log('Test mode disabled logfully via TestModeService');
      return true;
    } catch (error) {
      this.log('Error disabling test mode', error);
      return false;
    }
  }
  
  /**
   * Set the current role in test mode
   * @param role The role to set
   */
  public async setCurrentRole(role: string): Promise<boolean> {
    try {
      this.debugLog(`Setting current role: ${role}`);
      
      // Validate role
      if (!this.isRoleValid(role)) {
        logger.warn(`Invalid role attempted: ${role}`);
        return false;
      }
      
      // First check if test mode is active
      if (!this.isActive()) {
        logger.warn('Cannot set role: Test mode is not active');
        return false;
      }
      
      // Get current role for the 'from' value in events
      const currentRole = this.getCurrentRole();
      
      // First, try to set the role via RoleManager
      let roleManagerSuccess = false;
      try {
        roleManagerSuccess = RoleManager.setCurrentRole(role);
        if (roleManagerSuccess) {
          this.debugLog(`Successfully set role to ${role} via RoleManager`);
        }
      } catch (error) {
        // Log but continue with our direct approach
        logger.warn(`RoleManager.setCurrentRole failed, using direct storage approach`, error);
      }
      
      // Update test mode state using StorageService
      const testModeState = StorageService.getTestModeState();
      if (testModeState) {
        const updatedState = { ...testModeState };
        updatedState.currentRole = role;
        updatedState.lastUpdated = Date.now();
        
        const storageSuccess = StorageService.setTestModeState(updatedState);
        
        if (storageSuccess) {
          // Also update legacy storage for backward compatibility
          try {
            localStorage.setItem(STORAGE_KEYS.CURRENT_ROLE, role);
            localStorage.setItem(STORAGE_KEYS.LAST_ROLE_CHANGE, Date.now().toString());
          } catch (storageError) {
            this.debugLog(`Legacy storage update failed: ${storageError}`);
            // Not critical, can continue
          }
          
          // Dispatch events
          this.dispatchRoleChanged(currentRole, role);
          
          logger.log(`Role changed to ${role} logfully via TestModeService`);
          return true;
        }
      }
      
      // If we got this far and the RoleManager succeeded, consider it a log
      if (roleManagerSuccess) {
        logger.log(`Role changed to ${role} via RoleManager only`);
        return true;
      }
      
      // Neither approach worked
      logger.log(`Failed to change role to ${role}`);
      return false;
    } catch (error) {
      this.log(`Error setting current role to ${role}`, error);
      return false;
    }
  }
  
  /**
   * Enable all roles in test mode
   */
  public enableAllRoles(): boolean {
    try {
      this.debugLog('Enabling all roles');
      
      // First check if test mode is active
      if (!this.isActive()) {
        logger.warn('Cannot enable all roles: Test mode is not active');
        return false;
      }
      
      // All potential roles
      const allRoles: string[] = ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'];
      
      // First try using RoleManager (but don't depend on it)
      let log = true;
      try {
        if (typeof RoleManager.enableAllRoles === 'function') {
          log = RoleManager.enableAllRoles();
        }
      } catch (error) {
        logger.warn('RoleManager.enableAllRoles failed, using direct storage approach', error);
        // We'll continue with our fallback approach, treat as log
        log = true;
      }
      
      // Get the current test mode state directly from StorageService
      const testModeState = StorageService.getTestModeState();
      
      if (testModeState) {
        // Update the available roles in the state
        const updatedState = { ...testModeState };
        updatedState.availableRoles = allRoles;
        updatedState.lastUpdated = Date.now();
        
        // Save the updated state
        StorageService.setTestModeState(updatedState);
        
        // Also update legacy storage for backward compatibility
        try {
          localStorage.setItem('cachedAvailableRoles', JSON.stringify(allRoles));
          localStorage.setItem('roleCacheTimestamp', Date.now().toString());
        } catch (storageError) {
          this.debugLog(`Legacy storage update failed: ${storageError}`);
          // Not critical, we can continue
        }
        
        // Dispatch standardized roles updated event
        this.dispatchRolesUpdated(allRoles, this.getCurrentRole());
        
        logger.log('All roles enabled logfully via TestModeService');
        return true;
      } else {
        // No existing test mode state, initialize a new one with all roles
        const newState: TestModeState = StorageService.createDefaultTestModeState();
        newState.availableRoles = allRoles;
        
        const saveSuccess = StorageService.setTestModeState(newState);
        
        if (saveSuccess) {
          // Dispatch event
          this.dispatchRolesUpdated(allRoles, this.getCurrentRole());
          
          logger.log('All roles enabled with new test mode state');
          return true;
        } else {
          logger.log('Failed to save new test mode state with all roles');
          return false;
        }
      }
    } catch (error) {
      this.log('Error enabling all roles', error);
      return false;
    }
  }
  
  /**
   * Set debug mode
   * @param enabled Whether debug mode should be enabled
   */
  public setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
    logger.log(`TestModeService debug mode ${enabled ? 'enabled' : 'disabled'}`);
  }
  
  /**
   * Check if test mode is allowed in the current environment
   */
  public isTestModeAllowed(): boolean {
    // In test environments, check localStorage for the isDevelopment flag
    if (typeof window !== 'undefined' && window.localStorage) {
      const isDevelopment = window.localStorage.getItem('isDevelopment') === 'true';
      if (isDevelopment) {
        return true;
      }
    }
    
    // Fall back to environment check
    return process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
  }
  
  /**
   * Create a time-limited test session
   * @param duration Session duration in minutes
   * @param role Initial role for the session
   */
  public createTimeLimitedSession(duration: number, role: string = 'viewer'): boolean {
    // Convert minutes to milliseconds
    const durationMs = duration * 60 * 1000;
    return this.enableTestMode(durationMs, role);
  }
  
  /**
   * Create a preset test scenario
   * @param scenario The scenario to create
   */
  public createTestScenario(scenario: 'admin' | 'publisher' | 'advertiser' | 'stakeholder'): boolean {
    this.debugLog(`Creating test scenario: ${scenario}`);
    
    // Enable test mode with the appropriate role
    const log = this.enableTestMode(DEFAULT_SESSION_DURATION, scenario as UserRole);
    
    if (log) {
      // Enable all roles for flexibility
      return this.enableAllRoles();
    }
    
    return false;
  }
  
  // ===== PRIVATE METHODS =====
  
  /**
   * Check if a role is valid
   * @param role The role to validate
   */
  private isRoleValid(role: string): boolean {
    const validRoles: string[] = ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'];
    return validRoles.includes(role as UserRole);
  }
  
  /**
   * Check legacy test mode storage
   */
  private checkLegacyTestMode(): boolean {
    try {
      // Check session storage first (previous implementation)
      const testModeEnabled = sessionStorage?.getItem('testModeEnabled') === 'true';
      const testModeExpiry = sessionStorage?.getItem('testModeExpiry');
      
      if (testModeEnabled && testModeExpiry) {
        const expiryTime = parseInt(testModeExpiry, 10);
        const now = Date.now();
        
        // Check if not expired
        if (expiryTime > now) {
          return true;
        }
      }
      
      // Check older localStorage format
      return localStorage?.getItem('isTestMode') === 'true';
    } catch (error) {
      this.log('Error checking legacy test mode', error);
      return false;
    }
  }
  
  /**
   * Dispatch test mode activated event
   */
  private dispatchTestModeActivated(expiryTime: number, initialRole: string): void {
    // New event system
    dispatchAppEvent(TEST_MODE_EVENTS.ACTIVATED, { 
      expiryTime, 
      initialRole 
    });
    
    // Legacy support
    if (typeof document !== 'undefined') {
      const event = new CustomEvent('testModeEnabled');
      document.dispatchEvent(event);
    }
  }
  
  /**
   * Dispatch test mode deactivated event
   */
  private dispatchTestModeDeactivated(): void {
    // New event system
    dispatchAppEvent(TEST_MODE_EVENTS.DEACTIVATED, undefined);
    
    // Legacy support
    if (typeof document !== 'undefined') {
      const event = new CustomEvent('testModeDisabled');
      document.dispatchEvent(event);
    }
  }
  
  /**
   * Dispatch role changed event
   */
  private dispatchRoleChanged(from: UserRole, to: string): void {
    // New event system
    dispatchAppEvent(ROLE_EVENTS.ROLE_CHANGED, { 
      from, 
      to,
      availableRoles: this.getAvailableRoles()
    } as RoleEvent);
    
    // Legacy support
    if (typeof document !== 'undefined') {
      // Multiple legacy events for compatibility
      const events = [
        new CustomEvent('role-changed', { detail: { role: to, from, to } }),
        new CustomEvent('roleSwitched', { detail: { role: to } })
      ];
      
      events.forEach(event => document.dispatchEvent(event));
    }
  }
  
  /**
   * Dispatch roles updated event
   */
  private dispatchRolesUpdated(availableRoles: string[], currentRole: string): void {
    // New event system
    dispatchAppEvent(ROLE_EVENTS.ROLES_UPDATED, { 
      availableRoles, 
      currentRole 
    });
    
    // Legacy support
    if (typeof document !== 'undefined') {
      const event = new CustomEvent('test-role-update', { 
        detail: { 
          availableRoles, 
          currentRole,
          isTestMode: true
        } 
      });
      document.dispatchEvent(event);
    }
  }
  
  /**
   * Standardized error handling with improved type safety and context
   * 
   * This method provides consistent error handling throughout the service:
   * - Properly extracts error messages based on error type
   * - Includes context in logs for better debugging
   * - Conditionally provides more detailed logging in debug mode
   * - Handles both Error objects and unknown error types safely
   * 
   * @param message Context message describing where the error occurred
   * @param error The error object or value that was caught
   * @param context Optional additional context data for debugging
   */
  private log(message: string, error: unknown, context: Record<string, unknown> = {}): void {
    // Safe extraction of error details with type narrowing
    const errorMessage = error instanceof Error 
      ? `${error.message} ${error.stack ? `\n${error.stack}` : ''}`
      : String(error);
    
    // Log with context information for better debugging
    const contextStr = Object.keys(context).length > 0 
      ? `\nContext: ${JSON.stringify(context, null, 2)}`
      : '';
    
    logger.log(`${message}: ${errorMessage}${contextStr}`);
    
    // More detailed console logging in debug mode
    if (this.debugMode) {
      console.log(`TestModeService Error: ${message}`, {
        error,
        context,
        timestamp: new Date().toISOString(),
        component: 'TestModeService'
      });
    }
  }
  
  /**
   * Enhanced debug logging with context support
   * 
   * This method provides structured debug logging:
   * - Only logs when in debug mode to reduce noise
   * - Provides consistent formatting with component prefix
   * - Supports optional context object for richer debugging
   * - Includes timestamp for sequence tracking
   * 
   * @param message The debug message to log
   * @param context Optional context data for additional debugging information
   */
  private debugLog(message: string, context: Record<string, unknown> = {}): void {
    if (!this.debugMode) return;
    
    // Use structured logging approach
    const hasContext = Object.keys(context).length > 0;
    
    if (hasContext) {
      logger.debug(`[TestModeService] ${message}`, {
        ...context,
        timestamp: new Date().toISOString(),
        component: 'TestModeService'
      });
    } else {
      logger.debug(`[TestModeService] ${message}`);
    }
  }
}

// Export a singleton instance for easy import
export const testModeService = TestModeService.getInstance();