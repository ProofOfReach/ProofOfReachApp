/**
 * useTestMode Hook - Provides a simplified interface for components to interact with TestMode
 * 
 * This hook abstracts the TestModeService and provides a React-friendly interface
 * for common test mode operations. It ensures that components are re-rendered when 
 * test mode state changes and provides appropriate typing for TypeScript.
 * 
 * Part of the Phase 6 TestMode modernization strategy.
 */

import { useState, useEffect, useCallback } from 'react';
import '@/services/testModeService';
import '@/types/role';
import '@/hooks/useAppEvent';
import '@/lib/events/eventTypes';
import '@/lib/logger';

/**
 * Interface for the hook return value
 */
export interface UseTestModeResult {
  // State
  isActive: boolean;
  timeRemaining: number | null;
  currentRole: string;
  availableRoles: string[];
  isDevEnvironment: boolean;
  
  // Actions
  enableTestMode: (duration?: number, initialRole?: UserRole, debug?: boolean) => boolean;
  disableTestMode: () => boolean;
  setCurrentRole: (role: string) => Promise<boolean>;
  enableAllRoles: () => boolean;
  
  // Utility functions
  createTimeLimitedSession: (minutes: number, role?: string) => boolean;
  createTestScenario: (scenario: 'admin' | 'publisher' | 'advertiser' | 'stakeholder') => boolean;
  setDebugMode: (enabled: boolean) => void;
  
  // Environment
  isTestModeAllowed: boolean;
}

/**
 * Hook for accessing and managing test mode functionality
 * 
 * @returns Object containing test mode state and functions
 */
export function useTestMode(): UseTestModeResult {
  // Get initial values
  const [isActive, setIsActive] = useState<boolean>(testModeService.isActive());
  const [timeRemaining, setTimeRemaining] = useState<number | null>(testModeService.getTimeRemaining());
  const [currentRole, setCurrentRole] = useState<UserRole>(testModeService.getCurrentRole());
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>(testModeService.getAvailableRoles());
  
  // Environment flags
  const isDevEnvironment = process.env.NODE_ENV === 'development' || (
    typeof window !== 'undefined' && 
    // Use type assertion to handle __DEV__ property
    (window as any).__DEV__ === true
  );
  const isTestModeAllowed = testModeService.isTestModeAllowed();
  
  // Use our app event system to listen for test mode events
  useAppEvent(TEST_MODE_EVENTS.ACTIVATED, (payload) => {
    if (!payload) return;
    
    setIsActive(true);
    if (payload.expiryTime) {
      const now = Date.now();
      setTimeRemaining(Math.floor((payload.expiryTime - now) / 1000 / 60));
    }
    if (payload.initialRole) {
      setCurrentRole(payload.initialRole as UserRole);
    }
    logger.debug('TestMode activated event received in useTestMode hook');
  });
  
  useAppEvent(TEST_MODE_EVENTS.DEACTIVATED, () => {
    setIsActive(false);
    setTimeRemaining(null);
    logger.debug('TestMode deactivated event received in useTestMode hook');
  });
  
  useAppEvent(ROLE_EVENTS.ROLE_CHANGED, (payload) => {
    if (payload && payload.to) {
      setCurrentRole(payload.to as UserRole);
      logger.debug(`Role changed event received in useTestMode hook: ${payload.from} -> ${payload.to}`);
    }
  });
  
  useAppEvent(ROLE_EVENTS.ROLES_UPDATED, (payload) => {
    if (payload && payload.availableRoles) {
      setAvailableRoles(payload.availableRoles as UserRole[]);
      if (payload.currentRole) {
        setCurrentRole(payload.currentRole as UserRole);
      }
      logger.debug(`Roles updated event received in useTestMode hook: ${payload.availableRoles.join(', ')}`);
    }
  });
  
  // Timer effect to update timeRemaining
  useEffect(() => {
    // Only set up the timer if test mode is active
    if (!isActive) return;
    
    // Check every minute
    const timer = setInterval(() => {
      const remaining = testModeService.getTimeRemaining();
      setTimeRemaining(remaining);
      
      // If test mode expired, update state
      if (remaining !== null && remaining <= 0) {
        setIsActive(false);
        setTimeRemaining(null);
      }
    }, 60000);
    
    // Cleanup on unmount
    return () => clearInterval(timer);
  }, [isActive]);
  
  // Actions
  const enableTestMode = useCallback((
    duration?: number,
    initialRole?: UserRole,
    debug?: boolean
  ): boolean => {
    return testModeService.enableTestMode(duration, initialRole, debug);
  }, []);
  
  const disableTestMode = useCallback((): boolean => {
    return testModeService.disableTestMode();
  }, []);
  
  const switchRole = useCallback(async (role: string): Promise<boolean> => {
    return testModeService.setCurrentRole(role);
  }, []);
  
  const enableAllRoles = useCallback((): boolean => {
    return testModeService.enableAllRoles();
  }, []);
  
  // Utility functions
  const createTimeLimitedSession = useCallback((
    minutes: number,
    role?: string
  ): boolean => {
    return testModeService.createTimeLimitedSession(minutes, role);
  }, []);
  
  const createTestScenario = useCallback((
    scenario: 'admin' | 'publisher' | 'advertiser' | 'stakeholder'
  ): boolean => {
    return testModeService.createTestScenario(scenario);
  }, []);
  
  const setDebugMode = useCallback((enabled: boolean): void => {
    testModeService.setDebugMode(enabled);
  }, []);
  
  // Return the interface
  return {
    // State
    isActive,
    timeRemaining,
    currentRole,
    availableRoles,
    isDevEnvironment,
    isTestModeAllowed,
    
    // Actions
    enableTestMode,
    disableTestMode,
    setCurrentRole: switchRole,
    enableAllRoles,
    
    // Utility functions
    createTimeLimitedSession,
    createTestScenario,
    setDebugMode,
  };
}

export default useTestMode;