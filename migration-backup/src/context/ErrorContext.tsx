import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';

interface ErrorProviderProps {
  children: ReactNode;
  initialState?: any;
}

interface ErrorContextType {
  state: any;
  addError: (error: any) => void;
  clearError: (id: string) => void;
  clearAllErrors: () => void;
  setGlobalError: (error: any) => void;
  setToastError: (error: any) => void;
}

// Create context with default value
const ErrorContext = createContext<ErrorContextType>({
  state: { errors: [], globalError: null, toastError: null },
  addError: () => {},
  clearError: () => {},
  clearAllErrors: () => {},
  setGlobalError: () => {},
  setToastError: () => {},
});

/**
 * Error Provider Component
 * 
 * Provides error state and functions to the component tree.
 */
export const ErrorProvider: React.FC<ErrorProviderProps> = ({
  children,
  initialState = {},
}) => {
  // State for errors, global error, and toast error
  const [errors, setErrors] = useState<any[]>([]);
  const [globalError, setGlobalError] = useState<any | null>(null);
  const [toastError, setToastError] = useState<any | null>(null);

  // Functions to manipulate errors
  const handleAddError = useCallback((error: any): void => {
    setErrors(prev => [...prev, error]);
  }, []);

  const clearError = useCallback((id: string): void => {
    setErrors(prev => prev.filter(error => error.id !== id));
  }, []);

  const clearAllErrors = useCallback((): void => {
    setErrors([]);
  }, []);

  const handleSetGlobalError = useCallback((error: any | null): void => {
    setGlobalError(error);
  }, []);

  const handleSetToastError = useCallback((error: any | null): void => {
    setToastError(error);
  }, []);

  // Memoized context value
  const value = useMemo(() => ({
    state: {
      errors,
      globalError,
      toastError,
    },
    addError: handleAddError,
    clearError,
    clearAllErrors,
    setGlobalError: handleSetGlobalError,
    setToastError: handleSetToastError,
  }), [
    errors,
    globalError,
    toastError,
    handleAddError,
    clearError,
    clearAllErrors,
    handleSetGlobalError,
    handleSetToastError,
  ]);

  return (
    <ErrorContext.Provider value={value}>
      {children}
    </ErrorContext.Provider>
  );
};

/**
 * Hook to access the error context
 */
export const useErrorContext = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useErrorContext must be used within an ErrorProvider');
  }
  return context;
};

export default ErrorContext;