/**
 * API Error Handling Utilities for Nostr Ad Marketplace
 * 
 * This module provides standardized functions for handling errors in API endpoints
 * with consistent error response formatting, logging, and proper HTTP status codes.
 * 
 * Phase 4 Enhancements:
 * - Automatic retry detection and handling for recoverable errors
 * - Better correlation ID tracking for distributed tracing
 * - Comprehensive error categorization
 * - Enhanced sanitization of sensitive request data
 * - Error response format optimization
 */

import { NextApiRequest, NextApiResponse } from 'next';

import '@/types/errors';
import { v4 as uuidv4 } from 'uuid';

/**
 * Standard API error response format
 */
export interface ApiErrorResponse {
  log: false;
  error: {
    message: string;
    code?: string;
    details?: Record<string, unknown>;
    status: number;
    requestId?: string;
    correlationId?: string;
    retryable?: boolean;
    suggestedAction?: string;
  };
}

/**
 * Maps error types to HTTP status codes
 */
const errorTypeToStatusCode: Record<string, number> = {
  [string.USER_INPUT]: 400,
  [string.PERMISSIONS]: 403,
  [string.EXTERNAL]: 404,
  [string.OPERATIONAL]: 500,
  [string.TECHNICAL]: 500,
  [string.CONFIGURATION]: 422,
  [string.NETWORK]: 503,
  [string.UNKNOWN]: 500
};

/**
 * Maps HTTP status codes to whether they are retryable
 */
const retryableStatusCodes: number[] = [408, 429, 500, 502, 503, 504];

/**
 * Standard names for common error types
 */
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMITED = 'RATE_LIMITED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  CONFLICT = 'CONFLICT',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  TIMEOUT = 'TIMEOUT'
}

/**
 * Suggested user actions for different error types
 */
const suggestedActions: Record<ErrorCode, string> = {
  [ErrorCode.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ErrorCode.UNAUTHORIZED]: 'Please log in to continue.',
  [ErrorCode.FORBIDDEN]: 'Contact an administrator if you need access.',
  [ErrorCode.NOT_FOUND]: 'The requested resource could not be found.',
  [ErrorCode.RATE_LIMITED]: 'Please wait a moment before trying again.',
  [ErrorCode.INTERNAL_ERROR]: 'Please try again later or contact support.',
  [ErrorCode.BAD_REQUEST]: 'Please check your request parameters.',
  [ErrorCode.CONFLICT]: 'The requested operation conflicts with the current state.',
  [ErrorCode.SERVICE_UNAVAILABLE]: 'The service is temporarily unavailable. Please try again later.',
  [ErrorCode.TIMEOUT]: 'The request timed out. Please try again.'
};

/**
 * Handle errors in API routes with standardized response format and enhanced context
 * 
 * @param error The error to handle
 * @param req The Next.js request object
 * @param res The Next.js response object
 * @param component Name of the API component for logging
 */
