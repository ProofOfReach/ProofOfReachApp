import { NextApiRequest, NextApiResponse } from 'next';
import { UserRoleType } from '@/types/role';
import onboardingService from '@/lib/onboardingService';
import { logger } from '@/lib/logger';
import { errorService } from '@/lib/errorService';
import { ErrorCategory } from '@/types/errors';

/**
 * API endpoint to check onboarding status for a user and role
 * 
 * @param req - The Next.js API request
 * @param res - The Next.js API response
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { pubkey, role } = req.query;
  const correlationId = `api-onboarding-status-${Date.now()}`;
  
  // Validate required parameters
  if (!pubkey || !role) {
    return res.status(400).json({ 
      error: 'Missing required parameters',
      details: 'Both pubkey and role are required' 
    });
  }

  try {
    // Check onboarding status
    const isComplete = await onboardingService.isOnboardingComplete(
      pubkey as string,
      role as UserRoleType
    );

    // Return the status
    return res.status(200).json({ isComplete });
  } catch (error) {
    // Log and report the error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error checking onboarding status';
    
    logger.error(`API Error: ${errorMessage}`, {
      pubkey,
      role,
      path: req.url
    });

    // Report to error tracking system
    errorService.reportError(
      error instanceof Error ? error : errorMessage,
      'api.onboarding.status',
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
      error: 'Failed to check onboarding status',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
}