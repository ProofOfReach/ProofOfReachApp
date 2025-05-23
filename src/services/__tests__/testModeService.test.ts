import { TestModeService } from '../testModeService';
import { EnhancedStorageService } from '../enhancedStorageService';
import { TestModeStorageService } from '../testModeStorageService';
import { StorageService } from '../storageService';
import * as eventDispatcherModule from '../../lib/events/eventDispatcher';
import { logger } from '../../lib/logger';
import type { UserRole } from '../../types/role';

// Mock dependencies
jest.mock('../enhancedStorageService', () => ({
  EnhancedStorageService: {
    getInstance: jest.fn()
  }
}));

jest.mock('../testModeStorageService', () => ({
  TestModeStorageService: {
    getInstance: jest.fn().mockReturnValue({
      getTestModeState: jest.fn(),
      saveTestModeState: jest.fn(),
      clearTestModeState: jest.fn(),
      validateTestModeState: jest.fn(),
      migrateFromLegacyStorage: jest.fn()
    })
  }
}));

// Mock StorageService static methods
jest.mock('../storageService', () => ({
  StorageService: {
    isTestModeActive: jest.fn().mockReturnValue(true),
    getTestModeState: jest.fn(),
    setTestModeState: jest.fn().mockReturnValue(true),
    createDefaultTestModeState: jest.fn().mockReturnValue({
      isActive: false,
      currentRole: 'viewer',
      availableRoles: ['viewer'],
      expiryTime: 0,
      lastUpdated: 0
    }),
    getStoredTestModeState: jest.fn(),
    setTimeRemaining: jest.fn(),
    getTimeRemaining: jest.fn().mockReturnValue(60),
    clearTestMode: jest.fn().mockReturnValue(true)
  }
}));

jest.mock('../../lib/events/eventDispatcher');
jest.mock('../../lib/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    log: jest.fn()
  }
}));

