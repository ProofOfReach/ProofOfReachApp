import { NextApiRequest, NextApiResponse } from 'next';
import { UserRoleType } from '@/types/role';
import onboardingService from '@/lib/onboardingService';
import { logger } from '@/lib/logger';
import { errorService } from '@/lib/errorService';
import { ErrorCategory } from '@/types/errors';

/**
 * API endpoint to mark onboarding as complete for a user and role
 * 
 * @param req - The Next.js API request
 * @param res - The Next.js API response
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { pubkey, role } = req.body;
  const correlationId = `api-onboarding-complete-${Date.now()}`;
  
  // Validate required parameters
  if (!pubkey || !role) {
    return res.status(400).json({ 
      error: 'Missing required parameters',
      details: 'Both pubkey and role are required in the request body' 
    });
  }

  try {
    // Mark onboarding as complete
    await onboardingService.markOnboardingComplete(
      pubkey as string,
      role as UserRoleType
    );

    // Return success response
    return res.status(200).json({ success: true });
  } catch (error) {
    // Log and report the error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error marking onboarding complete';
    
    logger.error(`API Error: ${errorMessage}`, {
      pubkey,
      role,
      path: req.url
    });

    // Report to error tracking system
    errorService.reportError(
      error instanceof Error ? error : errorMessage,
      'api.onboarding.complete',
      'api',
      'error',
      {
        data: { pubkey, role },
        category: ErrorCategory.OPERATIONAL,
        userFacing: false,
        correlationId
      }
    );

    // Return error response
    return res.status(500).json({ 
      error: 'Failed to mark onboarding complete',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
}