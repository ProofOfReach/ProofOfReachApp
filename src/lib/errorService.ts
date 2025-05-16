/**
 * Error Service
 * 
 * Centralized service for handling, logging, and tracking errors throughout
 * the application. This service is the core of the error handling infrastructure.
 * 
 * Phase 4 adds:
 * - Specialized error handlers for different error types
 * - Recovery mechanisms including retries with exponential backoff
 * - Automatic error categorization
 * - Better error correlation and context tracking
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  ErrorCategory,
  ErrorSeverity, 
  ErrorType, 
  ErrorState,
  FieldError
} from '@/types/errors';

// Default error messages by type
const DEFAULT_ERROR_MESSAGES: Record<ErrorType, string> = {
  validation: 'Please check your input and try again.',
  api: 'An error occurred while communicating with the server.',
  auth: 'Authentication error. Please log in again.',
  network: 'Network connection issue. Please check your internet connection.',
  permission: 'You don\'t have permission to perform this action.',
  unexpected: 'An unexpected error occurred. Please try again later.',
  business: 'Unable to complete the requested action.',
  timeout: 'The operation timed out. Please try again.',
  external: 'An error occurred with an external service.',
  unknown: 'An unknown error occurred. Please try again later.'
};

// Error category mapping
const ERROR_TYPE_TO_CATEGORY: Record<ErrorType, ErrorCategory> = {
  validation: ErrorCategory.USER_INPUT,
  api: ErrorCategory.OPERATIONAL,
  auth: ErrorCategory.AUTHORIZATION,
  network: ErrorCategory.OPERATIONAL,
  permission: ErrorCategory.AUTHORIZATION,
  unexpected: ErrorCategory.PROGRAMMER,
  business: ErrorCategory.BUSINESS,
  timeout: ErrorCategory.RESOURCE,
  external: ErrorCategory.OPERATIONAL,
  unknown: ErrorCategory.OPERATIONAL
};

// For analytics & monitoring
interface ErrorMetrics {
  total: number;
  byType: Record<ErrorType, number>;
  bySeverity: Record<ErrorSeverity, number>;
  byCategory: Record<ErrorCategory, number>;
  recent: ErrorState[];
  recoveryAttempts: number;
  successfulRecoveries: number;
}

// Retry configuration options
export interface RetryOptions {
  retries: number;
  initialDelay: number;
  maxDelay?: number;
  backoffFactor?: number;
  shouldRetry?: (error: any, attemptCount: number) => boolean;
  onRetry?: (error: any, attemptCount: number) => void;
}

// Default retry options
const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  retries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  shouldRetry: (error: any) => true,
  onRetry: (error: any, attemptCount: number) => console.log(`Retry attempt ${attemptCount} after error:`, error)
};

export class ErrorService {
  private static instance: ErrorService;
  private metrics: ErrorMetrics;
  private readonly MAX_RECENT_ERRORS = 50;
  private listeners: ((error: ErrorState) => void)[] = [];
  private clearListeners: ((id: string) => void)[] = [];
  private globalErrorListeners: ((error: ErrorState | null) => void)[] = [];
  private recoveryListeners: ((error: ErrorState, success: boolean) => void)[] = [];
  
  // Correlation and tracing related properties
  private correlationMap: Record<string, string[]> = {};
  private traceContext: Record<string, any> = {};
  private static readonly CORRELATION_EXPIRY_MS = 30 * 60 * 1000; // 30 minutes
  private correlationExpiry: Record<string, number> = {};
  private cleanupTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.metrics = {
      total: 0,
      byType: {
        validation: 0,
        api: 0,
        auth: 0,
        network: 0,
        permission: 0,
        unexpected: 0,
        business: 0,
        timeout: 0,
        external: 0,
        unknown: 0
      },
      bySeverity: {
        info: 0,
        warning: 0,
        error: 0,
        critical: 0,
        success: 0
      },
      byCategory: {
        [ErrorCategory.USER_INPUT]: 0,
        [ErrorCategory.AUTHORIZATION]: 0,
        [ErrorCategory.RESOURCE]: 0,
        [ErrorCategory.OPERATIONAL]: 0,
        [ErrorCategory.PROGRAMMER]: 0,
        [ErrorCategory.BUSINESS]: 0
      },
      recent: [],
      recoveryAttempts: 0,
      successfulRecoveries: 0
    };
    
    // Set up periodic cleanup of expired correlation IDs
    if (typeof window !== 'undefined') {
      // In browser, clean up correlation IDs every 5 minutes
      this.cleanupTimer = setInterval(() => this.cleanupExpiredCorrelations(), 5 * 60 * 1000);
    }
  }
  
  /**
   * Clean up expired correlation IDs to prevent memory leaks
   */
  private cleanupExpiredCorrelations(): void {
    const now = Date.now();
    const expiredIds = Object.keys(this.correlationExpiry).filter(
      id => this.correlationExpiry[id] < now
    );
    
    expiredIds.forEach(id => {
      delete this.correlationMap[id];
      delete this.correlationExpiry[id];
      delete this.traceContext[id];
    });
  }

  // Get singleton instance
  public static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService();
    }
    return ErrorService.instance;
  }
  
  /**
   * Reset the singleton instance (mainly for testing)
   */
  public static resetInstance(): void {
    if (ErrorService.instance) {
      ErrorService.instance.dispose();
      ErrorService.instance = new ErrorService();
    }
  }
  
  /**
   * Dispose of the service and clean up resources
   * Call this when the service is no longer needed, like when unmounting a component tree
   */
  public dispose(): void {
    // Clean up timer
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    
    // Clear all memory
    this.listeners = [];
    this.clearListeners = [];
    this.globalErrorListeners = [];
    this.recoveryListeners = [];
    this.correlationMap = {};
    this.correlationExpiry = {};
    this.traceContext = {};
    this.resetMetrics();
  }

  /**
   * Reports an error to the error tracking system
   * 
   * @param error The error object or message
   * @param source The source of the error (component, service, etc.)
   * @param type The type of error
   * @param severity The severity level
   * @param options Additional options
   * @returns The created error state object
   */
  public reportError(
    error: Error | string,
    source: string = 'unknown',
    type: ErrorType = 'unknown',
    severity: ErrorSeverity = 'error',
    options: {
      code?: string;
      details?: string;
      data?: any;
      errors?: FieldError[];
      retry?: () => void;
      correlationId?: string;
      category?: ErrorCategory;
      recoverable?: boolean;
      retryable?: boolean;
      userFacing?: boolean;
      suggestedAction?: string;
    } = {}
  ): ErrorState {
    // Determine the appropriate category based on error type if not provided
    const category = options.category || ERROR_TYPE_TO_CATEGORY[type];
    
    // Generate a correlation ID if not provided
    const correlationId = options.correlationId || uuidv4();
    
    // Create error state object
    const errorState: ErrorState = {
      active: true,
      message: typeof error === 'string' ? error : error.message || DEFAULT_ERROR_MESSAGES[type],
      type,
      severity,
      code: options.code,
      details: options.details || (error instanceof Error ? error.stack : undefined),
      timestamp: Date.now(),
      id: uuidv4(),
      source: source || '',
      data: options.data || {},
      errors: options.errors || [],
      handled: false,
      retry: options.retry,
      correlationId,
      category,
      recoverable: options.recoverable !== undefined ? options.recoverable : this.isRecoverableError(error, type),
      retryable: options.retryable !== undefined ? options.retryable : this.isRetryableError(error, type),
      userFacing: options.userFacing !== undefined ? options.userFacing : this.shouldShowToUser(error, type, severity),
      suggestedAction: options.suggestedAction
    };

    // Track correlation ID with expiration
    if (correlationId) {
      if (!this.correlationMap[correlationId]) {
        this.correlationMap[correlationId] = [];
        // Set expiry time for this correlation ID (30 minutes from now)
        this.correlationExpiry[correlationId] = Date.now() + ErrorService.CORRELATION_EXPIRY_MS;
      }
      this.correlationMap[correlationId].push(errorState.id);
      
      // Store additional context for this correlation if provided
      if (options.data && Object.keys(options.data).length > 0) {
        this.traceContext[correlationId] = {
          ...(this.traceContext[correlationId] || {}),
          lastUpdate: Date.now(),
          relatedData: options.data
        };
      }
    }

    // Update metrics
    this.updateMetrics(errorState);

    // Console logging in development
    if (process.env.NODE_ENV === 'development') {
      this.logErrorToConsole(errorState);
    }
    
    // Log the error to the console for all environments
    // This ensures that logger.error is called for string errors in tests
    const { logger } = require('@/lib/logger');
    if (typeof error === 'string') {
      logger.error(`[${source}] ${error}`);
    }

    // Notify listeners
    this.notifyListeners(errorState);

    // Auto-handle the error based on its type if possible
    this.autoHandleError(errorState);

    return errorState;
  }

  /**
   * Clears an error by ID
   * 
   * @param id The ID of the error to clear
   */
  public clearError(id: string): void {
    // Find the error in the recent errors list and mark it as inactive
    const errorIndex = this.metrics.recent.findIndex(e => e.id === id);
    if (errorIndex >= 0) {
      this.metrics.recent[errorIndex].active = false;
    }
    
    // Notify clear listeners
    this.clearListeners.forEach(listener => listener(id));
  }

  /**
   * Sets the active global error
   * 
   * @param error The error state to set as global, or null to clear
   */
  public setGlobalError(error: ErrorState | null): void {
    this.globalErrorListeners.forEach(listener => listener(error));
  }

  /**
   * Get error metrics for monitoring
   */
  public getMetrics(): ErrorMetrics {
    return { ...this.metrics };
  }

  /**
   * Add listener for new errors
   * 
   * @param listener The callback function to call when a new error occurs
   * @returns A function to remove the listener
   */
  public addErrorListener(listener: (error: ErrorState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Add listener for cleared errors
   * 
   * @param listener The callback function to call when an error is cleared
   * @returns A function to remove the listener
   */
  public addClearListener(listener: (id: string) => void): () => void {
    this.clearListeners.push(listener);
    return () => {
      this.clearListeners = this.clearListeners.filter(l => l !== listener);
    };
  }

  /**
   * Add listener for global error changes
   * 
   * @param listener The callback function to call when the global error changes
   * @returns A function to remove the listener
   */
  public addGlobalErrorListener(listener: (error: ErrorState | null) => void): () => void {
    this.globalErrorListeners.push(listener);
    return () => {
      this.globalErrorListeners = this.globalErrorListeners.filter(l => l !== listener);
    };
  }

  /**
   * Add listener for recovery attempts
   * 
   * @param listener The callback function to call when a recovery is attempted
   * @returns A function to remove the listener
   */
  public addRecoveryListener(listener: (error: ErrorState, success: boolean) => void): () => void {
    this.recoveryListeners.push(listener);
    return () => {
      this.recoveryListeners = this.recoveryListeners.filter(l => l !== listener);
    };
  }

  /**
   * Reset all error metrics
   */
  public resetMetrics(): void {
    this.metrics = {
      total: 0,
      byType: {
        validation: 0,
        api: 0,
        auth: 0,
        network: 0,
        permission: 0,
        unexpected: 0,
        business: 0,
        timeout: 0,
        external: 0,
        unknown: 0
      },
      bySeverity: {
        info: 0,
        warning: 0,
        error: 0,
        critical: 0,
        success: 0
      },
      byCategory: {
        [ErrorCategory.USER_INPUT]: 0,
        [ErrorCategory.AUTHORIZATION]: 0,
        [ErrorCategory.RESOURCE]: 0,
        [ErrorCategory.OPERATIONAL]: 0,
        [ErrorCategory.PROGRAMMER]: 0,
        [ErrorCategory.BUSINESS]: 0
      },
      recent: [],
      recoveryAttempts: 0,
      successfulRecoveries: 0
    };
    
    this.correlationMap = {};
  }

  /**
   * Get related errors by correlation ID
   * 
   * @param correlationId The correlation ID to look up
   * @returns Array of error IDs with the same correlation ID
   */
  public getRelatedErrors(correlationId: string): string[] {
    return this.correlationMap[correlationId] || [];
  }
  
  /**
   * Get trace context for a specific correlation ID
   * 
   * @param correlationId The correlation ID to get context for
   * @returns The trace context data or null if not found
   */
  public getTraceContext(correlationId: string): any {
    return this.traceContext[correlationId] || null;
  }
  
  /**
   * Set trace context for distributed tracing
   * 
   * @param correlationId The correlation ID to associate with this context
   * @param context The context data to store
   */
  public setTraceContext(correlationId: string, context: any): void {
    // Create correlation ID entry if it doesn't exist
    if (!this.correlationMap[correlationId]) {
      this.correlationMap[correlationId] = [];
      this.correlationExpiry[correlationId] = Date.now() + ErrorService.CORRELATION_EXPIRY_MS;
    }
    
    // Store or update the context
    this.traceContext[correlationId] = {
      ...context,
      lastUpdate: Date.now()
    };
  }
  
  /**
   * Get all active correlation IDs that haven't expired
   * 
   * @returns Array of active correlation IDs
   */
  public getActiveCorrelationIds(): string[] {
    const now = Date.now();
    return Object.keys(this.correlationExpiry).filter(
      id => this.correlationExpiry[id] > now
    );
  }
  
  /**
   * Manually clean up correlation IDs by IDs
   * Useful when you know certain operations have completed
   * 
   * @param correlationIds Array of correlation IDs to clean up
   */
  public cleanupCorrelationIds(correlationIds: string[]): void {
    correlationIds.forEach(id => {
      delete this.correlationMap[id];
      delete this.correlationExpiry[id];
      delete this.traceContext[id];
    });
  }

  /**
   * Executes a function with automatic retries on failure
   * 
   * @param fn The function to execute
   * @param options Retry options
   * @returns Promise resolving to the function result
   */
  public async withRetry<T>(
    fn: () => Promise<T>, 
    options: Partial<RetryOptions> = {}
  ): Promise<T> {
    // Ensure we have default values for shouldRetry and onRetry
    const config = { 
      ...DEFAULT_RETRY_OPTIONS, 
      ...options,
      shouldRetry: options.shouldRetry || DEFAULT_RETRY_OPTIONS.shouldRetry,
      onRetry: options.onRetry || DEFAULT_RETRY_OPTIONS.onRetry
    };
    
    let lastError: any;
    let delay = config.initialDelay;

    for (let attempt = 1; attempt <= config.retries + 1; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        // Track recovery attempt
        this.metrics.recoveryAttempts++;
        
        // Last attempt failed
        if (attempt > config.retries) {
          throw error;
        }
        
        // Check if we should retry - we know shouldRetry is defined now
        if (!config.shouldRetry!(error, attempt)) {
          throw error;
        }
        
        // Notify retry callback - we know onRetry is defined now
        if (config.onRetry) {
          config.onRetry(error, attempt);
        }
        
        // Add jitter to prevent thundering herd problem (±10%)
        const jitter = delay * (0.9 + Math.random() * 0.2);
        
        // Wait before next attempt
        await new Promise(resolve => setTimeout(resolve, jitter));
        
        // Increase delay for next attempt (with max cap)
        delay = Math.min(delay * (config.backoffFactor || 1), config.maxDelay || Infinity);
      }
    }

    // Should never reach here, but TypeScript requires a return
    throw lastError;
  }

  /**
   * Creates a specialized error handler for API errors
   * 
   * @param source The source of the error
   * @param options Additional options
   * @returns A function to handle API errors
   */
  public createApiErrorHandler(
    source: string, 
    options: {
      retryable?: boolean;
      userFacing?: boolean;
      severity?: ErrorSeverity;
      correlationProvider?: () => string;
      includeRequestInfo?: boolean;
    } = {}
  ): (error: any, endpoint?: string, requestInfo?: any) => ErrorState {
    return (error: any, endpoint?: string, requestInfo?: any) => {
      const details = endpoint ? `Endpoint: ${endpoint}` : undefined;
      const statusCode = error.status || error.statusCode;
      
      // Get correlation ID from provider or generate a new one
      const correlationId = options.correlationProvider ? options.correlationProvider() : undefined;
      
      // Determine error category based on status code
      let category;
      if (statusCode) {
        if (statusCode >= 400 && statusCode < 500) {
          if (statusCode === 401 || statusCode === 403) {
            category = ErrorCategory.AUTHORIZATION;
          } else if (statusCode === 404) {
            category = ErrorCategory.RESOURCE;
          } else {
            category = ErrorCategory.USER_INPUT;
          }
        } else if (statusCode >= 500) {
          category = ErrorCategory.OPERATIONAL;
        }
      }
      
      // Determine if error is retryable based on status code
      const isRetryable = options.retryable !== undefined 
        ? options.retryable 
        : (statusCode ? (statusCode >= 500 || statusCode === 429) : true);
      
      // Create data object with available request info if enabled
      const data: Record<string, any> = { 
        statusCode, 
        endpoint,
        ...(options.includeRequestInfo && requestInfo ? { requestInfo } : {})
      };
      
      // Determine appropriate severity based on status code
      let severity = options.severity;
      if (!severity && statusCode) {
        if (statusCode >= 500) {
          severity = 'error';
        } else if (statusCode === 429 || statusCode === 403) {
          severity = 'warning';
        } else if (statusCode === 404) {
          severity = 'info';
        }
      }
      
      return this.reportError(
        error,
        source,
        'api',
        severity || 'error',
        {
          details,
          data,
          correlationId,
          category,
          retryable: isRetryable,
          userFacing: options.userFacing !== undefined ? options.userFacing : true,
          suggestedAction: this.getSuggestedActionForStatusCode(statusCode)
        }
      );
    };
  }
  
  /**
   * Get suggested action based on HTTP status code
   * This helps guide users on what to do next when encountering API errors
   */
  private getSuggestedActionForStatusCode(statusCode?: number): string | undefined {
    if (!statusCode) return undefined;
    
    switch (statusCode) {
      case 401:
        return 'Please log in again to continue.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource could not be found.';
      case 429:
        return 'Please wait a moment before trying again.';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'Please try again later or contact support if the issue persists.';
      default:
        return undefined;
    }
  }

  /**
   * Creates a specialized error handler for form validation errors
   * 
   * @param source The source component
   * @returns A function to handle validation errors
   */
  public createValidationErrorHandler(source: string): (message: string, fields?: FieldError[]) => ErrorState {
    return (message: string, fields?: FieldError[]) => {
      return this.reportError(
        message,
        source,
        'validation',
        'warning',
        {
          errors: fields || [],
          userFacing: true,
          retryable: false,
          recoverable: true,
          category: ErrorCategory.USER_INPUT
        }
      );
    };
  }

  /**
   * Format an error message for display to users
   * 
   * @param error The error to format
   * @param defaultMessage Default message if none available
   * @returns User-friendly error message
   */
  public formatErrorForUser(error: unknown, defaultMessage = 'An unexpected error occurred'): string {
    if (!error) {
      return defaultMessage;
    }
    
    // If it's our error state object
    if (this.isErrorState(error)) {
      return error.message;
    }
    
    // If it's a regular Error
    if (error instanceof Error) {
      // In production, we might want to use generic messages
      if (process.env.NODE_ENV === 'production') {
        return defaultMessage;
      }
      return error.message || defaultMessage;
    }
    
    // If it's a string
    if (typeof error === 'string') {
      return error;
    }
    
    // If it has a message property
    if (typeof error === 'object' && error !== null && 'message' in error) {
      return String((error as any).message);
    }
    
    return defaultMessage;
  }

  /**
   * Attempt to automatically recover from an error
   * 
   * @param errorState The error state to recover from
   * @returns Promise resolving to true if recovery was successful
   */
  public async attemptRecovery(errorState: ErrorState): Promise<boolean> {
    if (!errorState.recoverable) {
      return false;
    }

    this.metrics.recoveryAttempts++;
    
    try {
      if (errorState.retry && typeof errorState.retry === 'function') {
        await errorState.retry();
        this.metrics.successfulRecoveries++;
        
        // Notify recovery listeners
        this.recoveryListeners.forEach(listener => listener(errorState, true));
        
        return true;
      }
      
      // For network errors, we can try to refresh the resource
      if (errorState.type === 'network' && typeof window !== 'undefined') {
        // Refreshing data automatically
        const success = await this.attemptNetworkRecovery(errorState);
        
        if (success) {
          this.metrics.successfulRecoveries++;
          
          // Notify recovery listeners
          this.recoveryListeners.forEach(listener => listener(errorState, true));
          
          return true;
        }
      }
      
      return false;
    } catch (recoveryError) {
      console.error('Error during recovery attempt:', recoveryError);
      
      // Notify recovery listeners
      this.recoveryListeners.forEach(listener => listener(errorState, false));
      
      return false;
    }
  }

  // Private methods

  private updateMetrics(error: ErrorState): void {
    this.metrics.total++;
    
    // Update byType metrics with a default if type is undefined
    const errorType = error.type || 'unknown';
    this.metrics.byType[errorType]++;
    
    // Update bySeverity metrics with a default if severity is undefined
    const errorSeverity = error.severity || 'error';
    this.metrics.bySeverity[errorSeverity]++;
    
    // Update byCategory metrics if category is defined
    if (error.category) {
      this.metrics.byCategory[error.category]++;
    } else {
      // Default to OPERATIONAL if category is undefined
      this.metrics.byCategory[ErrorCategory.OPERATIONAL]++;
    }
    
    // Add to recent errors, maintaining max size
    this.metrics.recent.unshift(error);
    if (this.metrics.recent.length > this.MAX_RECENT_ERRORS) {
      this.metrics.recent.pop();
    }
  }

  private logErrorToConsole(error: ErrorState): void {
    const timestamp = new Date(error.timestamp).toISOString();
    const severity = (error.severity || 'error').toUpperCase();
    const type = error.type || 'unknown';
    const source = error.source || 'unknown';
    const prefix = `[${severity}] [${type}] [${source}]`;
    
    console.group(`${prefix} ${timestamp} - ${error.message}`);
    console.log('Error ID:', error.id);
    console.log('Category:', error.category || 'OPERATIONAL');
    console.log('Correlation ID:', error.correlationId || 'none');
    
    if (error.code) {
      console.log('Code:', error.code);
    }
    
    if (error.details) {
      console.log('Details:', error.details);
    }
    
    if (error.errors && error.errors.length > 0) {
      console.log('Validation Errors:', error.errors);
    }
    
    if (error.data) {
      console.log('Additional Data:', error.data);
    }
    
    console.log('Recovery Info:', {
      recoverable: error.recoverable,
      retryable: error.retryable,
      userFacing: error.userFacing
    });
    
    console.groupEnd();
  }

  private notifyListeners(error: ErrorState): void {
    this.listeners.forEach(listener => listener(error));
  }

  /**
   * Check if an error is potentially recoverable
   */
  private isRecoverableError(error: unknown, type: ErrorType): boolean {
    // By default, most operational errors are recoverable
    if (
      type === 'api' ||
      type === 'network' ||
      type === 'timeout' ||
      type === 'external'
    ) {
      return true;
    }
    
    // Validation errors are recoverable (user can fix input)
    if (type === 'validation') {
      return true;
    }
    
    // Programmer errors usually aren't automatically recoverable
    if (type === 'unexpected') {
      return false;
    }
    
    return false;
  }

  /**
   * Check if an error can be automatically retried
   */
  private isRetryableError(error: unknown, type: ErrorType): boolean {
    // Network, timeout, and some API errors can be retried
    if (
      type === 'network' ||
      type === 'timeout' ||
      type === 'external'
    ) {
      return true;
    }
    
    // API errors can sometimes be retried depending on status code
    if (type === 'api') {
      const statusCode = error && typeof error === 'object' && 'status' in error
        ? (error as any).status
        : undefined;
      
      // 429 (too many requests), 408 (timeout), and 5xx are retryable
      if (statusCode) {
        return statusCode === 429 || statusCode === 408 || statusCode >= 500;
      }
      
      return true;
    }
    
    return false;
  }

  /**
   * Check if an error should be shown to the user
   */
  private shouldShowToUser(error: unknown, type: ErrorType, severity: ErrorSeverity): boolean {
    // Validation errors should always be shown
    if (type === 'validation') {
      return true;
    }
    
    // Critical and error level should be shown
    if (severity === 'critical' || severity === 'error') {
      return true;
    }
    
    // Network errors should be shown
    if (type === 'network') {
      return true;
    }
    
    // Auth and permission errors should be shown
    if (type === 'auth' || type === 'permission') {
      return true;
    }
    
    // Unexpected errors should be shown in dev but not in prod
    if (type === 'unexpected') {
      return process.env.NODE_ENV !== 'production';
    }
    
    return false;
  }

  /**
   * Auto-handle error based on type
   */
  private autoHandleError(error: ErrorState): void {
    // Automatically retry network errors if we can detect an online state change
    if (error.type === 'network' && typeof window !== 'undefined' && 'navigator' in window) {
      const onlineHandler = () => {
        // If we're back online, try to recover
        if (navigator.onLine) {
          this.attemptRecovery(error)
            .then(success => {
              if (success) {
                window.removeEventListener('online', onlineHandler);
              }
            })
            .catch(err => console.error('Error during auto-recovery:', err));
        }
      };
      
      window.addEventListener('online', onlineHandler);
      
      // Clean up after 5 minutes to avoid memory leaks
      setTimeout(() => {
        window.removeEventListener('online', onlineHandler);
      }, 5 * 60 * 1000);
    }
    
    // Handle timeout errors with automatic retry
    if (error.type === 'timeout' && error.retryable) {
      // For timeout errors, we implement exponential backoff
      const retryTimeout = setTimeout(() => {
        this.attemptRecovery(error)
          .catch(err => console.error('Error during timeout recovery:', err));
      }, 2000); // Wait 2 seconds before retry
      
      // Store timeout reference in error data for potential cleanup
      error.data = {
        ...error.data,
        retryTimeout
      };
    }
    
    // Handle API errors with retry mechanism if they're retryable
    if (error.type === 'api' && error.retryable) {
      // For API errors, we use the retry function if provided
      if (error.retry && typeof error.retry === 'function') {
        const retryTimeout = setTimeout(() => {
          this.attemptRecovery(error)
            .catch(err => console.error('Error during API retry:', err));
        }, 1000); // Wait 1 second before retry
        
        // Store timeout reference
        error.data = {
          ...error.data,
          retryTimeout
        };
      }
    }
    
    // Handle auth errors by potentially redirecting to login
    if (error.type === 'auth' && typeof window !== 'undefined') {
      // Check if this is an authentication error that should redirect
      if (error.category === ErrorCategory.AUTHORIZATION && 
          error.data && error.data.redirectToLogin === true) {
        // Wait a moment to allow error to be displayed first
        setTimeout(() => {
          // We don't use window.location.href directly to avoid hard dependencies
          // The app should register a handler for this event
          const authErrorEvent = new CustomEvent('auth:loginRequired', {
            detail: { 
              reason: error.message, 
              redirectAfter: 3000 // Redirect after 3 seconds
            }
          });
          window.dispatchEvent(authErrorEvent);
        }, 500);
      }
    }
    
    // Track errors for analytics in production
    if (process.env.NODE_ENV === 'production') {
      // This could be replaced with a real analytics service
      this.trackErrorForAnalytics(error);
    }
  }
  
  /**
   * Track error for analytics purposes
   * (Placeholder for integration with an actual analytics service)
   */
  private trackErrorForAnalytics(error: ErrorState): void {
    // In a real app, this would send to an analytics service
    // For now, we just log a message when not in test environment
    if (process.env.NODE_ENV !== 'test') {
      console.log(
        `[Analytics] Error tracked: ${error.type}:${error.severity} - ${error.message}`
      );
    }
  }

  /**
   * Attempt to recover from a network error
   */
  private async attemptNetworkRecovery(error: ErrorState): Promise<boolean> {
    // Check network connectivity
    if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
      if (!navigator.onLine) {
        // Can't recover if offline
        return false;
      }
    }
    
    // Attempt to re-fetch resource if URL is provided
    if (error.data && error.data.url) {
      try {
        const response = await fetch(error.data.url, {
          method: 'GET',
          cache: 'reload', // Force refresh
        });
        
        return response.ok;
      } catch (e) {
        return false;
      }
    }
    
    return false;
  }

  /**
   * Type guard to check if an object is an ErrorState
   */
  private isErrorState(obj: any): obj is ErrorState {
    return (
      obj && 
      typeof obj === 'object' && 
      'id' in obj && 
      'message' in obj && 
      'type' in obj && 
      'severity' in obj
    );
  }
}

// Export singleton instance
export const errorService = ErrorService.getInstance();