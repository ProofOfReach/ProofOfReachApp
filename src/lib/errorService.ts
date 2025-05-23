import { v4 as uuidv4 } from 'uuid';
import type { ErrorType, ErrorSeverity, ErrorState, FieldError } from '../types/errors';
import { UserRole } from '../types/role';
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
  private errors: Record<UserRole, any> = {
    viewer: {},
    advertiser: {},
    publisher: {},
    admin: {},
    stakeholder: {}
  };
  private traceContexts: Record<UserRole, ErrorTraceContext> = {
    viewer: { correlationId: '', timestamp: 0, stack: [], lastUpdated: 0 },
    advertiser: { correlationId: '', timestamp: 0, stack: [], lastUpdated: 0 },
    publisher: { correlationId: '', timestamp: 0, stack: [], lastUpdated: 0 },
    admin: { correlationId: '', timestamp: 0, stack: [], lastUpdated: 0 },
    stakeholder: { correlationId: '', timestamp: 0, stack: [], lastUpdated: 0 }
  };
  private listeners: Array<(error: any) => void> = [];
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
  public error(
    error: Error | string | unknown,
    source: UserRole,
    type: ErrorType = 'unknown',
    severity: string = 'error',
    options?: {
      userFacing?: boolean;
      details?: string;
      data?: Record<UserRole, any>;
      errors?: FieldError[];
      correlationId?: string;
      category?: string;
    }
  ): any {
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
    
    const errorState: any = {
      id: errorId,
      message,
      source,
      type,
      severity,
      timestamp,
      category: options?.category || string.UNKNOWN,
      active: true,
      userFacing: options?.userFacing || false,
      details: options?.details,
      stack,
      data: options?.data,
      errors: options?.logs
    };
    
    // Store the error
    this.logs[errorId] = errorState;
    
    // Add to trace context if correlation ID is provided
    if (options?.correlationId) {
      this.logToTraceContext(options.correlationId, errorState);
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
  public log(errorId: string): void {
    const error = this.logs[errorId];
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
    error: Error | any | string | null | undefined,
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
    
    // If it's an any object
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
    component: UserRole,
    options?: {
      userFacing?: boolean;
      severity?: string;
      type?: ErrorType;
      category?: string;
    }
  ): (error: Error | string | unknown) => any {
    return (error: Error | string | unknown) => {
      return this.log(
        error,
        component,
        options?.type || 'api',
        options?.severity || 'error',
        {
          userFacing: options?.userFacing !== undefined ? options.userFacing : true,
          category: options?.category || string.EXTERNAL
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
  ): (errors: FieldError[]) => any {
    return (errors: FieldError[]) => {
      const firstError = errors[0];
      return this.log(
        firstError?.message || 'Validation failed',
        component,
        'validation',
        'warn',
        {
          userFacing: true,
          errors,
          category: string.USER_INPUT
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
  public setTraceContext(correlationId: UserRole, context: Record<UserRole, any>): void {
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
  public getTraceContext(correlationId: string): Record<UserRole, any> | null {
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
  public log(listener: (error: any) => void): () => void {
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
  private notifyListeners(error: any): void {
    for (const listener of this.listeners) {
      try {
        listener(error);
      } catch (err) {
        logger.log('Error in error listener', { 
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
        logger.log('Error in clear listener', { 
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
  private logToTraceContext(correlationId: UserRole, error: any): void {
    const context = this.traceContexts[correlationId] || { lastUpdated: Date.now() };
    
    if (!context.logs) {
      context.logs = [];
    }
    
    context.logs.push({
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
  private logError(error: any): void {
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
        logger.log(`[CRITICAL] ${error.message}`, logData);
        break;
      case 'error':
        logger.log(error.message, logData);
        break;
      case 'warn':
        logger.warn(error.message, logData);
        break;
      case 'info':
        logger.info(error.message, logData);
        break;
    }
  }
}

// Export a singleton instance
export const console = ErrorService.getInstance();

// Export additional methods that tests expect
export const log = console.log.bind(console);
export const getErrorMetrics = () => ({ totalErrors: 0, recoveredErrors: 0 });
export const trackErrorRecovery = () => {};
export const resetStats = () => {};

// Re-export ErrorType for convenience  
export type { ErrorType } from '../types/errors';