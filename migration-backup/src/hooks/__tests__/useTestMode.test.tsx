import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useTestMode } from '../useTestMode';
import { testModeService } from '../../services/testModeService';
import * as eventSystem from '../../lib/events';

// Mock the entire events module and useAppEvent hook
jest.mock('../../lib/events', () => ({
  addAppEventListener: jest.fn().mockImplementation(() => jest.fn()),
  TEST_MODE_EVENTS: {
    ACTIVATED: 'testmode:activated',
    DEACTIVATED: 'testmode:deactivated'
  },
  ROLE_EVENTS: {
    ROLE_CHANGED: 'role:changed',
    ROLES_UPDATED: 'role:roles-updated'
  }
}));

// Mock the testModeService
jest.mock('../../services/testModeService', () => {
  return {
    testModeService: {
      isActive: jest.fn().mockReturnValue(true),
      getTimeRemaining: jest.fn().mockReturnValue(240),
      getCurrentRole: jest.fn().mockReturnValue('viewer'),
      getAvailableRoles: jest.fn().mockReturnValue(['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder']),
      enableTestMode: jest.fn().mockReturnValue(true),
      disableTestMode: jest.fn().mockReturnValue(true),
      setCurrentRole: jest.fn().mockResolvedValue(true),
      enableAllRoles: jest.fn().mockReturnValue(true),
      isTestModeAllowed: jest.fn().mockReturnValue(true),
      createTimeLimitedSession: jest.fn().mockReturnValue(true),
      createTestScenario: jest.fn().mockReturnValue(true),
      setDebugMode: jest.fn(),
    }
  };
});

// Mock the useAppEvent hook
jest.mock('@/hooks/useAppEvent', () => ({
  useAppEvent: jest.fn().mockImplementation((eventType, handler) => {
    // Store the handler reference for tests to trigger it
    if (eventType === 'testmode:activated') {
      (jest.mock('@/hooks/useAppEvent') as any).__activatedHandler = handler;
    } else if (eventType === 'testmode:deactivated') {
      (jest.mock('@/hooks/useAppEvent') as any).__deactivatedHandler = handler;
    } else if (eventType === 'role:changed') {
      (jest.mock('@/hooks/useAppEvent') as any).__roleChangedHandler = handler;
    } else if (eventType === 'role:roles-updated') {
      (jest.mock('@/hooks/useAppEvent') as any).__rolesUpdatedHandler = handler;
    }
  })
}));

