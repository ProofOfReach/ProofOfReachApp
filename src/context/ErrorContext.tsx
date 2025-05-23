/**
 * Error Context
 * 
 * This context provides global error state management for the application.
 * It connects to the errorIntegration service and makes the error state
 * available to components via React Context.
 */

import React, { createContext, useState, useEffect, useMemo, useCallback, useContext } from 'react';
import.*./types/errors';
import.*./lib/errorIntegration';
import.*./lib/errorService';
import.*./utils/toast';

// Create the context with a default value
export const ErrorContext = createContext<{
  state: ErrorContextState;
  addError: (error: ErrorState) => void;
  clearError: (id: string) => void;
  clearAllErrors: () => void;
  setGlobalError: (error: ErrorState | null) => void;
  setToastError: (error: ErrorState | null) => void;
} | null>(null);

// Props for the provider component
export interface ErrorProviderProps {
  children: React.ReactNode;
  initialState?: Partial<ErrorContextState>;
}

/**
 * Error Provider Component
 * 
 * Provides error state and functions to the component tree.
 */
export const ErrorProvider: React.FC<ErrorProviderProps> = ({
  children,
  initialState = {},
}) => {
  // Merge initial state with default state
  const mergedInitialState = { ...defaultErrorState, ...initialState };
  
  // State for errors, global error, and toast error
  const [errors, setErrors] = useState<ErrorState[]>(mergedInitialState.errors);
  const [globalError, setGlobalError] = useState<ErrorState | null>(mergedInitialState.globalError);
  const [toastError, setToastError] = useState<ErrorState | null>(mergedInitialState.toastError);
  
  // Effect to subscribe to errorIntegration updates
  useEffect(() => {
    // Update state when error state changes
    const updateErrorState = () => {
      const newState = errorIntegration.getErrorState();
      setErrors(newState.errors);
      setGlobalError(newState.globalError);
      setToastError(newState.toastError);
    };
    
    // Subscribe to error state changes
    const unsubscribe = errorIntegration.addErrorListener(updateErrorState);
    
    // Initialize state
    updateErrorState();
    
    // Clean up subscription
    return unsubscribe;
  }, []);
  
  // Functions to manipulate errors
  const addError = useCallback((error: ErrorState): void => {
    errorIntegration.addError(error);
  }, []);
  
  const clearError = useCallback((id: string): void => {
    errorIntegration.clearError(id);
  }, []);
  
  const clearAllErrors = useCallback((): void => {
    errorIntegration.clearAllErrors();
  }, []);
  
  const setGlobalErrorState = useCallback((error: ErrorState | null): void => {
    errorIntegration.setGlobalError(error);
  }, []);
  
  const setToastErrorState = useCallback((error: ErrorState | null): void => {
    if (error) {
      errorIntegration.addError(error);
    } else if (toastError) {
      errorIntegration.clearError(toastError.id);
    }
  }, [toastError]);
  
  // Create stable context value
  const value = useMemo(() => ({
    state: { errors, globalError, toastError },
    addError,
    clearError,
    clearAllErrors,
    setGlobalError: setGlobalErrorState,
    setToastError: setToastErrorState,
  }), [
    errors, 
    globalError, 
    toastError, 
    addError, 
    clearError, 
    clearAllErrors, 
    setGlobalErrorState, 
    setToastErrorState
  ]);
  
  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
};

/**
 * Hook to access the error context
 * 
 * Returns error state and methods to update it
 */
export const useError = () => {
  const context = useContext(ErrorContext);
  
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  
  // Simplify the state for component use
  return {
    errorState: {
      message: context.state.globalError?.message || '',
      type: context.state.globalError?.type || 'unknown',
      severity: context.state.globalError?.severity || 'error'
    },
    setError: context.setGlobalError,
    clearError: () => context.setGlobalError(null),
    errors: context.state.errors
  };
};

/**
 * Hook for simplified error reporting
 * 
 * Provides simplified error reporting functions
 */
export const useErrorReporting = () => {
  const context = useContext(ErrorContext);
  
  if (!context) {
    throw new Error('useErrorReporting must be used within an ErrorProvider');
  }
  
  const reportError = useCallback((error: Error | string, component?: string, errorType?: string) => {
    const errorMessage = error instanceof Error ? error.message : error;
    
    // Show error toast
    toast.logger.error(`Error: ${errorMessage}`);
    
    // Report error to service
    errorService.reportError(error, component, (errorType as anyType) || 'unknown');
  }, []);
  
  return { reportError };
};

/**
 * Hook for simplified toast-based error display
 * 
 * Provides simplified methods to show different types of toasts
 */
export const useErrorToast = () => {
  const showErrorToast = useCallback((message: string, severity: ErrorSeverity = 'error') => {
    switch (severity) {
      case 'info':
        toast.info(message);
        break;
      case 'warning':
        toast.warning(message);
        break;
      case 'error':
      case 'critical':
        toast.logger.error(message);
        break;
      case 'success':
        toast.success(message);
        break;
      default:
        toast.info(message);
    }
  }, []);
  
  return { showErrorToast };
};

export default ErrorProvider;