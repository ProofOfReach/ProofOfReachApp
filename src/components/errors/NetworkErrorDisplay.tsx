/**
 * Network Error Display Component
 * 
 * This component displays network/connectivity errors in a user-friendly format.
 * It shows troubleshooting steps and provides a retry button if applicable.
 */

import React from 'react';

export interface NetworkErrorDisplayProps {
  error?: Error | null;
  message?: string;
  title?: string;
  showHelpTips?: boolean;
  onRetry?: () => void;
  className?: string;
}

const NetworkErrorDisplay: React.FC<NetworkErrorDisplayProps> = ({
  error,
  message,
  title = 'Network Error',
  showHelpTips = true,
  onRetry,
  className = '',
}) => {
  // Determine which message to display
  const getDisplayMessage = (): string => {
    if (message) {
      return message;
    }
    
    if (error) {
      // Check for common network error patterns and provide friendly messages
      const errorMessage = error.message.toLowerCase();
      
      if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
        return 'Connection timed out. The server is taking too long to respond.';
      }
      
      if (errorMessage.includes('offline') || errorMessage.includes('internet')) {
        return 'Network connection lost. Please check your internet connection.';
      }
      
      if (errorMessage.includes('abort') || errorMessage.includes('interrupt')) {
        return 'The connection was interrupted. Please try again.';
      }
      
      // Use the error message directly if none of the patterns match
      return error.message;
    }
    
    // Default message if no error or custom message provided
    return 'Unable to connect to the network';
  };
  
  // Common troubleshooting steps
  const helpTips = [
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
            <p className="text-sm text-blue-700">{getDisplayMessage()}</p>
          </div>
          
          {showHelpTips && (
            <div className="mt-3">
              <h4 className="text-xs font-semibold text-blue-800">Try the following:</h4>
              <ul className="list-disc pl-5 space-y-1 mt-1">
                {helpTips.map((tip, index) => (
                  <li key={index} className="text-xs text-blue-700">
                    {tip}
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
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NetworkErrorDisplay;