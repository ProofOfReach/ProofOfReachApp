import { NextApiRequest, NextApiResponse } from 'next';
import { ApiError } from './apiError';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

type ApiHandler = {
  [key in HttpMethod]?: (
    req: NextApiRequest,
    res: NextApiResponse
  ) => Promise<unknown>;
};

/**
 * API handler wrapper to handle API requests and errors
 */
export function apiHandler(handler: ApiHandler) {
  return async function (req: NextApiRequest, res: NextApiResponse) {
    try {
      // Check if the method is allowed
      const method = req.method as HttpMethod;
      
      if (!handler[method]) {
        return res.status(405).json({
          error: `Method ${method} not allowed`,
        });
      }
      
      // Call the handler for the requested method
      return await handler[method]!(req, res);
    } catch (error) {
      console.logger.error('API error:', error);
      
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({
          error: error.message,
        });
      }
      
      // For any other error, return a 500 Internal Server Error
      return res.status(500).json({
        error: 'Internal Server Error',
      });
    }
  };
}