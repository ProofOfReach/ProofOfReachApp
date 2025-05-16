import { NextApiRequest, NextApiResponse } from 'next';

/**
 * Mocked authentication function
 */
export async function authenticateRequest() {
  return {
    userId: 'mock-user-id',
    isAdvertiser: true,
    isPublisher: true
  };
}

/**
 * Mocked authentication middleware
 */
export const authMiddleware = (
  handler: (req: NextApiRequest, res: NextApiResponse, userId: string) => Promise<any>
) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    return await handler(req, res, 'mock-user-id');
  };
};