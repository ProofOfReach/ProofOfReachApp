import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prismaClient';
import { requireAuth } from '../../../lib/auth';
import { logger } from '../../../lib/logger';

async function getSpaces(req: NextApiRequest, res: NextApiResponse, pubkey: string, userId: string) {
  try {
    // Get optional limit parameter
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const all = req.query.all === 'true'; // Check if all spaces are requested

    // Set up the query based on whether we want all spaces or just the user's spaces
    const query = all
      ? {} // No where clause means get all spaces
      : { publisherId: userId }; // Only get spaces created by this user
    
    // Get spaces based on query
    const spaces = await prisma.adSpace.findMany({
      where: query,
      orderBy: {
        createdAt: 'desc'
      },
      ...(limit ? { take: limit } : {}),
      include: {
        placements: {
          include: {
            ad: {
              select: {
                title: true,
                advertiserId: true
              }
            }
          }
        }
      }
    });

    return res.status(200).json(spaces);
  } catch (error) {
    logger.logger.error('Error fetching spaces:', error);
    return res.status(500).json({ error: 'Failed to fetch ad spaces' });
  }
}

async function createSpace(req: NextApiRequest, res: NextApiResponse, pubkey: string, userId: string) {
  try {
    // Mark user as a publisher by adding the publisher role
    await prisma.user.update({
      where: { id: userId },
      data: { currentRole: 'publisher' }
    });
    
    // Check if the user already has the publisher role
    const existingPublisherRole = await prisma.userRole.findFirst({
      where: { 
        userId: userId,
        role: 'publisher'
      }
    });
    
    // If not, create the publisher role for this user
    if (!existingPublisherRole) {
      await prisma.userRole.create({
        data: {
          userId: userId,
          role: 'publisher',
          isActive: true
        }
      });
    }

    // Validate required fields
    const { 
      name, 
      description, 
      website, 
      minBidPerImpression, 
      minBidPerClick, 
      dimensions, 
      allowedAdTypes,
      contentCategory,
      contentTags
    } = req.body;

    if (!name || !description || !website || !dimensions || !allowedAdTypes || !contentCategory) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate bid minimums as positive numbers
    if (minBidPerImpression <= 0 || minBidPerClick <= 0) {
      return res.status(400).json({ error: 'Minimum bid values must be positive' });
    }

    // Create new ad space
    const newSpace = await prisma.adSpace.create({
      data: {
        name,
        description,
        website,
        minBidPerImpression,
        minBidPerClick,
        dimensions,
        allowedAdTypes,
        contentCategory,
        contentTags: contentTags || '',
        publisherId: userId
      }
    });

    return res.status(201).json(newSpace);
  } catch (error) {
    logger.logger.error('Error creating ad space:', error);
    return res.status(500).json({ error: 'Failed to create ad space' });
  }
}

// Process API requests with auth middleware
const handleRequest = async (req: NextApiRequest, res: NextApiResponse, pubkey: string, userId: string) => {
  if (req.method === 'GET') {
    return getSpaces(req, res, pubkey, userId);
  } else if (req.method === 'POST') {
    return createSpace(req, res, pubkey, userId);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
};

// Export with auth middleware
export default requireAuth(handleRequest);
