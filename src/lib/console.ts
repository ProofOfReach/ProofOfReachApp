/**
 * Console Error Service
 * 
 * A centralized service for handling and reporting errors throughout the application.
 * This service provides unified error handling, logging, and user-friendly error reporting.
 */

import { ErrorType } from '@/types/errors';

export interface FieldError {
  field: string;
  message: string;
}

export interface ErrorState {
  id: string;
  source: string;
  type: ErrorType;
  category: string;
  severity?: string;
  userFacing?: boolean;
  logs?: any[];
}

export interface RetryOptions {
  maxRetries: number;
  baseBackoffMs: number;
}

/**
 * Console service for error handling and logging
 */
class ConsoleService {
  private errorListeners: Array<(error: ErrorState) => void> = [];
  private clearListeners: Array<(errorId: string) => void> = [];
  private traceContexts: Map<string, any> = new Map();

  /**
   * Create an API error handler
   */
  createApiErrorHandler(source: string, options?: { severity?: string; userFacing?: boolean }) {
    return (error: Error): ErrorState => {
      return {
        id: Math.random().toString(36).substr(2, 9),
        source,
        type: 'api' as ErrorType,
        category: 'EXTERNAL',
        severity: options?.severity || 'error',
        userFacing: options?.userFacing !== false,
        logs: [error]
      };
    };
  }

  /**
   * Create a validation error handler
   */
  createValidationErrorHandler(source: string) {
    return (fields: FieldError[]): ErrorState => {
      return {
        id: Math.random().toString(36).substr(2, 9),
        source,
        type: 'validation' as ErrorType,
        category: 'USER_INPUT',
        logs: fields
      };
    };
  }

  /**
   * Format error for user display
   */
  formatErrorForUser(error: any, defaultMessage?: string): string {
    if (!error) {
      return defaultMessage || 'An error occurred';
    }

    if (typeof error === 'string') {
      return error;
    }

    if (error.message) {
      return error.message;
    }

    return defaultMessage || 'An unexpected error occurred';
  }

  /**
   * Retry failed operations
   */
  async withRetry<T>(fn: () => T | Promise<T>, options: RetryOptions): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt < options.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (attempt < options.maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, options.baseBackoffMs * (attempt + 1)));
        }
      }
    }
    
    throw lastError!;
  }

  /**
   * Log an error
   */
  log(error: Error | ErrorState, source?: string): ErrorState {
    let errorState: ErrorState;
    
    if ('id' in error && error.id) {
      errorState = error;
    } else {
      errorState = {
        id: Math.random().toString(36).substr(2, 9),
        source: source || 'Unknown',
        type: 'runtime' as ErrorType,
        category: 'INTERNAL',
        logs: [error]
      };
    }

    // Notify listeners
    this.errorListeners.forEach(listener => listener(errorState));
    
    return errorState;
  }

  /**
   * Clear an error by ID
   */
  clear(errorId: string): void {
    this.clearListeners.forEach(listener => listener(errorId));
  }

  /**
   * Add error listener
   */
  addErrorListener(listener: (error: ErrorState) => void): () => void {
    this.errorListeners.push(listener);
    return () => {
      const index = this.errorListeners.indexOf(listener);
      if (index > -1) {
        this.errorListeners.splice(index, 1);
      }
    };
  }

  /**
   * Add clear listener
   */
  addClearListener(listener: (errorId: string) => void): void {
    this.clearListeners.push(listener);
  }

  /**
   * Get trace context
   */
  getTraceContext(correlationId: string): any {
    return this.traceContexts.get(correlationId) || null;
  }

  /**
   * Set trace context
   */
  setTraceContext(correlationId: string, context: any): void {
    this.traceContexts.set(correlationId, context);
  }

  /**
   * Cleanup trace contexts
   */
  cleanupTraceContexts(maxAge: number = 5 * 60 * 1000): void {
    // For simplicity, if maxAge is 0, clear all
    if (maxAge === 0) {
      this.traceContexts.clear();
    }
    // In a real implementation, we'd check timestamps
  }

  /**
   * Static error checking methods
   */
  static isRecoverable(error: any): boolean {
    return true; // Simplified implementation
  }
}

// Export singleton instance
export const console = new ConsoleService();

// Export the class for testing
export { ConsoleService };