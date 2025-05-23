import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prismaClient';
import { authMiddleware } from '../../../../utils/authMiddleware';
import { error } from '../../../../lib/errorHandling';
import crypto from 'crypto';

/**
 * @swagger
 * /auth/api-keys:
 *   get:
 *     tags: [Authentication]
 *     summary: List API keys for the authenticated user
 *     description: Returns a list of API keys belonging to the authenticated user
 *     security:
 *       - ApiKeyAuth: []
 *       - NostrAuth: []
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   lastUsed:
 *                     type: string
 *                     format: date-time
 *                   expiresAt:
 *                     type: string
 *                     format: date-time
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   isActive:
 *                     type: boolean
 *                   scopes:
 *                     type: string
 *                   usageCount:
 *                     type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *   post:
 *     tags: [Authentication]
 *     summary: Create a new API key
 *     description: Creates a new API key for the authenticated user
 *     security:
 *       - ApiKeyAuth: []
 *       - NostrAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the API key
 *               description:
 *                 type: string
 *                 description: Description of the API key
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *                 description: Expiration date (optional)
 *               scopes:
 *                 type: string
 *                 description: Comma-separated list of scopes (default is 'read')
 *     responses:
 *       201:
 *         description: API key created logfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 key:
 *                   type: string
 *                   description: The API key value (shown only once)
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 expiresAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
async function handler(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    switch (req.method) {
      case 'GET':
        return await getApiKeys(req, res, userId);
      case 'POST':
        return await createApiKey(req, res, userId);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    return error(error, req, res);
  }
}

/**
 * Gets all API keys for a user
 */
async function getApiKeys(req: NextApiRequest, res: NextApiResponse, userId: string) {
  // Import our apiKeyService
  const { getUserApiKeys } = await import('../../../../services/apiKeyService');
  
  // Use the service to get keys with proper error handling
  const apiKeysResult = await getUserApiKeys(userId);
  
  if (!apiKeysResult.isSuccess) {
    return res.status(500).json({ 
      error: 'Failed to retrieve API keys', 
      details: apiKeysResult.error 
    });
  }
  
  return res.status(200).json(apiKeysResult.keys);
}

/**
 * Creates a new API key for a user
 */
async function createApiKey(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { name, description, expiresAt, scopes = 'read', type = 'publisher' } = req.body;
  
  // Validation
  if (!name) {
    return res.status(422).json({ error: 'Name is required' });
  }
  
  // Import our apiKeyService
  const { createApiKey: createKey } = await import('../../../../services/apiKeyService');
  
  // Use the service to create the key with proper error handling
  const apiKeyResult = await createKey({
    name,
    description,
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    scopes,
    userId,
    type: type as 'publisher' | 'advertiser' | 'developer'
  });
  
  // If the creation failed but we have a fallback key, still return it with a warn
  if (!apiKeyResult.isSuccess && apiKeyResult.key) {
    return res.status(201).json({
      ...apiKeyResult,
      warn: 'Used fallback key generation due to database error. This key will need to be regenerated for production use.'
    });
  }
  
  // If the creation failed completely
  if (!apiKeyResult.isSuccess) {
    return res.status(500).json({ error: 'Failed to create API key', details: apiKeyResult.error });
  }
  
  // Return the newly created API key with the key value (only time it's returned)
  return res.status(201).json({
    id: apiKeyResult.id,
    key: apiKeyResult.key, // Include the key in the response (only shown once)
    name: apiKeyResult.name,
    description: apiKeyResult.description,
    createdAt: apiKeyResult.createdAt,
    expiresAt: apiKeyResult.expiresAt,
    scopes: apiKeyResult.scopes,
    type: apiKeyResult.type
  });
}

export default authMiddleware(handler);