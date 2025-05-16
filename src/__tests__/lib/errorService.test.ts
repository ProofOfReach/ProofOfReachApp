import { ErrorService, errorService } from '@/lib/errorService';
import { ErrorCategory, ErrorSeverity, ErrorType, ErrorState, FieldError } from '@/types/errors';
import { logger } from '@/lib/logger';

// Mock the logger
jest.mock('@/lib/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    log: jest.fn()
  }
}));

describe('ErrorService', () => {
  beforeEach(() => {
    // Reset the error service to a clean state
    ErrorService.resetInstance();
    
    // Clear mocks
    jest.clearAllMocks();
  });

  describe('reportError', () => {
    it('should create an error state with correct properties', () => {
      const error = new Error('Test error');
      const errorState = errorService.reportError(
        error, 
        'TestComponent',
        'api',
        'error'
      );
      
      expect(errorState).toHaveProperty('id');
      expect(errorState.message).toBe('Test error');
      expect(errorState.source).toBe('TestComponent');
      expect(errorState.type).toBe('api');
      expect(errorState.severity).toBe('error');
      expect(errorState.active).toBe(true);
      expect(errorState.timestamp).toBeGreaterThan(0);
    });
    
    it('should handle string errors', () => {
      const errorState = errorService.reportError(
        'String error message', 
        'TestComponent'
      );
      
      expect(errorState.message).toBe('String error message');
      expect(logger.error).toHaveBeenCalled();
    });
    
    it('should assign appropriate default values', () => {
      const error = new Error('Minimal error');
      const errorState = errorService.reportError(error, 'TestComponent');
      
      // Check default values
      expect(errorState.type).toBe('unknown');
      expect(errorState.severity).toBe('error');
      expect(errorState.handled).toBe(false);
    });
    
    it('should use correlation IDs when provided', () => {
      const correlationId = 'test-correlation-123';
      const errorState = errorService.reportError(
        new Error('Correlated error'),
        'TestComponent',
        'api',
        'error',
        { correlationId }
      );
      
      expect(errorState.correlationId).toBe(correlationId);
      
      // Check that related errors can be retrieved
      const relatedErrors = errorService.getRelatedErrors(correlationId);
      expect(relatedErrors.length).toBe(1);
      expect(relatedErrors[0]).toBe(errorState.id);
    });
  });

  describe('clearError', () => {
    it('should mark an error as inactive when cleared', () => {
      // Reset the error service to ensure a clean state
      ErrorService.resetInstance();
      
      // First create an error
      const errorState = errorService.reportError(
        new Error('Error to clear'),
        'TestComponent'
      );
      
      // Now clear it
      errorService.clearError(errorState.id);
      
      // Get updated metrics to check if the error was cleared
      const metrics = errorService.getMetrics();
      
      // The error should still be in the recent list but marked as inactive
      const clearedError = metrics.recent.find(e => e.id === errorState.id);
      expect(clearedError).toBeDefined();
      expect(clearedError?.active).toBe(false);
    });
  });
  
  describe('formatErrorForUser', () => {
    it('should format errors for user display', () => {
      const error = new Error('Database connection failed');
      const result = errorService.formatErrorForUser(error);
      
      // Should show the actual error message
      expect(result).toBe('Database connection failed');
    });
    
    it('should use default message for null/undefined errors', () => {
      const defaultMsg = 'Custom default message';
      
      expect(errorService.formatErrorForUser(null, defaultMsg)).toBe(defaultMsg);
      expect(errorService.formatErrorForUser(undefined, defaultMsg)).toBe(defaultMsg);
    });
  });
  
  describe('withRetry', () => {
    it('should retry failed operations', async () => {
      let attempts = 0;
      const testFn = jest.fn().mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Temporary failure');
        }
        return 'success';
      });
      
      const result = await errorService.withRetry(testFn, {
        retries: 3,
        initialDelay: 10
      });
      
      expect(result).toBe('success');
      expect(testFn).toHaveBeenCalledTimes(3);
    });
    
    it('should pass along the error after max retries', async () => {
      const testError = new Error('Persistent failure');
      const testFn = jest.fn().mockRejectedValue(testError);
      
      await expect(errorService.withRetry(testFn, {
        retries: 2,
        initialDelay: 10
      })).rejects.toThrow('Persistent failure');
      
      expect(testFn).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });
  });
  
  describe('createApiErrorHandler', () => {
    it('should return a function that reports API errors', () => {
      const handler = errorService.createApiErrorHandler('ApiComponent');
      const error = new Error('API failure');
      
      const errorState = handler(error);
      
      expect(errorState.source).toBe('ApiComponent');
      expect(errorState.type).toBe('api');
      expect(errorState.category).toBe(ErrorCategory.OPERATIONAL);
    });
    
    it('should customize error reporting with options', () => {
      const handler = errorService.createApiErrorHandler('ApiComponent', {
        severity: 'critical',
        userFacing: false
      });
      
      const errorState = handler(new Error('Critical API error'));
      
      expect(errorState.severity).toBe('critical');
      expect(errorState.userFacing).toBe(false);
    });
  });
  
  describe('createValidationErrorHandler', () => {
    it('should create a handler for validation errors', () => {
      const handler = errorService.createValidationErrorHandler('FormComponent');
      
      const fields: FieldError[] = [
        { field: 'email', message: 'Invalid email' },
        { field: 'password', message: 'Too short' }
      ];
      
      const errorState = handler('Please fix form errors', fields);
      
      expect(errorState.source).toBe('FormComponent');
      expect(errorState.type).toBe('validation');
      expect(errorState.category).toBe(ErrorCategory.USER_INPUT);
      expect(errorState.errors).toEqual(fields);
    });
  });
  
  describe('tracing and context', () => {
    it('should store and retrieve trace context', () => {
      const correlationId = 'trace-123';
      const context = { requestId: 'req-456', userId: 'user-789' };
      
      errorService.setTraceContext(correlationId, context);
      
      const retrieved = errorService.getTraceContext(correlationId);
      // Check that the retrieved context contains all the expected values
      // We ignore the lastUpdate timestamp property
      expect(retrieved).toMatchObject(context);
    });
    
    it('should clean up correlation IDs', () => {
      // Create some correlation IDs
      errorService.reportError(new Error('Error 1'), 'Test', 'api', 'error', { correlationId: 'corr-1' });
      errorService.reportError(new Error('Error 2'), 'Test', 'api', 'error', { correlationId: 'corr-2' });
      
      // Check they exist
      const activeIds = errorService.getActiveCorrelationIds();
      expect(activeIds).toContain('corr-1');
      expect(activeIds).toContain('corr-2');
      
      // Clean up one
      errorService.cleanupCorrelationIds(['corr-1']);
      
      // Check it's gone
      const updatedIds = errorService.getActiveCorrelationIds();
      expect(updatedIds).not.toContain('corr-1');
      expect(updatedIds).toContain('corr-2');
    });
  });
  
  describe('error listeners', () => {
    it('should notify listeners when errors occur', () => {
      const listener = jest.fn();
      const removeListener = errorService.addErrorListener(listener);
      
      const errorState = errorService.reportError(new Error('Test error'), 'Test');
      
      expect(listener).toHaveBeenCalledWith(errorState);
      
      // Test removing the listener
      removeListener();
      jest.clearAllMocks();
      
      errorService.reportError(new Error('Another error'), 'Test');
      expect(listener).not.toHaveBeenCalled();
    });
    
    it('should notify when errors are cleared', () => {
      const clearListener = jest.fn();
      errorService.addClearListener(clearListener);
      
      const errorState = errorService.reportError(new Error('Test error'), 'Test');
      errorService.clearError(errorState.id);
      
      expect(clearListener).toHaveBeenCalledWith(errorState.id);
    });
  });
});