import { NextApiRequest, NextApiResponse } from 'next';

/**
 * Error types for the application
 */
export enum ErrorType {
  Validation = 'ValidationError',
  Authentication = 'AuthenticationError',
  Authorization = 'AuthorizationError',
  NotFound = 'NotFoundError',
  Database = 'DatabaseError',
  External = 'ExternalAPIError',
  Payment = 'PaymentError',
  Nostr = 'NostrError',
  Internal = 'InternalError',
  Api = 'ApiError', // For compatibility with existing ApiError
}

/**
 * Application error structure
 */
export interface AppError {
  type: ErrorType | string;
  message: string;
  status: number;
  details?: any;
}

/**
 * Add properties to Error class for better typechecking
 */
declare global {
  interface Error {
    status?: number;
    code?: string;
    details?: any;
  }
}

/**
 * Log error to the console or monitoring service with proper context
 */
export function logger.error(message: string, err?: unknown): void {
  if (!err) {
    console.error(`Error in ${message}`);
    return;
  }

  // Format the error for better readability
  const errorInfo = {
    message: (err as any).message || 'Unknown error',
    name: (err as any).name,
    stack: (err as any).stack,
    code: (err as any).code,
    status: (err as any).status,
    details: (err as any).details
  };

  console.error(`Error in ${message}:`, errorInfo);
}

/**
 * Create a standardized API error response
 */
export function createErrorResponse(
  type: ErrorType | string,
  message: string,
  status = 500,
  details?: any
): AppError {
  return {
    type,
    message,
    status,
    details,
  };
}

/**
 * Map JavaScript errors to application errors with improved error detection
 */
export function mapError(err: unknown): AppError {
  // Handle native Error object with our custom properties
  if (err instanceof Error) {
    // Handle prisma errors - keep existing behavior
    if (err.code && err.code.startsWith('P')) {
      return createErrorResponse(
        ErrorType.Database,
        err.message || 'Database error',
        500
      );
    }

    // Pre-defined error types with appropriate status codes
    const errorTypeMap: Record<ErrorType, number> = {
      [ErrorType.Validation]: 400,
      [ErrorType.Authentication]: 401,
      [ErrorType.Authorization]: 403,
      [ErrorType.NotFound]: 404,
      [ErrorType.Database]: 500,
      [ErrorType.External]: 502,
      [ErrorType.Payment]: 402,
      [ErrorType.Nostr]: 500,
      [ErrorType.Internal]: 500,
      [ErrorType.Api]: 500 // Default status code for Api errors
    };

    // Check if error name matches one of our types
    if (err.name in errorTypeMap) {
      const errorType = err.name as any;
      return createErrorResponse(
        errorType,
        err.message || getDefaultMessageForErrorType(errorType),
        err.status || errorTypeMap[errorType],
        err.details
      );
    }
  }

  // Handle non-Error objects or unrecognized types
  return createErrorResponse(
    (err as any).name || 'Internal',
    (err as any).message || 'An unexpected error occurred',
    (err as any).status || 500,
    (err as any).details
  );
}

/**
 * Get default error message for error types
 */
function getDefaultMessageForErrorType(type: ErrorType): string {
  switch (type) {
    case ErrorType.Validation:
      return 'Invalid request data';
    case ErrorType.Authentication:
      return 'Not authenticated';
    case ErrorType.Authorization:
      return 'Not authorized to perform this action';
    case ErrorType.NotFound:
      return 'Resource not found';
    case ErrorType.Database:
      return 'Database operation failed';
    case ErrorType.External:
      return 'External service request failed';
    case ErrorType.Payment:
      return 'Payment operation failed';
    case ErrorType.Nostr:
      return 'Nostr operation failed';
    case ErrorType.Api:
      return 'API error';
    case ErrorType.Internal:
    default:
      return 'An unexpected error occurred';
  }
}

/**
 * Standard error handler for API routes
 */
