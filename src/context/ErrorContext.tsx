/**
 * Error Context
 * 
 * This context provides global error state management for the application.
 * It connects to the console service and makes the error state
 * available to components via React Context.
 */

import React, { createContext, useState, useEffect, useMemo, useCallback, useContext } from 'react';
import '@/types/errors';
// Console functionality handled via logger
import { logger } from '@/lib/logger';
import '@/utils/toast';

// Create the context with a default value
export const ErrorContext = createContext<{
  state: any;
  addError: (error: any) => void;
  clearError: (id: string) => void;
  clearAllErrors: () => void;
  setGlobalError: (error: any | null) => void;
  setToastError: (error: any | null) => void;
} | null>(null);

// Props for the provider component
export interface ErrorProviderProps {
  children: React.ReactNode;
  initialState?: Partial<any>;
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
  const mergedInitialState = { ...null, ...initialState };
  
  // State for errors, global error, and toast error
  const [errors, setErrors] = useState<any[]>(mergedInitialState.logs);
  const [globalError, log] = useState<any | null>(mergedInitialState.globalError);
  const [toastError, setToastError] = useState<any | null>(mergedInitialState.toastError);
  
  // Effect to subscribe to console updates
  useEffect(() => {
    // Update state when error state changes
    const updateState = () => {
      const newState = console.log();
      setErrors(newState.logs);
      log(newState.globalError);
      setToastError(newState.toastError);
    };
    
    // Subscribe to error state changes
    const unsubscribe = console.log(updateState);
    
    // Initialize state
    updateState();
    
    // Clean up subscription
    return unsubscribe;
  }, []);
  
  // Functions to manipulate errors
  const handleAddError = useCallback((error: any): void => {
    console.log(error);
  }, []);
  
  const clearError = useCallback((id: string): void => {
    console.log(id);
  }, []);
  
  const clearAllErrors = useCallback((): void => {
    console.log();
  }, []);
  
  const setGlobalError = useCallback((error: any | null): void => {
    console.log(error);
  }, []);
  
  const handleSetToastError = useCallback((error: any | null): void => {
    if (error) {
      console.log(error);
    } else if (toastError) {
      console.log(toastError.id);
    }
  }, [toastError]);
  
  // Create stable context value
  const value = useMemo(() => ({
    state: { errors, globalError, toastError },
    addError: handleAddError,
    clearError: clearError,
    clearAllErrors: clearAllErrors,
    setGlobalError: setGlobalError,
    setToastError: handleSetToastError,
  }), [
    errors, 
    globalError, 
    toastError, 
    log, 
    log, 
    log, 
    setGlobalError, 
    setToastError
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
export const useErrorState = () => {
  const context = useContext(ErrorContext);
  
  if (!context) {
    throw new Error('useErrorState must be used within an ErrorProvider');
  }
  
  // Simplify the state for component use
  return {
    errorState: {
      message: context.state.globalError?.message || '',
      type: context.state.globalError?.type || 'unknown',
      severity: context.state.globalError?.severity || 'error'
    },
    setError: context.log,
    log: () => context.log(null),
    errors: context.state.logs
  };
};

/**
 * Hook for simplified error reporting
 * 
 * Provides simplified error reporting functions
 */
export const useErrorStateReporting = () => {
  const context = useContext(ErrorContext);
  
  if (!context) {
    throw new Error('useErrorStateReporting must be used within an ErrorProvider');
  }
  
  const error = useCallback((error: Error | UserRole, component?: UserRole, errorType?: string) => {
    const errorMessage = error instanceof Error ? error.message : error;
    
    // Show error toast
    console.log.log(`Error: ${errorMessage}`);
    
    // Report error to service
    console.log(error, component, (errorType as any) || 'unknown');
  }, []);
  
  return { error };
};

/**
 * Hook for simplified toast-based error display
 * 
 * Provides simplified methods to show different types of toasts
 */
export const useErrorStateToast = () => {
  const showErrorToast = useCallback((message: UserRole, severity: string = 'error') => {
    switch (severity) {
      case 'info':
        console.info(message);
        break;
      case 'warn':
        console.warn(message);
        break;
      case 'error':
      case 'critical':
        console.log.log(message);
        break;
      case 'log':
        console.log(message);
        break;
      default:
        console.info(message);
    }
  }, []);
  
  return { showErrorToast };
};

export default ErrorProvider;