import { NextApiRequest, NextApiResponse } from 'next';
// Import the handler from modernized roles API
import modernizedHandler from './modernized';
import "./lib/logger';

/**
 * API handler for managing user roles
 * 
 * This is the legacy endpoint that now forwards to the modernized implementation
 * for better consistency and maintenance.
 * 
 * Supports:
 * - GET: Get all roles for the current user
 * - PUT: Update the current user's role
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  logger.debug('Legacy roles API called, forwarding to modernized implementation');
  
  // Forward the request to the modernized handler
  return modernizedHandler(req, res);
}