/**
 * useAppEvent Hook
 * 
 * A React hook for subscribing to application events with proper
 * cleanup and TypeScript type safety. This makes it easier for
 * components to respond to events without manual event listener management.
 */

import { useEffect } from 'react';
import { 
  AppEventType, 
  AppEventPayloads,
  LegacyEventType,
  addAppEventListener,
  addLegacyEventListener
} from '@/lib/events';
import type { UserRole } from '@/types/auth';

/**
 * Hook to subscribe to application events
 * 
 * @param eventType The type of event to listen for
 * @param handler The event handler function
 */
function useAppEvent<T extends AppEventType>(
  eventType: T,
  handler: (payload: T extends keyof AppEventPayloads ? AppEventPayloads[T] : never) => void
): void {
  useEffect(() => {
    // Add the event listener and get the cleanup function
    const cleanup = addAppEventListener(eventType, handler);
    
    // Return the cleanup function to be called when the component unmounts
    // or when the dependencies change
    return cleanup;
  }, [eventType, handler]);
}

/**
 * Hook to subscribe to legacy events for backward compatibility
 * 
 * @param eventType The legacy event type
 * @param handler The event handler function
 */
export function useLegacyEvent(
  eventType: LegacyEventType,
  handler: (event: CustomEvent) => void
): void {
  useEffect(() => {
    // Add the legacy event listener and get the cleanup function
    const cleanup = addLegacyEventListener(eventType, handler);
    
    // Return the cleanup function to be called when the component unmounts
    // or when the dependencies change
    return cleanup;
  }, [eventType, handler]);
}

/**
 * Hook to subscribe to storage events
 * 
 * @param key The storage key to watch
 * @param handler The event handler function
 */
export function useStorageEvent(
  key: string,
  handler: (newValue: string | null, oldValue: string | null) => void
): void {
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === key) {
        handler(event.newValue, event.oldValue);
      }
    };
    
    window.addEventListener('storage', handleStorage);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, [key, handler]);
}

// Export both named and default
export { useAppEvent };
export default useAppEvent;