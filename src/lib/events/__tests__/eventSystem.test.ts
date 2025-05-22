/**
 * Event System Tests
 * 
 * This file contains tests for the new event system to ensure
 * it works correctly for both modern and legacy event patterns.
 */

import { 
  dispatchAppEvent, 
  dispatchRoleEvent,
  dispatchTestModeEvent,
  addAppEventListener,
  addLegacyEventListener,
  ROLE_EVENTS,
  TEST_MODE_EVENTS,
  LEGACY_EVENTS,
  notifyRoleChanged,
  notifyTestModeActivated,
  notifyTestModeDeactivated
} from '../index';

// Mock the logger to avoid console output during tests
jest.mock('@/lib/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    log: jest.fn()
  }
}));

describe('Event System', () => {
  let mockHandler: jest.Mock;
  let mockLegacyHandler: jest.Mock;
  
  beforeEach(() => {
    // Create fresh mock functions for each test
    mockHandler = jest.fn();
    mockLegacyHandler = jest.fn();
    
    // Clear any previous event listeners
    jest.clearAllMocks();
  });
  
  describe('Event Dispatching', () => {
    it('dispatches modern events', () => {
      // Set up listener
      const cleanup = addAppEventListener(
        ROLE_EVENTS.ROLE_CHANGED, 
        mockHandler
      );
      
      // Dispatch event
      dispatchRoleEvent(ROLE_EVENTS.ROLE_CHANGED, {
        from: 'user',
        to: 'advertiser',
        availableRoles: ['user', 'advertiser']
      });
      
      // Verify handler was called with correct payload
      expect(mockHandler).toHaveBeenCalledWith({
        from: 'user',
        to: 'advertiser',
        availableRoles: ['user', 'advertiser']
      });
      
      cleanup();
    });
    
    it('dispatches legacy events automatically', () => {
      // Set up legacy listener
      const cleanup = addLegacyEventListener(
        LEGACY_EVENTS.ROLE_CHANGED,
        mockLegacyHandler
      );
      
      // Dispatch modern event that should trigger legacy events
      notifyRoleChanged('user', 'advertiser', ['user', 'advertiser']);
      
      // Verify legacy handler was called
      expect(mockLegacyHandler).toHaveBeenCalled();
      
      cleanup();
    });
    
    it('handles test mode activation/deactivation events', () => {
      // Set up listeners
      const activatedCleanup = addAppEventListener(
        TEST_MODE_EVENTS.ACTIVATED,
        mockHandler
      );
      
      const legacyCleanup = addLegacyEventListener(
        LEGACY_EVENTS.TEST_MODE_ENABLED,
        mockLegacyHandler
      );
      
      // Dispatch activation event
      notifyTestModeActivated(Date.now() + 3600000, 'admin');
      
      // Verify handlers were called
      expect(mockHandler).toHaveBeenCalled();
      expect(mockLegacyHandler).toHaveBeenCalled();
      
      // Clean up
      activatedCleanup();
      legacyCleanup();
    });
  });
  
  describe('Event Listening', () => {
    it('properly removes event listeners when cleanup is called', () => {
      // Set up listener
      const cleanup = addAppEventListener(
        ROLE_EVENTS.ROLE_CHANGED, 
        mockHandler
      );
      
      // Dispatch event
      dispatchRoleEvent(ROLE_EVENTS.ROLE_CHANGED, {
        from: 'user',
        to: 'advertiser',
        availableRoles: ['user', 'advertiser']
      });
      
      // Verify handler was called
      expect(mockHandler).toHaveBeenCalledTimes(1);
      
      // Call cleanup function
      cleanup();
      
      // Reset mock
      mockHandler.mockReset();
      
      // Dispatch again
      dispatchRoleEvent(ROLE_EVENTS.ROLE_CHANGED, {
        from: 'advertiser',
        to: 'publisher',
        availableRoles: ['user', 'advertiser', 'publisher']
      });
      
      // Verify handler was not called again
      expect(mockHandler).not.toHaveBeenCalled();
    });
  });
});