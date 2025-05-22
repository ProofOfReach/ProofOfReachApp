import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prismaClient';
import { requireAuth } from '../../../lib/auth';

async function getPreferences(req: NextApiRequest, res: NextApiResponse, pubkey: string) {
  try {
    // Get user from pubkey
    const user = await prisma.user.findUnique({
      where: { nostrPubkey: pubkey },
      include: { preferences: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.preferences) {
      // Create default preferences if they don't exist
      const preferences = await prisma.userPreferences.create({
        data: {
          userId: user.id,
          shareLocation: false,
          shareInterests: false,
          shareBrowsing: false,
          shareAge: false
        }
      });
      
      return res.status(200).json(preferences);
    }

    return res.status(200).json(user.preferences);
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return res.status(500).json({ error: 'Failed to fetch user preferences' });
  }
}

async function updatePreferences(req: NextApiRequest, res: NextApiResponse, pubkey: string) {
  try {
    const { shareLocation, shareInterests, shareBrowsing, shareAge } = req.body;

    // Get user from pubkey
    const user = await prisma.user.findUnique({
      where: { nostrPubkey: pubkey },
      include: { preferences: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let preferences;

    if (!user.preferences) {
      // Create preferences if they don't exist
      preferences = await prisma.userPreferences.create({
        data: {
          userId: user.id,
          shareLocation: shareLocation || false,
          shareInterests: shareInterests || false,
          shareBrowsing: shareBrowsing || false,
          shareAge: shareAge || false
        }
      });
    } else {
      // Update existing preferences
      preferences = await prisma.userPreferences.update({
        where: { id: user.preferences.id },
        data: {
          shareLocation: shareLocation !== undefined ? shareLocation : user.preferences.shareLocation,
          shareInterests: shareInterests !== undefined ? shareInterests : user.preferences.shareInterests,
          shareBrowsing: shareBrowsing !== undefined ? shareBrowsing : user.preferences.shareBrowsing,
          shareAge: shareAge !== undefined ? shareAge : user.preferences.shareAge
        }
      });
    }

    return res.status(200).json(preferences);
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return res.status(500).json({ error: 'Failed to update user preferences' });
  }
}

// Process API requests with auth middleware
const handleRequest = async (req: NextApiRequest, res: NextApiResponse, pubkey: string, userId: string) => {
  if (req.method === 'GET') {
    return getPreferences(req, res, pubkey);
  } else if (req.method === 'PUT' || req.method === 'PATCH') {
    return updatePreferences(req, res, pubkey);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
};

// Export with auth middleware
export default requireAuth(handleRequest);
