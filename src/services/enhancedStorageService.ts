/**
 * Enhanced Storage Service
 * 
 * This service provides an improved approach to managing application state
 * in browser storage with proper typing, encryption, expiry, and error handling.
 * It builds upon the original StorageService but adds more robust features.
 */

import { logger } from '@/lib/logger';
import { 
  dispatchConfigChanged, 
  dispatchError, 
  notifyStorageChanged,
  notifyStorageCleared,
  notifyStorageMigrated,
  SYSTEM_EVENTS 
} from '@/lib/events';
import CryptoJS from 'crypto-js';

// Define storage types for clearer usage
export type StorageType = 'localStorage' | 'sessionStorage' | 'memory';

// Define expiry options
export interface ExpiryOptions {
  /** Duration in milliseconds before the item expires */
  duration: number;
  /** Whether to refresh the expiry time on each access */
  refreshOnAccess?: boolean;
}

/**
 * Migration strategy for handling version changes in storage items
 */
export type MigrationStrategy<T> = (oldData: any, oldVersion: number, newVersion: number) => T;

/**
 * Encryption configuration 
 */
export interface EncryptionConfig {
  /** The encryption key to use */
  key: string;
  /** Salt for key derivation (optional) */
  salt?: string;
  /** Iterations for key derivation (defaults to 1000) */
  iterations?: number;
  /** Key size in bits (defaults to 256) */
  keySize?: number;
}

// Define base storage item interface
export interface StorageItem<T> {
  /** The actual data being stored */
  value: T;
  /** When the item was created */
  createdAt: number;
  /** When the item expires (if applicable) */
  expiresAt?: number;
  /** Version of the storage format, for future migrations */
  version: number;
  /** Encryption indicator - helps during migrations */
  encrypted?: boolean;
}

// Storage keys constants - centralized to avoid duplication and ensure consistency
export const STORAGE_KEYS = {
  // Test mode related keys
  TEST_MODE: 'testMode',
  TEST_MODE_EXPIRY: 'testModeExpiry',
  TEST_MODE_INITIAL_ROLE: 'testModeInitialRole',
  TEST_MODE_ACTIVATED_AT: 'testModeActivatedAt',
  TEST_MODE_STATE: 'testModeState',
  TEST_MODE_PASSWORD_HASH: 'testModePasswordHash',
  
  // Role related keys
  CURRENT_ROLE: 'currentRole',
  AVAILABLE_ROLES: 'availableRoles',
  CACHED_AVAILABLE_ROLES: 'cachedAvailableRoles',
  ROLE_CACHE_TIMESTAMP: 'roleCacheTimestamp',
  USER_ROLES: 'userRoles',
  ROLE_TRANSITION_HISTORY: 'roleTransitionHistory',
  
  // Auth related keys
  AUTH_TOKEN: 'authToken',
  AUTH_REFRESH_TOKEN: 'authRefreshToken',
  AUTH_EXPIRY: 'authExpiry',
  SESSION_ID: 'sessionId',
  
  // User related keys
  USER_ID: 'userId',
  USER_PROFILE: 'userProfile',
  USER_PREFERENCES: 'userPreferences',
  USER_SETTINGS: 'userSettings',
  
  // Application settings
  THEME: 'theme',
  LANGUAGE: 'language',
  NOTIFICATIONS_ENABLED: 'notificationsEnabled',
  
  // Feature flags
  FEATURE_FLAGS: 'featureFlags',
  
  // Cache related keys
  BTC_PRICE: 'btcPrice',
  EXCHANGE_RATES: 'exchangeRates',
  CACHE_TIMESTAMP: 'cacheTimestamp',
  
  // Analytics and metrics
  METRICS_CONSENT: 'metricsConsent',
  LAST_ACTIVE: 'lastActive',
  
  // Security related
  ENCRYPTION_TEST: 'encryptionTest',
  ENCRYPTION_VERSION: 'encryptionVersion',
  
  // Debug and development
  DEBUG_MODE: 'debugMode',
  BYPASS_API_CALLS: 'bypassApiCalls',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS] | string;

/**
 * In-memory storage for items that shouldn't persist
 * or for environments without access to localStorage/sessionStorage
 */
const memoryStorage: Map<string, string> = new Map();

/**
 * Enhanced Storage Service class
 */
export class EnhancedStorageService {
  private encryptionKey: string | null = null;
  private readonly defaultStorageType: StorageType;
  private readonly namespace: string;
  
