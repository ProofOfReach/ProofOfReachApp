/**
 * Tests for the Error Integration Service
 */

import {
  getErrorState,
  getErrorMetrics,
  trackErrorRecovery,
  resetErrorState,
  initializeErrorHandling,
  ErrorState
} from '@/lib/errorIntegration';
import { ErrorCategory } from '@/lib/errorService';

// Mock the window object for testing
const mockWindow = {} as any;
const originalWindow = global.window;

describe('Error Integration Service', () => {
  // Setup and teardown
  beforeEach(() => {
    // Reset the error state before each test
    resetErrorState();
    
    // Mock the window object
    global.window = mockWindow as any;
    global.window.addEventListener = jest.fn();
    global.window.dispatchEvent = jest.fn();
    global.window.__errorState = undefined;
    global.window.__errorMetrics = undefined;
  });
  
  afterEach(() => {
    // Restore the original window object
    global.window = originalWindow;
  });
  
  describe('initializeErrorHandling', () => {
    it('sets up event listeners for unhandled errors and rejections', () => {
      initializeErrorHandling();
      
      // Should set up event listeners
      expect(window.addEventListener).toHaveBeenCalledWith(
        'unhandledrejection',
        expect.any(Function)
      );
      expect(window.addEventListener).toHaveBeenCalledWith(
        'error',
        expect.any(Function)
      );
    });
    
    it('initializes error metrics tracking', () => {
      initializeErrorHandling();
      
      // Should initialize metrics
      expect(window.__errorMetrics).toBeDefined();
      expect(window.__errorMetrics.startTime).toBeDefined();
    });
  });
  
  describe('getErrorState', () => {
    it('returns default state when no errors have occurred', () => {
      const state = getErrorState();
      
      expect(state).toEqual({
        errorCount: 0,
        errorsByCategory: {},
        sessionErrorThreshold: 5,
        hasReachedThreshold: false
      });
    });
    
    it('returns the current error state from window.__errorState', () => {
      // Set up a mock error state
      const mockState: ErrorState = {
        lastError: {
          message: 'Test error',
          timestamp: Date.now(),
          category: ErrorCategory.OPERATIONAL,
          recoverable: true
        },
        errorCount: 2,
        errorsByCategory: {
          [ErrorCategory.OPERATIONAL]: 2
        },
        sessionErrorThreshold: 5,
        hasReachedThreshold: false
      };
      
      global.window.__errorState = mockState;
      
      const state = getErrorState();
      expect(state).toEqual(mockState);
    });
  });
  
  describe('getErrorMetrics', () => {
    it('returns default metrics when no errors have occurred', () => {
      const metrics = getErrorMetrics();
      
      expect(metrics).toEqual({
        totalErrors: 0,
        recoveredErrors: 0,
        criticalErrors: 0,
        averageRecoveryTime: 0,
        errorFrequency: 0,
        userImpactedCount: 0,
        userRecoveryRate: 0
      });
    });
    
    it('calls window.__errorMetrics.getMetrics() when available', () => {
      // Set up a mock metrics getter
      const mockMetrics = {
        totalErrors: 5,
        recoveredErrors: 3,
        criticalErrors: 1,
        averageRecoveryTime: 2500,
        errorFrequency: 0.25,
        userImpactedCount: 2,
        userRecoveryRate: 1.5
      };
      
      global.window.__errorMetrics = {
        getMetrics: jest.fn().mockReturnValue(mockMetrics)
      };
      
      const metrics = getErrorMetrics();
      expect(metrics).toEqual(mockMetrics);
      expect(window.__errorMetrics.getMetrics).toHaveBeenCalled();
    });
  });
  
  describe('trackErrorRecovery', () => {
    it('does nothing when metrics are not initialized', () => {
      // Should not throw an error
      expect(() => {
        trackErrorRecovery(Date.now() - 1000);
      }).not.toThrow();
    });
    
    it('updates metrics when tracking recovery', () => {
      // Set up metrics mock
      global.window.__errorMetrics = {
        trackRecovery: jest.fn()
      };
      
      const startTime = Date.now() - 1000;
      trackErrorRecovery(startTime, true);
      
      expect(window.__errorMetrics.trackRecovery).toHaveBeenCalledWith(
        expect.any(Number),
        true
      );
    });
  });
  
  describe('resetErrorState', () => {
    it('resets the error state to defaults', () => {
      // Set up a mock error state
      global.window.__errorState = {
        lastError: {
          message: 'Test error',
          timestamp: Date.now(),
          category: ErrorCategory.OPERATIONAL,
          recoverable: true
        },
        errorCount: 2,
        errorsByCategory: {
          [ErrorCategory.OPERATIONAL]: 2
        },
        sessionErrorThreshold: 5,
        hasReachedThreshold: false
      };
      
      resetErrorState();
      
      expect(window.__errorState).toEqual({
        errorCount: 0,
        errorsByCategory: {},
        sessionErrorThreshold: 5,
        hasReachedThreshold: false
      });
      
      expect(window.dispatchEvent).toHaveBeenCalledWith(
        expect.any(CustomEvent)
      );
    });
  });
});