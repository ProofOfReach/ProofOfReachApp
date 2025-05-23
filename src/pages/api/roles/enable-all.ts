import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prismaClient';

/**
 * API endpoint to enable all roles for the current user
 * This is intended for development/testing purposes only and should be disabled in production
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // This endpoint should be disabled in production
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'This endpoint is only available in development mode' });
  }

  // Verify user is authenticated
  // This would be enhanced with proper auth middleware in a real app
  const session = req.cookies?.session;
  if (!session) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    // Extract user ID from session (simplified for demo)
    const userId = req.cookies?.userId || '1';

    // Update user to have admin current role
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        currentRole: 'admin',
        isTestUser: true
      },
    });
    
    // Delete any existing roles to avoid duplication
    await prisma.userRole.deleteMany({
      where: { userId: userId }
    });
    
    // Create all roles
    await prisma.userRole.createMany({
      data: [
        { userId: userId, role: 'admin', isActive: true, isTestRole: true },
        { userId: userId, role: 'advertiser', isActive: true, isTestRole: true },
        { userId: userId, role: 'publisher', isActive: true, isTestRole: true },
        { userId: userId, role: 'stakeholder', isActive: true, isTestRole: true },
        { userId: userId, role: 'viewer', isActive: true, isTestRole: true }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'All roles enabled',
      roles: {
        user: true,
        advertiser: true,
        publisher: true,
        admin: true,
        stakeholder: true,
      },
    });
  } catch (error) {
    console.logger.error('Error enabling all roles:', error);
    return res.status(500).json({ error: 'Failed to enable all roles' });
  }
}