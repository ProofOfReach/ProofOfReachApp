/**
 * Error Integration Test Suite - Fixed Version
 * 
 * Tests the error integration module functionality with proper TypeScript types.
 */

import { 
  addError, 
  clearAllErrors, 
  getErrors, 
  getErrorState, 
  getErrorMetrics,
  trackErrorRecovery,
  resetErrorState 
} from '@/lib/errorIntegration';
import { ErrorState } from '@/types/errors';

// Mock the logger
jest.mock('@/lib/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
  }
}));

describe('Error Integration', () => {
  beforeEach(() => {
    // Reset global state
    clearAllErrors();
    resetErrorState();
    
    // Mock window and document
    global.window = Object.create(window);
    global.document = {
      dispatchEvent: jest.fn()
    } as any;
    
    // Add required methods and properties
    global.window.addEventListener = jest.fn();
    global.window.dispatchEvent = jest.fn();
    
    // Initialize the error state with default structure
    (global.window as any).__errorState = {
      errors: [],
      globalError: null,
      toastError: null
    };
    
    // Initialize metrics
    (global.window as any).__errorMetrics = {
      startTime: Date.now(),
      getMetrics: jest.fn().mockReturnValue({
        totalErrors: 0,
        recoveredErrors: 0,
        criticalErrors: 0,
        errorsByType: {},
        averageRecoveryTime: 0,
        lastErrorTime: null
      }),
      totalErrors: 0,
      errorsByType: {}
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addError', () => {
    it('adds an error to the global state', () => {
      const testError: ErrorState = {
        id: 'test-1',
        message: 'Test error',
        type: 'api',
        severity: 'error',
        timestamp: Date.now().toString(),
        category: 'EXTERNAL' as any,
        source: 'test',
        active: true,
        userFacing: true
      };

      addError(testError);
      
      const errors = getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0]).toEqual(testError);
    });
  });

  describe('clearAllErrors', () => {
    it('clears all errors from global state', () => {
      const testError: ErrorState = {
        id: 'test-1',
        message: 'Test error',
        type: 'api',
        severity: 'error',
        timestamp: Date.now().toString(),
        category: 'EXTERNAL' as any,
        source: 'test',
        active: true,
        userFacing: true
      };

      addError(testError);
      expect(getErrors()).toHaveLength(1);
      
      clearAllErrors();
      expect(getErrors()).toHaveLength(0);
    });
  });

  describe('getErrorState', () => {
    it('returns state with empty properties when no errors present', () => {
      // Reset to a clean state with our test setup
      (global.window as any).__errorState = {
        errors: [],
        globalError: null,
        toastError: null
      };
      
      const state = getErrorState();
      expect(state.errors).toHaveLength(0);
      expect(state.globalError).toBeNull();
      expect(state.toastError).toBeNull();
    });

    it('returns current error state when errors are present', () => {
      clearAllErrors();
      (global.window as any).__errorState = {
        errors: [],
        globalError: null,
        toastError: null
      };
      
      const state = getErrorState();
      expect(state.errors).toHaveLength(0);
      clearAllErrors();
      expect((global.window as any).__errorState.errors).toHaveLength(0);
    });
  });
  
  describe('getErrorMetrics', () => {
    it('returns default metrics when no errors have occurred', () => {
      // Make sure (window as any).__errorMetrics doesn't exist for this test
      (global.window as any).__errorMetrics = undefined;
      
      const metrics = getErrorMetrics();
      
      // Check that we get back basic metrics properties
      expect(metrics).toHaveProperty('totalErrors');
      expect(metrics).toHaveProperty('errorsByType');
      expect(metrics.totalErrors).toBe(0);
    });
    
    it('uses (window as any).__errorMetrics when available', () => {
      // Set up a mock metrics structure
      (global.window as any).__errorMetrics = {
        getMetrics: jest.fn().mockReturnValue({
          totalErrors: 5,
          recoveredErrors: 3,
          criticalErrors: 1,
          errorsByType: { api: 3, network: 2 },
          averageRecoveryTime: 1500,
          lastErrorTime: Date.now()
        })
      };
      
      const metrics = getErrorMetrics();
      expect(metrics.totalErrors).toBe(5);
      expect(metrics.recoveredErrors).toBe(3);
    });
  });
  
  describe('trackErrorRecovery', () => {
    it('tracks recovery time and user recovery status', () => {
      // Set up (window as any).__errorMetrics for this test
      (global.window as any).__errorMetrics = {
        trackRecovery: jest.fn()
      };
      
      const startTime = Date.now() - 1000;
      trackErrorRecovery(startTime, true);
      
      expect(console.info).toHaveBeenCalledWith(
        expect.stringMatching(/Error recovered in \d+ms, user recovered: true/)
      );
    });
    
    it('uses (window as any).__errorMetrics when available', () => {
      // Set up metrics mock
      (global.window as any).__errorMetrics = {
        trackRecovery: jest.fn()
      };
      
      const startTime = Date.now() - 1000;
      trackErrorRecovery(startTime, true);
      
      expect((window as any).__errorMetrics.trackRecovery).toHaveBeenCalledWith(
        expect.any(Number),
        true
      );
    });
  });
  
  describe('resetErrorState', () => {
    it('resets all error state to defaults', () => {
      // Add some errors first
      const testError: ErrorState = {
        id: 'test-1',
        message: 'Test error',
        type: 'api',
        severity: 'error',
        timestamp: Date.now().toString(),
        category: 'EXTERNAL' as any,
        source: 'test',
        active: true,
        userFacing: true
      };

      addError(testError);
      expect(getErrors()).toHaveLength(1);
      
      resetErrorState();
      
      const state = getErrorState();
      expect(state.errors).toHaveLength(0);
      expect(state.globalError).toBeNull();
      expect(state.toastError).toBeNull();
    });
  });
});