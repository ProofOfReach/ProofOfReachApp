/**
 * Custom API error class for handling HTTP errors
 * 
 * Use this for consistent error handling across API endpoints
 * Each error has a status code and message that will be returned to the client
 */
export class ApiError extends Error {
  statusCode: number;
  
  constructor(statusCode: number, message?: string) {
    // If no message is provided, use default message for the status code
    const errorMessage = message || getDefaultErrorMessage(statusCode);
    
    super(errorMessage);
    this.statusCode = statusCode;
    this.name = 'ApiError';
    
    // Ensures 'instanceof' works properly in TypeScript
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Get default error message for common HTTP status codes
 */
function getDefaultErrorMessage(statusCode: number): string {
  switch (statusCode) {
    case 400:
      return 'Bad request';
    case 401:
      return 'Unauthorized';
    case 403:
      return 'Forbidden';
    case 404:
      return 'Resource not found';
    case 409:
      return 'Conflict';
    case 422:
      return 'Unprocessable entity';
    case 429:
      return 'Too many requests';
    case 500:
      return 'Internal server error';
    case 502:
      return 'Bad gateway';
    case 503:
      return 'Service unavailable';
    default:
      return `Error with status code ${statusCode}`;
  }
}