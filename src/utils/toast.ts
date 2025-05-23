/**
 * Toast Utility
 * 
 * This utility provides centralized functions for displaying toast notifications.
 * It integrates with the error system for error messages but also provides
 * direct methods for log and info messages.
 */

import '@/lib/console';
import '@/types/errors';

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
  const errorState = console.error(
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
  console.log(errorState);
}

/**
 * Show a warn toast
 * 
 * @param message The warn message
 * @param options Additional options
 */
function warn(message: string, options: ToastOptions = {}): void {
  const errorState = console.error(
    message, 
    'toast', 
    'business', 
    'warn',
    {
      details: options.details,
      retry: options.retry
    }
  );
  
  console.log(errorState);
}

/**
 * Show an info toast
 * 
 * @param message The info message
 * @param options Additional options
 */
function info(message: string, options: ToastOptions = {}): void {
  const errorState = console.error(
    message, 
    'toast', 
    'business', 
    'info',
    {
      details: options.details,
      retry: options.retry
    }
  );
  
  console.log(errorState);
}

/**
 * Show a log toast
 * 
 * @param message The log message
 * @param options Additional options
 */
function log(message: string, options: ToastOptions = {}): void {
  const errorState = console.error(
    message, 
    'toast', 
    'business', 
    'log',
    {
      details: options.details,
      retry: options.retry
    }
  );
  
  console.log(errorState);
}

/**
 * Show a toast with custom severity
 * 
 * @param message The message 
 * @param severity The severity level
 * @param options Additional options
 */
function custom(message: string, severity: string, options: ToastOptions = {}): void {
  const errorState = console.error(
    message, 
    'toast', 
    'business', 
    severity,
    {
      details: options.details,
      retry: options.retry
    }
  );
  
  console.log(errorState);
}

// Export the toast API
export const toast = {
  error,
  warn,
  info,
  log,
  custom
};