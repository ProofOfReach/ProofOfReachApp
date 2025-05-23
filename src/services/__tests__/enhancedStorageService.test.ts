/**
 * Unit tests for the EnhancedStorageService
 * 
 * These tests cover the enhanced storage service functionality including:
 * - Encryption and decryption
 * - Storage with expiry
 * - Namespaced storage
 * - Memory fallback
 * - Error handling
 */

import { EnhancedStorageService, StorageItem, STORAGE_KEYS } from '../enhancedStorageService';

// Mock the logger to prevent console output during tests
jest.mock('@/lib/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    info: jest.fn()
  }
}));

// Mock event dispatchers
jest.mock('@/lib/events', () => ({
  dispatchConfigChanged: jest.fn(),
  dispatchError: jest.fn(),
  SYSTEM_EVENTS: {
    CONFIG_CHANGED: 'system:config-changed',
    ERROR: 'system:error'
  }
}));

// Create mock localStorage and sessionStorage implementations
const createStorageMock = () => {
  let store: Record<UserRole, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: UserRole, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index: number) => {
      return Object.keys(store)[index] || null;
    }),
    store
  };
};

describe('EnhancedStorageService', () => {
  // Storage mocks
  const localStorageMock = createStorageMock();
  const sessionStorageMock = createStorageMock();
  
  // Original window object
  const originalWindow = global.window;
  
  beforeAll(() => {
    // Mock window and storage objects
    Object.defineProperty(global, 'window', {
      value: {
        localStorage: localStorageMock,
        sessionStorage: sessionStorageMock
      },
      writable: true
    });
    
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true
    });
    
    Object.defineProperty(global, 'sessionStorage', {
      value: sessionStorageMock,
      writable: true
    });
  });
  
  afterAll(() => {
    // Restore window object
    Object.defineProperty(global, 'window', {
      value: originalWindow,
      writable: true
    });
  });
  
  beforeEach(() => {
    // Clear storage and mocks before each test
    localStorageMock.clear();
    sessionStorageMock.clear();
    jest.clearAllMocks();
  });
  
  describe('Basic Storage Operations', () => {
    it('should store and retrieve items', () => {
      const storage = new EnhancedStorageService();
      const testKey = 'test-key';
      const testValue = { name: 'Test Value', id: 123 };
      
      // Set the item
      const setResult = storage.setItem(testKey, testValue);
      expect(setResult).toBe(true);
      
      // Get the item
      const retrievedValue = storage.getItem(testKey);
      expect(retrievedValue).toEqual(testValue);
    });
    
    it('should handle undefined window object gracefully', () => {
      // Mock window as undefined
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true
      });
      
      const storage = new EnhancedStorageService();
      const testKey = 'test-key';
      const testValue = { name: 'Test Value' };
      
      // Operations should not throw and use memory storage
      const setResult = storage.setItem(testKey, testValue);
      expect(setResult).toBe(true);
      
      const retrievedValue = storage.getItem(testKey);
      expect(retrievedValue).toEqual(testValue);
      
      // Restore window
      Object.defineProperty(global, 'window', {
        value: {
          localStorage: localStorageMock,
          sessionStorage: sessionStorageMock
        },
        writable: true
      });
    });
    
    it('should remove items', () => {
      const storage = new EnhancedStorageService();
      const testKey = 'test-key';
      const testValue = { name: 'Test Value' };
      
      // Set and then remove
      storage.setItem(testKey, testValue);
      const removeResult = storage.removeItem(testKey);
      
      expect(removeResult).toBe(true);
      expect(storage.getItem(testKey)).toBeNull();
    });
    
    it('should clear items by namespace', () => {
      const storage = new EnhancedStorageService({ namespace: 'test-ns' });
      const regularStorage = new EnhancedStorageService();
      
      // Set items in both storages
      storage.setItem('key1', 'value1');
      storage.setItem('key2', 'value2');
      regularStorage.setItem('key3', 'value3');
      
      // Clear only the test namespace
      const clearResult = storage.clear();
      
      expect(clearResult).toBe(true);
      expect(storage.getItem('key1')).toBeNull();
      expect(storage.getItem('key2')).toBeNull();
      expect(regularStorage.getItem('key3')).not.toBeNull();
    });
    
    it('should get all keys in namespace', () => {
      const storage = new EnhancedStorageService({ namespace: 'test-ns' });
      
      // Set multiple items
      storage.setItem('key1', 'value1');
      storage.setItem('key2', 'value2');
      storage.setItem('key3', 'value3');
      
      // Get all keys
      const keys = storage.getKeys();
      
      expect(keys).toHaveLength(3);
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toContain('key3');
    });
  });
  
  describe('Encryption and Security', () => {
    it('should encrypt and decrypt values when encryption key is provided', () => {
      const encryptionKey = 'test-encryption-key-12345';
      const storage = new EnhancedStorageService({ encryptionKey });
      const testKey = 'secure-key';
      const testValue = { secret: 'sensitive-data', userId: 456 };
      
      // Set with encryption
      storage.setItem(testKey, testValue, { encrypt: true });
      
      // Raw value in storage should be encrypted (not contain the original data)
      const namespacedKey = `nostr-ads_${testKey}`;
      const rawValue = localStorageMock.getItem(namespacedKey);
      expect(rawValue).not.toBeNull();
      expect(rawValue).not.toContain('sensitive-data');
      
      // Retrieved value should be decrypted
      const retrievedValue = storage.getItem(testKey, { decrypt: true });
      expect(retrievedValue).toEqual(testValue);
    });
    
    it('should store secure items encrypted by default', () => {
      const encryptionKey = 'test-encryption-key-12345';
      const storage = new EnhancedStorageService({ encryptionKey });
      const testKey = 'secure-data';
      const testValue = { apiToken: 'abc-123-xyz', userId: 789 };
      
      // Use the secure item methods
      storage.setSecureItem(testKey, testValue);
      
      // Raw value should be encrypted
      const namespacedKey = `nostr-ads_${testKey}`;
      const rawValue = localStorageMock.getItem(namespacedKey);
      expect(rawValue).not.toBeNull();
      expect(rawValue).not.toContain('abc-123-xyz');
      
      // Retrieved value should be decrypted
      const retrievedValue = storage.getSecureItem(testKey);
      expect(retrievedValue).toEqual(testValue);
    });
    
    it('should use sessionStorage for session-only secure items', () => {
      const encryptionKey = 'test-encryption-key-12345';
      const storage = new EnhancedStorageService({ encryptionKey });
      const testKey = 'session-only-data';
      const testValue = { tempToken: 'temp-123', expires: Date.now() };
      
      // Set as session-only
      storage.setSecureItem(testKey, testValue, { sessionOnly: true });
      
      // Check that item was stored in sessionStorage, not localStorage
      const namespacedKey = `nostr-ads_${testKey}`;
      expect(sessionStorageMock.getItem(namespacedKey)).not.toBeNull();
      expect(localStorageMock.getItem(namespacedKey)).toBeNull();
      
      // Retrieved value should be correct
      const retrievedValue = storage.getSecureItem(testKey, { sessionOnly: true });
      expect(retrievedValue).toEqual(testValue);
    });
    
    it('should fallback gracefully if encryption/decryption fails', () => {
      const encryptionKey = 'test-encryption-key-12345';
      const storage = new EnhancedStorageService({ encryptionKey });
      const testKey = 'failing-encryption';
      const testValue = { data: 'test' };
      
      // Mock CryptoJS to simulate failure
      const CryptoJS = require('crypto-js');
      const originalEncrypt = CryptoJS.AES.encrypt;
      CryptoJS.AES.encrypt = jest.fn(() => {
        throw new Error('Encryption failed');
      });
      
      // Should not throw
      expect(() => {
        storage.setItem(testKey, testValue, { encrypt: true });
      }).not.toThrow();
      
      // Restore original
      CryptoJS.AES.encrypt = originalEncrypt;
    });
  });
  
  describe('Expiry and Auto-cleanup', () => {
    it('should handle item expiry correctly', () => {
      const storage = new EnhancedStorageService();
      const testKey = 'expiring-item';
      const testValue = { temp: true };
      
      // Set with short expiry (50ms)
      storage.setItem(testKey, testValue, {
        expiry: { duration: 50 }
      });
      
      // Should be available immediately
      expect(storage.getItem(testKey)).toEqual(testValue);
      
      // Wait for expiry
      return new Promise<void>(resolve => {
        setTimeout(() => {
          // Should be null after expiry
          expect(storage.getItem(testKey)).toBeNull();
          resolve();
        }, 100);
      });
    });
    
    it('should refresh expiry when requested', () => {
      jest.useFakeTimers();
      
      const storage = new EnhancedStorageService();
      const testKey = 'refresh-expiry-item';
      const testValue = { refreshable: true };
      
      // Set with short expiry (100ms)
      storage.setItem(testKey, testValue, {
        expiry: { duration: 100 }
      });
      
      // Advance time by 50ms
      jest.advanceTimersByTime(50);
      
      // Get with refresh option
      const retrieved = storage.getItem(testKey, { refreshExpiry: true });
      expect(retrieved).toEqual(testValue);
      
      // Advance time by another 75ms (should still be valid if refreshed)
      jest.advanceTimersByTime(75);
      expect(storage.getItem(testKey)).toEqual(testValue);
      
      // Advance time past the new expiry
      jest.advanceTimersByTime(50);
      expect(storage.getItem(testKey)).toBeNull();
      
      jest.useRealTimers();
    });
    
    it('should clean up expired items', () => {
      jest.useFakeTimers();
      
      const storage = new EnhancedStorageService();
      
      // Set multiple items with different expiry times
      storage.setItem('expire1', 'value1', { expiry: { duration: 100 } });
      storage.setItem('expire2', 'value2', { expiry: { duration: 200 } });
      storage.setItem('no-expire', 'value3');
      
      // Advance time past first expiry
      jest.advanceTimersByTime(150);
      
      // Clean expired items
      const cleanedCount = storage.cleanExpired();
      expect(cleanedCount).toBe(1);
      
      // expire1 should be gone, expire2 and no-expire should remain
      expect(storage.getItem('expire1')).toBeNull();
      expect(storage.getItem('expire2')).not.toBeNull();
      expect(storage.getItem('no-expire')).not.toBeNull();
      
      jest.useRealTimers();
    });
  });
  
  describe('Error Handling', () => {
    it('should handle errors when storage is not available', () => {
      // Mock localStorage.setItem to throw
      const originalSetItem = localStorageMock.setItem;
      localStorageMock.setItem = jest.fn(() => {
        throw new Error('Storage quota exceeded');
      });
      
      const storage = new EnhancedStorageService();
      const testKey = 'failing-storage';
      const testValue = { data: 'test' };
      
      // Should return false but not throw
      const result = storage.setItem(testKey, testValue);
      expect(result).toBe(false);
      
      // Restore original
      localStorageMock.setItem = originalSetItem;
    });
    
    it('should provide default values when retrieval fails', () => {
      // Mock localStorage.getItem to throw
      const originalGetItem = localStorageMock.getItem;
      localStorageMock.getItem = jest.fn(() => {
        throw new Error('Storage error');
      });
      
      const storage = new EnhancedStorageService();
      const testKey = 'failing-retrieval';
      const defaultValue = { default: true };
      
      // Should return default value but not throw
      const result = storage.getItem(testKey, { defaultValue });
      expect(result).toEqual(defaultValue);
      
      // Restore original
      localStorageMock.getItem = originalGetItem;
    });
  });
});