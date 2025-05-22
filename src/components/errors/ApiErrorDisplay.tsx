/**
 * API Error Display Component
 * 
 * This component displays API errors in a user-friendly format.
 * It shows the error message, details, and provides a retry button if applicable.
 */

import React, { useState } from 'react';

export interface ApiErrorDisplayProps {
  error: unknown;
  title?: string;
  message?: string;
  showDetails?: boolean;
  onRetry?: () => void;
  className?: string;
}

// Error display component

const ApiErrorDisplay: React.FC<ApiErrorDisplayProps> = ({
  error,
  title = 'Error',
  message = 'An error occurred while fetching data',
  showDetails = false,
  onRetry,
  className = '',
}) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  
  if (!error) {
    return null;
  }
  
  // Format error message using fallback
  const errorMessage = error instanceof Error ? error.message : 
                       typeof error === 'string' ? error : 
                       message || 'An error occurred';
  
  // Handle status code in the title if available
  const statusTitle = (error && typeof error === 'object' && 'status' in error) ? `${title} (${(error as { status: number }).status})` : title;
  
  return (
    <div className={`bg-red-50 border-l-4 border-red-500 p-4 rounded ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v4a1 1 0 102 0V7zm-1 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">{statusTitle}</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{errorMessage}</p>
          </div>
          
          {showDetails && (
            <div className="mt-2">
              <button 
                onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                className="text-xs text-red-600 underline"
              >
                {showTechnicalDetails ? 'Hide technical details' : 'Show technical details'}
              </button>
              
              {showTechnicalDetails && error instanceof Error && (
                <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 overflow-auto max-h-40 rounded border border-red-200">
                  {(error as Error).stack || 'No stack trace available'}
                </pre>
              )}
            </div>
          )}
          
          {onRetry && (
            <div className="mt-3">
              <button
                onClick={onRetry}
                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiErrorDisplay;