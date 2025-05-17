/**
 * useErrorState Hook
 * 
 * This hook provides a simplified interface for accessing and manipulating
 * global error state in components. It wraps the errorContext in a
 * React-friendly way.
 */

import { useContext, useCallback, useEffect, useState } from 'react';
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
  const [errorState, setLocalErrorState] = useState(() => errorIntegration.getErrorState());
  
  if (!errorContext) {
    throw new Error('useErrorState must be used within an ErrorContext.Provider');
  }
  
  // Listen for error state changes
  useEffect(() => {
    const handleErrorStateChange = () => {
      setLocalErrorState(errorIntegration.getErrorState());
    };
    
    // Add event listener for error state changes
    window.addEventListener('error-state-changed', handleErrorStateChange);
    
    // Poll for changes as a backup mechanism
    const intervalId = setInterval(handleErrorStateChange, 1000);
    
    return () => {
      window.removeEventListener('error-state-changed', handleErrorStateChange);
      clearInterval(intervalId);
    };
  }, []);
  
  /**
   * Set error state
   */
  const setError = useCallback((error: any): void => {
    errorIntegration.updateErrorState(error);
  }, []);
  
  /**
   * Clear error state
   */
  const clearError = useCallback((): void => {
    errorIntegration.resetErrorTracking();
  }, []);
  
  /**
   * Handle an error
   */
  const handleError = useCallback((
    error: Error | string,
    component?: string,
    errorType?: string,
    severity: ErrorSeverity = 'error'
  ): void => {
    errorIntegration.reportError(error, component, errorType, severity);
  }, []);
  
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
    ...errorState,
    hasError: errorState.hasError || false,
    message: errorState.message || '',
    type: errorState.type || 'unknown',
    severity: errorState.severity || 'info',
    
    // Error management functions from tests
    setError,
    clearError,
    handleError,
    
    // Additional error functions for the app
    reportError,
    showToast,
    setGlobalError,
    dismissError,
    dismissAllErrors,
    getErrorMetrics,
    
    // Current error state from context
    errors: errorContext.state.errors,
    globalError: errorContext.state.globalError,
    toastError: errorContext.state.toastError,
    hasErrors: errorContext.state.errors.length > 0,
  };
}