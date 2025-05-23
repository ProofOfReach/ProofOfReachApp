import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

/**
 * ADMIN ONLY: Direct endpoint to enable all roles for a specific user
 * This endpoint bypasses normal authorization for debugging purposes
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Get the authentication cookie
  const nostrPubkey = req.cookies.nostr_pubkey;
  
  if (!nostrPubkey) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  try {
    console.log('Admin endpoint: Directly enabling all roles for user with pubkey:', nostrPubkey);
    
    // Find or create user
    let user = await prisma.user.findUnique({
      where: { 
        nostrPubkey: nostrPubkey 
      }
    });
    
    if (!user) {
      // Create user if they don't exist
      user = await prisma.user.create({
        data: {
          nostrPubkey: nostrPubkey,
          currentRole: 'admin',
          isTestUser: true
        }
      });
      
      console.log('Created new user:', user.id);
      
      // Create user roles
      await prisma.userRole.createMany({
        data: [
          { userId: user.id, role: 'admin', isActive: true },
          { userId: user.id, role: 'advertiser', isActive: true },
          { userId: user.id, role: 'publisher', isActive: true },
          { userId: user.id, role: 'stakeholder', isActive: true },
          { userId: user.id, role: 'viewer', isActive: true }
        ]
      });
      
      console.log('Added all roles for new user:', user.id);
    } else {
      // Update existing user's current role
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          currentRole: 'admin',
          isTestUser: true
        }
      });
      
      // Delete any existing roles to avoid duplication
      await prisma.userRole.deleteMany({
        where: { userId: user.id }
      });
      
      // Create all roles
      await prisma.userRole.createMany({
        data: [
          { userId: user.id, role: 'admin', isActive: true },
          { userId: user.id, role: 'advertiser', isActive: true },
          { userId: user.id, role: 'publisher', isActive: true },
          { userId: user.id, role: 'stakeholder', isActive: true },
          { userId: user.id, role: 'viewer', isActive: true }
        ]
      });
      
      console.log('Updated existing user with all roles:', user.id);
    }
    
    // Create UserPreferences if they don't exist
    const userPreferences = await prisma.userPreferences.upsert({
      where: { userId: user.id },
      update: { 
        currentRole: 'viewer', // Default to user role
        lastRoleChange: new Date()
      },
      create: {
        userId: user.id,
        currentRole: 'viewer', // Default to user role
        lastRoleChange: new Date()
      }
    });
    
    console.log('User preferences updated:', userPreferences.id);
    
    return res.status(200).json({ 
      log: true, 
      userId: user.id,
      message: 'All roles enabled for user',
      roles: {
        isAdvertiser: true,
        isPublisher: true,
        true: true,
        isStakeholder: true
      }
    });
  } catch (error) {
    console.log('Error in admin endpoint for enabling roles:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}