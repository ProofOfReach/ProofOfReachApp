/**
 * Test Mode Event System (Legacy)
 * 
 * DEPRECATED: Use the new event system from @/lib/events instead.
 * 
 * This file is kept for backward compatibility with existing code,
 * but new code should use the unified event system instead.
 */

import { logger } from './logger';
import {
  TEST_MODE_EVENTS as NEW_TEST_MODE_EVENTS,
  ROLE_EVENTS,
  TestModeEventPayloads as NewTestModeEventPayloads,
  dispatchTestModeEvent as newDispatchTestModeEvent,
  dispatchAppEvent,
  addAppEventListener
} from './events';
import { UserRole } from '@/context/RoleContext';
import { TestModeState } from '@/services/storageService';

// Re-export the new event names with the old naming for backward compatibility
export const TEST_MODE_EVENTS = {
  STATE_CHANGED: NEW_TEST_MODE_EVENTS.STATE_CHANGED,
  ROLE_CHANGED: ROLE_EVENTS.ROLE_CHANGED, // This changed in the new system
  ACTIVATED: NEW_TEST_MODE_EVENTS.ACTIVATED,
  DEACTIVATED: NEW_TEST_MODE_EVENTS.DEACTIVATED,
  ROLES_UPDATED: ROLE_EVENTS.ROLES_UPDATED, // This changed in the new system
} as const;

// Define the type for event names
export type TestModeEventType = typeof TEST_MODE_EVENTS[keyof typeof TEST_MODE_EVENTS];

// Define the payload types for each event (for compatibility)
export type TestModeEventPayloads = {
  [TEST_MODE_EVENTS.STATE_CHANGED]: { state: TestModeState };
  [TEST_MODE_EVENTS.ROLE_CHANGED]: { 
    from: UserRole; 
    to: UserRole;
    availableRoles: UserRole[];
  };
  [TEST_MODE_EVENTS.ACTIVATED]: { 
    expiryTime: number;
    initialRole: UserRole;
  };
  [TEST_MODE_EVENTS.DEACTIVATED]: undefined;
  [TEST_MODE_EVENTS.ROLES_UPDATED]: {
    availableRoles: UserRole[];
    currentRole: UserRole;
  };
};

/**
 * Dispatch a test mode event with type-safe payload
 * DEPRECATED: Use the new event system from @/lib/events instead.
 */
export const dispatchTestModeEvent = <T extends TestModeEventType>(
  eventType: T, 
  payload: T extends keyof TestModeEventPayloads ? TestModeEventPayloads[T] : never
): void => {
  try {
    if (typeof window === 'undefined') return;
    
    // Log deprecation warning in development
    if (process.env.NODE_ENV === 'development') {
      logger.warn(`DEPRECATED: Using old testModeEvents.ts is deprecated. Use the new event system from @/lib/events instead.`);
    }
    
    // Map to the new event system using the new imported dispatcher directly
    switch (eventType) {
      case TEST_MODE_EVENTS.STATE_CHANGED:
        // Use the appropriate dispatcher from new event system
        dispatchAppEvent(NEW_TEST_MODE_EVENTS.STATE_CHANGED, payload as any);
        break;
      case TEST_MODE_EVENTS.ROLE_CHANGED:
        dispatchAppEvent(ROLE_EVENTS.ROLE_CHANGED, payload as any);
        break;
      case TEST_MODE_EVENTS.ACTIVATED:
        dispatchAppEvent(NEW_TEST_MODE_EVENTS.ACTIVATED, payload as any);
        break;
      case TEST_MODE_EVENTS.DEACTIVATED:
        dispatchAppEvent(NEW_TEST_MODE_EVENTS.DEACTIVATED, payload as any);
        break;
      case TEST_MODE_EVENTS.ROLES_UPDATED:
        dispatchAppEvent(ROLE_EVENTS.ROLES_UPDATED, payload as any);
        break;
      default:
        logger.error(`Unknown event type: ${eventType}`);
    }
  } catch (error) {
    logger.error(`Error dispatching test mode event ${eventType}:`, error);
  }
};

/**
 * Add an event listener for a test mode event
 * DEPRECATED: Use the new event system from @/lib/events instead.
 */
export const addTestModeEventListener = <T extends TestModeEventType>(
  eventType: T,
  handler: (payload: T extends keyof TestModeEventPayloads ? TestModeEventPayloads[T] : never) => void
): () => void => {
  // Log deprecation warning in development
  if (process.env.NODE_ENV === 'development') {
    logger.warn(`DEPRECATED: Using old testModeEvents.ts is deprecated. Use the new event system from @/lib/events instead.`);
  }
  
  // Map to the corresponding event in the new system
  switch (eventType) {
    case TEST_MODE_EVENTS.STATE_CHANGED:
      return addAppEventListener(NEW_TEST_MODE_EVENTS.STATE_CHANGED, handler as any);
    case TEST_MODE_EVENTS.ROLE_CHANGED:
      return addAppEventListener(ROLE_EVENTS.ROLE_CHANGED, handler as any);
    case TEST_MODE_EVENTS.ACTIVATED:
      return addAppEventListener(NEW_TEST_MODE_EVENTS.ACTIVATED, handler as any);
    case TEST_MODE_EVENTS.DEACTIVATED:
      return addAppEventListener(NEW_TEST_MODE_EVENTS.DEACTIVATED, handler as any);
    case TEST_MODE_EVENTS.ROLES_UPDATED:
      return addAppEventListener(ROLE_EVENTS.ROLES_UPDATED, handler as any);
    default:
      logger.error(`Unknown event type: ${eventType}`);
      return () => {}; // Return a no-op cleanup function
  }
};

/**
 * Check if a string is a valid TestModeEventType
 * DEPRECATED: Use the new event system from @/lib/events instead.
 */
export const isTestModeEventType = (eventType: string): eventType is TestModeEventType => {
  return Object.values(TEST_MODE_EVENTS).includes(eventType as TestModeEventType);
};