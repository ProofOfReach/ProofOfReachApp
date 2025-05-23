import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { logger } from '../lib/logger';
import "./services/storageService';
import { 
  dispatchTestModeEvent, 
  TEST_MODE_EVENTS, 
  addTestModeEventListener 
} from '@/lib/testModeEvents';
import "./types/role';
import "./services/roleManager';

/**
 * Enhanced TestMode Context Interface
 * Provides a comprehensive API for managing test mode state
 */
interface TestModeContextType {
  // Core test mode state
  isTestMode: boolean;
  timeRemaining: number | null;
  currentRole: UserRoleType;
  availableRoles: UserRoleType[];
  
  // Actions
  enableTestMode: () => void;
  disableTestMode: () => void;
  enableAllRoles: () => Promise<boolean>;
  setCurrentRole: (role: UserRoleType) => Promise<boolean>;
  
  // State information
  isTestModeAvailable: boolean;
  isDevEnvironment: boolean;
  isDevelopment: boolean;
  
  // State management
  updateTestModeState: (updates: Partial<TestModeState>) => boolean;
}

// Create the context with a default value
const TestModeContext = createContext<TestModeContextType | null>(null);

// Provider component props
interface TestModeProviderProps {
  children: ReactNode;
}

// Check if we're in a development environment
const isDevelopmentEnv = process.env.NODE_ENV === 'development';
const isTestEnv = process.env.NODE_ENV === 'test';

/**
 * TestMode Provider Component (Modernized)
 * Manages test mode state and provides a consistent API for interacting with it
 */
