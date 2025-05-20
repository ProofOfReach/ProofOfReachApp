import { v4 as uuidv4 } from 'uuid';
import { ErrorCategory, ErrorSeverity, ErrorState, ErrorType, FieldError } from '../types/errors';
import { logger } from './logger';

/**
 * Maximum number of retries for operations
 */
const MAX_RETRIES = 3;

/**
 * Base exponential backoff time in milliseconds
 */
const BASE_BACKOFF_MS = 300;

/**
 * Error tracking metadata
 */
interface ErrorTraceContext {
  [key: string]: any;
  lastUpdated: number;
}

/**
 * Error Service
 * 
 * Centralized service for error handling, reporting, and management.
 * This service is part of the Phase 1 error handling infrastructure.
 */
export class ErrorService {
  private static instance: ErrorService;
  private errors: Record<string, ErrorState> = {};
  private traceContexts: Record<string, ErrorTraceContext> = {};
  private listeners: Array<(error: ErrorState) => void> = [];
  private clearListeners: Array<(errorId: string) => void> = [];

  /**
   * Get the singleton instance of ErrorService
   */
  public static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService();
    }
    return ErrorService.instance;
  }

  /**
   * Reset the instance (for testing)
   */
  public static resetInstance(): void {
    ErrorService.instance = new ErrorService();
  }

  private constructor() {
    // Private constructor to enforce singleton pattern
    logger.debug('Error service initialized');
  }

  /**
   * Report an error to the error service
   * 
   * @param error The error to report
   * @param source The source of the error (component, module, etc.)
   * @param type The type of error
   * @param severity The severity of the error
   * @param options Additional options for the error
   * @returns The created error state
   */
  public reportError(
    error: Error | string | unknown,
    source: string,
    type: ErrorType = 'unknown',
    severity: ErrorSeverity = 'error',
    options?: {
      userFacing?: boolean;
      details?: string;
      data?: Record<string, any>;
      errors?: FieldError[];
      correlationId?: string;
      category?: ErrorCategory;
    }
  ): ErrorState {
    const errorId = uuidv4();
    const timestamp = new Date().toISOString();
    
    let message: string;
    let stack: string | undefined;
    
    if (error instanceof Error) {
      message = error.message || 'An unknown error occurred';
      stack = error.stack;
    } else if (typeof error === 'string') {
      message = error;
    } else {
      message = 'An unknown error occurred';
    }
    
    const errorState: ErrorState = {
      id: errorId,
      message,
      source,
      type,
      severity,
      timestamp,
      category: options?.category || ErrorCategory.UNKNOWN,
      active: true,
      userFacing: options?.userFacing || false,
      details: options?.details,
      stack,
      data: options?.data,
      errors: options?.errors
    };
    
    // Store the error
    this.errors[errorId] = errorState;
    
    // Add to trace context if correlation ID is provided
    if (options?.correlationId) {
      this.addErrorToTraceContext(options.correlationId, errorState);
    }
    
    // Log the error
    this.logError(errorState);
    
    // Notify listeners
    this.notifyListeners(errorState);
    
    return errorState;
  }

  /**
   * Clear an error by ID
   * 
   * @param errorId The ID of the error to clear
   */
  public clearError(errorId: string): void {
    const error = this.errors[errorId];
    if (error) {
      error.active = false;
      logger.debug(`Error ${errorId} cleared`);
      
      // Notify clear listeners
      this.notifyClearListeners(errorId);
    }
  }

  /**
   * Format an error for user display
   * 
   * @param error The error to format
   * @param defaultMessage The default message to use if no error is provided
   * @returns A user-friendly error message
   */
  public formatErrorForUser(
    error: Error | ErrorState | string | null | undefined,
    defaultMessage = 'An unexpected error occurred. Please try again.'
  ): string {
    if (!error) {
      return defaultMessage;
    }
    
    if (typeof error === 'string') {
      return error;
    }
    
    if (error instanceof Error) {
      return error.message || defaultMessage;
    }
    
    // If it's an ErrorState object
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
    
    return defaultMessage;
  }

  /**
   * Retry an operation with exponential backoff
   * 
   * @param operation The operation to retry
   * @param options Retry options
   * @returns The result of the operation
   */
  public async withRetry<T>(
    operation: () => Promise<T>,
    options?: {
      maxRetries?: number;
      baseBackoffMs?: number;
      onRetry?: (error: Error, attempt: number) => void;
      shouldRetry?: (error: Error) => boolean;
    }
  ): Promise<T> {
    const maxRetries = options?.maxRetries || MAX_RETRIES;
    const baseBackoffMs = options?.baseBackoffMs || BASE_BACKOFF_MS;
    
    let attempt = 0;
    
    while (true) {
      try {
        return await operation();
      } catch (err) {
        attempt++;
        
        const error = err instanceof Error ? err : new Error(String(err));
        
        // Check if we've reached max retries
        if (attempt >= maxRetries) {
          logger.warn(`Max retries (${maxRetries}) reached for operation`, { 
            error: error.message, 
            attempt 
          });
          throw error;
        }
        
        // Check if we should retry this particular error
        if (options?.shouldRetry && !options.shouldRetry(error)) {
          logger.debug(`Not retrying operation due to shouldRetry returning false`, { 
            error: error.message 
          });
          throw error;
        }
        
        // Calculate backoff time with exponential backoff and jitter
        const backoffTime = baseBackoffMs * Math.pow(2, attempt - 1) * (0.8 + 0.4 * Math.random());
        
        logger.debug(`Retrying operation after error (attempt ${attempt}/${maxRetries})`, { 
          error: error.message, 
          backoffMs: backoffTime 
        });
        
        // Notify retry callback if provided
        if (options?.onRetry) {
          options.onRetry(error, attempt);
        }
        
        // Wait for the backoff time
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      }
    }
  }

  /**
   * Create a handler for API errors
   * 
   * @param component The component reporting the error
   * @param options Options for the handler
   * @returns An error handler function
   */
  public createApiErrorHandler(
    component: string,
    options?: {
      userFacing?: boolean;
      severity?: ErrorSeverity;
      type?: ErrorType;
      category?: ErrorCategory;
    }
  ): (error: Error | string | unknown) => ErrorState {
    return (error: Error | string | unknown) => {
      return this.reportError(
        error,
        component,
        options?.type || 'api',
        options?.severity || 'error',
        {
          userFacing: options?.userFacing !== undefined ? options.userFacing : true,
          category: options?.category || ErrorCategory.EXTERNAL
        }
      );
    };
  }

  /**
   * Create a handler for validation errors
   * 
   * @param component The component reporting the error
   * @returns A validation error handler function
   */
  public createValidationErrorHandler(
    component: string
  ): (errors: FieldError[]) => ErrorState {
    return (errors: FieldError[]) => {
      const firstError = errors[0];
      return this.reportError(
        firstError?.message || 'Validation failed',
        component,
        'validation',
        'warning',
        {
          userFacing: true,
          errors,
          category: ErrorCategory.USER_INPUT
        }
      );
    };
  }

  /**
   * Set context for error tracing
   * 
   * @param correlationId The correlation ID
   * @param context The context to store
   */
  public setTraceContext(correlationId: string, context: Record<string, any>): void {
    this.traceContexts[correlationId] = {
      ...context,
      lastUpdated: Date.now()
    };
    logger.debug(`Trace context set for ${correlationId}`);
  }

  /**
   * Get context for error tracing
   * 
   * @param correlationId The correlation ID
   * @returns The trace context or null if not found
   */
  public getTraceContext(correlationId: string): Record<string, any> | null {
    const context = this.traceContexts[correlationId];
    if (!context) {
      return null;
    }
    return { ...context };
  }

  /**
   * Clean up stale trace contexts
   * 
   * @param maxAge The maximum age of contexts to keep in milliseconds
   */
  public cleanupTraceContexts(maxAge = 3600000): void {
    const now = Date.now();
    
    for (const correlationId in this.traceContexts) {
      const context = this.traceContexts[correlationId];
      if (now - context.lastUpdated > maxAge) {
        delete this.traceContexts[correlationId];
        logger.debug(`Cleaned up stale trace context for ${correlationId}`);
      }
    }
  }

  /**
   * Add a listener for new errors
   * 
   * @param listener The listener function
   * @returns A function to remove the listener
   */
  public addErrorListener(listener: (error: ErrorState) => void): () => void {
    this.listeners.push(listener);
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Add a listener for cleared errors
   * 
   * @param listener The listener function
   * @returns A function to remove the listener
   */
  public addClearListener(listener: (errorId: string) => void): () => void {
    this.clearListeners.push(listener);
    
    return () => {
      this.clearListeners = this.clearListeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners of a new error
   * 
   * @param error The error to notify about
   */
  private notifyListeners(error: ErrorState): void {
    for (const listener of this.listeners) {
      try {
        listener(error);
      } catch (err) {
        logger.error('Error in error listener', { 
          error: err instanceof Error ? err.message : 'Unknown error' 
        });
      }
    }
  }

  /**
   * Notify all clear listeners of a cleared error
   * 
   * @param errorId The ID of the cleared error
   */
  private notifyClearListeners(errorId: string): void {
    for (const listener of this.clearListeners) {
      try {
        listener(errorId);
      } catch (err) {
        logger.error('Error in clear listener', { 
          error: err instanceof Error ? err.message : 'Unknown error' 
        });
      }
    }
  }

  /**
   * Add an error to a trace context
   * 
   * @param correlationId The correlation ID
   * @param error The error to add
   */
  private addErrorToTraceContext(correlationId: string, error: ErrorState): void {
    const context = this.traceContexts[correlationId] || { lastUpdated: Date.now() };
    
    if (!context.errors) {
      context.errors = [];
    }
    
    context.errors.push({
      id: error.id,
      message: error.message,
      timestamp: error.timestamp
    });
    
    context.lastUpdated = Date.now();
    this.traceContexts[correlationId] = context;
  }

  /**
   * Log an error to the console
   * 
   * @param error The error to log
   */
  private logError(error: ErrorState): void {
    const logData = {
      errorId: error.id,
      source: error.source,
      type: error.type,
      category: error.category,
      details: error.details,
      data: error.data
    };
    
    switch (error.severity) {
      case 'critical':
        logger.error(`[CRITICAL] ${error.message}`, logData);
        break;
      case 'error':
        logger.error(error.message, logData);
        break;
      case 'warning':
        logger.warn(error.message, logData);
        break;
      case 'info':
        logger.info(error.message, logData);
        break;
    }
  }
}

// Export a singleton instance
export const errorService = ErrorService.getInstance();

// Re-export ErrorCategory for convenience
export { ErrorCategory } from '../types/errors';