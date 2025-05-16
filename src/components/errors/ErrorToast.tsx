/**
 * Error Toast Component
 * 
 * This component displays error notifications as toasts.
 * It shows different styles based on error severity.
 */

import React, { useEffect, useState } from 'react';
import { ErrorState, ErrorSeverity } from '@/types/errors';

export interface ErrorToastProps {
  error: ErrorState;
  onDismiss?: () => void;
  autoClose?: boolean;
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  className?: string;
}

/**
 * Toast component for displaying error notifications
 */
const ErrorToast: React.FC<ErrorToastProps> = ({
  error,
  onDismiss,
  autoClose = true,
  duration = 5000, // 5 seconds by default
  position = 'top-right',
  className = '',
}) => {
  const [visible, setVisible] = useState(true);
  
  // Handle auto-close functionality
  useEffect(() => {
    if (!autoClose) return;
    
    const timer = setTimeout(() => {
      setVisible(false);
      if (onDismiss) {
        setTimeout(onDismiss, 300); // Call onDismiss after animation completes
      }
    }, duration);
    
    return () => clearTimeout(timer);
  }, [autoClose, duration, onDismiss]);
  
  // Handle manual dismiss
  const handleDismiss = () => {
    setVisible(false);
    if (onDismiss) {
      setTimeout(onDismiss, 300); // Call onDismiss after animation completes
    }
  };
  
  // Define position classes
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
  };
  
  // Define severity classes (background, text, icon)
  const severityClasses = {
    info: 'bg-blue-50 text-blue-800 border-blue-500',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-500',
    error: 'bg-red-50 text-red-800 border-red-500',
    critical: 'bg-purple-50 text-purple-800 border-purple-500',
    success: 'bg-green-50 text-green-800 border-green-500',
  };
  
  // Get appropriate classes based on error severity
  const getSeverityClasses = (severity: ErrorSeverity) => {
    return severityClasses[severity] || severityClasses.error;
  };
  
  // Render icon based on severity
  const renderIcon = (severity: ErrorSeverity) => {
    switch (severity) {
      case 'info':
        return (
          <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'critical':
        return (
          <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'success':
        return (
          <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };
  
  if (!visible) {
    return null;
  }
  
  return (
    <div 
      className={`fixed z-50 ${positionClasses[position]} transition-all duration-300 ease-in-out 
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'} ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <div className={`max-w-md rounded-md shadow-lg border-l-4 ${getSeverityClasses(error.severity)}`}>
        <div className="flex p-4">
          <div className="flex-shrink-0">
            {renderIcon(error.severity)}
          </div>
          
          <div className="ml-3 flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {error.message}
              </p>
              
              <button
                type="button"
                className="ml-4 inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={handleDismiss}
                aria-label="Dismiss error"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {error.details && (
              <p className="mt-1 text-xs opacity-80">
                {error.details}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorToast;