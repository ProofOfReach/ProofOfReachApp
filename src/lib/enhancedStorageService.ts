import { v4 as uuidv4 } from 'uuid';
import CryptoJS from 'crypto-js';
import { logger } from './logger';
import { string } from './console';

/**
 * Storage type options
 */
export type StorageType = 'localStorage' | 'sessionStorage';

/**
 * Expiry options for storage items
 */
export interface ExpiryOptions {
  /**
   * Time in seconds until item expires
   */
  seconds?: number;
  
  /**
   * Absolute expiry date
   */
  date?: Date;
}

/**
 * Stored item metadata
 */
interface StoredItemMetadata {
  /**
   * Version of the stored item format
   */
  version: number;
  
  /**
   * When the item was created
   */
  created: string;
  
  /**
   * When the item was last modified
   */
  modified: string;
  
  /**
   * When the item expires (if applicable)
   */
  expires?: string;
  
  /**
   * Whether the item is encrypted
   */
  encrypted: boolean;
  
  /**
   * The namespace the item belongs to
   */
  namespace: string;
}

/**
 * Stored item with wrapped metadata
 */
interface StoredItem<T = any> {
  /**
   * The actual data being stored
   */
  data: T;
  
  /**
   * Metadata about the stored item
   */
  meta: StoredItemMetadata;
}

/**
 * Enhanced Storage Provider Interface
 * This extends the standard Storage interface with additional functionality:
 * - Namespacing to prevent conflicts
 * - Encryption for sensitive data
 * - Automatic expiry of stored items
 */
export interface EnhancedStorageProvider {
  /**
   * Get an item from storage with support for decryption and namespacing
   * @param key The key to retrieve
   * @param options Options for retrieval
   * @returns The stored value or null if not found
   */
  getItem(key: string, options?: {
    decrypt?: boolean;
    namespace?: string;
    defaultValue?: unknown;
    refreshExpiry?: boolean;
  }): Promise<string | null>;
  
  /**
   * Set an item in storage with support for encryption, expiry, and namespacing
   * @param key The key to set
   * @param value The value to store
   * @param options Options for storage
   * @returns Promise that resolves when the operation is complete
   */
  setItem(key: string, value: string, options?: {
    encrypt?: boolean;
    namespace?: string;
    expiry?: ExpiryOptions;
    version?: number;
  }): Promise<void>;
  
  /**
   * Remove an item from storage
   * @param key The key to remove
   * @param options Options for removal
   * @returns Promise that resolves when the operation is complete
   */
  removeItem(key: string, options?: {
    namespace?: string;
  }): Promise<void>;
  
  /**
   * Clear all items from the storage or just those in a specific namespace
   * @param options Options for clearing
   * @returns Promise that resolves when the operation is complete
   */
  clear(options?: {
    namespace?: string;
  }): Promise<void>;
  
  /**
   * Check if an item exists and has not expired
   * @param key The key to check
   * @param options Options for checking
   * @returns Promise that resolves to a boolean indicating existence
   */
  has(key: string, options?: {
    namespace?: string;
  }): Promise<boolean>;
  
  /**
   * Get the current storage type
   */
  readonly type: StorageType;
}

/**
 * Default application namespace for storage items
 */
const DEFAULT_NAMESPACE = 'nostr-ads';

/**
 * Secret key for encryption (in a real app, this should come from environment variables or a secure store)
 */
const ENCRYPTION_KEY = process.env.STORAGE_ENCRYPTION_KEY || 'nostr-ads-secure-storage-key';

/**
 * Create an enhanced storage provider that wraps the native Web Storage API
 * @param storageType Type of storage to use
 * @returns An enhanced storage provider
 */