export const TestModeProvider: React.FC<TestModeProviderProps> = ({ children }) => {
  // Core state
  const [isTestMode, setIsTestMode] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRoleType>('viewer');
  const [availableRoles, setAvailableRoles] = useState<UserRoleType[]>(['viewer']);
  
  /**
   * Helper function to update the full test mode state
   * This ensures all components get consistent updates
   */
  const updateTestModeState = useCallback((updates: Partial<TestModeState>): boolean => {
    try {
      // Get current state or create default
      let state = StorageService.getTestModeState();
      if (!state && updates.isActive) {
        // Initialize with defaults if enabling
        state = StorageService.createDefaultTestModeState();
      } else if (!state) {
        // Nothing to update if not enabling and no existing state
        return false;
      }
      
      // Apply updates
      const updatedState: TestModeState = {
        ...state,
        ...updates,
        lastUpdated: Date.now()
      };
      
      // Persist state
      const success = StorageService.setTestModeState(updatedState);
      
      if (success) {
        // Update React state
        setIsTestMode(updatedState.isActive);
        if (updatedState.expiryTime) {
          setTimeRemaining(Math.floor((updatedState.expiryTime - Date.now()) / 1000 / 60));
        } else {
          setTimeRemaining(null);
        }
        setCurrentRole(updatedState.currentRole);
        setAvailableRoles(updatedState.availableRoles);
        
        // Dispatch standardized event
        dispatchTestModeEvent(TEST_MODE_EVENTS.STATE_CHANGED, { state: updatedState });
        
        return true;
      }
      
      return false;
    } catch (error) {
      logger.logger.error('Error updating test mode state:', error);
      return false;
    }
  }, []);
  
  /**
   * Synchronize with storage on mount and handle legacy formats
   * Enhanced to integrate with RoleManager as the source of truth for roles
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Flag to prevent multiple state updates in the same cycle
    let isInitializing = true;
    
    const initializeTestMode = () => {
      // Check for test mode state in the new format
      const storedState = StorageService.getTestModeState();
      
      if (storedState) {
        // Check if test mode is still valid (not expired)
        const now = Date.now();
        if (storedState.isActive && (!storedState.expiryTime || storedState.expiryTime > now)) {
          // Valid test mode - update local state
          setIsTestMode(true);
          if (storedState.expiryTime) {
            setTimeRemaining(Math.floor((storedState.expiryTime - now) / 1000 / 60));
          }
          
          // Get role information from RoleManager as the source of truth
          const currentRoleFromManager = RoleManager.getCurrentRole();
          const availableRolesFromManager = RoleManager.getAvailableRoles();
          
          // Update local state with role information from RoleManager
          setCurrentRole(currentRoleFromManager);
          setAvailableRoles(availableRolesFromManager);
          
          // If the test mode state doesn't match the RoleManager, update it for consistency
          if (currentRoleFromManager !== storedState.currentRole || 
              JSON.stringify(availableRolesFromManager) !== JSON.stringify(storedState.availableRoles)) {
            const updatedState: TestModeState = {
              ...storedState,
              currentRole: currentRoleFromManager,
              availableRoles: availableRolesFromManager,
              lastUpdated: Date.now()
            };
            StorageService.setTestModeState(updatedState);
          }
          
          // Make sure bypass flag is set for compatibility
          localStorage.setItem(STORAGE_KEYS.BYPASS_API_CALLS, 'true');
          return;
        } else {
          // Test mode has expired
          StorageService.clearTestModeState();
          setIsTestMode(false);
          setTimeRemaining(null);
          return;
        }
      }
      
      // Check legacy storage - but only during initialization
      if (isInitializing) {
        const legacyCheck = () => {
          // First check session storage (previous implementation)
          const testModeExpiry = sessionStorage?.getItem('testModeExpiry');
          if (testModeExpiry) {
            const expiryTime = parseInt(testModeExpiry, 10);
            const now = Date.now();
            
            if (expiryTime > now) {
              // Test mode is active and not expired - migrate to new format using RoleManager
              
              // Get roles from RoleManager or fallback to stored values
              const currentRoleFromManager = RoleManager.getCurrentRole();
              const availableRolesFromManager = RoleManager.getAvailableRoles();
              
              // Create new state object
              const newState: TestModeState = {
                isActive: true,
                expiryTime,
                currentRole: currentRoleFromManager,
                availableRoles: availableRolesFromManager,
                lastUpdated: Date.now()
              };
              
              // Store in new format
              StorageService.setTestModeState(newState);
              
              // Update local state
              setIsTestMode(true);
              setTimeRemaining(Math.floor((expiryTime - now) / 1000 / 60));
              setCurrentRole(currentRoleFromManager);
              setAvailableRoles(availableRolesFromManager);
              
              // Set compatibility flag
              localStorage.setItem(STORAGE_KEYS.BYPASS_API_CALLS, 'true');
              return true;
            } else {
              // Test mode has expired - clear legacy data
              sessionStorage.removeItem('testModeExpiry');
              sessionStorage.removeItem('testModeEnabled');
              localStorage.removeItem(STORAGE_KEYS.BYPASS_API_CALLS);
              localStorage.removeItem('isTestMode');
              return false;
            }
          }
          
          // Finally check older localStorage format
          const isLegacyTestMode = localStorage?.getItem('isTestMode') === 'true';
          if (isLegacyTestMode) {
            // Migrate old format to new one
            const expiryTime = Date.now() + (4 * 60 * 60 * 1000); // 4 hours
            
            // Create new state object
            const newState: TestModeState = {
              isActive: true,
              expiryTime,
              currentRole: 'viewer',
              availableRoles: ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'],
              lastUpdated: Date.now()
            };
            
            // Store in new format
            StorageService.setTestModeState(newState);
            
            // Update local state
            setIsTestMode(true);
            setTimeRemaining(240); // 4 hours in minutes
            setCurrentRole('viewer');
            setAvailableRoles(['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder']);
            
            // Set compatibility flag
            localStorage.setItem(STORAGE_KEYS.BYPASS_API_CALLS, 'true');
            return true;
          }
          
          return false;
        };
        
        // Run legacy check if no new state found
        legacyCheck();
      }
    };
    
    // Run initialization
    initializeTestMode();
    isInitializing = false;
    
    // Set up event listeners for the new event format
    const handleStateChanged = (event: CustomEvent) => {
      if (!event || !event.detail) {
        logger.warn('State changed event received with invalid detail');
        return;
      }
      
      const { state } = event.detail;
      if (state) {
        setIsTestMode(state.isActive);
        if (state.expiryTime) {
          setTimeRemaining(Math.floor((state.expiryTime - Date.now()) / 1000 / 60));
        } else {
          setTimeRemaining(null);
        }
        setCurrentRole(state.currentRole);
        setAvailableRoles(state.availableRoles);
      }
    };
    
    // Listen for role changes
    const handleRoleChanged = (event: CustomEvent) => {
      // Add defensive checks for event.detail
      if (!event || !event.detail) {
        logger.warn('Role changed event received with invalid detail');
        return;
      }
      
      const { to } = event.detail;
      if (to) {
        setCurrentRole(to as UserRoleType);
      }
    };
    
    // Set up legacy event listeners
    const handleLegacyTestModeEnabled = () => {
      const expiryTime = Date.now() + (4 * 60 * 60 * 1000); // 4 hours
      const newState: TestModeState = {
        isActive: true,
        expiryTime,
        currentRole: currentRole || 'viewer',
        availableRoles: availableRoles.length ? availableRoles : ['viewer'],
        lastUpdated: Date.now()
      };
      
      StorageService.setTestModeState(newState);
      
      setIsTestMode(true);
      setTimeRemaining(240); // 4 hours in minutes
    };
    
    const handleLegacyTestModeDisabled = () => {
      StorageService.clearTestModeState();
      setIsTestMode(false);
      setTimeRemaining(null);
    };
    
    // Add event listeners
    const removeStateListener = addTestModeEventListener(
      TEST_MODE_EVENTS.STATE_CHANGED, 
      handleStateChanged as any
    );
    
    const removeRoleListener = addTestModeEventListener(
      TEST_MODE_EVENTS.ROLE_CHANGED,
      handleRoleChanged as any
    );
    
    document.addEventListener('testModeEnabled', handleLegacyTestModeEnabled);
    document.addEventListener('testModeDisabled', handleLegacyTestModeDisabled);
    
    // Check every minute to update the countdown
    const interval = setInterval(() => {
      if (isTestMode && timeRemaining !== null) {
        // Update time remaining
        const storedState = StorageService.getTestModeState();
        if (storedState?.expiryTime) {
          const remaining = Math.floor((storedState.expiryTime - Date.now()) / 1000 / 60);
          if (remaining <= 0) {
            // Test mode has expired
            StorageService.clearTestModeState();
            setIsTestMode(false);
            setTimeRemaining(null);
          } else {
            setTimeRemaining(remaining);
          }
        }
      }
    }, 60000);
    
    // Clean up on unmount
    return () => {
      clearInterval(interval);
      removeStateListener();
      removeRoleListener();
      document.removeEventListener('testModeEnabled', handleLegacyTestModeEnabled);
      document.removeEventListener('testModeDisabled', handleLegacyTestModeDisabled);
    };
  }, []); // Empty dependency array to run only on mount
  
  /**
   * Enable test mode with standardized approach
   */
  const enableTestMode = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      // Set expiry to 4 hours from now
      const expiryTime = Date.now() + (4 * 60 * 60 * 1000);
      
      // Create or update test mode state
      const newState: TestModeState = {
        isActive: true,
        expiryTime,
        // Use the current state value directly, not from the dependency
        currentRole: 'viewer', // Default to 'viewer' for consistency with role types
        availableRoles: ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'],
        lastUpdated: Date.now()
      };
      
      // Persist state and update UI
      const success = updateTestModeState(newState);
      
      if (success) {
        // For backwards compatibility with code that checks this flag
        localStorage.setItem(STORAGE_KEYS.BYPASS_API_CALLS, 'true');
        
        // Dispatch standardized activation event
        dispatchTestModeEvent(TEST_MODE_EVENTS.ACTIVATED, { 
          expiryTime, 
          initialRole: 'viewer' // Default to 'viewer' for consistency with role types
        });
        
        logger.log('Test mode enabled successfully');
      } else {
        logger.logger.error('Failed to enable test mode');
      }
    } catch (error) {
      logger.logger.error('Error enabling test mode', error);
    }
  }, [updateTestModeState]);
  
  /**
   * Disable test mode with standardized approach
   */
  const disableTestMode = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      // Clear all test mode state
      StorageService.clearTestModeState();
      
      // Update local state
      setIsTestMode(false);
      setTimeRemaining(null);
      
      // Dispatch standardized deactivation event
      dispatchTestModeEvent(TEST_MODE_EVENTS.DEACTIVATED, undefined);
      
      logger.log('Test mode disabled');
    } catch (error) {
      logger.logger.error('Error disabling test mode', error);
    }
  }, []);
  
  /**
   * Enable all roles in test mode
   * Fully delegated to RoleManager service
   */
  const enableAllRoles = useCallback(async (): Promise<boolean> => {
    // Check if test mode is active
    const checkTestMode = () => StorageService.isTestModeActive();
    
    if (!checkTestMode()) {
      logger.warn('Cannot enable all roles: Test mode is not active');
      return false;
    }
    
    try {
      // Fully delegate to RoleManager
      const roleSuccess = RoleManager.enableAllRoles();
      if (!roleSuccess) {
        logger.logger.error('Failed to enable all roles via RoleManager');
        return false;
      }
      
      // Get the roles from RoleManager
      const allRoles = RoleManager.getAvailableRoles();
      
      // Get current state
      const currentState = StorageService.getTestModeState();
      if (currentState) {
        // Keep TestModeState in sync with RoleManager
        const updatedState: TestModeState = {
          ...currentState,
          availableRoles: allRoles,
          lastUpdated: Date.now()
        };
        
        // Store updated state
        StorageService.setTestModeState(updatedState);
      }
      
      // Update local state
      setAvailableRoles(allRoles);
      
      logger.log('All roles enabled in test mode');
      return true;
    } catch (error) {
      logger.logger.error('Error enabling all roles in test mode', error);
      return false;
    }
  }, []);
  
  /**
   * Set current role in test mode
   * Fully delegated to RoleManager service
   */
  const setCurrentRoleAction = useCallback(async (role: UserRoleType): Promise<boolean> => {
    // Check if test mode is active
    const checkTestMode = () => StorageService.isTestModeActive();
    
    if (!checkTestMode()) {
      logger.warn('Cannot change role: Test mode is not active');
      return false;
    }
    
    try {
      logger.log(`Setting current role to: ${role}`);
      
      // Fully delegate to RoleManager
      const roleSuccess = RoleManager.setCurrentRole(role);
      if (!roleSuccess) {
        logger.logger.error(`Failed to set role to ${role} via RoleManager`);
        return false;
      }
      
      // Get current state
      const currentState = StorageService.getTestModeState();
      if (currentState) {
        // Keep TestModeState in sync with RoleManager (don't modify RoleManager state)
        const updatedState: TestModeState = {
          ...currentState,
          currentRole: role,
          lastUpdated: Date.now()
        };
        
        // Store updated state
        StorageService.setTestModeState(updatedState);
      }
      
      // Update local React state
      setCurrentRole(role);
      
      return true;
    } catch (error) {
      logger.logger.error('Error changing role in test mode', error);
      return false;
    }
  }, []);
  
  // Determine if test mode should be available
  // Only in development or test environments
  const isTestModeAvailable = isDevelopmentEnv || isTestEnv;
  
  // Define the context value
  const contextValue: TestModeContextType = {
    isTestMode,
    timeRemaining,
    currentRole,
    availableRoles,
    enableTestMode,
    disableTestMode,
    enableAllRoles,
    setCurrentRole: setCurrentRoleAction,
    isTestModeAvailable,
    isDevEnvironment: isDevelopmentEnv,
    isDevelopment: isDevelopmentEnv || isTestEnv,
    updateTestModeState
  };
  
  return (
    <TestModeContext.Provider value={contextValue}>
      {children}
    </TestModeContext.Provider>
  );
};

/**
 * Hook for using the test mode context
 */
export const useTestMode = () => {
  const context = useContext(TestModeContext);
  if (!context) {
    // In test environment, provide a fallback mock context
    if (process.env.NODE_ENV === 'test') {
      return {
        isTestMode: false,
        timeRemaining: null,
        currentRole: 'viewer',
        availableRoles: ['viewer'],
        isTestModeAvailable: true,
        isDevEnvironment: true,
        isDevelopment: true,
        enableTestMode: () => {},
        disableTestMode: () => {},
        enableAllRoles: async () => true,
        setCurrentRole: async () => true,
        updateTestModeState: () => true
      };
    }
    throw new Error('useTestMode must be used within a TestModeProvider');
  }
  return context;
};

/**
 * Utility function to check test mode status
 * This can be used in non-React code
 */
export const getTestModeStatus = (): boolean => {
  // Handle SSR
  if (typeof window === 'undefined') return false;
  
  // Use new storage service
  return StorageService.isTestModeActive();
};

/**
 * Check if environment is development
 */
export const isDevelopmentEnvironment = (): boolean => {
  return process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
};