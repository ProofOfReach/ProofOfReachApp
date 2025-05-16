/**
 * API Error Display Component
 * 
 * This component displays API errors in a user-friendly format.
 * It shows the error message, details, and provides a retry button if applicable.
 */

import React from 'react';
import { ErrorState } from '@/types/errors';

export interface ApiErrorDisplayProps {
  errors: ErrorState | ErrorState[];
  title?: string;
  showDetails?: boolean;
  onRetry?: () => void;
  className?: string;
}

const ApiErrorDisplay: React.FC<ApiErrorDisplayProps> = ({
  errors,
  title = 'API Error',
  showDetails = false,
  onRetry,
  className = '',
}) => {
  // Convert single error to array for consistent handling
  const errorArray = Array.isArray(errors) ? errors : [errors];
  const hasErrors = errorArray.length > 0;
  
  // If no errors, don't render anything
  if (!hasErrors) {
    return null;
  }
  
  // Get status code from error data if available
  const getStatusCode = (error: ErrorState): string => {
    if (error.data && 'statusCode' in error.data) {
      return `Status: ${error.data.statusCode}`;
    }
    return '';
  };
  
  // Get endpoint from error data if available
  const getEndpoint = (error: ErrorState): string => {
    if (error.data && 'endpoint' in error.data) {
      return `Endpoint: ${error.data.endpoint}`;
    }
    return '';
  };
  
  return (
    <div className={`bg-red-50 border-l-4 border-red-500 p-4 rounded ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <div className="ml-3 w-full">
          <h3 className="text-sm font-medium text-red-800">{title}</h3>
          
          <div className="mt-2">
            <ul className="list-disc pl-5 space-y-1">
              {errorArray.map((error, index) => (
                <li key={error.id || index} className="text-sm text-red-700">
                  {error.message}
                  
                  {showDetails && (
                    <div className="mt-1 text-xs text-red-600">
                      {error.details && <div>{error.details}</div>}
                      {getStatusCode(error) && <div>{getStatusCode(error)}</div>}
                      {getEndpoint(error) && <div>{getEndpoint(error)}</div>}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
          
          {onRetry && (
            <div className="mt-4">
              <button
                onClick={onRetry}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Retry Request
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiErrorDisplay;