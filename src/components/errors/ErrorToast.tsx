/**
 * Error Toast Component
 * 
 * This component displays error notifications as toasts.
 * It shows different styles based on error type.
 */

import React, { useEffect, useState } from 'react';
import '@/types/errors';

export type ErrorToastType = 'error' | 'warn' | 'network' | 'permission' | 'validation';

export interface ErrorToastProps {
  message: string;
  type?: ErrorToastType;
  details?: string;
  onClose?: () => void;
  retryAction?: () => void;
  autoClose?: boolean;
  duration?: number;
  errorCategory?: string;
  className?: string;
}

/**
 * Toast component for displaying error notifications
 */
const ErrorToast: React.FC<ErrorToastProps> = ({
  message,
  type = 'error',
  details,
  onClose,
  retryAction,
  autoClose = true,
  duration = 5000, // 5 seconds by default
  errorCategory,
  className = '',
}) => {
  const [visible, setVisible] = useState(true);
  
  // Handle auto-close functionality
  useEffect(() => {
    if (!autoClose) return;
    
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) {
        onClose(); // Call onClose immediately
      }
    }, duration);
    
    return () => clearTimeout(timer);
  }, [autoClose, duration, onClose]);
  
  // Handle manual close
  const handleClose = () => {
    setVisible(false);
    if (onClose) {
      onClose();
    }
  };
  
  // Define type classes (background, text, icon)
  const getTypeClasses = (errorType: ErrorToastType) => {
    switch (errorType) {
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warn':
      case 'validation':
        return 'bg-amber-100 text-amber-800';
      case 'network':
        return 'bg-blue-100 text-blue-800';
      case 'permission':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };
  
  // Render icon based on type
  const renderIcon = (errorType: ErrorToastType) => {
    switch (errorType) {
      case 'error':
        return (
          <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warn':
      case 'validation':
        return (
          <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'network':
        return (
          <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'permission':
        return (
          <svg className="h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
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
  
  // Data attributes for error category
  const dataAttributes = errorCategory 
    ? { 'data-error-category': errorCategory } 
    : {};
  
  return (
    <div 
      className={`fixed top-4 right-4 z-50 transition-all duration-300 max-w-md rounded-md shadow-lg p-4 ${getTypeClasses(type)} ${className}`}
      role="alert"
      aria-live="assertive"
      {...dataAttributes}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          {renderIcon(type)}
        </div>
        
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              {message}
            </p>
            
            <button
              type="button"
              className="ml-4 inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={handleClose}
              aria-label="close"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {details && (
            <p className="mt-1 text-xs opacity-80">
              {details}
            </p>
          )}
          
          {retryAction && (
            <div className="mt-2">
              <button
                type="button"
                onClick={retryAction}
                className="text-sm font-medium underline hover:text-opacity-80 focus:outline-none"
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

export default ErrorToast;