  /**
   * Create a new EnhancedStorageService
   * 
   * @param options Configuration options
   */
  constructor(options: {
    /** Default storage type to use */
    defaultStorageType?: StorageType;
    /** Application namespace to prefix all keys */
    namespace?: string;
    /** Optional encryption key for sensitive data */
    encryptionKey?: string;
  } = {}) {
    this.defaultStorageType = options.defaultStorageType || 'localStorage';
    this.namespace = options.namespace || 'nostr-ads';
    
    if (options.encryptionKey) {
      this.encryptionKey = options.encryptionKey;
    }
    
    // Check if storage is available
    this.checkStorageAvailability();
  }
  
  /**
   * Check if the configured storage types are available
   */
  private checkStorageAvailability(): void {
    try {
      // Test localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        const testKey = `${this.namespace}_test`;
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
      }
      
      // Test sessionStorage
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const testKey = `${this.namespace}_test`;
        sessionStorage.setItem(testKey, 'test');
        sessionStorage.removeItem(testKey);
      }
    } catch (error) {
      logger.warn('Browser storage is not available, falling back to memory storage', error);
    }
  }
  
  /**
   * Get the storage object based on the specified type
   */
  private getStorageObject(type: StorageType): Storage | Map<string, string> {
    if (typeof window === 'undefined') {
      return memoryStorage;
    }
    
    switch (type) {
      case 'localStorage':
        return window.localStorage || memoryStorage;
      case 'sessionStorage':
        return window.sessionStorage || memoryStorage;
      case 'memory':
      default:
        return memoryStorage;
    }
  }
  
  /**
   * Create a namespaced key
   */
  private createKey(key: StorageKey): string {
    return `${this.namespace}_${key}`;
  }
  
  /**
   * Encrypt a value if encryption is enabled
   */
  private encrypt(value: string): string {
    if (!this.encryptionKey) {
      return value;
    }
    
    try {
      return CryptoJS.AES.encrypt(value, this.encryptionKey).toString();
    } catch (error) {
      logger.error('Encryption failed:', error);
      return value;
    }
  }
  
  /**
   * Decrypt a value if encryption is enabled
   */
  private decrypt(value: string): string {
    if (!this.encryptionKey) {
      return value;
    }
    
    try {
      const bytes = CryptoJS.AES.decrypt(value, this.encryptionKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      logger.error('Decryption failed:', error);
      return value;
    }
  }
  
  /**
   * Set an item in storage with optional expiry
   * 
   * @param key The key to store the value under
   * @param value The value to store
   * @param options Storage options including expiry and encryption
   * @returns boolean indicating success
   */
  setItem<T>(
    key: StorageKey,
    value: T,
    options: {
      expiry?: ExpiryOptions;
      encrypt?: boolean;
      storageType?: StorageType;
      version?: number;
    } = {}
  ): boolean {
    try {
      const storageType = options.storageType || this.defaultStorageType;
      const storage = this.getStorageObject(storageType);
      const namespaceKey = this.createKey(key);
      
      // Create storage item object
      const storageItem: StorageItem<T> = {
        value,
        createdAt: Date.now(),
        version: options.version || 1
      };
      
      // Add expiry if specified
      if (options.expiry) {
        storageItem.expiresAt = Date.now() + options.expiry.duration;
      }
      
      // Serialize and optionally encrypt
      let serialized = JSON.stringify(storageItem);
      if (options.encrypt) {
        serialized = this.encrypt(serialized);
      }
      
      // Store the value
      if (storage instanceof Map) {
        storage.set(namespaceKey, serialized);
      } else {
        storage.setItem(namespaceKey, serialized);
      }
      
      // Get old value for the notification
      const oldValue = this.getItem(key);
      
      // Dispatch storage changed event
      notifyStorageChanged(
        key, 
        value, 
        oldValue, 
        storageType,
        this.namespace
      );
      
      return true;
    } catch (error) {
      logger.error(`Error setting item ${key}:`, error instanceof Error ? error.message : String(error));
      dispatchError(`Failed to store ${key}`, 'STORAGE_ERROR', { error });
      return false;
    }
  }
  
  /**
   * Get an item from storage
   * 
   * @param key The key to retrieve
   * @param options Storage options
   * @returns The stored value or null if not found
   */
  getItem<T>(
    key: StorageKey,
    options: {
      defaultValue?: T;
      decrypt?: boolean;
      storageType?: StorageType;
      refreshExpiry?: boolean;
    } = {}
  ): T | null {
    try {
      const storageType = options.storageType || this.defaultStorageType;
      const storage = this.getStorageObject(storageType);
      const namespaceKey = this.createKey(key);
      
      // Get serialized value
      let serialized: string | null = null;
      if (storage instanceof Map) {
        serialized = storage.get(namespaceKey) || null;
      } else {
        serialized = storage.getItem(namespaceKey);
      }
      
      if (!serialized) {
        return options.defaultValue !== undefined ? options.defaultValue : null;
      }
      
      // Decrypt if necessary
      if (options.decrypt) {
        serialized = this.decrypt(serialized);
      }
      
      // Parse the storage item
      const storageItem = JSON.parse(serialized) as StorageItem<T>;
      
      // Check expiry
      if (storageItem.expiresAt && Date.now() > storageItem.expiresAt) {
        this.removeItem(key, { storageType });
        return options.defaultValue !== undefined ? options.defaultValue : null;
      }
      
      // Refresh expiry if requested
      if (options.refreshExpiry && storageItem.expiresAt) {
        // Calculate original duration
        const originalDuration = storageItem.expiresAt - storageItem.createdAt;
        // Set the item with the same duration
        this.setItem(key, storageItem.value, {
          storageType,
          encrypt: options.decrypt,
          expiry: {
            duration: originalDuration
          }
        });
      }
      
      return storageItem.value;
    } catch (error) {
      // Log as debug instead of error - this is expected on public pages
      logger.debug(`Error getting item ${key} from local storage:`, error instanceof Error ? error.message : String(error));
      return options.defaultValue !== undefined ? options.defaultValue : null;
    }
  }
  
  /**
   * Remove an item from storage
   * 
   * @param key The key to remove
   * @param options Storage options
   * @returns boolean indicating success
   */
  removeItem(
    key: StorageKey,
    options: {
      storageType?: StorageType;
    } = {}
  ): boolean {
    try {
      const oldValue = this.getItem(key);
      const storageType = options.storageType || this.defaultStorageType;
      const storage = this.getStorageObject(storageType);
      const namespaceKey = this.createKey(key);
      
      if (storage instanceof Map) {
        storage.delete(namespaceKey);
      } else {
        storage.removeItem(namespaceKey);
      }
      
      // Dispatch storage changed event
      notifyStorageChanged(
        key,
        null,
        oldValue,
        storageType,
        this.namespace
      );
      
      return true;
    } catch (error) {
      logger.error(`Error removing item ${key}:`, error instanceof Error ? error.message : String(error));
      return false;
    }
  }
  
  /**
   * Clear all items in the namespace
   * 
   * @param options Storage options
   * @returns boolean indicating success
   */
  clear(
    options: {
      storageType?: StorageType;
    } = {}
  ): boolean {
    try {
      const storageType = options.storageType || this.defaultStorageType;
      const storage = this.getStorageObject(storageType);
      
      // Keep track of removed keys
      const keysToRemove: string[] = [];
      
      if (storage instanceof Map) {
        // For Map, only clear items with our namespace
        Array.from(storage.keys())
          .filter(key => key.startsWith(this.namespace))
          .forEach(key => {
            storage.delete(key);
            // Extract the original key without namespace
            const originalKey = key.slice(this.namespace.length + 1);
            keysToRemove.push(originalKey);
          });
      } else {
        // For localStorage/sessionStorage, iterate through keys
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (key && key.startsWith(this.namespace)) {
            // Extract the original key without namespace
            const originalKey = key.slice(this.namespace.length + 1);
            keysToRemove.push(originalKey);
            storage.removeItem(key);
            // Adjust index since the length decreased
            i--;
          }
        }
      }
      
      // Dispatch storage cleared event
      notifyStorageCleared(storageType, this.namespace, keysToRemove);
      
      return true;
    } catch (error) {
      logger.error('Error clearing storage:', error instanceof Error ? error.message : String(error));
      return false;
    }
  }
  
  /**
   * Clean up expired items from storage
   * 
   * @param options Storage options
   * @returns The number of items cleaned up
   */
  cleanExpired(
    options: {
      storageType?: StorageType;
    } = {}
  ): number {
    try {
      const storageType = options.storageType || this.defaultStorageType;
      const storage = this.getStorageObject(storageType);
      let cleanedCount = 0;
      
      const now = Date.now();
      
      if (storage instanceof Map) {
        // For Map storage
        Array.from(storage.keys())
          .filter(key => key.startsWith(this.namespace))
          .forEach(key => {
            const value = storage.get(key);
            if (value) {
              try {
                const item = JSON.parse(value) as StorageItem<unknown>;
                if (item.expiresAt && now > item.expiresAt) {
                  storage.delete(key);
                  cleanedCount++;
                }
              } catch (e) {
                // Skip items that can't be parsed
              }
            }
          });
      } else {
        // For localStorage/sessionStorage
        const keysToCheck: string[] = [];
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (key && key.startsWith(this.namespace)) {
            keysToCheck.push(key);
          }
        }
        
        keysToCheck.forEach(key => {
          const value = storage.getItem(key);
          if (value) {
            try {
              const item = JSON.parse(value) as StorageItem<unknown>;
              if (item.expiresAt && now > item.expiresAt) {
                storage.removeItem(key);
                cleanedCount++;
              }
            } catch (e) {
              // Skip items that can't be parsed
            }
          }
        });
      }
      
      return cleanedCount;
    } catch (error) {
      logger.error('Error cleaning expired items:', error instanceof Error ? error.message : String(error));
      return 0;
    }
  }
  
  /**
   * Get all keys in the namespace
   * 
   * @param options Storage options
   * @returns Array of keys
   */
  getKeys(
    options: {
      storageType?: StorageType;
    } = {}
  ): string[] {
    try {
      const storageType = options.storageType || this.defaultStorageType;
      const storage = this.getStorageObject(storageType);
      const prefix = `${this.namespace}_`;
      
      if (storage instanceof Map) {
        return Array.from(storage.keys())
          .filter(key => key.startsWith(prefix))
          .map(key => key.substring(prefix.length));
      } else {
        const keys: string[] = [];
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i);
          if (key && key.startsWith(prefix)) {
            keys.push(key.substring(prefix.length));
          }
        }
        return keys;
      }
    } catch (error) {
      logger.error('Error getting keys:', error);
      return [];
    }
  }
  
  /**
   * Set a secure item (encrypted and optionally session-only)
   * 
   * @param key The key to store the value under
   * @param value The value to store
   * @param options Storage options
   * @returns boolean indicating success
   */
  setSecureItem<T>(
    key: StorageKey,
    value: T,
    options: {
      expiry?: ExpiryOptions;
      sessionOnly?: boolean;
    } = {}
  ): boolean {
    return this.setItem(key, value, {
      encrypt: true,
      storageType: options.sessionOnly ? 'sessionStorage' : 'localStorage',
      expiry: options.expiry
    });
  }
  
  /**
   * Get a secure item (decrypted)
   * 
   * @param key The key to retrieve
   * @param options Storage options
   * @returns The stored value or null if not found
   */
  getSecureItem<T>(
    key: StorageKey,
    options: {
      defaultValue?: T;
      sessionOnly?: boolean;
      refreshExpiry?: boolean;
    } = {}
  ): T | null {
    return this.getItem(key, {
      decrypt: true,
      storageType: options.sessionOnly ? 'sessionStorage' : 'localStorage',
      defaultValue: options.defaultValue,
      refreshExpiry: options.refreshExpiry
    });
  }
  
  /**
   * Migrate an item's data structure if its version is outdated
   * 
   * @param key The key to migrate
   * @param targetVersion The target version to migrate to
   * @param migrationStrategy A function that transforms the data from its old format to the new one
   * @param options Storage options
   * @returns boolean indicating success
   */
  migrateItem<T>(
    key: StorageKey,
    targetVersion: number,
    migrationStrategy: MigrationStrategy<T>,
    options: {
      storageType?: StorageType;
      encrypt?: boolean;
    } = {}
  ): boolean {
    try {
      const storageType = options.storageType || this.defaultStorageType;
      const namespaceKey = this.createKey(key);
      const storage = this.getStorageObject(storageType);
      
      // Get serialized value
      let serialized: string | null = null;
      if (storage instanceof Map) {
        serialized = storage.get(namespaceKey) || null;
      } else {
        serialized = storage.getItem(namespaceKey);
      }
      
      if (!serialized) {
        logger.warn(`No item found for key ${key} during migration`);
        return false;
      }
      
      // Decrypt if necessary
      if (options.encrypt) {
        serialized = this.decrypt(serialized);
      }
      
      // Parse the storage item
      const storageItem = JSON.parse(serialized) as StorageItem<any>;
      
      // Check if migration is needed
      if (storageItem.version >= targetVersion) {
        logger.info(`Item ${key} already at version ${storageItem.version}, no migration needed`);
        return true;
      }
      
      // Apply migration
      const oldVersion = storageItem.version;
      try {
        // Transform data using the provided migration strategy
        const migratedValue = migrationStrategy(
          storageItem.value, 
          oldVersion, 
          targetVersion
        );
        
        // Save the migrated data with the new version
        const success = this.setItem(key, migratedValue, {
          storageType,
          encrypt: options.encrypt,
          version: targetVersion
        });
        
        if (success) {
          // Dispatch storage migrated event
          notifyStorageMigrated(
            key,
            oldVersion,
            targetVersion,
            true
          );
          
          return true;
        } else {
          throw new Error('Failed to save migrated data');
        }
      } catch (error) {
        logger.error(`Migration failed for ${key}:`, error);
        
        // Dispatch failed migration event
        notifyStorageMigrated(
          key,
          oldVersion,
          targetVersion,
          false,
          error instanceof Error ? error.message : 'Unknown error'
        );
        
        return false;
      }
    } catch (error) {
      logger.error(`Error during migration of ${key}:`, error);
      return false;
    }
  }
  
  /**
   * Migrate multiple storage items in a batch operation
   * 
   * @param keys List of keys to migrate or a pattern to match against
   * @param targetVersion The target version to migrate to
   * @param migrationStrategy A function that transforms the data
   * @param options Storage options
   * @returns Object containing results of the migration
   */
  migrateBatch<T>(
    keys: StorageKey[] | RegExp,
    targetVersion: number,
    migrationStrategy: MigrationStrategy<T>,
    options: {
      storageType?: StorageType;
      encrypt?: boolean;
    } = {}
  ): { 
    total: number; 
    succeeded: number; 
    failed: number;
    skipped: number;
    errors: Record<string, string>;
  } {
    try {
      const storageType = options.storageType || this.defaultStorageType;
      let keysToMigrate: string[] = [];
      
      // Get keys to migrate based on input
      if (keys instanceof RegExp) {
        // If a regex pattern is provided, get all keys that match the pattern
        const allKeys = this.getKeys({ storageType });
        keysToMigrate = allKeys.filter(key => keys.test(key));
      } else {
        // Use the provided array of keys
        keysToMigrate = keys;
      }
      
      // Initialize result object
      const result = {
        total: keysToMigrate.length,
        succeeded: 0,
        failed: 0,
        skipped: 0,
        errors: {} as Record<string, string>
      };
      
      // Process each key
      for (const key of keysToMigrate) {
        try {
          const success = this.migrateItem(key, targetVersion, migrationStrategy, options);
          
          if (success) {
            result.succeeded++;
          } else {
            // Check if item was skipped because it's already at target version
            const item = this.getItem(key, { storageType });
            
            if (item && (item as any)?.version >= targetVersion) {
              result.skipped++;
            } else {
              result.failed++;
              result.errors[key] = 'Migration failed but no exception was thrown';
            }
          }
        } catch (error) {
          result.failed++;
          result.errors[key] = error instanceof Error ? error.message : 'Unknown error';
          logger.error(`Failed to migrate ${key}:`, error);
        }
      }
      
      return result;
    } catch (error) {
      logger.error('Batch migration failed:', error);
      return {
        total: 0,
        succeeded: 0,
        failed: 0,
        skipped: 0,
        errors: { 'batch': error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }
}

// Export singleton instance for app-wide use
export const enhancedStorage = new EnhancedStorageService();

// Register automatic cleanup and maintenance on page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      // Clean expired items
      const cleaned = enhancedStorage.cleanExpired();
      if (cleaned > 0) {
        logger.debug(`Cleaned ${cleaned} expired storage items`);
      }
      
      // Run migration checks for critical app data
      // This allows us to automatically upgrade storage schemas when needed
      try {
        // Example of how to use batch migrations for app upgrades
        // (commented out as it's just an example pattern)
        /*
        const migrationResult = enhancedStorage.migrateBatch(
          /^app_config_.*$/,  // Migrate all app config items
          2,  // Target version 2
          (oldData, oldVersion, newVersion) => {
            // Example migration strategy
            if (oldVersion === 1 && newVersion === 2) {
              return {
                ...oldData,
                // Add new fields or transform data structure
                updatedAt: Date.now(),
                schemaVersion: newVersion
              };
            }
            return oldData;
          }
        );
        
        if (migrationResult.succeeded > 0) {
          logger.info(`Migrated ${migrationResult.succeeded} items to new schema version`);
        }
        */
      } catch (error) {
        logger.error('Error during automatic migration:', error);
      }
    }, 1000);
  });
}