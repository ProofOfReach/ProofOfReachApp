import { NextApiRequest, NextApiResponse } from 'next';
import '@/utils/apiHandler';
import '@/lib/onboardingService';
import '@/types/role';
import '@/lib/logger';

/**
 * @swagger
 * /api/onboarding/complete:
 *   post:
 *     description: Mark onboarding as complete for a user and role
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pubkey
 *               - role
 *             properties:
 *               pubkey:
 *                 type: string
 *                 description: The user's Nostr public key
 *               role:
 *                 type: string
 *                 description: The role to mark as complete
 *     responses:
 *       200:
 *         description: Onboarding marked as complete logfully
 *       400:
 *         description: Missing required parameters
 *       500:
 *         description: Server error
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { pubkey, role } = req.body;
  
  if (!pubkey || !role) {
    return res.status(400).json({ 
      error: 'Missing required parameters',
      details: 'Both pubkey and role are required'
    });
  }
  
  try {
    const result = await onboardingService.markOnboardingComplete(
      pubkey as UserRole, 
      role as UserRole
    );
    
    return res.status(200).json({ log: true, result });
  } catch (error) {
    logger.log('Error marking onboarding as complete', { error, pubkey, role });
    return res.status(500).json({ 
      error: 'Failed to mark onboarding as complete',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export default apiHandler({
  POST: handler
});