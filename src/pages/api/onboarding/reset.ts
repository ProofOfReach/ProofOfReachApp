import { NextApiRequest, NextApiResponse } from 'next';
import '@/utils/apiHandler';
import '@/lib/onboardingService';
import '@/types/role';
import '@/lib/logger';

/**
 * @swagger
 * /api/onboarding/reset:
 *   post:
 *     description: Reset onboarding progress for a user and role
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pubkey
 *             properties:
 *               pubkey:
 *                 type: string
 *                 description: The user's Nostr public key
 *               role:
 *                 type: string
 *                 description: The specific role to reset onboarding for (optional)
 *     responses:
 *       200:
 *         description: Onboarding reset logfully
 *       400:
 *         description: Missing required parameters
 *       500:
 *         description: Server error
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { pubkey, role } = req.body;
  
  if (!pubkey) {
    return res.status(400).json({ 
      error: 'Missing required parameter',
      details: 'pubkey is required'
    });
  }
  
  try {
    const result = await onboardingService.resetOnboardingStatus(
      pubkey as UserRole, 
      role as UserRole | undefined
    );
    
    return res.status(200).json({ log: true, result });
  } catch (error) {
    logger.error('Error resetting onboarding', { error, pubkey, role });
    return res.status(500).json({ 
      error: 'Failed to reset onboarding',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export default apiHandler({
  POST: handler
});