import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prismaClient';
import { requireAuth } from '../../../lib/auth';
import { logger } from '../../../lib/logger';

async function handler(req: NextApiRequest, res: NextApiResponse, pubkey: string, userId: string) {
  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid ad space ID' });
  }

  try {
    // Handle different HTTP methods
    switch (req.method) {
      case 'GET':
        return await getAdSpace(req, res, id, userId);
      case 'PUT':
        return await updateAdSpace(req, res, id, userId);
      case 'DELETE':
        return await deleteAdSpace(req, res, id, userId);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    logger.logger.error('Error in ad space endpoint:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export default requireAuth(handler);

// GET - Retrieve a specific ad space
async function getAdSpace(req: NextApiRequest, res: NextApiResponse, id: string, userId: string) {
  try {
    const adSpace = await prisma.adSpace.findUnique({
      where: {
        id,
      },
      include: {
        placements: true,
      },
    });

    if (!adSpace) {
      return res.status(404).json({ error: 'Ad space not found' });
    }

    // Check if the user is the owner of the ad space
    if (adSpace.publisherId !== userId) {
      return res.status(403).json({ error: 'You do not have permission to view this ad space' });
    }

    return res.status(200).json(adSpace);
  } catch (error) {
    logger.logger.error('Error retrieving ad space:', error);
    return res.status(500).json({ error: 'Failed to retrieve ad space' });
  }
}

// PUT - Update an existing ad space
async function updateAdSpace(req: NextApiRequest, res: NextApiResponse, id: string, userId: string) {
  try {
    // Check if the ad space exists and belongs to the user
    const existingSpace = await prisma.adSpace.findUnique({
      where: {
        id,
      },
    });

    if (!existingSpace) {
      return res.status(404).json({ error: 'Ad space not found' });
    }

    if (existingSpace.publisherId !== userId) {
      return res.status(403).json({ error: 'You do not have permission to update this ad space' });
    }

    // Get the updated data from the request body
    const {
      name,
      description,
      website,
      dimensions,
      allowedAdTypes,
      contentCategory,
      contentTags,
      minBidPerImpression,
      minBidPerClick,
    } = req.body;

    // Validate the required fields
    if (!name || !description || !website || !dimensions || !allowedAdTypes || !contentCategory) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Update the ad space in the database
    const updatedSpace = await prisma.adSpace.update({
      where: {
        id,
      },
      data: {
        name,
        description,
        website,
        dimensions,
        allowedAdTypes,
        contentCategory,
        contentTags,
        minBidPerImpression: parseInt(minBidPerImpression),
        minBidPerClick: parseInt(minBidPerClick),
        updatedAt: new Date(),
      },
    });

    return res.status(200).json(updatedSpace);
  } catch (error) {
    logger.logger.error('Error updating ad space:', error);
    return res.status(500).json({ error: 'Failed to update ad space' });
  }
}

// DELETE - Remove an existing ad space
async function deleteAdSpace(req: NextApiRequest, res: NextApiResponse, id: string, userId: string) {
  try {
    // Check if the ad space exists and belongs to the user
    const existingSpace = await prisma.adSpace.findUnique({
      where: {
        id,
      },
    });

    if (!existingSpace) {
      return res.status(404).json({ error: 'Ad space not found' });
    }

    if (existingSpace.publisherId !== userId) {
      return res.status(403).json({ error: 'You do not have permission to delete this ad space' });
    }

    // Delete all placements associated with this ad space first
    await prisma.adPlacement.deleteMany({
      where: {
        spaceId: id,
      },
    });

    // Delete the ad space
    await prisma.adSpace.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({ message: 'Ad space deleted successfully' });
  } catch (error) {
    logger.logger.error('Error deleting ad space:', error);
    return res.status(500).json({ error: 'Failed to delete ad space' });
  }
}