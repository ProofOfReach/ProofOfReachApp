/**
 * Error types for the application
 */

// Possible error types
export type ErrorType = 
  | 'api'          // API/HTTP errors
  | 'validation'   // Form validation errors
  | 'network'      // Network connectivity errors
  | 'auth'         // Authentication/authorization errors
  | 'permission'   // Permission denied errors
  | 'unexpected'   // Unexpected errors 
  | 'business'     // Business logic errors
  | 'timeout'      // Timeout errors
  | 'external'     // External service errors
  | 'unknown';     // Unknown/unclassified errors

// Error categories for API error handling
export enum ErrorCategory {
  USER_INPUT = 'USER_INPUT',           // 400: Validation errors, bad inputs
  AUTHORIZATION = 'AUTHORIZATION',     // 403: Permission/access denied errors
  RESOURCE = 'RESOURCE',               // 404: Resource not found
  OPERATIONAL = 'OPERATIONAL',         // 500: Server errors, database issues
  PROGRAMMER = 'PROGRAMMER',           // 500: Programming errors, bugs
  BUSINESS = 'BUSINESS'                // 422: Business logic errors
}

// Error severity levels
export type ErrorSeverity = 
  | 'info'        // Informational, non-critical
  | 'warning'     // Warning, potential issue
  | 'error'       // Error, functionality affected
  | 'critical'    // Critical, system failure
  | 'success';    // Success message (for toast compatibility)

// Field error for form validation
export interface FieldError {
  field: string;
  message: string;
}

// Core error state interface
export interface ErrorState {
  // Core properties
  id: string;                       // Unique identifier for the error
  message: string;                  // User-friendly error message
  timestamp: number;                // When the error occurred
  
  // Classification
  type: ErrorType;                  // Type of error
  severity: ErrorSeverity;          // Error severity
  source: string;                   // Source of the error (component, function, etc.)
  category?: ErrorCategory;         // Error category (user input, auth, etc.)
  
  // Additional info
  details?: string;                 // Detailed error information (optional)
  code?: string | number;           // Error code (optional)
  stack?: string;                   // Error stack trace (optional)
  data?: Record<string, any>;       // Additional error data (optional)
  retry?: (() => void) | null;      // Retry function if available
  
  // State tracking
  active: boolean;                  // Whether the error is currently active
  handled: boolean;                 // Whether the error has been handled
  dismissed?: boolean;              // Whether the error has been dismissed by user
  retryCount?: number;              // Number of retry attempts (optional)
  
  // Recovery and user experience
  recoverable?: boolean;            // Whether the error can be recovered from
  retryable?: boolean;              // Whether the operation can be retried
  userFacing?: boolean;             // Whether the error should be shown to user
  suggestedAction?: string;         // Suggested action for the user
  
  // Correlation and tracing
  correlationId?: string;           // For tracking related errors
  
  // Related errors
  errors?: FieldError[];            // For validation errors with multiple fields
}

// Context state for error management
export interface ErrorContextState {
  errors: ErrorState[];             // All tracked errors
  globalError: ErrorState | null;   // Current global error
  toastError: ErrorState | null;    // Current toast error
}

// Default error state
export const defaultErrorState: ErrorContextState = {
  errors: [],
  globalError: null,
  toastError: null,
};