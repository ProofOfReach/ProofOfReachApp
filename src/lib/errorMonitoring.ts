/**
 * Error Monitoring Service for Nostr Ad Marketplace
 * 
 * This module provides centralized error tracking and monitoring functionality.
 * It captures uncaught errors, logs them appropriately, and prepares them for
 * reporting to monitoring services in production environments.
 * Part of the Phase 1 error handling infrastructure implementation.
 */

import "./lib/errorService';
import { logger } from './logger';

/**
 * Error metrics tracking
 */
interface ErrorMetrics {
  [errorCode: string]: {
    count: number;
    firstSeen: number;
    lastSeen: number;
    examples: Array<{
      message: string;
      component?: string;
      timestamp: number;
    }>;
    components: {
      [component: string]: number;
    };
  };
}

/**
 * Configuration for the error monitoring service
 */
interface ErrorMonitoringConfig {
  enabled: boolean;
  captureGlobalErrors: boolean;
  reportToBackend: boolean;
  maxExamplesPerError: number;
  logToConsole: boolean;
  samplingRate: number; // between 0 and 1
}

/**
 * Error Monitoring Service
 */
class ErrorMonitoringService {
  private static instance: ErrorMonitoringService;
  private config: ErrorMonitoringConfig;
  private metrics: ErrorMetrics = {};
  private isInitialized = false;
  private errorCount = 0;
  
  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    this.config = {
      enabled: process.env.NODE_ENV !== 'test',
      captureGlobalErrors: true,
      reportToBackend: process.env.NODE_ENV === 'production',
      maxExamplesPerError: 5,
      logToConsole: process.env.NODE_ENV !== 'production',
      samplingRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0 // Sample 10% in production
    };
  }
  
  /**
   * Get singleton instance
   */
  public static getInstance(): ErrorMonitoringService {
    if (!ErrorMonitoringService.instance) {
      ErrorMonitoringService.instance = new ErrorMonitoringService();
    }
    return ErrorMonitoringService.instance;
  }
  
  /**
   * Initialize error monitoring
   * @param config Optional configuration to override defaults
   */
  public initialize(
    config: Partial<ErrorMonitoringConfig> = {}
  ): void {
    if (this.isInitialized) {
      return;
    }
    
    // Apply custom config
    this.config = {
      ...this.config,
      ...config
    };
    
    // Set up global error handlers if enabled
    if (this.config.captureGlobalErrors && typeof window !== 'undefined') {
      // Capture uncaught exceptions
      window.addEventListener('error', (event) => {
        this.captureError(event.error || new Error(event.message), {
          component: 'window.onerror',
          category: ErrorCategory.EXTERNAL,
          severity: ErrorSeverity.ERROR
        });
        
        // Don't prevent default handling
        return false;
      });
      
      // Capture unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.captureError(event.reason || new Error('Unhandled Promise rejection'), {
          component: 'unhandledrejection',
          category: ErrorCategory.EXTERNAL,
          severity: ErrorSeverity.ERROR
        });
        
        // Don't prevent default handling
        return false;
      });
      
      // Make the metrics available for debugging
      (window as any).__errorMetrics = {
        getMetrics: () => this.metrics,
        trackError: (code: string, data: any) => this.trackErrorMetrics(code, data),
        clearMetrics: () => this.clearMetrics()
      };
    }
    
    // Mark as initialized
    this.isInitialized = true;
    logger.info('Error monitoring initialized');
  }
  
  /**
   * Capture and process an error
   * @param error The error to capture
   * @param context Additional context for the error
   */
  public captureError(
    error: unknown,
    context: {
      component?: string;
      category?: ErrorCategory;
      severity?: ErrorSeverity;
      data?: Record<string, unknown>;
    } = {}
  ): void {
    if (!this.config.enabled) {
      return;
    }
    
    // Apply sampling rate - only process a percentage of errors in high-volume environments
    if (Math.random() > this.config.samplingRate) {
      return;
    }
    
    // Track total error count
    this.errorCount++;
    
    try {
      // Process the error using our central error service
      errorService.handleError(error, {
        component: context.component || 'errorMonitoring',
        category: context.category || ErrorCategory.EXTERNAL,
        severity: context.severity || ErrorSeverity.ERROR,
        data: context.data
      });
      
      // Extract error code for metrics tracking
      const errorCode = this.getErrorCode(error);
      const component = context.component || 'unknown';
      const message = error instanceof Error ? error.message : String(error);
      
      // Track metrics for this error type
      this.trackErrorMetrics(errorCode, { component, message });
      
      // Log to console in development
      if (this.config.logToConsole) {
        console.group('Error captured by ErrorMonitoringService');
        console.logger.error(error);
        console.info('Context:', {
          component,
          category: context.category,
          severity: context.severity,
          data: context.data
        });
        console.groupEnd();
      }
      
      // Report to backend in production
      if (this.config.reportToBackend && typeof window !== 'undefined') {
        this.reportToBackend(error, context);
      }
    } catch (err) {
      // Avoid infinite loops if our error handling itself has errors
      if (this.config.logToConsole) {
        console.logger.error('Error in ErrorMonitoringService:', err);
      }
    }
  }
  
  /**
   * Get the cumulative error metrics
   */
  public getMetrics(): ErrorMetrics {
    return this.metrics;
  }
  
  /**
   * Get the total number of errors captured
   */
  public getErrorCount(): number {
    return this.errorCount;
  }
  
  /**
   * Clear all error metrics
   */
  public clearMetrics(): void {
    this.metrics = {};
    this.errorCount = 0;
  }
  
  /**
   * Track metrics for an error
   * @param errorCode A code identifying the error type
   * @param data Additional data about the error
   */
  private trackErrorMetrics(
    errorCode: string,
    data: {
      component?: string;
      message?: string;
      severity?: ErrorSeverity;
    }
  ): void {
    const code = errorCode || 'unknown';
    const component = data.component || 'unknown';
    const message = data.message || 'Unknown error';
    const now = Date.now();
    
    // Initialize metrics for this error code if needed
    if (!this.metrics[code]) {
      this.metrics[code] = {
        count: 0,
        firstSeen: now,
        lastSeen: now,
        examples: [],
        components: {}
      };
    }
    
    const metrics = this.metrics[code];
    
    // Update basic metrics
    metrics.count++;
    metrics.lastSeen = now;
    
    // Track component frequency
    metrics.components[component] = (metrics.components[component] || 0) + 1;
    
    // Store example (up to max)
    if (metrics.examples.length < this.config.maxExamplesPerError) {
      metrics.examples.push({
        message,
        component,
        timestamp: now
      });
    }
  }
  
  /**
   * Extract an error code from an error for grouping similar errors
   * @param error The error to process
   * @returns A code identifying the error type
   */
  private getErrorCode(error: unknown): string {
    if (!error) {
      return 'null_error';
    }
    
    // Use explicit error code if available
    if (typeof error === 'object' && error !== null && 'code' in error && 
        typeof (error as any).code === 'string') {
      return (error as any).code;
    }
    
    if (error instanceof Error) {
      // Use specific error name if available
      if (error.name && error.name !== 'Error') {
        return `${error.name}`;
      }
      
      // For generic errors, use a normalized version of the message
      // to group similar errors without creating too many buckets
      return `Error:${this.normalizeErrorMessage(error.message)}`;
    }
    
    // Default categorization by type
    return `type:${typeof error}`;
  }
  
  /**
   * Normalize an error message to group similar errors
   * @param message The error message to normalize
   * @returns A normalized version for grouping
   */
  private normalizeErrorMessage(message: string): string {
    // Truncate to first 40 chars for grouping
    const truncated = message.substring(0, 40);
    
    // Normalize common patterns
    return truncated
      // Remove specific IDs, numbers
      .replace(/\b[0-9a-f]{24}\b/g, '<id>') // MongoDB IDs
      .replace(/\b[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}\b/ig, '<uuid>') // UUIDs
      .replace(/\b\d+\b/g, '<num>')
      .replace(/(['"]).*?\1/g, '<str>') // String literals
      .trim();
  }
  
  /**
   * Report an error to the backend monitoring service
   * To be implemented based on chosen error monitoring service
   */
  private reportToBackend(
    error: unknown,
    context: {
      component?: string;
      category?: ErrorCategory;
      severity?: ErrorSeverity;
      data?: Record<string, unknown>;
    }
  ): void {
    // In a production app, this would send to a service like Sentry, LogRocket, etc.
    // For the MVP, we'll just implement the client-side infrastructure
    
    // Example implementation with fetch:
    /*
    try {
      fetch('/api/monitoring/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          component: context.component,
          category: context.category,
          severity: context.severity,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent,
        }),
      }).catch(() => {
        // Silently fail if reporting fails
      });
    } catch (e) {
      // Prevent any errors in reporting from causing issues
    }
    */
  }
}

// Export singleton instance
export const errorMonitoring = ErrorMonitoringService.getInstance();

// Initialize on import in browser environments
if (typeof window !== 'undefined') {
  // Delay initialization to ensure it doesn't block page load
  setTimeout(() => {
    errorMonitoring.initialize();
  }, 0);
}