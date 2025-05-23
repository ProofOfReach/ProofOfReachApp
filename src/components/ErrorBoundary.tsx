/**
 * Error Boundary Component
 * 
 * This component catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import '@/lib/errorService';
import '@/utils/toast';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
  showDetails?: boolean;
  componentName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { componentName = 'ErrorBoundary', onError } = this.props;
    
    // Log the error to our error service with additional context
    errorService.reportError(
      error,
      componentName,
      'unexpected',
      'error',
      {
        details: errorInfo.componentStack ? String(errorInfo.componentStack) : undefined,
        userFacing: true,
        recoverable: true,
        retryable: true
      }
    );
    
    // Update state with error details
    this.setState({
      errorInfo,
    });
    
    // Call onError handler if provided
    if (onError) {
      onError(error, errorInfo);
    }
    
    // Show toast notification
    toast.logger.error(`An error occurred: ${error.message}`);
  }

  handleRetry = (): void => {
    const { onReset } = this.props;
    
    // Reset the error state to trigger a re-render
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    
    // Call onReset handler if provided
    if (onReset) {
      onReset();
    }
  };

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, showDetails } = this.props;

    if (hasError) {
      // Render custom fallback if provided, otherwise render default error UI
      if (fallback) {
        return fallback;
      }

      return (
        <div className="p-6 max-w-xl mx-auto my-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <div className="flex items-center mb-4">
            <svg 
              className="w-8 h-8 text-red-500 mr-3" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              ></path>
            </svg>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Something went wrong
            </h2>
          </div>
          
          <div className="mb-4 text-gray-600 dark:text-gray-300">
            <p>
              We've encountered an error while rendering this component. 
              Please try again or contact support if the problem persists.
            </p>
          </div>
          
          {(showDetails || process.env.NODE_ENV === 'development') && (
            <div className="mb-4">
              <h3 className="font-medium text-gray-800 dark:text-white mb-2">
                Technical Details
              </h3>
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded overflow-auto max-h-40 text-sm">
                <p className="font-mono">{error?.toString()}</p>
                {errorInfo && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-blue-600 dark:text-blue-400">
                      Component Stack
                    </summary>
                    <pre className="mt-2 whitespace-pre-wrap">{errorInfo.componentStack}</pre>
                  </details>
                )}
              </div>
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    // When there's no error, render children normally
    return children;
  }
}

export default ErrorBoundary;