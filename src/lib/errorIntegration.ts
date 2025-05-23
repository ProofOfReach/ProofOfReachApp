/**
 * Error Integration Service
 * 
 * This service provides a central integration point between the error service,
 * error context, and application error components. It serves as the glue that
 * connects these systems together.
 */

import { v4 as uuidv4 } from 'uuid';
import.*./types/errors';

// Custom event names
const ERROR_EVENTS = {
  ERROR_ADDED: 'erroradded',
  ERROR_REMOVED: 'errorremoved',
  GLOBAL_ERROR_SET: 'globalerrorset',
  GLOBAL_ERROR_CLEARED: 'globalerrorclear',
  ALL_ERRORS_CLEARED: 'allerrorsclear',
  ERROR_STATE_UPDATED: 'errorstateupdated'
};

// Store of all current errors
let currentErrors: ErrorState[] = [];
let globalError: ErrorState | null = null;
let toastError: ErrorState | null = null;
let errorListeners: Array<() => void> = [];
let lastErrorTime = 0;
let totalErrorCount = 0;
let initialized = false;

/**
 * Create an error object with default values
 */
export function createError(
  message: string,
  source: string = 'unknown',
  type: ErrorType = 'unknown',
  severity: ErrorSeverity = 'error'
): ErrorState {
  return {
    id: uuidv4(),
    message,
    source,
    type,
    severity,
    timestamp: Date.now(),
    active: true,
    handled: false
  };
}

/**
 * Report an error to the error system
 */
export function reportError(
  error: string | Error,
  source: string = 'unknown',
  type: ErrorType = 'unknown',
  severity: ErrorSeverity = 'error',
  options?: {
    details?: string;
    retry?: () => void;
    data?: Record<string, any>;
  }
): ErrorState {
  const message = error instanceof Error ? error.message : error;
  const errorState: ErrorState = {
    id: uuidv4(),
    message,
    source,
    type,
    severity,
    timestamp: Date.now(),
    active: true,
    handled: false,
    details: options?.details,
    retry: options?.retry,
    data: options?.data || {},
    stack: error instanceof Error ? error.stack : undefined
  };
  
  // Update metrics
  lastErrorTime = errorState.timestamp;
  totalErrorCount++;
  
  // Log error to console
  console.group(`[ERROR] [${type}] [${source}] ${new Date(errorState.timestamp).toISOString()} - ${message}`);
  if (errorState.details) {
    console.log('Details:', errorState.details);
  }
  if (errorState.stack) {
    console.log('Stack:', errorState.stack);
  }
  console.groupEnd();
  
  return errorState;
}

/**
 * Set global error
 */
export function setGlobalError(error: ErrorState | null): void {
  globalError = error;
  
  if (error) {
    // Dispatch custom event
    const event = new CustomEvent(ERROR_EVENTS.GLOBAL_ERROR_SET, { 
      detail: { error } 
    });
    document.dispatchEvent(event);
  } else {
    // Dispatch clear event
    const event = new CustomEvent(ERROR_EVENTS.GLOBAL_ERROR_CLEARED);
    document.dispatchEvent(event);
  }
  
  // Notify listeners
  notifyListeners();
}

/**
 * Get global error
 */
export function getGlobalError(): ErrorState | null {
  return globalError;
}

/**
 * Clear global error
 */
export function clearGlobalError(): void {
  setGlobalError(null);
}

/**
 * Add an error to the list of errors
 */
export function addError(error: ErrorState): void {
  currentErrors.push(error);
  
  // Set as toast error
  toastError = error;
  
  // Dispatch custom event
  const event = new CustomEvent(ERROR_EVENTS.ERROR_ADDED, { 
    detail: { error } 
  });
  document.dispatchEvent(event);
  
  // Notify listeners
  notifyListeners();
}

/**
 * Clear an error by ID
 */
export function clearError(id: string): void {
  const index = currentErrors.findIndex(e => e.id === id);
  
  if (index !== -1) {
    const error = currentErrors[index];
    currentErrors.splice(index, 1);
    
    // Clear toast error if it's the same one
    if (toastError && toastError.id === id) {
      toastError = null;
    }
    
    // Clear global error if it's the same one
    if (globalError && globalError.id === id) {
      globalError = null;
    }
    
    // Dispatch custom event
    const event = new CustomEvent(ERROR_EVENTS.ERROR_REMOVED, { 
      detail: { error } 
    });
    document.dispatchEvent(event);
    
    // Notify listeners
    notifyListeners();
  }
}

/**
 * Clear all errors
 */
export function clearAllErrors(): void {
  currentErrors = [];
  globalError = null;
  toastError = null;
  
  // Dispatch custom event
  const event = new CustomEvent(ERROR_EVENTS.ALL_ERRORS_CLEARED);
  document.dispatchEvent(event);
  
  // Notify listeners
  notifyListeners();
}

/**
 * Get all current errors
 */
export function getErrors(): ErrorState[] {
  return [...currentErrors];
}

/**
 * Get current error state
 */
export function getErrorState(): {
  errors: ErrorState[];
  globalError: ErrorState | null;
  toastError: ErrorState | null;
} {
  return {
    errors: [...currentErrors],
    globalError,
    toastError
  };
}

