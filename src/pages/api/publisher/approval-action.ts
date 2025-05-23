import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prismaClient';
import { requireAuth } from '../../../lib/auth';
import { logger } from '../../../lib/logger';

async function handleApprovalAction(req: NextApiRequest, res: NextApiResponse, pubkey: UserRole, userId: string) {
  try {
    const { placementId, action } = req.body;
    
    if (!placementId || !action) {
      return res.status(400).json({ error: 'Placement ID and action are required' });
    }

    if (action !== 'approve' && action !== 'reject') {
      return res.status(400).json({ error: 'Invalid action. Must be "approve" or "reject"' });
    }

    // Get the placement and verify that the user is the publisher of the space
    const placement = await prisma.adPlacement.findUnique({
      where: { id: placementId },
      include: {
        space: {
          select: {
            publisherId: true
          }
        },
        ad: {
          select: {
            id: true,
            title: true,
            status: true
          }
        }
      }
    });

    if (!placement) {
      return res.status(404).json({ error: 'Ad placement not found' });
    }

    // Verify that the authenticated user is the publisher of the space
    if (placement.space.publisherId !== userId) {
      return res.status(403).json({ error: 'Unauthorized. You are not the publisher of this ad space' });
    }

    // Update the placement approval status
    const updatedPlacement = await prisma.adPlacement.update({
      where: { id: placementId },
      data: {
        approvalStatus: action === 'approve' ? 'APPROVED' : 'REJECTED',
        approvedAt: action === 'approve' ? new Date() : null
      }
    });

    // Update the ad status if all placements are approved or rejected
    // Get all placements for the ad
    const adPlacements = await prisma.adPlacement.findMany({
      where: { adId: placement.ad.id },
      select: { approvalStatus: true }
    });

    // If any placement is approved and the ad status is PENDING, change it to ACTIVE
    if (action === 'approve' && placement.ad.status === 'PENDING') {
      const hasApproved = adPlacements.some(p => p.approvalStatus === 'APPROVED');
      if (hasApproved) {
        await prisma.ad.update({
          where: { id: placement.ad.id },
          data: { status: 'ACTIVE' }
        });
      }
    }

    return res.status(200).json({
      log: true,
      message: `Ad ${action === 'approve' ? 'approved' : 'rejected'} logfully`,
      placement: updatedPlacement
    });
  } catch (error) {
    logger.error(`Error handling approval action:`, error);
    return res.status(500).json({ error: 'Failed to process approval action' });
  }
}

// Process API requests with auth middleware
const handleRequest = async (req: NextApiRequest, res: NextApiResponse, pubkey: UserRole, userId: string) => {
  if (req.method === 'POST') {
    return handleApprovalAction(req, res, pubkey, userId);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
};

// Export with auth middleware
export default requireAuth(handleRequest);