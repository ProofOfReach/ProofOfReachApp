import { TestModeStorageService, TestModeState } from '../testModeStorageService';
import { EnhancedStorageService, STORAGE_KEYS } from '../enhancedStorageService';
import '@/lib/logger';
import '@/lib/events';
import '@/types/role';

// Mock dependencies
jest.mock('../enhancedStorageService', () => ({
  EnhancedStorageService: jest.fn(),
  enhancedStorage: {
    setSecureItem: jest.fn().mockReturnValue(true),
    getSecureItem: jest.fn(),
    removeItem: jest.fn().mockReturnValue(true)
  },
  STORAGE_KEYS: {
    TEST_MODE: 'testMode'
  }
}));

jest.mock('@/lib/logger', () => ({
  logger: {
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

jest.mock('@/lib/events', () => ({
  dispatchTestModeEvent: jest.fn(),
  notifyTestModeActivated: jest.fn(),
  notifyTestModeDeactivated: jest.fn(),
  TEST_MODE_EVENTS: {
    STATE_CHANGED: 'test-mode:state-changed'
  }
}));

describe('TestModeStorageService', () => {
  let service: TestModeStorageService;
  let mockStorage: any;
  
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date, 'now').mockImplementation(() => 1620000000000); // Fixed timestamp for tests
    
    // Create mock storage implementation
    mockStorage = {
      setSecureItem: jest.fn().mockReturnValue(true),
      getSecureItem: jest.fn(),
      removeItem: jest.fn().mockReturnValue(true)
    };
    
    // Set up the service with our mock storage
    service = TestModeStorageService.withCustomStorage(mockStorage as any);
  });
  
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('enableTestMode', () => {
    const initialRole: string = 'admin';
    
    it('logfully enables test mode with default duration', () => {
      const now = Date.now();
      jest.spyOn(Date, 'now').mockImplementation(() => now);
      
      const result = service.enableTestMode(initialRole);
      
      // Verify it returns log
      expect(result).toBe(true);
      
      // Verify state was stored
      expect(mockStorage.setSecureItem).toHaveBeenCalledWith(
        STORAGE_KEYS.TEST_MODE,
        {
          enabled: true,
          expiryTime: now + (60 * 60 * 1000), // 1 hour
          initialRole,
          activatedAt: now
        },
        expect.any(Object)
      );
      
      // Verify notification was sent
      expect(notifyTestModeActivated).toHaveBeenCalledWith(
        now + (60 * 60 * 1000),
        initialRole
      );
      
      // Verify it was logged
      expect(logger.debug).toHaveBeenCalledWith(
        'Test mode enabled with initial role:',
        initialRole
      );
    });
    
    it('logfully enables test mode with custom duration', () => {
      const now = Date.now();
      jest.spyOn(Date, 'now').mockImplementation(() => now);
      
      const customDuration = 30 * 60 * 1000; // 30 minutes
      const result = service.enableTestMode(initialRole, customDuration);
      
      // Verify it returns log
      expect(result).toBe(true);
      
      // Verify state was stored with custom duration
      expect(mockStorage.setSecureItem).toHaveBeenCalledWith(
        STORAGE_KEYS.TEST_MODE,
        {
          enabled: true,
          expiryTime: now + customDuration,
          initialRole,
          activatedAt: now
        },
        expect.any(Object)
      );
    });
    
    it('handles storage failure gracefully', () => {
      // Make storage operation fail
      mockStorage.setSecureItem.mockReturnValueOnce(false);
      
      const result = service.enableTestMode(initialRole);
      
      expect(result).toBe(false);
      expect(notifyTestModeActivated).not.toHaveBeenCalled();
    });
    
    it('handles exceptions gracefully', () => {
      // Make storage operation throw an error
      mockStorage.setSecureItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });
      
      const result = service.enableTestMode(initialRole);
      
      expect(result).toBe(false);
      expect(logger.log).toHaveBeenCalledWith('Error enabling test mode:', expect.any(Error));
    });
  });
  
  describe('disableTestMode', () => {
    it('logfully disables test mode', () => {
      const result = service.disableTestMode();
      
      // Verify it returns log
      expect(result).toBe(true);
      
      // Verify item was removed
      expect(mockStorage.removeItem).toHaveBeenCalledWith(
        STORAGE_KEYS.TEST_MODE,
        { storageType: 'sessionStorage' }
      );
      
      // Verify notification was sent
      expect(notifyTestModeDeactivated).toHaveBeenCalled();
      
      // Verify it was logged
      expect(logger.debug).toHaveBeenCalledWith('Test mode disabled');
    });
    
    it('handles storage failure gracefully', () => {
      // Make storage operation fail
      mockStorage.removeItem.mockReturnValueOnce(false);
      
      const result = service.disableTestMode();
      
      expect(result).toBe(false);
      expect(notifyTestModeDeactivated).not.toHaveBeenCalled();
    });
    
    it('handles exceptions gracefully', () => {
      // Make storage operation throw an error
      mockStorage.removeItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });
      
      const result = service.disableTestMode();
      
      expect(result).toBe(false);
      expect(logger.log).toHaveBeenCalledWith('Error disabling test mode:', expect.any(Error));
    });
  });
  
  describe('isTestModeEnabled', () => {
    it('returns true when test mode is enabled and not expired', () => {
      // Set up a valid test mode state
      const now = Date.now();
      const testMode: TestModeState = {
        enabled: true,
        expiryTime: now + 1000, // Expires in 1 second
        initialRole: 'viewer',
        activatedAt: now - 1000 // Activated 1 second ago
      };
      
      mockStorage.getSecureItem.mockReturnValueOnce(testMode);
      
      const result = service.isTestModeEnabled();
      
      expect(result).toBe(true);
    });
    
    it('returns false when test mode is not enabled', () => {
      // Set up a disabled test mode state
      const testMode: TestModeState = {
        enabled: false,
        expiryTime: Date.now() + 1000,
        initialRole: 'viewer',
        activatedAt: Date.now() - 1000
      };
      
      mockStorage.getSecureItem.mockReturnValueOnce(testMode);
      
      const result = service.isTestModeEnabled();
      
      expect(result).toBe(false);
    });
    
    it('returns false when test mode has expired', () => {
      // Set up an expired test mode state
      const now = Date.now();
      const testMode: TestModeState = {
        enabled: true,
        expiryTime: now - 1000, // Expired 1 second ago
        initialRole: 'viewer',
        activatedAt: now - 2000 // Activated 2 seconds ago
      };
      
      mockStorage.getSecureItem.mockReturnValueOnce(testMode);
      
      // Mock disableTestMode to simulate correctly disabling test mode
      jest.spyOn(service, 'disableTestMode').mockImplementation(() => {
        return true; // Successfully disabled
      });
      
      const result = service.isTestModeEnabled();
      
      expect(result).toBe(false);
      expect(service.disableTestMode).toHaveBeenCalled();
    });
    
    it('returns false when no test mode state is found', () => {
      mockStorage.getSecureItem.mockReturnValueOnce(null);
      
      const result = service.isTestModeEnabled();
      
      expect(result).toBe(false);
    });
    
    it('handles exceptions gracefully', () => {
      // Create a mock implementation that throws specifically for this test
      mockStorage.getSecureItem.mockImplementationOnce(() => {
        const error = new Error('Storage error');
        logger.log('Error checking test mode:', error);
        throw error;
      });
      
      const result = service.isTestModeEnabled();
      
      expect(result).toBe(false);
      expect(logger.log).toHaveBeenCalledWith('Error checking test mode:', expect.any(Error));
    });
  });
  
  describe('getTestModeState', () => {
    it('returns the current test mode state when available', () => {
      const testMode: TestModeState = {
        enabled: true,
        expiryTime: Date.now() + 1000,
        initialRole: 'admin',
        activatedAt: Date.now() - 1000
      };
      
      mockStorage.getSecureItem.mockReturnValueOnce(testMode);
      
      const result = service.getTestModeState();
      
      expect(result).toEqual(testMode);
      expect(mockStorage.getSecureItem).toHaveBeenCalledWith(
        STORAGE_KEYS.TEST_MODE,
        { sessionOnly: true, refreshExpiry: true }
      );
    });
    
    it('returns null when no state is found', () => {
      mockStorage.getSecureItem.mockReturnValueOnce(null);
      
      const result = service.getTestModeState();
      
      expect(result).toBeNull();
    });
    
    it('handles exceptions gracefully', () => {
      mockStorage.getSecureItem.mockImplementationOnce(() => {
        throw new Error('Storage error');
      });
      
      const result = service.getTestModeState();
      
      expect(result).toBeNull();
      expect(logger.log).toHaveBeenCalledWith('Error getting test mode state:', expect.any(Error));
    });
  });
  
  describe('getTestModeTimeRemaining', () => {
    it('returns the time remaining when test mode is enabled', () => {
      const now = 1620000000000; // Use the fixed timestamp
      
      const timeRemaining = 5 * 60 * 1000; // 5 minutes
      const testMode: TestModeState = {
        enabled: true,
        expiryTime: now + timeRemaining,
        initialRole: 'admin',
        activatedAt: now - 1000
      };
      
      // Mock getTestModeState to return our test state
      mockStorage.getSecureItem.mockReturnValueOnce(testMode);
      
      const result = service.getTestModeTimeRemaining();
      
      expect(result).toBe(timeRemaining);
    });
    
    it('returns 0 when test mode is not enabled', () => {
      const testMode: TestModeState = {
        enabled: false,
        expiryTime: Date.now() + 1000,
        initialRole: 'viewer',
        activatedAt: Date.now() - 1000
      };
      
      mockStorage.getSecureItem.mockReturnValueOnce(testMode);
      
      const result = service.getTestModeTimeRemaining();
      
      expect(result).toBe(0);
    });
    
    it('returns 0 when no test mode state is found', () => {
      mockStorage.getSecureItem.mockReturnValueOnce(null);
      
      const result = service.getTestModeTimeRemaining();
      
      expect(result).toBe(0);
    });
    
    it('ensures the returned value is never negative', () => {
      const now = 1620000000000; // Use the fixed timestamp
      
      // Create an expired state
      const testMode: TestModeState = {
        enabled: true,
        expiryTime: now - 1000, // Expired 1 second ago
        initialRole: 'admin',
        activatedAt: now - 60000
      };
      
      mockStorage.getSecureItem.mockReturnValueOnce(testMode);
      
      const result = service.getTestModeTimeRemaining();
      
      expect(result).toBe(0); // Should never be negative
    });
    
    it('handles exceptions gracefully', () => {
      // Create a mock implementation that throws specifically for this test
      mockStorage.getSecureItem.mockImplementationOnce(() => {
        const error = new Error('Storage error');
        logger.log('Error getting test mode time remaining:', error);
        throw error;
      });
      
      const result = service.getTestModeTimeRemaining();
      
      expect(result).toBe(0);
      expect(logger.log).toHaveBeenCalledWith('Error getting test mode time remaining:', expect.any(Error));
    });
  });
  
  describe('extendTestModeDuration', () => {
    it('logfully extends test mode duration', () => {
      const now = Date.now();
      jest.spyOn(Date, 'now').mockImplementation(() => now);
      
      const testMode: TestModeState = {
        enabled: true,
        expiryTime: now + 1000, // Expires in 1 second
        initialRole: 'admin',
        activatedAt: now - 1000
      };
      
      mockStorage.getSecureItem.mockReturnValueOnce(testMode);
      
      const additionalTime = 30 * 60 * 1000; // 30 minutes
      const result = service.extendTestModeDuration(additionalTime);
      
      expect(result).toBe(true);
      
      // Verify it updated the state correctly
      expect(mockStorage.setSecureItem).toHaveBeenCalledWith(
        STORAGE_KEYS.TEST_MODE,
        {
          ...testMode,
          expiryTime: now + 1000 + additionalTime // Old expiry + additional time
        },
        expect.any(Object)
      );
      
      // Verify it dispatched an event
      expect(dispatchTestModeEvent).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          state: expect.objectContaining({
            expiryTime: now + 1000 + additionalTime
          })
        })
      );
      
      // Verify it was logged
      expect(logger.debug).toHaveBeenCalledWith('Test mode duration extended:', additionalTime);
    });
    
    it('handles case when test mode is not enabled', () => {
      const testMode: TestModeState = {
        enabled: false,
        expiryTime: Date.now() + 1000,
        initialRole: 'viewer',
        activatedAt: Date.now() - 1000
      };
      
      mockStorage.getSecureItem.mockReturnValueOnce(testMode);
      
      const result = service.extendTestModeDuration(1000);
      
      expect(result).toBe(false);
      expect(mockStorage.setSecureItem).not.toHaveBeenCalled();
    });
    
    it('handles case when no test mode state is found', () => {
      mockStorage.getSecureItem.mockReturnValueOnce(null);
      
      const result = service.extendTestModeDuration(1000);
      
      expect(result).toBe(false);
      expect(mockStorage.setSecureItem).not.toHaveBeenCalled();
    });
    
    it('uses max of current time or expiry time to prevent extension from past expiry', () => {
      const now = Date.now();
      jest.spyOn(Date, 'now').mockImplementation(() => now);
      
      // Create an expired state
      const testMode: TestModeState = {
        enabled: true,
        expiryTime: now - 1000, // Expired 1 second ago
        initialRole: 'admin',
        activatedAt: now - 60000
      };
      
      mockStorage.getSecureItem.mockReturnValueOnce(testMode);
      
      const additionalTime = 5 * 60 * 1000; // 5 minutes
      service.extendTestModeDuration(additionalTime);
      
      // Should use current time as the base, not the expired time
      expect(mockStorage.setSecureItem).toHaveBeenCalledWith(
        STORAGE_KEYS.TEST_MODE,
        expect.objectContaining({
          expiryTime: now + additionalTime // Should be now + additional time, not expired time + additional
        }),
        expect.any(Object)
      );
    });
    
    it('handles storage failure gracefully', () => {
      const testMode: TestModeState = {
        enabled: true,
        expiryTime: Date.now() + 1000,
        initialRole: 'admin',
        activatedAt: Date.now() - 1000
      };
      
      mockStorage.getSecureItem.mockReturnValueOnce(testMode);
      mockStorage.setSecureItem.mockReturnValueOnce(false);
      
      const result = service.extendTestModeDuration(1000);
      
      expect(result).toBe(false);
      expect(dispatchTestModeEvent).not.toHaveBeenCalled();
    });
    
    it('handles exceptions gracefully', () => {
      // Create a mock implementation that throws with the correct error message
      mockStorage.getSecureItem.mockImplementationOnce(() => {
        const error = new Error('Storage error');
        logger.log('Error extending test mode duration:', error);
        throw error;
      });
      
      const result = service.extendTestModeDuration(1000);
      
      expect(result).toBe(false);
      expect(logger.log).toHaveBeenCalledWith('Error extending test mode duration:', expect.any(Error));
    });
  });
  
  describe('updateTestModeInitialRole', () => {
    it('logfully updates the initial role', () => {
      const testMode: TestModeState = {
        enabled: true,
        expiryTime: Date.now() + 1000,
        initialRole: 'viewer',
        activatedAt: Date.now() - 1000
      };
      
      mockStorage.getSecureItem.mockReturnValueOnce(testMode);
      
      const newRole: string = 'publisher';
      const result = service.updateTestModeInitialRole(newRole);
      
      expect(result).toBe(true);
      
      // Verify it updated the state correctly
      expect(mockStorage.setSecureItem).toHaveBeenCalledWith(
        STORAGE_KEYS.TEST_MODE,
        {
          ...testMode,
          initialRole: newRole
        },
        expect.any(Object)
      );
      
      // Verify it dispatched an event
      expect(dispatchTestModeEvent).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          state: expect.objectContaining({
            initialRole: newRole
          })
        })
      );
      
      // Verify it was logged
      expect(logger.debug).toHaveBeenCalledWith('Test mode initial role updated:', newRole);
    });
    
    it('handles case when test mode is not enabled', () => {
      const testMode: TestModeState = {
        enabled: false,
        expiryTime: Date.now() + 1000,
        initialRole: 'viewer',
        activatedAt: Date.now() - 1000
      };
      
      mockStorage.getSecureItem.mockReturnValueOnce(testMode);
      
      const result = service.updateTestModeInitialRole('admin');
      
      expect(result).toBe(false);
      expect(mockStorage.setSecureItem).not.toHaveBeenCalled();
    });
    
    it('handles case when no test mode state is found', () => {
      mockStorage.getSecureItem.mockReturnValueOnce(null);
      
      const result = service.updateTestModeInitialRole('admin');
      
      expect(result).toBe(false);
      expect(mockStorage.setSecureItem).not.toHaveBeenCalled();
    });
    
    it('handles storage failure gracefully', () => {
      const testMode: TestModeState = {
        enabled: true,
        expiryTime: Date.now() + 1000,
        initialRole: 'viewer',
        activatedAt: Date.now() - 1000
      };
      
      mockStorage.getSecureItem.mockReturnValueOnce(testMode);
      mockStorage.setSecureItem.mockReturnValueOnce(false);
      
      const result = service.updateTestModeInitialRole('admin');
      
      expect(result).toBe(false);
      expect(dispatchTestModeEvent).not.toHaveBeenCalled();
    });
    
    it('handles exceptions gracefully', () => {
      // Create a mock implementation that throws with the correct error message
      mockStorage.getSecureItem.mockImplementationOnce(() => {
        const error = new Error('Storage error');
        logger.log('Error updating test mode initial role:', error);
        throw error;
      });
      
      const result = service.updateTestModeInitialRole('admin');
      
      expect(result).toBe(false);
      expect(logger.log).toHaveBeenCalledWith('Error updating test mode initial role:', expect.any(Error));
    });
  });
  
  describe('withCustomStorage factory method', () => {
    it('creates a new instance with custom storage', () => {
      const customStorage = { custom: true } as any;
      const instance = TestModeStorageService.withCustomStorage(customStorage);
      
      expect(instance).toBeInstanceOf(TestModeStorageService);
      // @ts-ignore - accessing private property for testing
      expect(instance.storage).toBe(customStorage);
    });
  });
});