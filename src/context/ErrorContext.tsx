/**
 * Error Context
 * 
 * This context provides global error state management for the application.
 * It connects to the errorIntegration service and makes the error state
 * available to components via React Context.
 */

import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import { ErrorState, ErrorContextState, defaultErrorState } from '@/types/errors';
import { errorIntegration } from '@/lib/errorIntegration';

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

export default ErrorProvider;