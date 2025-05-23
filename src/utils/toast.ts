/**
 * Toast Utility
 * 
 * This utility provides centralized functions for displaying toast notifications.
 * It integrates with the error system for error messages but also provides
 * direct methods for log and info messages.
 */

import { ErrorType, ErrorSeverity } from '@/types/errors';

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
function showToast(message: string, options: ToastOptions = {}): void {
  // Create a simple error state for toast display
  const errorState = {
    message,
    source: 'toast',
    type: 'unexpected' as ErrorType,
    severity: 'error' as ErrorSeverity,
    details: options.details,
    retry: options.retry
  };
  
  // In a real implementation, this would integrate with a toast system
  console.error('[Toast Error]', errorState);
}

/**
 * Show a warn toast
 * 
 * @param message The warn message
 * @param options Additional options
 */
function warn(message: string, options: ToastOptions = {}): void {
  const errorState = {
    message,
    source: 'toast',
    type: 'business' as ErrorType,
    severity: 'warn' as ErrorSeverity,
    details: options.details,
    retry: options.retry
  };
  
  console.warn('[Toast Warning]', errorState);
}

/**
 * Show an info toast
 * 
 * @param message The info message
 * @param options Additional options
 */
function info(message: string, options: ToastOptions = {}): void {
  const errorState = {
    message,
    source: 'toast',
    type: 'business' as ErrorType,
    severity: 'info' as ErrorSeverity,
    details: options.details,
    retry: options.retry
  };
  
  console.info('[Toast Info]', errorState);
}

/**
 * Show a log toast
 * 
 * @param message The log message
 * @param options Additional options
 */
function log(message: string, options: ToastOptions = {}): void {
  const errorState = {
    message,
    source: 'toast',
    type: 'business' as ErrorType,
    severity: 'info' as ErrorSeverity,
    details: options.details,
    retry: options.retry
  };
  
  console.log('[Toast Log]', errorState);
}

/**
 * Show a toast with custom severity
 * 
 * @param message The message 
 * @param severity The severity level
 * @param options Additional options
 */
function custom(message: string, severity: string, options: ToastOptions = {}): void {
  const errorState = {
    message,
    source: 'toast',
    type: 'business' as ErrorType,
    severity: severity as ErrorSeverity,
    details: options.details,
    retry: options.retry
  };
  
  console.log('[Toast Custom]', errorState);
}

// Export the toast API
export const toast = {
  error: showToast,
  warn,
  info,
  log,
  custom
};