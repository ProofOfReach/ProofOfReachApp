import { NextApiRequest, NextApiResponse } from 'next';
import '@/utils/apiHandler';
import '@/lib/onboardingService';
import '@/types/role';
import '@/lib/logger';

/**
 * @swagger
 * /api/onboarding/status:
 *   get:
 *     description: Get onboarding status for a user and role
 *     parameters:
 *       - in: query
 *         name: pubkey
 *         required: true
 *         schema:
 *           type: string
 *         description: The user's Nostr public key
 *       - in: query
 *         name: role
 *         required: true
 *         schema:
 *           type: string
 *         description: The role to check onboarding status for
 *     responses:
 *       200:
 *         description: Onboarding status retrieved logfully
 *       400:
 *         description: Missing required parameters
 *       500:
 *         description: Server error
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { pubkey, role } = req.query;
  
  if (!pubkey || !role) {
    return res.status(400).json({ 
      error: 'Missing required parameters',
      details: 'Both pubkey and role are required'
    });
  }
  
  try {
    // Check if onboarding is complete for this user/role
    const isComplete = await onboardingService.isOnboardingComplete(
      pubkey as string, 
      role as UserRole
    );
    
    // Create a status object to return to the client
    const status = {
      isComplete,
      currentStep: null, // Simplified for now
      lastStep: null     // Simplified for now
    };
    
    return res.status(200).json(status);
  } catch (error) {
    logger.error('Error getting onboarding status', { error, pubkey, role });
    return res.status(500).json({ 
      error: 'Failed to get onboarding status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export default apiHandler({
  GET: handler
});