function createEnhancedStorage(storageType: StorageType): EnhancedStorageProvider {
  // Check if running in a browser environment
  const isBrowser = typeof window !== 'undefined';
  
  // Get the storage object or create a mock one for SSR
  const storage = isBrowser 
    ? (storageType === 'localStorage' ? window.localStorage : window.sessionStorage) 
    : createMockStorage();
  
  return {
    async getItem(key, options = {}) {
      try {
        const { 
          decrypt = false, 
          namespace = DEFAULT_NAMESPACE,
          defaultValue = null,
          refreshExpiry = false
        } = options;
        
        // Create a namespaced key
        const namespacedKey = `${namespace}:${key}`;
        
        // Try to get the item from storage
        const rawItem = storage.getItem(namespacedKey);
        
        if (!rawItem) {
          return defaultValue as string | null;
        }
        
        // Parse the stored item
        let storedItem: StoredItem<string>;
        try {
          storedItem = JSON.parse(rawItem);
        } catch (error) {
          // If parsing fails, it's a legacy format (just the value)
          return rawItem;
        }
        
        // Check if the item has expired
        if (storedItem.meta?.expires) {
          const now = new Date();
          const expires = new Date(storedItem.meta.expires);
          
          if (now > expires) {
            // Item has expired, remove it
            await this.removeItem(key, { namespace });
            return defaultValue as string | null;
          }
          
          // If requested, refresh the expiry time
          if (refreshExpiry && options.refreshExpiry) {
            const expiryOptions: ExpiryOptions = {};
            
            // Calculate new expiry based on original duration
            const originalDuration = expires.getTime() - new Date(storedItem.meta.modified).getTime();
            expiryOptions.seconds = originalDuration / 1000;
            
            // Update the item with refreshed expiry
            await this.setItem(
              key, 
              storedItem.data, 
              { 
                namespace,
                encrypt: storedItem.meta.encrypted,
                expiry: expiryOptions,
                version: storedItem.meta.version 
              }
            );
          }
        }
        
        // If the item is encrypted and decryption is requested, decrypt it
        if (storedItem.meta?.encrypted && decrypt) {
          try {
            const decrypted = CryptoJS.AES.decrypt(
              storedItem.data,
              ENCRYPTION_KEY
            ).toString(CryptoJS.enc.Utf8);
            
            return decrypted || defaultValue as string | null;
          } catch (error) {
            logger.error('Error decrypting stored item', { 
              error: error instanceof Error ? error.message : 'Unknown error',
              key: namespacedKey,
              category: string.TECHNICAL
            });
            return defaultValue as string | null;
          }
        }
        
        return storedItem.data;
      } catch (error) {
        logger.error('Error getting item from storage', { 
          error: error instanceof Error ? error.message : 'Unknown error',
          key,
          category: string.TECHNICAL
        });
        return null;
      }
    },
    
    async setItem(key, value, options = {}) {
      try {
        const { 
          encrypt = false, 
          namespace = DEFAULT_NAMESPACE,
          expiry,
          version = 1
        } = options;
        
        // Create a namespaced key
        const namespacedKey = `${namespace}:${key}`;
        
        // Prepare the data
        let data = value;
        
        // Encrypt the data if requested
        if (encrypt) {
          data = CryptoJS.AES.encrypt(
            value, 
            ENCRYPTION_KEY
          ).toString();
        }
        
        // Create metadata
        const now = new Date().toISOString();
        let expires: string | undefined = undefined;
        
        if (expiry) {
          if (expiry.date) {
            expires = expiry.date.toISOString();
          } else if (expiry.seconds) {
            const expiryDate = new Date();
            expiryDate.setSeconds(expiryDate.getSeconds() + expiry.seconds);
            expires = expiryDate.toISOString();
          }
        }
        
        const meta: StoredItemMetadata = {
          version,
          created: now,
          modified: now,
          expires,
          encrypted: encrypt,
          namespace
        };
        
        // Create the stored item
        const storedItem: StoredItem<string> = {
          data,
          meta
        };
        
        // Store the item
        storage.setItem(namespacedKey, JSON.stringify(storedItem));
        
        // Dispatch a custom event for cross-tab communication
        if (isBrowser) {
          const event = new CustomEvent('storage', {
            detail: {
              key: namespacedKey,
              newValue: value,
              storageArea: storageType
            }
          });
          window.dispatchEvent(event);
          
          // Also dispatch a custom event for our own event system
          const systemEvent = new CustomEvent('system:storage-changed', {
            detail: {
              key,
              value,
              previousValue: null, // We don't track this currently
              storageType,
              namespace
            }
          });
          window.dispatchEvent(systemEvent);
          logger.debug(`Dispatching event: system:storage-changed`, {
            key,
            value,
            storageType,
            namespace
          });
        }
      } catch (error) {
        logger.error('Error setting item in storage', { 
          error: error instanceof Error ? error.message : 'Unknown error',
          key,
          category: string.TECHNICAL
        });
      }
    },
    
    async removeItem(key, options = {}) {
      try {
        const { namespace = DEFAULT_NAMESPACE } = options;
        
        // Create a namespaced key
        const namespacedKey = `${namespace}:${key}`;
        
        // Remove the item
        storage.removeItem(namespacedKey);
        
        // Dispatch a custom event for cross-tab communication
        if (isBrowser) {
          const event = new CustomEvent('storage', {
            detail: {
              key: namespacedKey,
              newValue: null,
              storageArea: storageType
            }
          });
          window.dispatchEvent(event);
          
          // Also dispatch a custom event for our own event system
          const systemEvent = new CustomEvent('system:storage-changed', {
            detail: {
              key,
              value: null,
              previousValue: null, // We don't track this currently
              storageType,
              namespace
            }
          });
          window.dispatchEvent(systemEvent);
        }
      } catch (error) {
        logger.error('Error removing item from storage', { 
          error: error instanceof Error ? error.message : 'Unknown error',
          key,
          category: string.TECHNICAL
        });
      }
    },
    
    async clear(options = {}) {
      try {
        const { namespace } = options;
        
        if (namespace) {
          // Only clear items in the specified namespace
          const prefix = `${namespace}:`;
          
          // Get all keys in storage
          const keys = [];
          for (let i = 0; i < storage.length; i++) {
            const key = storage.key(i);
            if (key && key.startsWith(prefix)) {
              keys.push(key);
            }
          }
          
          // Remove all items in the namespace
          for (const key of keys) {
            storage.removeItem(key);
          }
        } else {
          // Clear all storage
          storage.clear();
        }
      } catch (error) {
        logger.error('Error clearing storage', { 
          error: error instanceof Error ? error.message : 'Unknown error',
          category: string.TECHNICAL
        });
      }
    },
    
    async has(key, options = {}) {
      try {
        const { namespace = DEFAULT_NAMESPACE } = options;
        
        // Create a namespaced key
        const namespacedKey = `${namespace}:${key}`;
        
        // Check if the item exists
        const rawItem = storage.getItem(namespacedKey);
        
        if (!rawItem) {
          return false;
        }
        
        // Parse the stored item
        let storedItem: StoredItem;
        try {
          storedItem = JSON.parse(rawItem);
        } catch (error) {
          // If parsing fails, it's a legacy format (just the value)
          return true;
        }
        
        // Check if the item has expired
        if (storedItem.meta?.expires) {
          const now = new Date();
          const expires = new Date(storedItem.meta.expires);
          
          if (now > expires) {
            // Item has expired
            return false;
          }
        }
        
        return true;
      } catch (error) {
        logger.error('Error checking if item exists in storage', { 
          error: error instanceof Error ? error.message : 'Unknown error',
          key,
          category: string.TECHNICAL
        });
        return false;
      }
    },
    
    get type() {
      return storageType;
    }
  };
}

/**
 * Create a mock storage object for server-side rendering
 */
function createMockStorage(): Storage {
  const data: Record<string, string> = {};
  
  return {
    getItem(key: string): string | null {
      return key in data ? data[key] : null;
    },
    setItem(key: string, value: string): void {
      data[key] = value;
    },
    removeItem(key: string): void {
      delete data[key];
    },
    clear(): void {
      Object.keys(data).forEach(key => {
        delete data[key];
      });
    },
    key(index: number): string | null {
      return Object.keys(data)[index] || null;
    },
    get length(): number {
      return Object.keys(data).length;
    }
  };
}

// Export singleton instances
export const localStorage = createEnhancedStorage('localStorage');
export const sessionStorage = createEnhancedStorage('sessionStorage');

// Add event listener for changes in other tabs
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    logger.log('Storage changed event from other tab:', {
      key: event.key,
      newValue: event.newValue ? '(data)' : null // Don't log actual values for security
    });
  });
  
  // Add event listener for our own storage changes
  window.addEventListener('system:storage-changed', ((event: CustomEvent) => {
    const { key, value, previousValue } = event.detail;
    logger.log(`Storage changed for ${key}: ${previousValue} → ${value}`);
  }) as EventListener);
}