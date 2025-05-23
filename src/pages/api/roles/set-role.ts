import { NextApiRequest, NextApiResponse } from 'next';
import { UserRole } from '../../../context/RoleContext';
import { getCookie } from 'cookies-next';
import { prisma } from '../../../lib/prismaClient';

// Define the API handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the user from the nostr_pubkey cookie or header
    const pubkey = getCookie('nostr_pubkey', { req, res }) as string || 
                 req.headers['x-nostr-pubkey'] as string;
    
    if (!pubkey) {
      return res.status(401).json({ error: 'Unauthorized - No pubkey provided' });
    }
    
    // Get the user from the database
    const user = await prisma.user.findFirst({
      where: { nostrPubkey: pubkey }
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized - User not found' });
    }

    // Get the role from the request body
    const { role } = req.body as { role: UserRole };
    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }

    // Validate the role
    if (!['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if the user has permission for this role
    if (role === 'advertiser' && !user.isAdvertiser) {
      return res.status(403).json({ error: 'User does not have advertiser role' });
    }
    if (role === 'publisher' && !user.isPublisher) {
      return res.status(403).json({ error: 'User does not have publisher role' });
    }
    if (role === 'admin' && !user.isAdmin) {
      return res.status(403).json({ error: 'User does not have admin role' });
    }
    if (role === 'stakeholder' && !user.isStakeholder) {
      return res.status(403).json({ error: 'User does not have stakeholder role' });
    }

    // Get user preferences
    let userPrefs = await prisma.userPreferences.findFirst({
      where: { userId: user.id }
    });

    // Create user preferences if they don't exist
    if (!userPrefs) {
      userPrefs = await prisma.userPreferences.create({
        data: {
          userId: user.id,
          currentRole: role,
          lastRoleChange: new Date(),
          shareLocation: false,
          shareInterests: false,
          shareBrowsing: false,
          shareAge: false,
        }
      });
    } else {
      // Update user preferences
      userPrefs = await prisma.userPreferences.update({
        where: { id: userPrefs.id },
        data: {
          currentRole: role,
          lastRoleChange: new Date(),
        }
      });
    }

    // Special handling for test mode
    const isTestMode = req.cookies.isTestMode === 'true' || 
                      req.cookies.nostr_pubkey?.startsWith('pk_test_');
    
    if (isTestMode) {
      // In test mode, ensure all roles are available
      await prisma.user.update({
        where: { id: user.id },
        data: {
          isAdvertiser: true,
          isPublisher: true,
          isAdmin: true,
          isStakeholder: true,
        }
      });
      
      console.log(`Test mode: Set all roles for user ${user.id}`);
    }

    return res.status(200).json({
      success: true,
      role,
      preferences: userPrefs
    });
  } catch (error) {
    console.error('Error setting role:', error);
    return res.status(500).json({ error: 'Failed to set role' });
  }
}