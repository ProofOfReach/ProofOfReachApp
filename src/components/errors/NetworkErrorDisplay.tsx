/**
 * Network Error Display Component
 * 
 * This component displays network/connectivity errors in a user-friendly format.
 * It shows troubleshooting steps and provides a retry button if applicable.
 */

import React from 'react';
import { ErrorState } from '@/types/errors';

export interface NetworkErrorDisplayProps {
  errors: ErrorState | ErrorState[];
  title?: string;
  showTroubleshooting?: boolean;
  onRetry?: () => void;
  className?: string;
}

const NetworkErrorDisplay: React.FC<NetworkErrorDisplayProps> = ({
  errors,
  title = 'Network Error',
  showTroubleshooting = true,
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
  
  // Common troubleshooting steps
  const troubleshootingSteps = [
    'Check your internet connection',
    'Refresh the page',
    'Clear your browser cache',
    'Try again in a few minutes',
  ];
  
  return (
    <div className={`bg-blue-50 border-l-4 border-blue-500 p-4 rounded ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        
        <div className="ml-3 w-full">
          <h3 className="text-sm font-medium text-blue-800">{title}</h3>
          
          <div className="mt-2">
            <ul className="list-disc pl-5 space-y-1">
              {errorArray.map((error, index) => (
                <li key={error.id || index} className="text-sm text-blue-700">
                  {error.message}
                  
                  {error.details && (
                    <div className="mt-1 text-xs text-blue-600">
                      {error.details}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
          
          {showTroubleshooting && (
            <div className="mt-3">
              <h4 className="text-xs font-semibold text-blue-800">Try these steps:</h4>
              <ul className="list-disc pl-5 space-y-1 mt-1">
                {troubleshootingSteps.map((step, index) => (
                  <li key={index} className="text-xs text-blue-700">
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {onRetry && (
            <div className="mt-4">
              <button
                onClick={onRetry}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Retry Connection
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NetworkErrorDisplay;