/**
 * Self-contained Test Mode Event System
 * 
 * This file provides a simple event system for test mode functionality
 * without circular dependencies.
 */

import { logger } from './logger';

// Define event constants directly
const ROLE_EVENTS = {
  ROLE_CHANGED: 'role:changed',
  ROLES_UPDATED: 'role:roles-updated',
  PERMISSION_CHANGED: 'role:permission-changed',
  ROLE_ERROR: 'role:error',
  PERMISSION_DENIED: 'role:permission-denied',
} as const;

const NEW_TEST_MODE_EVENTS = {
  STATE_CHANGED: 'testmode:state-changed',
  ACTIVATED: 'testmode:activated',
  DEACTIVATED: 'testmode:deactivated',
} as const;

// Test mode state type
export type TestModeState = 'enabled' | 'disabled';

// Re-export the event names for backward compatibility
export const TEST_MODE_EVENTS = {
  STATE_CHANGED: NEW_TEST_MODE_EVENTS.STATE_CHANGED,
  ROLE_CHANGED: ROLE_EVENTS.ROLE_CHANGED,
  ACTIVATED: NEW_TEST_MODE_EVENTS.ACTIVATED,
  DEACTIVATED: NEW_TEST_MODE_EVENTS.DEACTIVATED,
  ROLES_UPDATED: ROLE_EVENTS.ROLES_UPDATED,
} as const;

// Define the type for event names
export type TestModeEventType = typeof TEST_MODE_EVENTS[keyof typeof TEST_MODE_EVENTS];

// Define the payload types for each event
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
 * Simple implementation that uses custom events to avoid circular dependencies
 */
export const dispatchTestModeEvent = <T extends TestModeEventType>(
  eventType: T, 
  payload: T extends keyof TestModeEventPayloads ? TestModeEventPayloads[T] : never
): void => {
  try {
    if (typeof window === 'undefined') return;
    
    // Use native CustomEvent to avoid circular dependencies
    const event = new CustomEvent(eventType, { 
      detail: payload,
      bubbles: true
    });
    
    window.dispatchEvent(event);
    logger.log(`Dispatched event: ${eventType}`);
  } catch (error) {
    logger.log(`Error dispatching test mode event ${eventType}: ${String(error)}`);
  }
};

/**
 * Add an event listener for a test mode event
 * Simple implementation using native event listeners
 */
export const addTestModeEventListener = <T extends TestModeEventType>(
  eventType: T,
  handler: (payload: T extends keyof TestModeEventPayloads ? TestModeEventPayloads[T] : never) => void
): () => void => {
  if (typeof window === 'undefined') {
    return () => {}; // No-op for SSR
  }

  const wrappedHandler = (event: CustomEvent) => {
    try {
      handler(event.detail);
    } catch (error) {
      logger.log(`Error in event handler for ${eventType}: ${String(error)}`);
    }
  };

  window.addEventListener(eventType, wrappedHandler as EventListener);
  
  // Return cleanup function
  return () => {
    window.removeEventListener(eventType, wrappedHandler as EventListener);
  };
};

/**
 * Check if a string is a valid TestModeEventType
 */
export const isTestModeEventType = (eventType: string): eventType is TestModeEventType => {
  return Object.values(TEST_MODE_EVENTS).includes(eventType as TestModeEventType);
};