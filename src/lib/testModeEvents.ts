/**
 * Modernized Test Mode Event System
 * 
 * This file serves as a compatibility layer between the legacy test mode event system
 * and the new unified event system. It directly uses the modern event system internally
 * while maintaining the original API for backward compatibility.
 */

import { logger } from './logger';
import {
  dispatchRoleEvent,
  dispatchTestModeEvent as newDispatchTestModeEvent,
  dispatchAppEvent,
  addAppEventListener,
  TEST_MODE_EVENTS as NEW_TEST_MODE_EVENTS,
  TestModeEventPayloads as NewTestModeEventPayloads
} from './events';
import { ROLE_EVENTS } from './events/eventTypes';
import '@/context/RoleContext';
import '@/services/storageService';

// Re-export the new event names with the old naming for backward compatibility
export const TEST_MODE_EVENTS = {
  STATE_CHANGED: NEW_TEST_MODE_EVENTS.STATE_CHANGED,
  ROLE_CHANGED: ROLE_EVENTS.ROLE_CHANGED,
  ACTIVATED: NEW_TEST_MODE_EVENTS.ACTIVATED,
  DEACTIVATED: NEW_TEST_MODE_EVENTS.DEACTIVATED,
  ROLES_UPDATED: ROLE_EVENTS.ROLES_UPDATED,
} as const;

// Define the type for event names
export type TestModeEventType = typeof TEST_MODE_EVENTS[keyof typeof TEST_MODE_EVENTS];

// Define the payload types for each event (for compatibility)
export type TestModeEventPayloads = {
  [TEST_MODE_EVENTS.STATE_CHANGED]: { state: TestModeState };
  [TEST_MODE_EVENTS.ROLE_CHANGED]: { 
    from: string; 
    to: string;
    availableRoles: string[];
  };
  [TEST_MODE_EVENTS.ACTIVATED]: { 
    expiryTime: number;
    initialRole: string;
  };
  [TEST_MODE_EVENTS.DEACTIVATED]: undefined;
  [TEST_MODE_EVENTS.ROLES_UPDATED]: {
    availableRoles: string[];
    currentRole: string;
  };
};

/**
 * Dispatch a test mode event with type-safe payload
 * This implementation now directly uses the modern event system
 */
export const dispatchTestModeEvent = <T extends TestModeEventType>(
  eventType: T, 
  payload: T extends keyof TestModeEventPayloads ? TestModeEventPayloads[T] : never
): void => {
  try {
    if (typeof window === 'undefined') return;
    
    // Directly use the modern event system
    switch (eventType) {
      case TEST_MODE_EVENTS.STATE_CHANGED:
        newDispatchTestModeEvent(NEW_TEST_MODE_EVENTS.STATE_CHANGED, payload as any);
        break;
      case TEST_MODE_EVENTS.ROLE_CHANGED:
        dispatchRoleEvent(ROLE_EVENTS.ROLE_CHANGED, payload as any);
        break;
      case TEST_MODE_EVENTS.ACTIVATED:
        newDispatchTestModeEvent(NEW_TEST_MODE_EVENTS.ACTIVATED, payload as any);
        break;
      case TEST_MODE_EVENTS.DEACTIVATED:
        newDispatchTestModeEvent(NEW_TEST_MODE_EVENTS.DEACTIVATED, payload as any);
        break;
      case TEST_MODE_EVENTS.ROLES_UPDATED:
        dispatchRoleEvent(ROLE_EVENTS.ROLES_UPDATED, payload as any);
        break;
      default:
        logger.log(`Unknown event type: ${eventType}`);
    }
  } catch (error) {
    logger.log(`Error dispatching test mode event ${eventType}:`, error);
  }
};

/**
 * Add an event listener for a test mode event
 * This implementation now directly uses the modern event system
 */
export const addTestModeEventListener = <T extends TestModeEventType>(
  eventType: T,
  handler: (payload: T extends keyof TestModeEventPayloads ? TestModeEventPayloads[T] : never) => void
): () => void => {
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
      logger.log(`Unknown event type: ${eventType}`);
      return () => {}; // Return a no-op cleanup function
  }
};

/**
 * Check if a string is a valid TestModeEventType
 */
export const isTestModeEventType = (eventType: string): eventType is TestModeEventType => {
  return Object.values(TEST_MODE_EVENTS).includes(eventType as TestModeEventType);
};