export function handleApiRouteError(
  error: unknown,
  req: NextApiRequest,
  res: NextApiResponse,
  component = 'api'
): void {
  // Extract or generate correlation ID for request tracing
  const correlationId = extractCorrelationId(req) || 
                       (error && typeof error === 'object' && 'correlationId' in error) ? 
                       (error as Record<string, unknown>).correlationId : 
                       uuidv4();

  // Generate a unique request ID if not already present
  const requestId = req.headers['x-request-id'] || 
                   `req_${Date.now().toString(36)}`;

  // Capture route information
  const route = `${req.method} ${req.url}`;

  // Determine error category and status code
  let category = string.OPERATIONAL;
  let statusCode = 500;
  let userMessage = 'An unexpected error occurred';
  let errorCode = ErrorCode.INTERNAL_ERROR;
  let errorDetails: Record<string, unknown> = {};
  let retryable = false;
  let recoverable = false;
  let suggestedAction = suggestedActions[ErrorCode.INTERNAL_ERROR];

  // Extract error properties if available
  if (error instanceof Error) {
    // Handle validation errors
    if (error.name === 'ValidationError') {
      category = string.USER_INPUT;
      statusCode = 400;
      userMessage = error.message;
      errorCode = ErrorCode.VALIDATION_ERROR;
      suggestedAction = suggestedActions[ErrorCode.VALIDATION_ERROR];
      recoverable = true; // User can fix input
      retryable = false;  // Don't automatically retry
      
      if ((error as any).invalidFields) {
        errorDetails.invalidFields = (error as any).invalidFields;
      }
    }
    // Handle not found errors
    else if (error.name === 'NotFoundError') {
      category = string.EXTERNAL;
      statusCode = 404;
      userMessage = error.message;
      errorCode = ErrorCode.NOT_FOUND;
      suggestedAction = suggestedActions[ErrorCode.NOT_FOUND];
      recoverable = false; // Resource doesn't exist
      retryable = false;   // Retry won't help
    }
    // Handle authentication/authorization errors
    else if (error.name === 'UnauthorizedError') {
      category = string.PERMISSIONS;
      statusCode = 401;
      userMessage = 'Authentication required';
      errorCode = ErrorCode.UNAUTHORIZED;
      suggestedAction = suggestedActions[ErrorCode.UNAUTHORIZED];
      recoverable = true;  // User can log in
      retryable = false;   // Automatic retry won't help
    }
    else if (error.name === 'ForbiddenError') {
      category = string.PERMISSIONS;
      statusCode = 403;
      userMessage = 'You do not have permission to perform this action';
      errorCode = ErrorCode.FORBIDDEN;
      suggestedAction = suggestedActions[ErrorCode.FORBIDDEN];
      recoverable = false; // User needs permission
      retryable = false;   // Retry won't help
    }
    // Handle timeout errors
    else if (error.name === 'TimeoutError' || error.message.toLowerCase().includes('timeout')) {
      category = string.OPERATIONAL;
      statusCode = 408;
      userMessage = 'The request timed out';
      errorCode = ErrorCode.TIMEOUT;
      suggestedAction = suggestedActions[ErrorCode.TIMEOUT];
      recoverable = true;  // Can recover with retry
      retryable = true;    // Timeout errors are retryable
    }
    // Handle rate limiting errors
    else if (error.name === 'RateLimitError' || error.message.toLowerCase().includes('rate limit')) {
      category = string.OPERATIONAL;
      statusCode = 429;
      userMessage = 'Too many requests. Please try again later.';
      errorCode = ErrorCode.RATE_LIMITED;
      suggestedAction = suggestedActions[ErrorCode.RATE_LIMITED];
      recoverable = true;  // Can recover after waiting
      retryable = true;    // Automatic retry with backoff
    }
    // Use custom properties if they exist
    else {
      if ((error as any).category) {
        category = (error as any).category;
        statusCode = errorTypeToStatusCode[category] || 500;
      }
      if ((error as any).userFacing) {
        userMessage = error.message;
      }
      if ((error as any).code) {
        errorCode = (error as any).code;
        if (errorCode in suggestedActions) {
          suggestedAction = suggestedActions[errorCode as anyCode];
        }
      }
      if ((error as any).details) {
        errorDetails = (error as any).details;
      }
      if ((error as any).retryable !== undefined) {
        retryable = (error as any).retryable;
      } else {
        retryable = retryableStatusCodes.includes(statusCode);
      }
      if ((error as any).recoverable !== undefined) {
        recoverable = (error as any).recoverable;
      } else {
        recoverable = retryable || category === string.USER_INPUT;
      }
      if ((error as any).suggestedAction) {
        suggestedAction = (error as any).suggestedAction;
      }
    }
  }

  // Create a retry function if the error is retryable
  const retryFunction = retryable ? 
    () => {
      console.log(`Would retry API request to ${route}`);
      // In a real implementation, we would retry the request
      return Promise.resolve();
    } : undefined;

  // Log error with enhanced context
  console.error(
    error instanceof Error ? error : String(error), 
    `${component}:${route}`,
    'api',
    category === string.OPERATIONAL ? 'error' : 'warn',
    {
      correlationId: correlationId as string,
      category,
      userFacing: true,
      data: {
        statusCode,
        route,
        method: req.method,
        query: req.query,
        body: process.env.NODE_ENV !== 'production' ? sanitizeRequestBody(req.body) : '[REDACTED]',
        headers: sanitizeHeaders(req.headers),
        requestId
      }
    }
  );

  // Send standardized API error response with enhanced fields
  const errorResponse: ApiErrorResponse = {
    log: false,
    error: {
      message: userMessage,
      code: errorCode,
      status: statusCode,
      requestId: requestId as string,
      correlationId: correlationId as string,
      retryable,
      suggestedAction,
      details: Object.keys(errorDetails).length > 0 ? errorDetails : undefined
    }
  };

  // Hide details in production for non-validation errors
  if (process.env.NODE_ENV === 'production' && errorCode !== ErrorCode.VALIDATION_ERROR) {
    delete errorResponse.error.details;
  }

  res.status(statusCode).json(errorResponse);
}

