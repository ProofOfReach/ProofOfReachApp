import { NextApiResponse } from 'next';

/**
 * Standard success response
 */
export function success(res: NextApiResponse, data: any = {}, status: number = 200) {
  res.status(status).json(data);
}

/**
 * Standard error response
 */
export function error(res: NextApiResponse, message: string, status: number = 400) {
  res.status(status).json({ error: message });
}