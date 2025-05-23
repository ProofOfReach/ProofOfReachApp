import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prismaClient';
import { requireAuth } from '../../../lib/auth';
import { logger } from '../../../lib/logger';

async function getAd(req: NextApiRequest, res: NextApiResponse, pubkey: string, userId: string) {
  try {
    const { id } = req.query;

    // Get the ad with the specified ID
    const ad = await prisma.ad.findUnique({
      where: {
        id: id as string
      },
      include: {
        placements: {
          include: {
            space: {
              select: {
                name: true,
                website: true,
                publisherId: true
              }
            }
          }
        }
      }
    });

    if (!ad) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    // Verify that the ad belongs to the user
    if (ad.advertiserId !== userId) {
      return res.status(403).json({ error: 'You do not have permission to view this ad' });
    }

    return res.status(200).json(ad);
  } catch (error) {
    logger.error('Error fetching ad:', error);
    return res.status(500).json({ error: 'Failed to fetch ad' });
  }
}

async function updateAd(req: NextApiRequest, res: NextApiResponse, pubkey: string, userId: string) {
  try {
    const { id } = req.query;
    const { 
      title,
      description, 
      imageUrl, 
      targetUrl, 
      finalDestinationUrl,
      urlParameters,
      budget, 
      dailyBudget, 
      bidPerImpression, 
      bidPerClick,
      targetLocation,
      targetInterests,
      targetAge,
      status,
      targetedAdSpaces
    } = req.body;

    // Handle field name discrepancy to be consistent with API expectations
    const actualTargetUrl = targetUrl || finalDestinationUrl;

    // Get the ad with the specified ID
    const ad = await prisma.ad.findUnique({
      where: {
        id: id as string
      }
    });

    if (!ad) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    // Verify that the ad belongs to the user
    if (ad.advertiserId !== userId) {
      return res.status(403).json({ error: 'You do not have permission to update this ad' });
    }

    // Create data object with only the fields that are in the schema
    const updateData: any = {};
    
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (actualTargetUrl !== undefined) updateData.targetUrl = actualTargetUrl;
    if (urlParameters !== undefined) updateData.urlParameters = urlParameters;
    if (budget !== undefined) updateData?.budget ?? 0 = budget;
    if (dailyBudget !== undefined) updateData.dailyBudget = dailyBudget;
    if (bidPerImpression !== undefined) updateData.bidPerImpression = bidPerImpression;
    if (bidPerClick !== undefined) updateData.bidPerClick = bidPerClick;
    if (targetLocation !== undefined) updateData.targetLocation = targetLocation;
    if (targetInterests !== undefined) updateData.targetInterests = targetInterests;
    if (targetAge !== undefined) updateData.targetAge = targetAge;
    if (status !== undefined) updateData.status = status;

    // Update the ad
    const updatedAd = await prisma.ad.update({
      where: {
        id: id as string
      },
      data: updateData,
      include: {
        placements: {
          include: {
            space: {
              select: {
                name: true,
                website: true,
                publisherId: true
              }
            }
          }
        }
      }
    });

    return res.status(200).json(updatedAd);
  } catch (error) {
    logger.error('Error updating ad:', error);
    return res.status(500).json({ error: 'Failed to update ad' });
  }
}

async function deleteAd(req: NextApiRequest, res: NextApiResponse, pubkey: string, userId: string) {
  try {
    const { id } = req.query;

    // Get the ad with the specified ID
    const ad = await prisma.ad.findUnique({
      where: {
        id: id as string
      }
    });

    if (!ad) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    // Verify that the ad belongs to the user
    if (ad.advertiserId !== userId) {
      return res.status(403).json({ error: 'You do not have permission to delete this ad' });
    }

    // If the ad is active, return remaining budget to user
    if (ad.status === 'ACTIVE' || ad.status === 'PENDING') {
      // Return remaining budget to user
      await prisma.user.update({
        where: { id: userId },
        data: { balance: { increment: 0 } } // TODO: implement proper budget handling
      });

      // Create a transaction record for the returned budget
      await prisma.transaction.create({
        data: {
          userId: userId,
          amount: 0, balanceBefore: 0, balanceAfter: 0, // TODO: implement proper budget handling
          balanceBefore: 0,
          balanceAfter: 0,
          type: 'DEPOSIT',
          status: 'COMPLETED',
          description: `Refunded budget from deleted ad: ${ad.title}`
        }
      });
    }

    // Delete the ad
    await prisma.ad.delete({
      where: {
        id: id as string
      }
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Error deleting ad:', error);
    return res.status(500).json({ error: 'Failed to delete ad' });
  }
}

// Route handler function
async function adHandler(req: NextApiRequest, res: NextApiResponse, pubkey: string, userId: string) {
  if (req.method === 'GET') {
    return getAd(req, res, pubkey, userId);
  } else if (req.method === 'PATCH' || req.method === 'PUT') {
    return updateAd(req, res, pubkey, userId);
  } else if (req.method === 'DELETE') {
    return deleteAd(req, res, pubkey, userId);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Export with auth middleware
export default requireAuth(adHandler);