/**
 * Initialize error integration
 * This should be called early in the application lifecycle
 */
export function initializeErrorIntegration(): void {
  if (initialized) {
    return;
  }
  
  // Set up custom event listeners
  document.addEventListener(ERROR_EVENTS.ERROR_ADDED, () => {
    notifyListeners();
  });
  
  document.addEventListener(ERROR_EVENTS.ERROR_REMOVED, () => {
    notifyListeners();
  });
  
  document.addEventListener(ERROR_EVENTS.GLOBAL_ERROR_SET, () => {
    notifyListeners();
  });
  
  document.addEventListener(ERROR_EVENTS.GLOBAL_ERROR_CLEARED, () => {
    notifyListeners();
  });
  
  document.addEventListener(ERROR_EVENTS.ALL_ERRORS_CLEARED, () => {
    notifyListeners();
  });
  
  console.info('Error handling system initialized');
  initialized = true;
}

/**
 * Notify all listeners that error state has changed
 */
function notifyListeners(): void {
  errorListeners.forEach(listener => listener());
  
  // Also dispatch a general state update event
  const event = new CustomEvent(ERROR_EVENTS.ERROR_STATE_UPDATED, {
    detail: getErrorState()
  });
  document.dispatchEvent(event);
}

/**
 * Register a listener for error state changes
 * 
 * @param listener Function to call when error state changes
 * @returns Unsubscribe function
 */
export function addErrorListener(listener: () => void): () => void {
  errorListeners.push(listener);
  
  // Return unsubscribe function
  return () => {
    errorListeners = errorListeners.filter(l => l !== listener);
  };
}

/**
 * Track error recovery time
 * 
 * @param startTime The timestamp when the error originally occurred
 * @param userRecovered Whether the user took action to recover
 */
export function trackErrorRecovery(startTime: number, userRecovered: boolean = false): void {
  const recoveryTime = Date.now() - startTime;
  
  // Use (window as any).__errorMetrics if available for detailed tracking
  if (typeof window !== 'undefined' && (window as any).__errorMetrics && (window as any).__errorMetrics.trackRecovery) {
    (window as any).__errorMetrics.trackRecovery(recoveryTime, userRecovered);
  }
  
  // Log recovery for debugging
  console.log(`Error recovered in ${recoveryTime}ms, user recovered: ${userRecovered}`);
}

/**
 * Get error metrics
 */
export function getErrorMetrics() {
  // Use (window as any).__errorMetrics if available
  if (typeof window !== 'undefined' && (window as any).__errorMetrics && (window as any).__errorMetrics.getMetrics) {
    return (window as any).__errorMetrics.getMetrics();
  }
  
  // Default metrics
  return {
    totalErrors: totalErrorCount,
    recoveredErrors: 0,
    criticalErrors: 0,
    averageRecoveryTime: 0,
    errorFrequency: 0,
    userImpactedCount: 0,
    userRecoveryRate: 0
  };
}

/**
 * Create and report network error
 */
export function reportNetworkError(
  error: string | Error,
  details?: string,
  retry?: () => void
): ErrorState {
  return reportError(
    error,
    'network',
    'network',
    'error',
    { details, retry }
  );
}

/**
 * Create and report API error
 */
export function reportApiError(
  error: string | Error,
  endpoint?: string,
  statusCode?: number,
  retry?: () => void
): ErrorState {
  return reportError(
    error,
    'api',
    'api',
    'error',
    { 
      details: endpoint ? `Endpoint: ${endpoint}` : undefined,
      data: { statusCode },
      retry
    }
  );
}

/**
 * Create and report validation error
 */
export function reportValidationError(
  error: string | Error,
  field?: string
): ErrorState {
  return reportError(
    error,
    'validation',
    'validation',
    'warning',
    { 
      details: field ? `Field: ${field}` : undefined
    }
  );
}

/**
 * Create and report authorization error
 */
export function reportAuthError(
  error: string | Error,
  details?: string
): ErrorState {
  return reportError(
    error,
    'auth',
    'auth',
    'error',
    { details }
  );
}

// Create an alias for initializeErrorIntegration to support the tests
// This function is exported separately to match what the tests expect
export function initializeErrorHandling(): void {
  return initializeErrorIntegration();
}

/**
 * Reset the error state
 * Used mainly for testing purposes
 */
export function resetErrorState(): void {
  currentErrors = [];
  globalError = null;
  toastError = null;
  lastErrorTime = 0;
  totalErrorCount = 0;
  initialized = false;
  
  // Dispatch clear event
  if (typeof document !== 'undefined') {
    const event = new CustomEvent(ERROR_EVENTS.ALL_ERRORS_CLEARED);
    document.dispatchEvent(event);
  }
  
  // Notify listeners
  notifyListeners();
}

// Export all functions as a single object for convenience
export const errorIntegration = {
  createError,
  reportError,
  setGlobalError,
  getGlobalError,
  clearGlobalError,
  addError,
  clearError,
  clearAllErrors,
  getErrors,
  getErrorState,
  initializeErrorIntegration,
  addErrorListener,
  getErrorMetrics,
  reportNetworkError,
  reportApiError,
  reportValidationError,
  reportAuthError,
  resetErrorState
};