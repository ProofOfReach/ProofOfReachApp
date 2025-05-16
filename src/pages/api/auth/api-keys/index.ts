import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prismaClient';
import { authMiddleware } from '../../../../utils/authMiddleware';
import { handleError } from '../../../../lib/errorHandling';
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
 *         description: API key created successfully
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
    return handleError(error, req, res);
  }
}

/**
 * Gets all API keys for a user
 */
async function getApiKeys(req: NextApiRequest, res: NextApiResponse, userId: string) {
  // Use raw SQL query since we're getting Prisma schema issues
  const apiKeys = await prisma.$queryRaw`
    SELECT id, name, description, "createdAt", "updatedAt", "lastUsed", 
           "expiresAt", "isActive", scopes, "usageCount"
    FROM "ApiKey"
    WHERE "userId" = ${userId}
    ORDER BY "createdAt" DESC
  `;
  
  return res.status(200).json(apiKeys);
}

/**
 * Creates a new API key for a user
 */
async function createApiKey(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { name, description, expiresAt, scopes = 'read' } = req.body;
  
  // Validation
  if (!name) {
    return res.status(422).json({ error: 'Name is required' });
  }
  
  // Generate a unique API key
  const apiKeyValue = `ak_${crypto.randomBytes(16).toString('hex')}`;
  
  // Create the API key in the database using raw SQL
  const createdAt = new Date();
  const expiresAtDate = expiresAt ? new Date(expiresAt) : null;
  
  const result = await prisma.$queryRaw`
    INSERT INTO "ApiKey" (
      id, key, name, description, "expiresAt", scopes, "userId", 
      "createdAt", "updatedAt", "isActive", "usageCount"
    ) VALUES (
      ${crypto.randomUUID()}, ${apiKeyValue}, ${name}, ${description}, ${expiresAtDate}, 
      ${scopes}, ${userId}, ${createdAt}, ${createdAt}, true, 0
    )
    RETURNING id, key, name, description, "createdAt", "expiresAt", scopes
  `;
  
  // The result is an array, get the first (and only) item
  const apiKey = Array.isArray(result) && result.length > 0 ? result[0] : null;
  
  if (!apiKey) {
    return res.status(500).json({ error: 'Failed to create API key' });
  }
  
  // Return the newly created API key with the key value (only time it's returned)
  return res.status(201).json({
    id: apiKey.id,
    key: apiKey.key, // Include the key in the response (only shown once)
    name: apiKey.name,
    description: apiKey.description,
    createdAt: apiKey.createdAt,
    expiresAt: apiKey.expiresAt,
    scopes: apiKey.scopes,
  });
}

export default authMiddleware(handler);