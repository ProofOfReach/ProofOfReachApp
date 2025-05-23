/**
 * Event Listener
 * 
 * This module provides utilities for listening to application events
 * in a type-safe and consistent manner, with proper cleanup
 * and support for both modern and legacy events.
 */

import { logger } from '../logger';
import { 
  AppEventType, 
  AppEventPayloads,
  LegacyEventType,
  isAppEventType,
  isLegacyEventType
} from './eventTypes';

/**
 * Add an event listener for an application event with type safety
 * 
 * @param eventType The type of event to listen for
 * @param handler The event handler function
 * @returns A cleanup function to remove the event listener
 */
export const addAppEventListener = <T extends AppEventType>(
  eventType: T,
  handler: (payload: T extends keyof AppEventPayloads ? AppEventPayloads[T] : never) => void
): () => void => {
  if (typeof window === 'undefined') return () => {};
  
  const eventHandler = (event: CustomEvent) => {
    // Add safety check for event.detail
    if (event && event.detail !== undefined) {
      handler(event.detail);
    } else {
      logger.warn(`Event ${eventType} received with undefined detail`);
    }
  };
  
  window.addEventListener(eventType, eventHandler as EventListener);
  
  // Return a cleanup function
  return () => {
    window.removeEventListener(eventType, eventHandler as EventListener);
  };
};

/**
 * Add an event listener for a legacy event
 * 
 * @param eventType The legacy event type
 * @param handler The event handler function
 * @returns A cleanup function to remove the event listener
 */
export const addLegacyEventListener = (
  eventType: LegacyEventType,
  handler: (event: CustomEvent) => void
): () => void => {
  if (typeof window === 'undefined') return () => {};
  
  // Determine if we should listen on window or document
  const target = eventType.startsWith('test') || eventType === 'roleSwitched' 
    ? document 
    : window;
  
  target.addEventListener(eventType, handler as EventListener);
  
  // Return a cleanup function
  return () => {
    target.removeEventListener(eventType, handler as EventListener);
  };
};

/**
 * Add an event listener for a storage event
 * Used for backward compatibility with older components
 * 
 * @param key The storage key to watch
 * @param handler The event handler function
 * @returns A cleanup function to remove the event listener
 */
export const addStorageEventListener = (
  key: UserRole,
  handler: (newValue: string | null, oldValue: string | null) => void
): () => void => {
  if (typeof window === 'undefined') return () => {};
  
  const storageHandler = (event: StorageEvent) => {
    if (event.key === key) {
      handler(event.newValue, event.oldValue);
    }
  };
  
  window.addEventListener('storage', storageHandler);
  
  // Return a cleanup function
  return () => {
    window.removeEventListener('storage', storageHandler);
  };
};

/**
 * Generic function for adding an event listener to any event
 * This is useful when you don't know the event type at compile time
 * 
 * @param eventName The name of the event to listen for
 * @param handler The event handler function
 * @returns A cleanup function to remove the event listener
 */
export const addEventListener = (
  eventName: UserRole,
  handler: (event: CustomEvent) => void
): () => void => {
  if (typeof window === 'undefined') return () => {};
  
  // Determine if this is a modern event, legacy event, or unknown
  if (isAppEventType(eventName)) {
    return addAppEventListener(eventName, (payload) => {
      handler(new CustomEvent(eventName, { detail: payload }));
    });
  } else if (isLegacyEventType(eventName)) {
    return addLegacyEventListener(eventName, handler);
  } else {
    // Unknown event type - just add a generic listener
    logger.warn(`Adding listener for unknown event type: ${eventName}`);
    const target = eventName.startsWith('test') ? document : window;
    target.addEventListener(eventName, handler as EventListener);
    return () => {
      target.removeEventListener(eventName, handler as EventListener);
    };
  }
};