export function error(
  err: any
  req: NextApiRequest,
  res: NextApiResponse
): void {
  // Map the error to our standard format
  const appError = mapError(err);
  
  // Log the error with context
  logger.error(`${req.method} ${req.url}`, {
    ...err,
    path: req.url,
    method: req.method,
    query: req.query,
    // Don't log full body for privacy, but include a digest
    bodyKeys: req.body ? Object.keys(req.body) : undefined,
  });
  
  // Add more debug info in development
  let debugInfo = {};
  if (process.env.NODE_ENV !== 'production') {
    debugInfo = {
      stack: err.stack,
      code: err.code,
      originalError: err.message
    };
  }
  
  // Send the response
  res.status(appError.status).json({
    error: appError.type,
    message: appError.message,
    ...(appError.details ? { details: appError.details } : {}),
    ...(Object.keys(debugInfo).length > 0 ? { debug: debugInfo } : {})
  });
}

/**
 * Create a validation error with 400 status code
 */
export function validationError(message: string, details?: Record<string, unknown>): AppError {
  return createErrorResponse(ErrorType.Validation, message, 400, details);
}

/**
 * Create an authentication error with 401 status code
 */
export function authenticationError(message = 'Not authenticated'): AppError {
  return createErrorResponse(ErrorType.Authentication, message, 401);
}

/**
 * Create an authorization error with 403 status code
 */
export function authorizationError(message = 'Not authorized'): AppError {
  return createErrorResponse(ErrorType.Authorization, message, 403);
}

/**
 * Create a not found error with 404 status code
 */
export function notFoundError(message = 'Resource not found'): AppError {
  return createErrorResponse(ErrorType.NotFound, message, 404);
}

/**
 * Create a database error with 500 status code
 */
export function databaseError(message = 'Database operation failed', details?: Record<string, unknown>): AppError {
  return createErrorResponse(ErrorType.Database, message, 500, details);
}

/**
 * Create an external API error with 502 status code
 */
export function externalError(message = 'External service request failed', details?: any): AppError {
  return createErrorResponse(ErrorType.External, message, 502, details);
}

/**
 * Create a payment error with 402 status code
 */
export function paymentError(message = 'Payment operation failed', details?: any): AppError {
  return createErrorResponse(ErrorType.Payment, message, 402, details);
}

/**
 * Create a Nostr error with 500 status code
 */
export function nostrError(message = 'Nostr operation failed', details?: any): AppError {
  return createErrorResponse(ErrorType.Nostr, message, 500, details);
}

/**
 * Base function to throw typed errors
 */
function throwTypedError(type: ErrorType, message: string, status?: number, details?: any): never {
  // For Api errors, use ApiError class directly for compatibility with tests
  if (type === ErrorType.Api) {
    const { ApiError } = require('../utils/apiError');
    throw new ApiError(status || 500, message);
  }
  
  // For other errors, use the standard approach
  const err = new Error(message);
  err.name = type;
  if (status) err.status = status;
  if (details) err.details = details;
  throw err;
}

/**
 * Throw a validation error that will be caught by error
 */
export function throwValidationError(message: string, details?: any): never {
  return throwTypedError(ErrorType.Validation, message, 400, details);
}

/**
 * Throw an authentication error that will be caught by error
 */
export function throwAuthenticationError(message = 'Not authenticated'): never {
  return throwTypedError(ErrorType.Authentication, message, 401);
}

/**
 * Throw an authorization error that will be caught by error
 */
export function throwAuthorizationError(message = 'Not authorized'): never {
  return throwTypedError(ErrorType.Authorization, message, 403);
}

/**
 * Throw a not found error that will be caught by error
 */
export function throwNotFoundError(message = 'Resource not found'): never {
  return throwTypedError(ErrorType.NotFound, message, 404);
}

/**
 * Throw a database error that will be caught by error
 */
export function throwDatabaseError(message = 'Database operation failed', details?: any): never {
  return throwTypedError(ErrorType.Database, message, 500, details);
}

/**
 * Throw an ApiError - this is for compatibility with the existing ApiError class
 */
export function throwApiError(statusCode: number, message?: string): never {
  return throwTypedError(ErrorType.Api, message || '', statusCode);
}