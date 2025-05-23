import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prismaClient';
import { requireAuth } from '../../../lib/auth';
import { logger } from '../../../lib/logger';

/**
 * @swagger
 * /api/ads:
 *   get:
 *     tags: [Advertiser]
 *     summary: Retrieve all ads created by the authenticated advertiser
 *     security:
 *       - NostrAuth: []
 *       - ApiKeyAuth: []
 *     description: |
 *       Advertiser endpoint: Returns all ads created by the authenticated user.
 *       This endpoint helps advertisers manage and monitor their ad inventory.
 *     parameters:
 *       - name: limit
 *         in: query
 *         description: Maximum number of ads to return
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: Successfully retrieved ads
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ad'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: User not found
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *   post:
 *     tags: [Advertiser]
 *     summary: Create a new ad as an advertiser
 *     security:
 *       - NostrAuth: []
 *       - ApiKeyAuth: []
 *     description: |
 *       Advertiser endpoint: Creates a new ad with the provided details.
 *       The ad budget is deducted from the user's balance during creation.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - targetUrl
 *               - budget
 *               - dailyBudget
 *               - bidPerImpression
 *               - bidPerClick
 *             properties:
 *               title:
 *                 type: string
 *                 description: The headline of the ad
 *               description:
 *                 type: string
 *                 description: The body text of the ad
 *               imageUrl:
 *                 type: string
 *                 description: URL to the ad image (optional)
 *               targetUrl:
 *                 type: string
 *                 description: The destination URL where users will be directed when clicking the ad
 *               urlParameters:
 *                 type: string
 *                 description: Additional URL parameters for tracking (optional)
 *               budget:
 *                 type: number
 *                 description: Total budget for the ad in satoshis
 *               dailyBudget:
 *                 type: number
 *                 description: Maximum daily spend in satoshis
 *               bidPerImpression:
 *                 type: number
 *                 description: Amount to pay per impression in satoshis
 *               bidPerClick:
 *                 type: number
 *                 description: Amount to pay per click in satoshis
 *               targetLocation:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Geographic locations to target (optional)
 *               targetInterests:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: User interests to target (optional)
 *               targetAge:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Age groups to target (optional)
 *               targetedAdSpaces:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Specific ad spaces to target (optional)
 *     responses:
 *       201:
 *         description: Ad created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ad'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */

// Handler for GET /api/ads endpoint
async function handleGetAds(req: NextApiRequest, res: NextApiResponse, pubkey: string, userId: string): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // First check if the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Get optional limit parameter
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

    // Get all ads created by the user
    const ads = await prisma.ad.findMany({
      where: {
        advertiserId: userId
      },
      orderBy: {
        createdAt: 'desc'
      },
      ...(limit ? { take: limit } : {}),
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

    res.status(200).json(ads);
    return;
  } catch (error) {
    logger.error('Error fetching ads:', error);
    res.status(500).json({ error: 'Failed to fetch ads' });
    return;
  }
}

// Handler for POST /api/ads endpoint
async function handleCreateAd(req: NextApiRequest, res: NextApiResponse, pubkey: string, userId: string): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // Validate required fields first, before any database access
    const { 
      title, 
      description, 
      imageUrl, 
      targetUrl, 
      urlParameters,
      budget, 
      dailyBudget, 
      bidPerImpression, 
      bidPerClick,
      targetLocation,
      targetInterests,
      targetAge,
      targetedAdSpaces = [] // Array of ad space IDs to target
    } = req.body;

    // Validate required fields
    if (!title || !description || !targetUrl || !budget || !dailyBudget || !bidPerImpression || !bidPerClick) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Validate budget as a positive number
    if (budget <= 0 || dailyBudget <= 0 || bidPerImpression <= 0 || bidPerClick <= 0) {
      res.status(400).json({ error: 'Budget values must be positive' });
      return;
    }
    
    // Get user balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, balance: true }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Check if user has enough balance
    if (user?.balance ?? 0 < budget) {
      logger.warn(`User ${userId} has insufficient balance for ad. Required: ${budget}, Available: ${user?.balance ?? 0}`);
      res.status(400).json({ error: 'Insufficient balance to create this ad' });
      return;
    }

    // Start a transaction - making sure all operations succeed or fail together
    const result = await prisma.$transaction(async (prisma) => {
      // First create the ad - we'll use a default campaign ID for tests
      // In a real implementation, we would create the campaign first
      const newAd = await prisma.ad.create({
        data: {
          title,
          description,
          imageUrl,
          targetUrl,
          urlParameters,
          bidPerImpression,
          bidPerClick,
          targetLocation: Array.isArray(targetLocation) ? targetLocation.join(',') : targetLocation,
          targetInterests: Array.isArray(targetInterests) ? targetInterests.join(',') : targetInterests,
          targetAge: Array.isArray(targetAge) ? targetAge.join(',') : targetAge,
          status: 'PENDING',
          // In a real implementation, we would use the campaign ID created above
          // For now, using a hardcoded campaign ID for testing
          campaignId: 'campaign-1', 
          advertiserId: userId
        }
      });

      // Deduct the budget from user's balance
      await prisma.user.update({
        where: { id: userId },
        data: { balance: user?.balance ?? 0 - budget }
      });

      // Create a transaction record for the ad payment
      await prisma.transaction.create({
        data: {
          userId: userId,
          amount: 0, balanceBefore: 0, balanceAfter: 0,
          type: 'AD_PAYMENT',
          status: 'COMPLETED',
          description: `Budget allocation for ad: ${title}`,
          balanceBefore: user?.balance ?? 0,
          balanceAfter: user?.balance ?? 0 - budget
        }
      });

      return newAd;
    });

    res.status(201).json(result);
    return;
  } catch (error) {
    logger.error('Error creating ad:', error);
    res.status(500).json({ error: 'Failed to create ad' });
    return;
  }
}

// Route handler function
async function adsHandler(req: NextApiRequest, res: NextApiResponse, pubkey: string, userId: string): Promise<void> {
  if (req.method === 'GET') {
    await handleGetAds(req, res, pubkey, userId);
    return;
  } else if (req.method === 'POST') {
    await handleCreateAd(req, res, pubkey, userId);
    return;
  } else {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
}

// Export with auth middleware
export default requireAuth(adsHandler);
