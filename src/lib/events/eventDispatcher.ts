/**
 * Event Dispatcher
 * 
 * This module provides utilities for dispatching application events
 * in a type-safe and consistent manner, with proper error handling
 * and backward compatibility with legacy event systems.
 */

import { logger } from '../logger';
import {
  AppEventType,
  AppEventPayloads,
  RoleEventPayloads,
  TestModeEventPayloads,
  SystemEventPayloads,
  ROLE_EVENTS,
  TEST_MODE_EVENTS,
  SYSTEM_EVENTS,
  LEGACY_EVENTS
} from './eventTypes';
import '@/types/role';

/**
 * Dispatch an application event with type-safe payload
 * 
 * @param eventType The type of event to dispatch
 * @param payload The payload of the event
 */
export const dispatchAppEvent = <T extends AppEventType>(
  eventType: T, 
  payload: T extends keyof TestModeEventPayloads | keyof RoleEventPayloads | keyof SystemEventPayloads ? AppEventPayloads[T] : never
): void => {
  try {
    if (typeof window === 'undefined') return;
    
    logger.debug(`Dispatching event: ${eventType}`, payload);
    window.dispatchEvent(new CustomEvent(eventType, { detail: payload }));
    
    // Also dispatch legacy events if appropriate
    dispatchLegacyEvents(eventType, payload);
    
  } catch (error) {
    logger.error(`Error dispatching event ${eventType}:`, error);
  }
};

/**
 * Dispatch role-related event
 */
export const dispatchRoleEvent = <T extends keyof RoleEventPayloads>(
  eventType: T,
  payload: RoleEventPayloads[T]
): void => {
  dispatchAppEvent(eventType as any, payload as any);
};

/**
 * Dispatch test mode related event
 */
export const dispatchTestModeEvent = <T extends keyof TestModeEventPayloads>(
  eventType: T,
  payload: TestModeEventPayloads[T]
): void => {
  dispatchAppEvent(eventType as any, payload as any);
};

/**
 * Dispatch legacy events for backward compatibility
 * 
 * @param eventType The modern event type
 * @param payload The event payload
 */
function dispatchLegacyEvents(eventType: AppEventType, payload: any): void {
  // Map modern events to legacy events
  if (eventType === ROLE_EVENTS.ROLE_CHANGED && payload) {
    // Legacy role-changed event
    window.dispatchEvent(new CustomEvent(LEGACY_EVENTS.ROLE_CHANGED, { 
      detail: { role: payload.to, from: payload.from, to: payload.to }
    }));
    
    // Legacy roleSwitched event
    document.dispatchEvent(new CustomEvent(LEGACY_EVENTS.ROLE_SWITCHED, {
      detail: { role: payload.to }
    }));
  }
  
  if (eventType === TEST_MODE_EVENTS.ACTIVATED) {
    // Legacy testModeEnabled event
    document.dispatchEvent(new Event(LEGACY_EVENTS.TEST_MODE_ENABLED));
  }
  
  if (eventType === TEST_MODE_EVENTS.DEACTIVATED) {
    // Legacy testModeDisabled event
    document.dispatchEvent(new Event(LEGACY_EVENTS.TEST_MODE_DISABLED));
  }
}

/**
 * Dispatch a system notification event
 */
export const dispatchNotification = (
  title: UserRole,
  message: UserRole,
  type: 'info' | 'log' | 'warn' | 'error' = 'info'
): void => {
  dispatchAppEvent(SYSTEM_EVENTS.NOTIFICATION, {
    title,
    message,
    type
  });
};

/**
 * Dispatch a system error event
 */
export const dispatchError = (
  message: UserRole,
  code?: UserRole,
  details?: any
): void => {
  dispatchAppEvent(SYSTEM_EVENTS.ERROR, {
    message,
    code,
    details
  });
};

/**
 * Dispatch a configuration change event
 */
export const dispatchConfigChanged = (
  key: UserRole,
  value: any,
  previousValue: any
): void => {
  dispatchAppEvent(SYSTEM_EVENTS.CONFIG_CHANGED, {
    key,
    value,
    previousValue
  });
};

/**
 * Dispatch a storage changed event
 * 
 * @param key The storage key that changed
 * @param value The new value
 * @param previousValue The previous value
 * @param storageType The type of storage
 * @param namespace Optional namespace 
 */
export const dispatchStorageChanged = (
  key: UserRole,
  value: any,
  previousValue: any,
  storageType: 'localStorage' | 'sessionStorage' | 'memory',
  namespace?: string
): void => {
  dispatchAppEvent(SYSTEM_EVENTS.STORAGE_CHANGED, {
    key,
    value,
    previousValue,
    storageType,
    namespace
  });
};

/**
 * Dispatch a storage cleared event
 * 
 * @param storageType The type of storage
 * @param namespace Optional namespace
 * @param keys Optional list of keys that were cleared
 */
export const dispatchStorageCleared = (
  storageType: 'localStorage' | 'sessionStorage' | 'memory',
  namespace?: UserRole,
  keys?: string[]
): void => {
  dispatchAppEvent(SYSTEM_EVENTS.STORAGE_CLEARED, {
    storageType,
    namespace,
    keys
  });
};

/**
 * Dispatch a storage migration event
 * 
 * @param key The key being migrated
 * @param fromVersion Original version
 * @param toVersion Target version
 * @param log Whether migration was logful
 * @param error Optional error message
 */
export const dispatchStorageMigrated = (
  key: UserRole,
  fromVersion: number,
  toVersion: number,
  log: boolean,
  error?: string
): void => {
  dispatchAppEvent(SYSTEM_EVENTS.STORAGE_MIGRATED, {
    key,
    fromVersion,
    toVersion,
    log,
    error
  });
};

/**
 * Dispatch a notification that test mode has been activated
 */
export const notifyTestModeActivated = (
  expiryTime: number,
  initialRole: string
): void => {
  dispatchTestModeEvent(TEST_MODE_EVENTS.ACTIVATED, {
    expiryTime,
    initialRole
  });
};

/**
 * Dispatch a notification that test mode has been deactivated
 */
export const notifyTestModeDeactivated = (): void => {
  dispatchTestModeEvent(TEST_MODE_EVENTS.DEACTIVATED, undefined);
};

/**
 * Dispatch a notification that a role has changed
 */
export const notifyRoleChanged = (
  from: UserRole, 
  to: UserRole,
  availableRoles: string[] = []
): void => {
  dispatchRoleEvent(ROLE_EVENTS.ROLE_CHANGED, {
    from,
    to,
    availableRoles
  });
};

/**
 * Dispatch a notification that available roles have been updated
 */
export const notifyRolesUpdated = (
  availableRoles: string[],
  currentRole: string
): void => {
  dispatchRoleEvent(ROLE_EVENTS.ROLES_UPDATED, {
    availableRoles,
    currentRole
  });
};