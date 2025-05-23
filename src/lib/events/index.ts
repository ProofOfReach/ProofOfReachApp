/**
 * Unified Event System
 * 
 * This file serves as the main entry point for the event system,
 * re-exporting all relevant types and functions for convenience.
 */

import type { UserRole } from '@/types/auth';

// Event Types
export * from './eventTypes';

// Event Dispatcher
export * from './eventDispatcher';

// Event Listener
export * from './eventListener';

// Additional convenience exports for common patterns

import { 
  dispatchRoleEvent, 
  dispatchTestModeEvent,
  dispatchStorageChanged,
  dispatchStorageCleared,
  dispatchStorageMigrated
} from './eventDispatcher';
import { ROLE_EVENTS, TEST_MODE_EVENTS, SYSTEM_EVENTS } from './eventTypes';
import '@/context/RoleContext';

/**
 * Convenience function to dispatch a role changed event
 */
export const notifyRoleChanged = (
  from: UserRole,
  to: UserRole,
  availableRoles: string[] = []
) => {
  dispatchRoleEvent(ROLE_EVENTS.ROLE_CHANGED, {
    from,
    to,
    availableRoles
  });
};

/**
 * Convenience function to dispatch a roles updated event
 */
export const notifyRolesUpdated = (
  availableRoles: string[],
  currentRole: string
) => {
  dispatchRoleEvent(ROLE_EVENTS.ROLES_UPDATED, {
    availableRoles,
    currentRole
  });
};

/**
 * Convenience function to dispatch a test mode activated event
 */
export const notifyTestModeActivated = (
  expiryTime: number,
  initialRole: string
) => {
  dispatchTestModeEvent(TEST_MODE_EVENTS.ACTIVATED, {
    expiryTime,
    initialRole
  });
};

/**
 * Convenience function to dispatch a test mode deactivated event
 */
export const notifyTestModeDeactivated = () => {
  dispatchTestModeEvent(TEST_MODE_EVENTS.DEACTIVATED, undefined);
};

/**
 * Convenience function to notify about storage value changes
 */
export const notifyStorageChanged = (
  key: UserRole,
  value: any,
  previousValue: any,
  storageType: 'localStorage' | 'sessionStorage' | 'memory',
  namespace?: string
) => {
  dispatchStorageChanged(key, value, previousValue, storageType, namespace);
};

/**
 * Convenience function to notify about storage being cleared
 */
export const notifyStorageCleared = (
  storageType: 'localStorage' | 'sessionStorage' | 'memory',
  namespace?: UserRole,
  keys?: string[]
) => {
  dispatchStorageCleared(storageType, namespace, keys);
};

/**
 * Convenience function to notify about storage migrations
 */
export const notifyStorageMigrated = (
  key: UserRole,
  fromVersion: number,
  toVersion: number,
  log: boolean,
  error?: string
) => {
  dispatchStorageMigrated(key, fromVersion, toVersion, log, error);
};