/**
 * Toast Utility
 * 
 * This utility provides centralized functions for displaying toast notifications.
 * It integrates with the error system for error messages but also provides
 * direct methods for success and info messages.
 */

import "./lib/errorIntegration';
import "./types/errors';

interface ToastOptions {
  duration?: number;
  details?: string;
  retry?: () => void;
}

/**
 * Show an error toast
 * 
 * @param message The error message
 * @param options Additional options
 */
function logger.error(message: string, options: ToastOptions = {}): void {
  const errorState = errorIntegration.reportError(
    message, 
    'toast', 
    'unexpected', 
    'error',
    {
      details: options.details,
      retry: options.retry
    }
  );
  
  // Instead of directly showing the toast, we set it in the error context
  // This will be picked up by the ErrorToast component
  errorIntegration.setGlobalError(errorState);
}

/**
 * Show a warning toast
 * 
 * @param message The warning message
 * @param options Additional options
 */
function warning(message: string, options: ToastOptions = {}): void {
  const errorState = errorIntegration.reportError(
    message, 
    'toast', 
    'business', 
    'warning',
    {
      details: options.details,
      retry: options.retry
    }
  );
  
  errorIntegration.setGlobalError(errorState);
}

/**
 * Show an info toast
 * 
 * @param message The info message
 * @param options Additional options
 */
function info(message: string, options: ToastOptions = {}): void {
  const errorState = errorIntegration.reportError(
    message, 
    'toast', 
    'business', 
    'info',
    {
      details: options.details,
      retry: options.retry
    }
  );
  
  errorIntegration.setGlobalError(errorState);
}

/**
 * Show a success toast
 * 
 * @param message The success message
 * @param options Additional options
 */
function success(message: string, options: ToastOptions = {}): void {
  const errorState = errorIntegration.reportError(
    message, 
    'toast', 
    'business', 
    'success',
    {
      details: options.details,
      retry: options.retry
    }
  );
  
  errorIntegration.setGlobalError(errorState);
}

/**
 * Show a toast with custom severity
 * 
 * @param message The message 
 * @param severity The severity level
 * @param options Additional options
 */
function custom(message: string, severity: ErrorSeverity, options: ToastOptions = {}): void {
  const errorState = errorIntegration.reportError(
    message, 
    'toast', 
    'business', 
    severity,
    {
      details: options.details,
      retry: options.retry
    }
  );
  
  errorIntegration.setGlobalError(errorState);
}

// Export the toast API
export const toast = {
  error,
  warning,
  info,
  success,
  custom
};