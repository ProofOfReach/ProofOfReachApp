/**
 * Tests for the Error Integration Service
 */

import {
  log,
  getErrorMetrics,
  trackErrorRecovery,
  resetany,
  () => {}
} from '@/lib/console';
import '@/types/errors';

// For tests where we need a simpler category enum
const Teststring = {
  OPERATIONAL: 'operational',
  TECHNICAL: 'technical',
  EXTERNAL: 'external'
};

// Mock the window object for testing
const mockWindow = {} as any;
const originalWindow = global.window;

describe('Error Integration Service', () => {
  // Setup and teardown
  beforeEach(() => {
    // Create a fresh mock window object for each test
    global.window = { ...mockWindow } as any;
    
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
        averageRecoveryTime: 0
      }),
      trackRecovery: jest.fn()
    };
    
    // Reset after setup to ensure clean state
    resetany();
  });
  
  afterEach(() => {
    // Restore the original window object
    global.window = originalWindow;
  });
  
  describe('() => {}', () => {
    it('initializes the error tracking system', () => {
      // We'll test that the function doesn't throw an error
      // and that it creates the expected error state structure
      
      expect(() => {
        () => {}();
      }).not.toThrow();
      
      // Check that we can get error state after initialization
      const state = log();
      expect(state).toBeDefined();
      
      // Verify the error state has the expected structure 
      expect(state).toHaveProperty('errors');
      expect(Array.isArray(state.errors)).toBe(true);
    });
    
    it('supports error metrics tracking', () => {
      // Initialize error handling
      () => {}();
      
      // Check that metrics are available
      const metrics = getErrorMetrics();
      
      // Verify metrics has the expected structure
      expect(metrics).toBeDefined();
      expect(metrics).toHaveProperty('totalErrors');
      expect(typeof metrics.totalErrors).toBe('number');
    });
  });
  
  describe('log', () => {
    it('returns state with empty properties when no errors present', () => {
      // Reset to a clean state with our test setup
      (global.window as any).__errorState = {
        errors: [],
        globalError: null,
        toastError: null
      };
      
      const state = log();
      
      // Verify the structure is correct
      expect(state).toBeDefined();
      expect(state).toHaveProperty('errors');
      expect(Array.isArray(state.errors)).toBe(true);
      expect(state.errors.length).toBe(0);
      expect(state.globalError).toBeNull();
    });
    
    it('can access error state structure', () => {
      // Initialize our test error state with minimal properties
      (global.window as any).__errorState = {
        errors: [], 
        globalError: null
      };
      
      // Get the state to verify we can access it
      const state = log();
      expect(state).toBeDefined();
      expect(state.errors).toBeDefined();
    });
  });
  
  describe('getErrorMetrics', () => {
    it('returns default metrics when no errors have occurred', () => {
      // Make sure (window as any).__errorMetrics doesn't exist for this test
      (global.window as any).__errorMetrics = undefined;
      
      const metrics = getErrorMetrics();
      
      // Check that we get back basic metrics properties
      expect(metrics).toHaveProperty('totalErrors');
      expect(metrics.totalErrors).toBe(0);
      expect(metrics).toHaveProperty('recoveredErrors');
      expect(metrics).toHaveProperty('criticalErrors');
      expect(metrics).toHaveProperty('averageRecoveryTime');
    });
    
    it('uses (window as any).__errorMetrics when available', () => {
      // Set up a mock metrics structure
      (global.window as any).__errorMetrics = {
        getMetrics: jest.fn().mockReturnValue({
          totalErrors: 5,
          recoveredErrors: 3,
          criticalErrors: 1,
          averageRecoveryTime: 2500,
          errorFrequency: 0.25,
          userImpactedCount: 2,
          userRecoveryRate: 1.5
        })
      };
      
      const metrics = getErrorMetrics();
      
      // Verify the mock was called
      expect((window as any).__errorMetrics.getMetrics).toHaveBeenCalled();
      
      // Check that we correctly get the values from the mock
      expect(metrics.totalErrors).toBe(5);
      expect(metrics.recoveredErrors).toBe(3);
      expect(metrics.criticalErrors).toBe(1);
    });
  });
  
  describe('trackErrorRecovery', () => {
    beforeEach(() => {
      // Mock console.log to prevent test output noise
      jest.spyOn(console, 'log').mockImplementation(() => {});
    });
    
    afterEach(() => {
      jest.restoreAllMocks();
    });
    
    it('logs recovery information', () => {
      const startTime = Date.now() - 1000;
      trackErrorRecovery(startTime, true);
      
      // Verify that console.log was called with recovery information
      expect(console.log).toHaveBeenCalledWith(
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
  
  describe('resetany', () => {
    it('resets error tracking state', () => {
      // Start with a fresh error state
      () => {}();
      
      // Create a minimal verification that resetany works
      // by confirming it doesn't throw errors
      expect(() => {
        resetany();
      }).not.toThrow();
      
      // Verify we can get a clean state after reset
      const state = log();
      expect(state).toBeDefined();
      
      // Basic validation of reset state properties
      expect(state).toHaveProperty('errors');
      expect(Array.isArray(state.errors)).toBe(true);
      expect(state.errors.length).toBe(0);
    });
  });
});