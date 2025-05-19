import { NextApiRequest, NextApiResponse } from 'next';
import { UserRoleType } from '@/types/role';
import onboardingService from '@/lib/onboardingService';
import { logger } from '@/lib/logger';
import { errorService } from '@/lib/errorService';
import { ErrorCategory } from '@/types/errors';

/**
 * API endpoint to reset onboarding status for a user and role
 * 
 * @param req - The Next.js API request
 * @param res - The Next.js API response
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { pubkey, role } = req.query;
  const correlationId = `api-onboarding-reset-${Date.now()}`;
  
  // Validate required parameters
  if (!pubkey) {
    return res.status(400).json({ 
      error: 'Missing required parameters',
      details: 'pubkey is required. Role is optional.' 
    });
  }

  try {
    // Reset onboarding status for specified role or all roles if not provided
    await onboardingService.resetOnboardingStatus(
      pubkey as string,
      role as UserRoleType | undefined
    );

    // Return success response
    return res.status(200).json({ success: true });
  } catch (error) {
    // Log and report the error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error resetting onboarding status';
    
    logger.error(`API Error: ${errorMessage}`, {
      pubkey,
      role,
      path: req.url
    });

    // Report to error tracking system
    errorService.reportError(
      error instanceof Error ? error : errorMessage,
      'api.onboarding.reset',
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
      error: 'Failed to reset onboarding status',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
}