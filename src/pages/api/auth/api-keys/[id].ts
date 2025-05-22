import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prismaClient';
import { authMiddleware } from '../../../../utils/authMiddleware';
import { handleError } from '../../../../lib/errorHandling';

/**
 * @swagger
 * /auth/api-keys/{id}:
 *   get:
 *     tags: [Authentication]
 *     summary: Get API key details
 *     description: Returns details for a specific API key
 *     security:
 *       - ApiKeyAuth: []
 *       - NostrAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the API key
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 lastUsed:
 *                   type: string
 *                   format: date-time
 *                 expiresAt:
 *                   type: string
 *                   format: date-time
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 isActive:
 *                   type: boolean
 *                 scopes:
 *                   type: string
 *                 usageCount:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: API key not found
 *       500:
 *         description: Server error
 *   patch:
 *     tags: [Authentication]
 *     summary: Update API key
 *     description: Updates an API key (name, description, active status, etc.)
 *     security:
 *       - ApiKeyAuth: []
 *       - NostrAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the API key
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *               scopes:
 *                 type: string
 *     responses:
 *       200:
 *         description: API key updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: API key not found
 *       500:
 *         description: Server error
 *   delete:
 *     tags: [Authentication]
 *     summary: Delete API key
 *     description: Deletes an API key
 *     security:
 *       - ApiKeyAuth: []
 *       - NostrAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the API key
 *     responses:
 *       204:
 *         description: API key deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: API key not found
 *       500:
 *         description: Server error
 */
async function handler(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid API key ID' });
    }
    
    // Check if the API key belongs to the authenticated user using raw SQL
    const result = await prisma.$queryRaw`
      SELECT id FROM "ApiKey" 
      WHERE id = ${id} AND "userId" = ${userId}
      LIMIT 1
    `;
    
    const apiKey = Array.isArray(result) && result.length > 0 ? result[0] : null;
    
    if (!apiKey) {
      return res.status(404).json({ error: 'API key not found' });
    }
    
    switch (req.method) {
      case 'GET':
        return await getApiKey(req, res, apiKey.id);
      case 'PATCH':
        return await updateApiKey(req, res, apiKey.id);
      case 'DELETE':
        return await deleteApiKey(req, res, apiKey.id);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    return handleError(error, req, res);
  }
}

/**
 * Gets details for a specific API key
 */
async function getApiKey(req: NextApiRequest, res: NextApiResponse, apiKeyId: string) {
  // Use raw SQL query
  const result = await prisma.$queryRaw`
    SELECT id, name, description, "createdAt", "updatedAt", 
           "lastUsed", "expiresAt", "isActive", scopes, "usageCount"
    FROM "ApiKey"
    WHERE id = ${apiKeyId}
    LIMIT 1
  `;
  
  const apiKey = Array.isArray(result) && result.length > 0 ? result[0] : null;
  
  if (!apiKey) {
    return res.status(404).json({ error: 'API key not found' });
  }
  
  return res.status(200).json(apiKey);
}

/**
 * Updates an API key
 */
async function updateApiKey(req: NextApiRequest, res: NextApiResponse, apiKeyId: string) {
  const { name, description, isActive, expiresAt, scopes } = req.body;
  
  // Build the SQL SET clause parts conditionally
  const updates = [];
  const params = [];
  
  if (name !== undefined) {
    updates.push(`name = $${params.length + 1}`);
    params.push(name);
  }
  
  if (description !== undefined) {
    updates.push(`description = $${params.length + 1}`);
    params.push(description);
  }
  
  if (isActive !== undefined) {
    updates.push(`"isActive" = $${params.length + 1}`);
    params.push(isActive);
  }
  
  if (expiresAt !== undefined) {
    updates.push(`"expiresAt" = $${params.length + 1}`);
    params.push(expiresAt ? new Date(expiresAt) : null);
  }
  
  if (scopes !== undefined) {
    updates.push(`scopes = $${params.length + 1}`);
    params.push(scopes);
  }
  
  // Always update the updatedAt timestamp
  updates.push(`"updatedAt" = $${params.length + 1}`);
  params.push(new Date());
  
  // Execute the query if we have updates
  if (updates.length === 0) {
    return res.status(400).json({ error: 'No updates provided' });
  }
  
  const updateClause = updates.join(', ');
  
  // Create the SQL query with dynamically built SET clause
  const query = `
    UPDATE "ApiKey" 
    SET ${updateClause}
    WHERE id = $${params.length + 1}
    RETURNING id, name, description, "createdAt", "updatedAt", 
              "lastUsed", "expiresAt", "isActive", scopes, "usageCount"
  `;
  
  // Add the API key ID as the last parameter
  params.push(apiKeyId);
  
  // Execute the query
  const result = await prisma.$queryRawUnsafe(query, ...params);
  
  const updatedApiKey = Array.isArray(result) && result.length > 0 ? result[0] : null;
  
  if (!updatedApiKey) {
    return res.status(404).json({ error: 'API key not found or update failed' });
  }
  
  return res.status(200).json(updatedApiKey);
}

/**
 * Deletes an API key
 */
async function deleteApiKey(req: NextApiRequest, res: NextApiResponse, apiKeyId: string) {
  // Delete using raw SQL
  await prisma.$executeRaw`
    DELETE FROM "ApiKey"
    WHERE id = ${apiKeyId}
  `;
  
  return res.status(204).end();
}

export default authMiddleware(handler);