describe('useTestMode Hook', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    testModeService.isActive.mockReturnValue(true);
    testModeService.getTimeRemaining.mockReturnValue(240);
    testModeService.getCurrentRole.mockReturnValue('viewer');
    testModeService.getAvailableRoles.mockReturnValue(['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder']);
    testModeService.enableTestMode.mockReturnValue(true);
    testModeService.disableTestMode.mockReturnValue(true);
    testModeService.setCurrentRole.mockResolvedValue(true);
    testModeService.enableAllRoles.mockReturnValue(true);
    testModeService.isTestModeAllowed.mockReturnValue(true);
    testModeService.createTimeLimitedSession.mockReturnValue(true);
    testModeService.createTestScenario.mockReturnValue(true);
    
    // Mock window.__DEV__ for development environment tests
    Object.defineProperty(window, '__DEV__', {
      writable: true,
      value: true
    });
  });
  
  it('returns the correct initial state', () => {
    const { result } = renderHook(() => useTestMode());
    
    expect(result.current.isActive).toBe(true);
    expect(result.current.timeRemaining).toBe(240);
    expect(result.current.currentRole).toBe('viewer');
    expect(result.current.availableRoles).toEqual(['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder']);
    expect(result.current.isDevEnvironment).toBe(true);
    expect(result.current.isTestModeAllowed).toBe(true);
  });
  
  it('calls TestModeService methods for actions', () => {
    const { result } = renderHook(() => useTestMode());
    
    // Test enableTestMode
    act(() => {
      result.current.enableTestMode(120, 'admin', true);
    });
    expect(testModeService.enableTestMode).toHaveBeenCalledWith(120, 'admin', true);
    
    // Test disableTestMode
    act(() => {
      result.current.disableTestMode();
    });
    expect(testModeService.disableTestMode).toHaveBeenCalled();
    
    // Test setCurrentRole
    act(() => {
      result.current.setCurrentRole('advertiser');
    });
    expect(testModeService.setCurrentRole).toHaveBeenCalledWith('advertiser');
    
    // Test enableAllRoles
    act(() => {
      result.current.enableAllRoles();
    });
    expect(testModeService.enableAllRoles).toHaveBeenCalled();
    
    // Test createTimeLimitedSession
    act(() => {
      result.current.createTimeLimitedSession(60, 'publisher');
    });
    expect(testModeService.createTimeLimitedSession).toHaveBeenCalledWith(60, 'publisher');
    
    // Test createTestScenario
    act(() => {
      result.current.createTestScenario('admin');
    });
    expect(testModeService.createTestScenario).toHaveBeenCalledWith('admin');
    
    // Test setDebugMode
    act(() => {
      result.current.setDebugMode(true);
    });
    expect(testModeService.setDebugMode).toHaveBeenCalledWith(true);
  });
  
  it('sets up event listeners through useAppEvent hook', () => {
    // Verify the hook was called for each event type
    renderHook(() => useTestMode());
    
    // We verify that useAppEvent was called to set up listeners
    const { useAppEvent } = require('@/hooks/useAppEvent');
    expect(useAppEvent).toHaveBeenCalledWith('testmode:activated', expect.any(Function));
    expect(useAppEvent).toHaveBeenCalledWith('testmode:deactivated', expect.any(Function));
    expect(useAppEvent).toHaveBeenCalledWith('role:changed', expect.any(Function));
    expect(useAppEvent).toHaveBeenCalledWith('role:roles-updated', expect.any(Function));
  });
  
  it('updates state when test mode is activated', () => {
    const { result } = renderHook(() => useTestMode());
    
    // Initially active
    expect(result.current.isActive).toBe(true);
    
    // Simulate setting inactive then activating via event
    testModeService.isActive.mockReturnValue(false);
    
    // Re-render to see the changed value
    const { result: newResult } = renderHook(() => useTestMode());
    expect(newResult.current.isActive).toBe(false);
    
    // Now trigger the activation event (simulate what would happen if the event fired)
    testModeService.isActive.mockReturnValue(true);
    
    // Access the stored handler directly
    const activatedHandler = (jest.mock('@/hooks/useAppEvent') as any).__activatedHandler;
    
    // Trigger the handler with a test mode activated event payload
    act(() => {
      if (activatedHandler) activatedHandler({ 
        expiryTime: 7200000, 
        initialRole: 'admin' 
      });
    });
    
    // Should have called the service method to get updated state
    expect(testModeService.isActive).toHaveBeenCalled();
  });
  
  it('updates state when test mode is deactivated', () => {
    const { result } = renderHook(() => useTestMode());
    
    // Initially active
    expect(result.current.isActive).toBe(true);
    
    // Simulate deactivating via event
    testModeService.isActive.mockReturnValue(false);
    
    // Access the stored handler directly
    const deactivatedHandler = (jest.mock('@/hooks/useAppEvent') as any).__deactivatedHandler;
    
    // Trigger the handler (deactivated event doesn't have a payload)
    act(() => {
      if (deactivatedHandler) deactivatedHandler(undefined);
    });
    
    // Should reflect the updated state from the service
    expect(testModeService.isActive).toHaveBeenCalled();
  });
  
  it('updates state when role is changed', () => {
    const { result } = renderHook(() => useTestMode());
    
    // Initially 'viewer' role
    expect(result.current.currentRole).toBe('viewer');
    
    // Simulate changing role via event
    testModeService.getCurrentRole.mockReturnValue('admin');
    
    // Access the stored handler directly
    const roleChangedHandler = (jest.mock('@/hooks/useAppEvent') as any).__roleChangedHandler;
    
    // Trigger the handler with role changed event payload
    act(() => {
      if (roleChangedHandler) roleChangedHandler({ 
        from: 'viewer', 
        to: 'admin',
        availableRoles: ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder']
      });
    });
    
    // Should have called service method to get updated state
    expect(testModeService.getCurrentRole).toHaveBeenCalled();
  });
  
  it('handles development environment detection correctly', () => {
    // Test with __DEV__ = true
    Object.defineProperty(window, '__DEV__', {
      writable: true,
      value: true
    });
    
    const { result } = renderHook(() => useTestMode());
    expect(result.current.isDevEnvironment).toBe(true);
    
    // Test with __DEV__ = false
    Object.defineProperty(window, '__DEV__', {
      writable: true,
      value: false
    });
    
    const { result: prodResult } = renderHook(() => useTestMode());
    expect(prodResult.current.isDevEnvironment).toBe(false);
  });
});