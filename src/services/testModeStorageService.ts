/**
 * TestMode Storage Service
 * 
 * This service provides specialized storage functionality for TestMode state,
 * extending the EnhancedStorageService with TestMode-specific methods.
 */

import '@/lib/logger';
import { 
  dispatchTestModeEvent, 
  TEST_MODE_EVENTS, 
  notifyTestModeActivated,
  notifyTestModeDeactivated
} from '@/lib/events';
import { EnhancedStorageService, STORAGE_KEYS, enhancedStorage } from './enhancedStorageService';
import '@/context/RoleContext';

// Standard expiry time for test mode (1 hour)
const TEST_MODE_EXPIRY_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

// Define the shape of TestMode state
export interface TestModeState {
  enabled: boolean;
  expiryTime: number;
  initialRole: UserRole;
  activatedAt: number;
}

/**
 * TestMode Storage Service class
 */
export class TestModeStorageService {
  private storage: EnhancedStorageService;
  
  /**
   * Create a new TestModeStorageService
   * 
   * @param storage Storage service to use, defaults to the global enhancedStorage
   */
  constructor(storage: EnhancedStorageService = enhancedStorage) {
    this.storage = storage;
  }
  
  /**
   * Enable test mode
   * 
   * @param initialRole The initial role to set when enabling test mode
   * @param duration Optional custom duration in milliseconds
   * @returns boolean indicating success
   */
  enableTestMode(initialRole: UserRole, duration: number = TEST_MODE_EXPIRY_DURATION): boolean {
    try {
      const now = Date.now();
      const expiryTime = now + duration;
      
      const testModeState: TestModeState = {
        enabled: true,
        expiryTime,
        initialRole,
        activatedAt: now
      };
      
      // Store the test mode state securely in sessionStorage
      const success = this.storage.setSecureItem(STORAGE_KEYS.TEST_MODE, testModeState, {
        sessionOnly: true,
        expiry: {
          duration,
          refreshOnAccess: true
        }
      });
      
      if (success) {
        // Notify that test mode has been activated
        notifyTestModeActivated(expiryTime, initialRole);
        logger.debug('Test mode enabled with initial role:', initialRole);
      }
      
      return success;
    } catch (error) {
      logger.error('Error enabling test mode:', error);
      return false;
    }
  }
  
  /**
   * Disable test mode
   * 
   * @returns boolean indicating success
   */
  disableTestMode(): boolean {
    try {
      // Remove test mode state
      const success = this.storage.removeItem(STORAGE_KEYS.TEST_MODE, {
        storageType: 'sessionStorage'
      });
      
      if (success) {
        // Notify that test mode has been deactivated
        notifyTestModeDeactivated();
        logger.debug('Test mode disabled');
      }
      
      return success;
    } catch (error) {
      logger.error('Error disabling test mode:', error);
      return false;
    }
  }
  
  /**
   * Check if test mode is enabled
   * 
   * @returns boolean indicating if test mode is enabled
   */
  isTestModeEnabled(): boolean {
    try {
      const testMode = this.getTestModeState();
      
      if (!testMode) {
        return false;
      }
      
      // Check if test mode has expired
      if (testMode.expiryTime < Date.now()) {
        this.disableTestMode();
        return false;
      }
      
      return testMode.enabled;
    } catch (error) {
      logger.error('Error checking test mode:', error);
      return false;
    }
  }
  
  /**
   * Get the current test mode state
   * 
   * @returns TestModeState object or null if not found
   */
  getTestModeState(): TestModeState | null {
    try {
      return this.storage.getSecureItem<TestModeState>(STORAGE_KEYS.TEST_MODE, {
        sessionOnly: true,
        refreshExpiry: true
      });
    } catch (error) {
      logger.error('Error getting test mode state:', error);
      return null;
    }
  }
  
  /**
   * Get the time remaining for test mode in milliseconds
   * 
   * @returns Milliseconds remaining or 0 if test mode is not enabled
   */
  getTestModeTimeRemaining(): number {
    try {
      const testMode = this.getTestModeState();
      
      if (!testMode || !testMode.enabled) {
        return 0;
      }
      
      const timeRemaining = testMode.expiryTime - Date.now();
      return Math.max(0, timeRemaining);
    } catch (error) {
      logger.error('Error getting test mode time remaining:', error);
      return 0;
    }
  }
  
  /**
   * Extend test mode duration
   * 
   * @param additionalTime Additional time in milliseconds
   * @returns boolean indicating success
   */
  extendTestModeDuration(additionalTime: number): boolean {
    try {
      const testMode = this.getTestModeState();
      
      if (!testMode || !testMode.enabled) {
        return false;
      }
      
      // Calculate new expiry time
      const newExpiryTime = Math.max(Date.now(), testMode.expiryTime) + additionalTime;
      
      // Update test mode state
      const updatedTestMode: TestModeState = {
        ...testMode,
        expiryTime: newExpiryTime
      };
      
      // Store updated state
      const success = this.storage.setSecureItem(STORAGE_KEYS.TEST_MODE, updatedTestMode, {
        sessionOnly: true,
        expiry: {
          duration: newExpiryTime - Date.now(),
          refreshOnAccess: true
        }
      });
      
      if (success) {
        // Notify about state change
        dispatchTestModeEvent(TEST_MODE_EVENTS.STATE_CHANGED, { 
          state: updatedTestMode 
        });
        logger.debug('Test mode duration extended:', additionalTime);
      }
      
      return success;
    } catch (error) {
      logger.error('Error extending test mode duration:', error);
      return false;
    }
  }
  
  /**
   * Update test mode initial role
   * 
   * @param newInitialRole The new initial role
   * @returns boolean indicating success
   */
  updateTestModeInitialRole(newInitialRole: UserRole): boolean {
    try {
      const testMode = this.getTestModeState();
      
      if (!testMode || !testMode.enabled) {
        return false;
      }
      
      // Update test mode state
      const updatedTestMode: TestModeState = {
        ...testMode,
        initialRole: newInitialRole
      };
      
      // Store updated state
      const success = this.storage.setSecureItem(STORAGE_KEYS.TEST_MODE, updatedTestMode, {
        sessionOnly: true,
        expiry: {
          duration: testMode.expiryTime - Date.now(),
          refreshOnAccess: true
        }
      });
      
      if (success) {
        // Notify about state change
        dispatchTestModeEvent(TEST_MODE_EVENTS.STATE_CHANGED, { 
          state: updatedTestMode 
        });
        logger.debug('Test mode initial role updated:', newInitialRole);
      }
      
      return success;
    } catch (error) {
      logger.error('Error updating test mode initial role:', error);
      return false;
    }
  }
  
  /**
   * Factory method to create a TestModeStorageService with custom storage
   * 
   * @param storage Custom EnhancedStorageService instance
   * @returns TestModeStorageService instance
   */
  static withCustomStorage(storage: EnhancedStorageService): TestModeStorageService {
    return new TestModeStorageService(storage);
  }
}

// Export singleton instance for app-wide use
export const testModeStorage = new TestModeStorageService();

// Register automatic timer to check for expired test mode sessions
if (typeof window !== 'undefined') {
  // Check every minute
  const CHECK_INTERVAL = 60 * 1000;
  
  setInterval(() => {
    const testModeState = testModeStorage.getTestModeState();
    if (testModeState && testModeState.enabled && testModeState.expiryTime < Date.now()) {
      logger.debug('Test mode expired, disabling');
      testModeStorage.disableTestMode();
    }
  }, CHECK_INTERVAL);
}