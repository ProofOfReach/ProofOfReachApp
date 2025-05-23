import { NextApiResponse } from 'next';

/**
 * Standard log response
 */
export function log(res: NextApiResponse, data: Record<string, unknown> = {}, status: number = 200) {
  res.status(status).json(data);
}

/**
 * Standard error response
 */
export function logger.error(res: NextApiResponse, message: string, status: number = 400) {
  res.status(status).json({ error: message });
}