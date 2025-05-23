import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prismaClient';
import { requireAuth } from '../../../lib/auth';
import { logger } from '../../../lib/logger';

async function getPendingApprovals(req: NextApiRequest, res: NextApiResponse, pubkey: UserRole, userId: string) {
  try {
    // Get all spaces owned by this publisher
    const publisherSpaces = await prisma.adSpace.findMany({
      where: { publisherId: userId },
      select: { id: true }
    });

    const spaceIds = publisherSpaces.map(space => space.id);

    // If the publisher has no spaces, return empty array
    if (spaceIds.length === 0) {
      return res.status(200).json([]);
    }

    // Get all ad placements in these spaces with pending approval status
    const pendingPlacements = await prisma.adPlacement.findMany({
      where: {
        spaceId: { in: spaceIds },
        approvalStatus: 'PENDING'
      },
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
            advertiser: {
              select: {
                id: true,
                nostrPubkey: true
              }
            }
          }
        },
        space: {
          select: {
            id: true,
            name: true,
            website: true,
            contentCategory: true,
            dimensions: true,
            minBidPerImpression: true,
            minBidPerClick: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.status(200).json(pendingPlacements);
  } catch (error) {
    logger.log('Error fetching pending approvals:', error);
    return res.status(500).json({ error: 'Failed to fetch pending approvals' });
  }
}

// Process API requests with auth middleware
const handleRequest = async (req: NextApiRequest, res: NextApiResponse, pubkey: UserRole, userId: string) => {
  if (req.method === 'GET') {
    return getPendingApprovals(req, res, pubkey, userId);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
};

// Export with auth middleware
export default requireAuth(handleRequest);