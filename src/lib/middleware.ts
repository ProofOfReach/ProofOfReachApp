import { NextApiRequest, NextApiResponse } from 'next';

/**
 * A middleware that adds error handling to API routes
 * 
 * @param handler - The API route handler function
 * @returns A wrapped handler function with error handling
 */
export function withErrorHandling(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
      // Call the original handler
      await handler(req, res);
    } catch (error) {
      console.logger.error('API error:', error);
      
      // If headers have already been sent, we can't send another response
      if (res.headersSent) {
        return;
      }

      // Determine appropriate status code based on error type
      let statusCode = 500;
      let errorMessage = 'An unexpected error occurred';
      let errorCode = 'INTERNAL_SERVER_ERROR';
      
      if (error instanceof Error) {
        // Custom error handling based on error type
        if (error.name === 'ValidationError') {
          statusCode = 400;
          errorMessage = error.message;
          errorCode = 'VALIDATION_ERROR';
        } else if (error.name === 'NotFoundError') {
          statusCode = 404;
          errorMessage = error.message;
          errorCode = 'NOT_FOUND';
        } else if (error.name === 'UnauthorizedError') {
          statusCode = 401;
          errorMessage = error.message;
          errorCode = 'UNAUTHORIZED';
        } else if (error.name === 'ForbiddenError') {
          statusCode = 403;
          errorMessage = error.message;
          errorCode = 'FORBIDDEN';
        } else {
          // Use error message if available
          errorMessage = error.message || errorMessage;
        }
      }
      
      // Return error response
      res.status(statusCode).json({
        code: errorCode,
        message: errorMessage
      });
    }
  };
}