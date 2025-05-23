/**
 * Event Types
 * 
 * This module defines the types for the application's event system,
 * ensuring consistent event naming and type safety across the application.
 */

import '@/context/RoleContext';
import '@/services/storageService';

// Test Mode Events
export const TEST_MODE_EVENTS = {
  STATE_CHANGED: 'testmode:state-changed',
  ACTIVATED: 'testmode:activated',
  DEACTIVATED: 'testmode:deactivated',
} as const;

// Role Events
export const ROLE_EVENTS = {
  ROLE_CHANGED: 'role:changed',
  ROLES_UPDATED: 'role:roles-updated',
  PERMISSION_CHANGED: 'role:permission-changed',
  ROLE_ERROR: 'role:error',
  PERMISSION_DENIED: 'role:permission-denied',
} as const;

// System Events
export const SYSTEM_EVENTS = {
  CONFIG_CHANGED: 'system:config-changed',
  ERROR: 'system:error',
  WARNING: 'system:warning',
  NOTIFICATION: 'system:notification',
  STORAGE_CHANGED: 'system:storage-changed',
  STORAGE_CLEARED: 'system:storage-cleared',
  STORAGE_MIGRATED: 'system:storage-migrated',
} as const;

// Legacy events for backward compatibility
export const LEGACY_EVENTS = {
  ROLE_CHANGED: 'role-changed',
  ROLE_SWITCHED: 'roleSwitched',
  TEST_MODE_ENABLED: 'testModeEnabled',
  TEST_MODE_DISABLED: 'testModeDisabled',
} as const;

// Combine all event types for the application
export const APP_EVENTS = {
  ...TEST_MODE_EVENTS,
  ...ROLE_EVENTS,
  ...SYSTEM_EVENTS,
} as const;

// Type for all event types
export type AppEventType = typeof APP_EVENTS[keyof typeof APP_EVENTS];
export type TestModeEventType = typeof TEST_MODE_EVENTS[keyof typeof TEST_MODE_EVENTS];
export type RoleEventType = typeof ROLE_EVENTS[keyof typeof ROLE_EVENTS];
export type SystemEventType = typeof SYSTEM_EVENTS[keyof typeof SYSTEM_EVENTS];
export type LegacyEventType = typeof LEGACY_EVENTS[keyof typeof LEGACY_EVENTS];

// Type guards for checking event types
export const isAppEventType = (type: string): type is AppEventType => {
  return Object.values(APP_EVENTS).includes(type as AppEventType);
};

export const isTestModeEventType = (type: string): type is TestModeEventType => {
  return Object.values(TEST_MODE_EVENTS).includes(type as TestModeEventType);
};

export const isRoleEventType = (type: string): type is RoleEventType => {
  return Object.values(ROLE_EVENTS).includes(type as RoleEventType);
};

export const isSystemEventType = (type: string): type is SystemEventType => {
  return Object.values(SYSTEM_EVENTS).includes(type as SystemEventType);
};

export const isLegacyEventType = (type: string): type is LegacyEventType => {
  return Object.values(LEGACY_EVENTS).includes(type as LegacyEventType);
};

// Define event payload types
export type TestModeEventPayloads = {
  [TEST_MODE_EVENTS.STATE_CHANGED]: { state: TestModeState };
  [TEST_MODE_EVENTS.ACTIVATED]: { 
    expiryTime: number;
    initialRole: string;
  };
  [TEST_MODE_EVENTS.DEACTIVATED]: undefined;
};

export type RoleEventPayloads = {
  [ROLE_EVENTS.ROLE_CHANGED]: { 
    from: string; 
    to: string;
    availableRoles: string[];
  };
  [ROLE_EVENTS.ROLES_UPDATED]: {
    availableRoles: string[];
    currentRole: string;
  };
  [ROLE_EVENTS.PERMISSION_CHANGED]: {
    role: string;
    permission: string;
    granted: boolean;
  };
  [ROLE_EVENTS.ROLE_ERROR]: {
    message: string;
    role?: string;
  };
  [ROLE_EVENTS.PERMISSION_DENIED]: {
    permission: string;
    role: string;
  };
};

export type SystemEventPayloads = {
  [SYSTEM_EVENTS.CONFIG_CHANGED]: {
    key: string;
    value: any;
    previousValue: any;
  };
  [SYSTEM_EVENTS.ERROR]: {
    message: string;
    code?: string;
    details?: any;
  };
  [SYSTEM_EVENTS.WARNING]: {
    message: string;
    details?: any;
  };
  [SYSTEM_EVENTS.NOTIFICATION]: {
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
  };
  [SYSTEM_EVENTS.STORAGE_CHANGED]: {
    key: string;
    value: any;
    previousValue: any;
    storageType: 'localStorage' | 'sessionStorage' | 'memory';
    namespace?: string;
  };
  [SYSTEM_EVENTS.STORAGE_CLEARED]: {
    storageType: 'localStorage' | 'sessionStorage' | 'memory';
    namespace?: string;
    keys?: string[];
  };
  [SYSTEM_EVENTS.STORAGE_MIGRATED]: {
    fromVersion: number;
    toVersion: number;
    key: string;
    success: boolean;
    error?: string;
  };
};

// Combined payload types for convenience
export type AppEventPayloads = TestModeEventPayloads & RoleEventPayloads & SystemEventPayloads;