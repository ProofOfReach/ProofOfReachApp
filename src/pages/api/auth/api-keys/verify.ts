import { NextApiRequest, NextApiResponse } from 'next';
import { requireAuth } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prismaClient';
import { error } from '../../../../lib/errorHandling';

/**
 * @swagger
 * /auth/api-keys/verify:
 *   get:
 *     tags: [Authentication]
 *     summary: Verify API key
 *     description: Verifies if an API key is valid and returns its details
 *     security:
 *       - ApiKeyAuth: []
 *       - NostrAuth: []
 *     responses:
 *       200:
 *         description: API key is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   description: Whether the API key is valid
 *                 keyId:
 *                   type: string
 *                   description: The API key ID
 *                 scopes:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: The scopes associated with the API key
 *                 userId:
 *                   type: string
 *                   description: The user ID associated with the API key (if any)
 *       401:
 *         description: Invalid or missing API key
 *       500:
 *         description: Server error
 */
async function handleApiKeyVerify(req: NextApiRequest, res: NextApiResponse, pubkey: UserRole, userId: string) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
    // Check if the API key exists in the Authorization header
    const apiKeyValue = req.headers.authorization?.replace('Bearer ', '');
    
    if (!apiKeyValue) {
      return res.status(401).json({ error: 'API key is required' });
    }
    
    // Lookup the API key
    const apiKey = await prisma.$queryRaw`
      SELECT id, "userId", scopes, "isActive", "expiresAt"
      FROM "ApiKey"
      WHERE key = ${apiKeyValue}
      LIMIT 1
    `;
    
    const apiKeyData = Array.isArray(apiKey) && apiKey.length > 0 ? apiKey[0] : null;
    
    if (!apiKeyData) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    
    // Check if the API key is active and not expired
    const now = new Date();
    const isExpired = apiKeyData.expiresAt && new Date(apiKeyData.expiresAt) < now;
    
    if (!apiKeyData.isActive || isExpired) {
      return res.status(401).json({ error: 'API key is inactive or expired' });
    }
    
    // API key is valid, return its details
    const scopes = apiKeyData.scopes ? apiKeyData.scopes.split(',') : [];
    
    // Update the lastUsed timestamp
    await prisma.$executeRaw`
      UPDATE "ApiKey"
      SET "lastUsed" = ${now}, "usageCount" = "usageCount" + 1
      WHERE id = ${apiKeyData.id}
    `;
    
    return res.status(200).json({
      valid: true,
      keyId: apiKeyData.id,
      scopes,
      userId: apiKeyData.userId,
    });
  } catch (error) {
    return error(error, req, res);
  }
}

export default requireAuth(handleApiKeyVerify);