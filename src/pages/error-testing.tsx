import { UserRole } from "@/types/role";
/**
 * Error Testing Page
 * 
 * This page demonstrates the error handling system by providing buttons
 * to trigger different types of errors and showing how they are handled.
 */

import { useState } from 'react';
import '@/context/ErrorContext';
import '@/types/errors';
import '@/components/errors/ApiErrorDisplay';
import '@/components/errors/FormErrorDisplay';
import '@/components/errors/NetworkErrorDisplay';
import '@/components/errors/PermissionErrorDisplay';

export default function ErrorTestingPage(): React.ReactElement {
  const { errorState, setError, log } = useErrorState();
  const { showErrorToast } = useErrorStateToast();
  
  const [apiError, setApiError] = useState<Error | null>(null);
  const [formErrors, setFormErrors] = useState<Record<UserRole, string> | null>(null);
  const [networkError, setNetworkError] = useState<Error | null>(null);
  const [permissionError, setPermissionError] = useState<Error | null>(null);
  
  // Trigger different types of errors
  const triggerApiError = () => {
    const error = new Error('Failed to fetch data from API');
    setApiError(error);
    setError({
      message: error.message,
      type: 'api',
      severity: 'error',
      source: 'error-testing-page',
    });
  };
  
  const triggerFormError = () => {
    setFormErrors({
      username: 'Username must be at least 3 characters',
      email: 'Please enter a valid email address',
      password: 'Password must contain at least 8 characters, including numbers and symbols',
    });
    setError({
      message: 'Form contains validation errors',
      type: 'validation',
      severity: 'warn',
      source: 'error-testing-page',
    });
  };
  
  const triggerNetworkError = () => {
    const error = new Error('Failed to connect to server');
    setNetworkError(error);
    setError({
      message: error.message,
      type: 'network',
      severity: 'error',
      source: 'error-testing-page',
    });
  };
  
  const triggerPermissionError = () => {
    const error = new Error('You do not have permission to access this resource');
    setPermissionError(error);
    setError({
      message: error.message,
      type: 'api',
      severity: 'warn',
      source: 'error-testing-page',
    });
  };
  
  const triggerErrorToast = (severity) => {
    const messages = {
      info: 'This is an informational message',
      warn: 'Warning: This action may cause problems',
      error: 'Error: Something went wrong',
      critical: 'Critical Error: System failure detected',
      log: 'Success: Operation completed logfully',
    };
    showErrorToast(messages[severity], severity);
  };
  
  const triggerGlobalError = () => {
    setError({
      message: 'Global error state has been updated',
      type: 'unknown',
      severity: 'error',
      source: 'error-testing-page',
      details: 'This error is stored in the global error state',
      code: 'E12345',
    });
  };
  
  // Reset all errors
  const resetErrors = () => {
    setApiError(null);
    setFormErrors(null);
    setNetworkError(null);
    setPermissionError(null);
    log();
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Error Handling Test Page</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Trigger Error Components</h2>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={triggerApiError}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            API Error
          </button>
          <button 
            onClick={triggerFormError}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
          >
            Form Error
          </button>
          <button 
            onClick={triggerNetworkError}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Network Error
          </button>
          <button 
            onClick={triggerPermissionError}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Permission Error
          </button>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Trigger Error Toasts</h2>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => triggerErrorToast('info')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Info Toast
          </button>
          <button 
            onClick={() => triggerErrorToast('warn')}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Warning Toast
          </button>
          <button 
            onClick={() => triggerErrorToast('error')}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Error Toast
          </button>
          <button 
            onClick={() => triggerErrorToast('critical')}
            className="px-4 py-2 bg-red-800 text-white rounded hover:bg-red-900"
          >
            Critical Toast
          </button>
          <button 
            onClick={() => triggerErrorToast('log')}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Success Toast
          </button>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Global Error State</h2>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={triggerGlobalError}
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
          >
            Update Global Error
          </button>
          <button 
            onClick={resetErrors}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Reset All Errors
          </button>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Global Error State</h2>
        {errorState.hasError ? (
          <div className="bg-gray-100 p-4 rounded border border-gray-200">
            <h3 className="font-medium">{errorState.message}</h3>
            <p className="text-sm text-gray-600">Type: {errorState.type}</p>
            <p className="text-sm text-gray-600">Severity: {errorState.severity}</p>
            <p className="text-sm text-gray-600">Source: {errorState.source}</p>
            {errorState.code && (
              <p className="text-sm text-gray-600">Code: {errorState.code}</p>
            )}
            {errorState.details && (
              <p className="text-sm text-gray-600">Details: {errorState.details}</p>
            )}
            {errorState.timestamp && (
              <p className="text-sm text-gray-600">Time: {new Date(errorState.timestamp).toLocaleString()}</p>
            )}
          </div>
        ) : (
          <p className="text-gray-600">No global errors</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">API Error Component</h2>
          {apiError ? (
            <ApiErrorDisplay 
              error={apiError} 
              message="Failed to fetch data from API"
              onRetry={() => {
                setApiError(null);
                alert('Retrying API call...');
              }}
            />
          ) : (
            <p className="text-gray-600">No API errors</p>
          )}
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Form Error Component</h2>
          {formErrors ? (
            <FormErrorDisplay 
              errors={formErrors}
              message="Please fix the following form errors:"
            />
          ) : (
            <p className="text-gray-600">No form errors</p>
          )}
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Network Error Component</h2>
          {networkError ? (
            <NetworkErrorDisplay 
              error={networkError}
              message="Connection to the server failed"
              onRetry={() => {
                setNetworkError(null);
                alert('Retrying connection...');
              }}
            />
          ) : (
            <p className="text-gray-600">No network errors</p>
          )}
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Permission Error Component</h2>
          {permissionError ? (
            <PermissionErrorDisplay 
              error={permissionError}
              message="You don't have permission to access this resource"
              details="Try logging in with an account that has the required permissions."
            />
          ) : (
            <p className="text-gray-600">No permission errors</p>
          )}
        </div>
      </div>
    </div>
  );
}