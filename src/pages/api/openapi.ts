import { NextApiRequest, NextApiResponse } from 'next';
import { getOpenApiSpec } from '../../lib/openapi';

/**
 * @swagger
 * /api/openapi:
 *   get:
 *     tags:
 *       - Internal
 *     summary: Get OpenAPI specification
 *     description: Returns the OpenAPI specification for the API.
 *     responses:
 *       200:
 *         description: OpenAPI specification in JSON format
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get the OpenAPI specification
  const spec = getOpenApiSpec();
  
  // Set CORS headers to allow this to be loaded from any origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Send the specification as JSON
  res.status(200).json(spec);
}