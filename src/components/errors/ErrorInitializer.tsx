/**
 * Error Initializer Component
 * 
 * This component initializes global error handlers for the application.
 * It sets up event listeners for uncaught exceptions and unhandled promise rejections,
 * and reports them to the error tracking system.
 * 
 * It should be included near the top of the component tree, typically in _app.tsx.
 */

import { useEffect } from 'react';
import { useErrorState } from '@/hooks/useErrorState';

interface ErrorInitializerProps {
  disableWindowEvents?: boolean;
  debug?: boolean;
}

/**
 * Component that initializes global error handling
 */
const ErrorInitializer: React.FC<ErrorInitializerProps> = ({
  disableWindowEvents = false,
  debug = false,
}) => {
  const errorState = useErrorState();
  
  // Set up global error listeners
  useEffect(() => {
    if (typeof window === 'undefined' || disableWindowEvents) {
      // Skip setup in SSR context or when explicitly disabled
      return;
    }
    
    if (debug) {
      console.log('[ErrorInitializer] Setting up global error handlers');
    }
    
    // Handler for uncaught exceptions
    const handleGlobalError = (event: ErrorEvent): void => {
      event.preventDefault();
      
      errorState.reportError(
        event.error || new Error(event.message),
        'window.onerror',
        'unknown', // Use an available ErrorType from our types
        'error',
        {
          details: `Error at ${event.filename}:${event.lineno}:${event.colno}`,
          data: { handled: false }
        }
      );
      
      if (debug) {
        console.error('[ErrorInitializer] Uncaught error:', event);
      }
    };
    
    // Handler for unhandled promise rejections
    const handlePromiseRejection = (event: PromiseRejectionEvent): void => {
      event.preventDefault();
      
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason));
      
      errorState.reportError(
        error,
        'unhandledrejection',
        'unknown', // Use an available ErrorType from our types
        'error',
        { 
          details: 'Unhandled promise rejection',
          data: { handled: false }
        }
      );
      
      if (debug) {
        console.error('[ErrorInitializer] Unhandled promise rejection:', event.reason);
      }
    };
    
    // Set up event listeners
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handlePromiseRejection);
    
    // Clean up event listeners
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handlePromiseRejection);
      
      if (debug) {
        console.log('[ErrorInitializer] Cleaned up global error handlers');
      }
    };
  }, [errorState, disableWindowEvents, debug]);
  
  // This component doesn't render anything
  return null;
};

export default ErrorInitializer;