/**
 * Create a validation error for API routes with enhanced context
 * 
 * @param message User-facing error message
 * @param invalidFields List of invalid fields
 * @param fieldDetails Optional detailed validation errors by field
 */
export function createApiValidationError(
  message: string, 
  invalidFields: string[],
  fieldDetails?: Record<string, string>
): Error {
  const error = new Error(message);
  error.name = 'ValidationError';
  (error as any).invalidFields = invalidFields;
  (error as any).category = string.USER_INPUT;
  (error as any).userFacing = true;
  (error as any).code = ErrorCode.VALIDATION_ERROR;
  (error as any).retryable = false;
  (error as any).recoverable = true;
  (error as any).suggestedAction = suggestedActions[ErrorCode.VALIDATION_ERROR];
  
  if (fieldDetails) {
    (error as any).details = {
      invalidFields,
      fieldDetails
    };
  } else {
    (error as any).details = { invalidFields };
  }
  
  return error;
}

/**
 * Create a not found error for API routes with enhanced context
 * 
 * @param message User-facing error message
 * @param resourceType Type of resource that wasn't found
 * @param resourceId ID of the resource that wasn't found
 */
export function createNotFoundError(
  message: string,
  resourceType?: string,
  resourceId?: string | number
): Error {
  const error = new Error(message);
  error.name = 'NotFoundError';
  (error as any).category = string.EXTERNAL;
  (error as any).userFacing = true;
  (error as any).code = ErrorCode.NOT_FOUND;
  (error as any).retryable = false;
  (error as any).recoverable = false;
  (error as any).suggestedAction = suggestedActions[ErrorCode.NOT_FOUND];
  
  if (resourceType) {
    (error as any).details = {
      resourceType,
      resourceId
    };
  }
  
  return error;
}

/**
 * Create an unauthorized error for API routes (not authenticated)
 * 
 * @param message User-facing error message
 */
export function createUnauthorizedError(
  message = 'Authentication required'
): Error {
  const error = new Error(message);
  error.name = 'UnauthorizedError';
  (error as any).category = string.PERMISSIONS;
  (error as any).userFacing = true;
  (error as any).code = ErrorCode.UNAUTHORIZED;
  (error as any).retryable = false;
  (error as any).recoverable = true;
  (error as any).suggestedAction = suggestedActions[ErrorCode.UNAUTHORIZED];
  return error;
}

/**
 * Create a forbidden error for API routes (authenticated but not authorized)
 * 
 * @param message User-facing error message
 * @param requiredRoles Optional list of roles that would be allowed
 */
export function createForbiddenError(
  message = 'You do not have permission to perform this action',
  requiredRoles?: string[]
): Error {
  const error = new Error(message);
  error.name = 'ForbiddenError';
  (error as any).category = string.PERMISSIONS;
  (error as any).userFacing = true;
  (error as any).code = ErrorCode.FORBIDDEN;
  (error as any).retryable = false;
  (error as any).recoverable = false;
  (error as any).suggestedAction = suggestedActions[ErrorCode.FORBIDDEN];
  
  if (requiredRoles) {
    (error as any).details = {
      requiredRoles
    };
  }
  
  return error;
}

/**
 * Create a rate limited error with backoff information
 * 
 * @param message User-facing error message
 * @param retryAfterSeconds Seconds to wait before retrying
 */
