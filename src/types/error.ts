/**
 * Error type definitions for the application
 */

export interface AppError {
  message: string;
  code?: string;
  category?: 'NETWORK' | 'PERMISSION' | 'VALIDATION' | 'OPERATIONAL' | 'SYSTEM';
  details?: Record<string, any>;
}

export interface ErrorState {
  hasError: boolean;
  error: AppError | null;
  isLoading?: boolean;
}

export interface ErrorHandlerOptions {
  fallbackMessage?: string;
  category?: AppError['category'];
  logError?: boolean;
  showToast?: boolean;
}

export type ErrorCategory = AppError['category'];

export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  NOT_FOUND: 'NOT_FOUND',
  SERVER_ERROR: 'SERVER_ERROR',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];