/**
 * useErrorState Hook
 * 
 * This hook provides a simplified interface for accessing and manipulating
 * global error state in components. It wraps the errorContext in a
 * React-friendly way.
 */

import { useContext, useCallback } from 'react';
import { ErrorContext } from '@/context/ErrorContext';
import { errorIntegration } from '@/lib/errorIntegration';
import { ErrorSeverity, ErrorState, ErrorType } from '@/types/errors';

/**
 * Hook for accessing error state
 * 
 * @returns Object with error state and functions for managing errors
 */
export function useErrorState() {
  const errorContext = useContext(ErrorContext);
  
  if (!errorContext) {
    throw new Error('useErrorState must be used within an ErrorContext.Provider');
  }
  
  /**
   * Report a new error
   */
  const reportError = useCallback((
    error: string | Error, 
    source?: string, 
    type: ErrorType = 'unknown', 
    severity: ErrorSeverity = 'error',
    options?: {
      details?: string;
      retry?: () => void;
      data?: Record<string, any>;
    }
  ): ErrorState => {
    return errorIntegration.reportError(error, source, type, severity, options);
  }, []);
  
  /**
   * Set a global error from an existing error state
   */
  const setError = useCallback((error: ErrorState): void => {
    errorIntegration.setGlobalError(error);
  }, []);
  
  /**
   * Show an error in a toast notification
   */
  const showToast = useCallback((error: ErrorState): void => {
    errorIntegration.addError(error);
  }, []);
  
  /**
   * Create and set global error in one operation
   */
  const setGlobalError = useCallback((
    error: string | Error, 
    source?: string, 
    type: ErrorType = 'unknown', 
    severity: ErrorSeverity = 'error',
    options?: {
      details?: string;
      retry?: () => void;
      data?: Record<string, any>;
    }
  ): ErrorState => {
    const errorState = errorIntegration.reportError(error, source, type, severity, options);
    errorIntegration.setGlobalError(errorState);
    return errorState;
  }, []);
  
  /**
   * Clear a specific error by ID
   */
  const dismissError = useCallback((id: string): void => {
    errorIntegration.clearError(id);
  }, []);
  
  /**
   * Clear all errors
   */
  const dismissAllErrors = useCallback((): void => {
    errorIntegration.clearAllErrors();
  }, []);
  
  /**
   * Get error metrics for monitoring
   */
  const getErrorMetrics = useCallback(() => {
    return errorIntegration.getErrorMetrics();
  }, []);
  
  return {
    // Current error state
    errors: errorContext.state.errors,
    globalError: errorContext.state.globalError,
    toastError: errorContext.state.toastError,
    hasErrors: errorContext.state.errors.length > 0,
    
    // Error management functions
    reportError,
    setError,
    showToast,
    setGlobalError,
    dismissError,
    dismissAllErrors,
    getErrorMetrics
  };
}