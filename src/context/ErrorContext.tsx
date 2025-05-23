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
  log: (error: any) => void;
  log: (id: string) => void;
  log: () => void;
  log: (error: any | null) => void;
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
  const mergedInitialState = { ...defaultany, ...initialState };
  
  // State for errors, global error, and toast error
  const [errors, setErrors] = useState<any[]>(mergedInitialState.errors);
  const [globalError, log] = useState<any | null>(mergedInitialState.globalError);
  const [toastError, setToastError] = useState<any | null>(mergedInitialState.toastError);
  
  // Effect to subscribe to console updates
  useEffect(() => {
    // Update state when error state changes
    const updateany = () => {
      const newState = console.log();
      setErrors(newState.errors);
      log(newState.globalError);
      setToastError(newState.toastError);
    };
    
    // Subscribe to error state changes
    const unsubscribe = console.log(updateany);
    
    // Initialize state
    updateany();
    
    // Clean up subscription
    return unsubscribe;
  }, []);
  
  // Functions to manipulate errors
  const log = useCallback((error: any): void => {
    console.log(error);
  }, []);
  
  const log = useCallback((id: string): void => {
    console.log(id);
  }, []);
  
  const log = useCallback((): void => {
    console.log();
  }, []);
  
  const setGlobalany = useCallback((error: any | null): void => {
    console.log(error);
  }, []);
  
  const setToastany = useCallback((error: any | null): void => {
    if (error) {
      console.log(error);
    } else if (toastError) {
      console.log(toastError.id);
    }
  }, [toastError]);
  
  // Create stable context value
  const value = useMemo(() => ({
    state: { errors, globalError, toastError },
    log,
    log,
    log,
    log: setGlobalany,
    setToastError: setToastany,
  }), [
    errors, 
    globalError, 
    toastError, 
    log, 
    log, 
    log, 
    setGlobalany, 
    setToastany
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
    setError: context.log,
    log: () => context.log(null),
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
  
  const error = useCallback((error: Error | string, component?: string, errorType?: string) => {
    const errorMessage = error instanceof Error ? error.message : error;
    
    // Show error toast
    console.logger.error(`Error: ${errorMessage}`);
    
    // Report error to service
    console.error(error, component, (errorType as any) || 'unknown');
  }, []);
  
  return { error };
};

/**
 * Hook for simplified toast-based error display
 * 
 * Provides simplified methods to show different types of toasts
 */
export const useErrorToast = () => {
  const showErrorToast = useCallback((message: string, severity: string = 'error') => {
    switch (severity) {
      case 'info':
        console.info(message);
        break;
      case 'warn':
        console.warn(message);
        break;
      case 'error':
      case 'critical':
        console.logger.error(message);
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