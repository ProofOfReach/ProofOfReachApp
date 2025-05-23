import { NextApiRequest, NextApiResponse } from 'next';
import '@/utils/apiHandler';
import '@/lib/onboardingService';
import '@/types/role';
import '@/lib/logger';

/**
 * @swagger
 * /api/onboarding/progress:
 *   post:
 *     description: Update onboarding progress for a user and role
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
 *                 description: The role to update onboarding progress for
 *               currentStep:
 *                 type: string
 *                 description: The current step in the onboarding process
 *               lastStep:
 *                 type: string
 *                 description: The last completed step in the onboarding process
 *     responses:
 *       200:
 *         description: Onboarding progress updated successfully
 *       400:
 *         description: Missing required parameters
 *       500:
 *         description: Server error
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { pubkey, role, ...updateData } = req.body;
  
  if (!pubkey || !role) {
    return res.status(400).json({ 
      error: 'Missing required parameters',
      details: 'Both pubkey and role are required'
    });
  }
  
  try {
    // Extract the current step to save
    const { currentStep } = updateData;
    
    if (!currentStep) {
      return res.status(400).json({
        error: 'Missing currentStep parameter',
        details: 'The currentStep parameter is required'
      });
    }
    
    // Save the onboarding step using the server-side method
    const result = await onboardingService.saveOnboardingStep(
      pubkey as string, 
      role as UserRole,
      currentStep as string
    );
    
    return res.status(200).json(result);
  } catch (error) {
    logger.error('Error updating onboarding progress', { error, pubkey, role });
    return res.status(500).json({ 
      error: 'Failed to update onboarding progress',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export default apiHandler({
  POST: handler
});