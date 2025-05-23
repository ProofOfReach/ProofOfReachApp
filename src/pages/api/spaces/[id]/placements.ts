import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prismaClient';
import { requireAuth } from '../../../../lib/auth';
import { logger } from '../../../../lib/logger';

async function handlePlacements(req: NextApiRequest, res: NextApiResponse, pubkey: string, userId: string) {
  try {
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id } = req.query;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Space ID is required' });
    }

    // Get the space to verify ownership
    const space = await prisma.adSpace.findUnique({
      where: { id },
      select: { publisherId: true }
    });

    if (!space) {
      return res.status(404).json({ error: 'Ad space not found' });
    }

    // Verify the space belongs to the user
    if (space.publisherId !== userId) {
      return res.status(403).json({ error: 'Unauthorized. You do not own this space' });
    }

    // Get all placements for this space
    const placements = await prisma.adPlacement.findMany({
      where: { spaceId: id },
      include: {
        ad: {
          select: {
            id: true,
            title: true,
            description: true,
            imageUrl: true,
            targetUrl: true,
            bidPerImpression: true,
            bidPerClick: true,
            status: true,
            advertiser: {
              select: {
                id: true,
                nostrPubkey: true
              }
            }
          }
        }
      },
      orderBy: [
        { approvalStatus: 'asc' }, // PENDING, APPROVED, REJECTED
        { createdAt: 'desc' }
      ]
    });

    return res.status(200).json(placements);
  } catch (error) {
    logger.logger.error('Error fetching placements:', error);
    return res.status(500).json({ error: 'Failed to fetch placements' });
  }
}

export default requireAuth(handlePlacements);