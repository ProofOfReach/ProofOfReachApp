import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';
import { logger } from '../../../lib/logger';

/**
 * API endpoint to enable all roles for a test user
 * This is primarily for development and testing purposes
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Get the pubkey from the request
    const { pubkey } = req.body;
    
    if (!pubkey) {
      return res.status(400).json({ error: 'Missing pubkey' });
    }
    
    // Check if this is a test pubkey
    const isTestPubkey = pubkey.startsWith('pk_test_');
    if (!isTestPubkey) {
      logger.warn(`Attempt to enable test roles for non-test pubkey: ${pubkey}`);
      return res.status(403).json({ error: 'Only test accounts can use this endpoint' });
    }
    
    // Find user by pubkey
    let user = await prisma.user.findUnique({
      where: { nostrPubkey: pubkey },
    });
    
    // If user doesn't exist, create one
    if (!user) {
      // Create the user with basic data
      user = await prisma.user.create({
        data: {
          nostrPubkey: pubkey,
          currentRole: 'admin',
          isTestUser: true
        },
      });
      
      // Create the user roles
      await prisma.userRole.createMany({
        data: [
          { userId: user.id, role: 'admin', isActive: true, isTestRole: true },
          { userId: user.id, role: 'advertiser', isActive: true, isTestRole: true },
          { userId: user.id, role: 'publisher', isActive: true, isTestRole: true },
          { userId: user.id, role: 'stakeholder', isActive: true, isTestRole: true },
          { userId: user.id, role: 'viewer', isActive: true, isTestRole: true }
        ]
      });
      
      logger.log(`Created new test user with ID: ${user.id} and added all roles`);
    } else {
      // Update existing user to have test mode flags
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          isTestUser: true,
          currentRole: 'admin',
          updatedAt: new Date(),
        },
      });
      
      // Delete any existing roles first to avoid duplication
      await prisma.userRole.deleteMany({
        where: { userId: user.id }
      });
      
      // Create new user roles
      await prisma.userRole.createMany({
        data: [
          { userId: user.id, role: 'admin', isActive: true, isTestRole: true },
          { userId: user.id, role: 'advertiser', isActive: true, isTestRole: true },
          { userId: user.id, role: 'publisher', isActive: true, isTestRole: true },
          { userId: user.id, role: 'stakeholder', isActive: true, isTestRole: true },
          { userId: user.id, role: 'viewer', isActive: true, isTestRole: true }
        ]
      });
      
      logger.log(`Updated existing user ${user.id} with all roles`);
    }
    
    // Ensure user preferences exist
    const existingPreferences = await prisma.userPreferences.findUnique({
      where: { userId: user.id },
    });
    
    if (existingPreferences) {
      // Update existing preferences
      await prisma.userPreferences.update({
        where: { userId: user.id },
        data: { 
          currentRole: 'advertiser',
          lastRoleChange: new Date(),
        },
      });
      
      logger.log(`Updated user preferences for ${user.id}`);
    } else {
      // Create new preferences
      await prisma.userPreferences.create({
        data: {
          userId: user.id,
          currentRole: 'advertiser',
          lastRoleChange: new Date(),
          // Default privacy settings
          shareLocation: false,
          shareInterests: false,
          shareBrowsing: false,
          shareAge: false,
        },
      });
      
      logger.log(`Created new user preferences for ${user.id}`);
    }
    
    // Get user roles from the database
    const userRoles = await prisma.userRole.findMany({
      where: { userId: user.id }
    });
    
    // Extract role names
    const roleNames = userRoles.map(role => role.role);
    
    // Return success with user data
    return res.status(200).json({
      success: true,
      message: 'All roles enabled for test user',
      user: {
        id: user.id,
        nostrPubkey: user.nostrPubkey,
        currentRole: user.currentRole,
        isTestUser: user.isTestUser,
        roles: roleNames
      },
    });
  } catch (error) {
    logger.error('Error enabling test roles:', error);
    return res.status(500).json({ 
      error: 'Failed to enable test roles',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}