describe('TestModeService', () => {
  let testModeService: TestModeService;
  
  // Mock implementations
  const mockEnhancedStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  };
  
  const mockTestModeStorage = {
    getTestModeState: jest.fn(),
    saveTestModeState: jest.fn(),
    clearTestModeState: jest.fn(),
    validateTestModeState: jest.fn(),
    migrateFromLegacyStorage: jest.fn()
  };
  
  const mockEventDispatcher = {
    dispatch: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset the TestModeService singleton for each test
    // @ts-ignore - accessing private property for testing
    TestModeService.instance = undefined;
    
    // Mock the dispatchAppEvent function
    jest.spyOn(eventDispatcherModule, 'dispatchAppEvent').mockImplementation(jest.fn());
    
    // Set up StorageService mock implementation for this test
    const defaultTestModeState = {
      isActive: true,
      currentRole: 'viewer',
      availableRoles: ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'],
      expiryTime: Date.now() + 1000 * 60 * 60, // 1 hour from now
      lastUpdated: Date.now()
    };
    
    // Update the mock implementations for this test
    (StorageService.getTestModeState as jest.Mock).mockReturnValue(defaultTestModeState);
    
    // Default test mode storage state
    mockTestModeStorage.getTestModeState.mockReturnValue({
      isActive: true,
      currentRole: 'viewer',
      availableRoles: ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'],
      expiryTime: Date.now() + 1000 * 60 * 60, // 1 hour from now
      lastUpdated: Date.now()
    });
    
    // Mock localStorage for isTestModeAllowed check
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn().mockImplementation((key) => {
          if (key === 'isDevelopment') return 'true';
          return null;
        }),
        setItem: jest.fn(),
        removeItem: jest.fn()
      },
      writable: true
    });
    
    // Initialize the service
    testModeService = TestModeService.getInstance();
  });
  
  describe('getInstance', () => {
    it('returns a singleton instance', () => {
      const instance1 = TestModeService.getInstance();
      const instance2 = TestModeService.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });
  
  describe('isActive', () => {
    it('returns true when test mode is active', () => {
      mockTestModeStorage.getTestModeState.mockReturnValue({
        isActive: true,
        currentRole: 'viewer',
        availableRoles: ['viewer'],
        expiryTime: Date.now() + 1000 * 60 * 60,
        lastUpdated: Date.now()
      });
      
      expect(testModeService.isActive()).toBe(true);
    });
    
    it('returns false when test mode is not active', () => {
      mockTestModeStorage.getTestModeState.mockReturnValue({
        isActive: false,
        currentRole: 'viewer',
        availableRoles: ['viewer'],
        expiryTime: 0,
        lastUpdated: Date.now()
      });
      
      expect(testModeService.isActive()).toBe(false);
    });
    
    it('returns false when test mode has expired', () => {
      mockTestModeStorage.getTestModeState.mockReturnValue({
        isActive: true,
        currentRole: 'viewer',
        availableRoles: ['viewer'],
        expiryTime: Date.now() - 1000, // Expired 1 second ago
        lastUpdated: Date.now()
      });
      
      expect(testModeService.isActive()).toBe(false);
    });
  });
  
  describe('getTimeRemaining', () => {
    it('returns the time remaining in minutes', () => {
      const oneHourFromNow = Date.now() + 1000 * 60 * 60;
      mockTestModeStorage.getTestModeState.mockReturnValue({
        isActive: true,
        currentRole: 'viewer',
        availableRoles: ['viewer'],
        expiryTime: oneHourFromNow,
        lastUpdated: Date.now()
      });
      
      // Should be close to 60 minutes
      const timeRemaining = testModeService.getTimeRemaining();
      expect(timeRemaining).toBeGreaterThan(59);
      expect(timeRemaining).toBeLessThanOrEqual(60);
    });
    
    it('returns null when test mode is not active', () => {
      mockTestModeStorage.getTestModeState.mockReturnValue({
        isActive: false,
        currentRole: 'viewer',
        availableRoles: ['viewer'],
        expiryTime: 0,
        lastUpdated: Date.now()
      });
      
      expect(testModeService.getTimeRemaining()).toBeNull();
    });
  });
  
  describe('getCurrentRole', () => {
    it('returns the current role from test mode state', () => {
      mockTestModeStorage.getTestModeState.mockReturnValue({
        isActive: true,
        currentRole: 'admin',
        availableRoles: ['viewer', 'admin'],
        expiryTime: Date.now() + 1000 * 60 * 60,
        lastUpdated: Date.now()
      });
      
      expect(testModeService.getCurrentRole()).toBe('admin');
    });
    
    it('returns the default role when test mode is not active', () => {
      mockTestModeStorage.getTestModeState.mockReturnValue({
        isActive: false,
        currentRole: 'admin',
        availableRoles: ['viewer', 'admin'],
        expiryTime: 0,
        lastUpdated: Date.now()
      });
      
      expect(testModeService.getCurrentRole()).toBe('viewer');
    });
  });
  
  describe('getAvailableRoles', () => {
    it('returns the available roles from test mode state', () => {
      const expectedRoles = ['viewer', 'advertiser', 'admin'];
      mockTestModeStorage.getTestModeState.mockReturnValue({
        isActive: true,
        currentRole: 'viewer',
        availableRoles: expectedRoles,
        expiryTime: Date.now() + 1000 * 60 * 60,
        lastUpdated: Date.now()
      });
      
      expect(testModeService.getAvailableRoles()).toEqual(expectedRoles);
    });
    
    it('returns only the default role when test mode is not active', () => {
      mockTestModeStorage.getTestModeState.mockReturnValue({
        isActive: false,
        currentRole: 'viewer',
        availableRoles: ['viewer', 'admin', 'advertiser'],
        expiryTime: 0,
        lastUpdated: Date.now()
      });
      
      expect(testModeService.getAvailableRoles()).toEqual(['viewer']);
    });
  });
  
  describe('enableTestMode', () => {
    it('enables test mode with default parameters', () => {
      mockTestModeStorage.getTestModeState.mockReturnValue({
        isActive: false,
        currentRole: 'viewer',
        availableRoles: ['viewer'],
        expiryTime: 0,
        lastUpdated: Date.now()
      });
      
      const result = testModeService.enableTestMode();
      
      expect(result).toBe(true);
      expect(mockTestModeStorage.saveTestModeState).toHaveBeenCalled();
      expect(mockEventDispatcher.dispatch).toHaveBeenCalledWith('testmode:activated', expect.any(Object));
    });
    
    it('enables test mode with custom parameters', () => {
      mockTestModeStorage.getTestModeState.mockReturnValue({
        isActive: false,
        currentRole: 'viewer',
        availableRoles: ['viewer'],
        expiryTime: 0,
        lastUpdated: Date.now()
      });
      
      const duration = 30 * 60 * 1000; // 30 minutes
      const initialRole: UserRole = 'admin';
      const debug = true;
      
      const result = testModeService.enableTestMode(duration, initialRole, debug);
      
      expect(result).toBe(true);
      expect(mockTestModeStorage.saveTestModeState).toHaveBeenCalled();
      expect(mockEventDispatcher.dispatch).toHaveBeenCalledWith('testmode:activated', expect.any(Object));
    });
    
    it('does not enable if test mode is not allowed', () => {
      // Mock isTestModeAllowed to return false
      Object.defineProperty(window.localStorage, 'getItem', {
        value: jest.fn().mockReturnValue(null) // Not in development mode
      });
      
      const result = testModeService.enableTestMode();
      
      expect(result).toBe(false);
      expect(mockTestModeStorage.saveTestModeState).not.toHaveBeenCalled();
    });
  });
  
  describe('disableTestMode', () => {
    it('disables test mode', () => {
      mockTestModeStorage.getTestModeState.mockReturnValue({
        isActive: true,
        currentRole: 'admin',
        availableRoles: ['viewer', 'admin'],
        expiryTime: Date.now() + 1000 * 60 * 60,
        lastUpdated: Date.now()
      });
      
      const result = testModeService.disableTestMode();
      
      expect(result).toBe(true);
      expect(mockTestModeStorage.clearTestModeState).toHaveBeenCalled();
      expect(mockEventDispatcher.dispatch).toHaveBeenCalledWith('testmode:deactivated', expect.any(Object));
    });
    
    it('returns false if already disabled', () => {
      mockTestModeStorage.getTestModeState.mockReturnValue({
        isActive: false,
        currentRole: 'viewer',
        availableRoles: ['viewer'],
        expiryTime: 0,
        lastUpdated: Date.now()
      });
      
      const result = testModeService.disableTestMode();
      
      expect(result).toBe(false);
      expect(mockTestModeStorage.clearTestModeState).not.toHaveBeenCalled();
    });
  });
  
  describe('setCurrentRole', () => {
    it('sets the current role in test mode', async () => {
      mockTestModeStorage.getTestModeState.mockReturnValue({
        isActive: true,
        currentRole: 'viewer',
        availableRoles: ['viewer', 'admin', 'advertiser'],
        expiryTime: Date.now() + 1000 * 60 * 60,
        lastUpdated: Date.now()
      });
      
      const result = await testModeService.setCurrentRole('admin');
      
      expect(result).toBe(true);
      expect(mockTestModeStorage.saveTestModeState).toHaveBeenCalled();
      expect(mockEventDispatcher.dispatch).toHaveBeenCalledWith('role:changed', expect.any(Object));
    });
    
    it('does not change role if test mode is not active', async () => {
      mockTestModeStorage.getTestModeState.mockReturnValue({
        isActive: false,
        currentRole: 'viewer',
        availableRoles: ['viewer', 'admin', 'advertiser'],
        expiryTime: 0,
        lastUpdated: Date.now()
      });
      
      const result = await testModeService.setCurrentRole('admin');
      
      expect(result).toBe(false);
      expect(mockTestModeStorage.saveTestModeState).not.toHaveBeenCalled();
    });
    
    it('does not change to an invalid role', async () => {
      mockTestModeStorage.getTestModeState.mockReturnValue({
        isActive: true,
        currentRole: 'viewer',
        availableRoles: ['viewer', 'admin', 'advertiser'],
        expiryTime: Date.now() + 1000 * 60 * 60,
        lastUpdated: Date.now()
      });
      
      const result = await testModeService.setCurrentRole('invalidRole' as UserRole);
      
      expect(result).toBe(false);
      expect(mockTestModeStorage.saveTestModeState).not.toHaveBeenCalled();
    });
  });
  
  describe('enableAllRoles', () => {
    it('enables all roles in test mode', () => {
      mockTestModeStorage.getTestModeState.mockReturnValue({
        isActive: true,
        currentRole: 'viewer',
        availableRoles: ['viewer'],
        expiryTime: Date.now() + 1000 * 60 * 60,
        lastUpdated: Date.now()
      });
      
      // Mock StorageService.createDefaultTestModeState
      (StorageService.createDefaultTestModeState as jest.Mock).mockReturnValue({
        isActive: true,
        currentRole: 'viewer',
        availableRoles: ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'],
        expiryTime: Date.now() + 1000 * 60 * 60,
        lastUpdated: Date.now()
      });
      
      const result = testModeService.enableAllRoles();
      
      expect(result).toBe(true);
      expect(mockTestModeStorage.saveTestModeState).toHaveBeenCalled();
      expect(mockEventDispatcher.dispatch).toHaveBeenCalledWith('role:roles-updated', expect.any(Object));
    });
    
    it('does not enable all roles if test mode is not active', () => {
      mockTestModeStorage.getTestModeState.mockReturnValue({
        isActive: false,
        currentRole: 'viewer',
        availableRoles: ['viewer'],
        expiryTime: 0,
        lastUpdated: Date.now()
      });
      
      const result = testModeService.enableAllRoles();
      
      expect(result).toBe(false);
      expect(mockTestModeStorage.saveTestModeState).not.toHaveBeenCalled();
    });
  });
  
  describe('isTestModeAllowed', () => {
    it('returns true in development environment', () => {
      Object.defineProperty(window.localStorage, 'getItem', {
        value: jest.fn().mockReturnValue('true') // Development mode
      });
      
      expect(testModeService.isTestModeAllowed()).toBe(true);
    });
    
    it('returns false in production environment', () => {
      Object.defineProperty(window.localStorage, 'getItem', {
        value: jest.fn().mockReturnValue(null) // Not in development mode
      });
      
      expect(testModeService.isTestModeAllowed()).toBe(false);
    });
  });
  
  describe('createTimeLimitedSession', () => {
    it('creates a time-limited test session', () => {
      mockTestModeStorage.getTestModeState.mockReturnValue({
        isActive: false,
        currentRole: 'viewer',
        availableRoles: ['viewer'],
        expiryTime: 0,
        lastUpdated: Date.now()
      });
      
      const result = testModeService.createTimeLimitedSession(30, 'admin');
      
      expect(result).toBe(true);
      expect(mockTestModeStorage.saveTestModeState).toHaveBeenCalled();
      expect(mockEventDispatcher.dispatch).toHaveBeenCalledWith('testmode:activated', expect.any(Object));
    });
    
    it('does not create a session if test mode is not allowed', () => {
      // Mock isTestModeAllowed to return false
      Object.defineProperty(window.localStorage, 'getItem', {
        value: jest.fn().mockReturnValue(null) // Not in development mode
      });
      
      const result = testModeService.createTimeLimitedSession(30, 'admin');
      
      expect(result).toBe(false);
      expect(mockTestModeStorage.saveTestModeState).not.toHaveBeenCalled();
    });
  });
  
  describe('createTestScenario', () => {
    it('creates a test scenario for a specific role', () => {
      mockTestModeStorage.getTestModeState.mockReturnValue({
        isActive: false,
        currentRole: 'viewer',
        availableRoles: ['viewer'],
        expiryTime: 0,
        lastUpdated: Date.now()
      });
      
      const result = testModeService.createTestScenario('admin');
      
      expect(result).toBe(true);
      expect(mockTestModeStorage.saveTestModeState).toHaveBeenCalled();
      expect(mockEventDispatcher.dispatch).toHaveBeenCalledWith('testmode:activated', expect.any(Object));
    });
    
    it('does not create a scenario if test mode is not allowed', () => {
      // Mock isTestModeAllowed to return false
      Object.defineProperty(window.localStorage, 'getItem', {
        value: jest.fn().mockReturnValue(null) // Not in development mode
      });
      
      const result = testModeService.createTestScenario('admin');
      
      expect(result).toBe(false);
      expect(mockTestModeStorage.saveTestModeState).not.toHaveBeenCalled();
    });
  });
  
  describe('setDebugMode', () => {
    it('enables debug mode and logs the action', () => {
      testModeService.setDebugMode(true);
      expect(logger.log).toHaveBeenCalledWith('TestModeService debug mode enabled');
    });
    
    it('disables debug mode and logs the action', () => {
      testModeService.setDebugMode(false);
      expect(logger.log).toHaveBeenCalledWith('TestModeService debug mode disabled');
    });
  });
});