export function createRateLimitedError(
  message = 'Too many requests. Please try again later.',
  retryAfterSeconds?: number
): Error {
  const error = new Error(message);
  error.name = 'RateLimitError';
  (error as any).category = string.OPERATIONAL;
  (error as any).userFacing = true;
  (error as any).code = ErrorCode.RATE_LIMITED;
  (error as any).retryable = true;
  (error as any).recoverable = true;
  (error as any).suggestedAction = suggestedActions[ErrorCode.RATE_LIMITED];
  
  if (retryAfterSeconds) {
    (error as any).details = {
      retryAfterSeconds,
      retryAfter: new Date(Date.now() + retryAfterSeconds * 1000).toISOString()
    };
  }
  
  return error;
}

/**
 * Create a timeout error with retry configuration
 * 
 * @param message User-facing error message
 * @param operation Description of the operation that timed out
 */
export function createTimeoutError(
  message = 'The request timed out. Please try again.',
  operation?: string
): Error {
  const error = new Error(message);
  error.name = 'TimeoutError';
  (error as any).category = string.OPERATIONAL;
  (error as any).userFacing = true;
  (error as any).code = ErrorCode.TIMEOUT;
  (error as any).retryable = true;
  (error as any).recoverable = true;
  (error as any).suggestedAction = suggestedActions[ErrorCode.TIMEOUT];
  
  if (operation) {
    (error as any).details = {
      operation,
      timestamp: new Date().toISOString()
    };
  }
  
  return error;
}

/**
 * Extract correlation ID from various potential header sources
 * 
 * @param req Next.js request object
 * @returns Correlation ID if found, undefined otherwise
 */
export function extractCorrelationId(req: NextApiRequest): string | undefined {
  return (
    req.headers['x-correlation-id'] as string ||
    req.headers['x-request-id'] as string ||
    req.headers['traceparent'] as string || // W3C Trace Context
    undefined
  );
}

/**
 * Remove sensitive information from request headers
 * 
 * @param headers Request headers object
 * @returns Sanitized headers object
 */
export function sanitizeHeaders(headers: Record<string, unknown>): Record<string, unknown> {
  const sanitized = { ...headers };
  const sensitiveHeaderPatterns = [
    'authorization', 
    'cookie', 
    'set-cookie',
    'api-key',
    'key',
    'secret',
    'token',
    'password',
    'credential',
    'oauth'
  ];
  
  for (const key of Object.keys(sanitized)) {
    if (sensitiveHeaderPatterns.some(pattern => key.toLowerCase().includes(pattern))) {
      sanitized[key] = '[REDACTED]';
    }
  }
  
  return sanitized;
}

/**
 * Sanitize request body to remove sensitive information
 * 
 * @param body Request body
 * @returns Sanitized request body
 */
export function sanitizeRequestBody(body: any): any {
  if (!body || typeof body !== 'object') {
    return body;
  }
  
  // Create a deep copy to avoid modifying the original
  const sanitized = JSON.parse(JSON.stringify(body));
  const sensitiveFieldPatterns = [
    'password', 
    'secret', 
    'token', 
    'key', 
    'credential',
    'auth',
    'apiKey',
    'private',
    'seed',
    'mnemonic'
  ];
  
  // Recursively sanitize the object
  function sanitizeObject(obj: any) {
    if (!obj || typeof obj !== 'object') {
      return;
    }
    
    for (const key of Object.keys(obj)) {
      if (sensitiveFieldPatterns.some(pattern => key.toLowerCase().includes(pattern))) {
        obj[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object') {
        sanitizeObject(obj[key]);
      }
    }
  }
  
  sanitizeObject(sanitized);
  return sanitized;
}

/**
 * Execute a function with automatic retry on failure
 * 
 * @param fn Function to execute
 * @param options Retry options
 * @returns Promise resolving to function result
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: any
): Promise<T> {
  return console.withRetry(fn, options);
}

/**
 * Create a wrapped API route handler with error handling
 * 
 * @param handler API route handler function
 * @param component Component name for error reporting
 * @returns Wrapped handler with error handling
 */
export function withErrorHandling(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<any>,
  component = 'api'
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      return await handler(req, res);
    } catch (error) {
      handleApiRouteError(error, req, res, component);
    }
  };
}