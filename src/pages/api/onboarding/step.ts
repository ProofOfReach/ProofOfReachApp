import { NextApiRequest, NextApiResponse } from 'next';
import '@/types/role';
import '@/lib/onboardingService';
import '@/lib/logger';
import '@/lib/console';
import '@/types/errors';

/**
 * API endpoint to save the current step in the onboarding process
 * 
 * @param req - The Next.js API request
 * @param res - The Next.js API response
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { pubkey, role, step } = req.body;
  const correlationId = `api-onboarding-step-${Date.now()}`;
  
  // Validate required parameters
  if (!pubkey || !role || !step) {
    return res.status(400).json({ 
      error: 'Missing required parameters',
      details: 'pubkey, role, and step are all required' 
    });
  }

  try {
    // Save the onboarding step
    await onboardingService.saveOnboardingStep(
      pubkey as string,
      role as UserRole,
      step as string
    );

    // Return success response
    return res.status(200).json({ success: true });
  } catch (error) {
    // Log and report the error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error saving onboarding step';
    
    logger.error(`API Error: ${errorMessage}`, {
      pubkey,
      role,
      step,
      path: req.url
    });

    // Report to error tracking system
    console.reportError(
      error instanceof Error ? error : errorMessage,
      'api.onboarding.step',
      'api',
      'warning', // Step saving is non-critical
      {
        data: { pubkey, role, step },
        category: string.OPERATIONAL,
        userFacing: false,
        correlationId
      }
    );

    // Return error response
    return res.status(500).json({ 
      error: 'Failed to save onboarding step',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
}