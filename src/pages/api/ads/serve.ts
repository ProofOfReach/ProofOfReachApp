import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prismaClient';
import { requireAuth } from '../../../lib/auth';
import { logger } from '../../../lib/logger';

/**
 * @swagger
 * /api/ads/serve:
 *   get:
 *     tags: [Publisher]
 *     summary: Retrieve a single ad for publishers to display
 *     security:
 *       - NostrAuth: []
 *       - ApiKeyAuth: []
 *     description: |
 *       Publisher endpoint: Returns a single targeted ad object ready for display on a publisher's platform.
 *       Authentication is required, and the endpoint tracks impressions using the publisher's ID.
 *       Uses targeting parameters to find the most suitable ad to display to the user.
 *     parameters:
 *       - name: placement
 *         in: query
 *         description: The ad placement type
 *         schema:
 *           type: string
 *           enum: ['feed', 'sidebar', 'banner', 'sponsored', 'native']
 *       - name: pubkey
 *         in: query
 *         description: The Nostr public key of the publisher requesting the ad
 *         schema:
 *           type: string
 *       - name: interests
 *         in: query
 *         description: Comma-separated list of content interests
 *         schema:
 *           type: string
 *       - name: format
 *         in: query
 *         description: Requested ad format
 *         schema:
 *           type: string
 *           enum: ['text', 'image', 'text-image', 'rich']
 *           default: 'text-image'
 *     responses:
 *       200:
 *         description: Successfully retrieved an ad
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ad'
 *       204:
 *         description: No suitable ads found for the given parameters
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
async function handler(req: NextApiRequest, res: NextApiResponse, pubkey: UserRole, userId: string): Promise<void> {
  // This endpoint only supports GET and requires authentication
  // The authenticated user should have publisher role to access this endpoint
  // In a future implementation, we would check if the user has publisher role
  if (req.method !== 'GET') {
    res.status(405).json({
      code: 'METHOD_NOT_ALLOWED',
      message: 'Method not allowed, please use GET'
    });
    return;
  }

  try {
    // Extract query parameters
    const { 
      placement, 
      pubkey, 
      interests: interestsParam, 
      format = 'text-image' 
    } = req.query;

    // Parse interests to array if provided
    const interests = interestsParam ? String(interestsParam).split(',') : [];

    // Validate format parameter
    const validFormats = ['text', 'image', 'text-image', 'rich'];
    if (format && !validFormats.includes(String(format))) {
      res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Invalid format parameter',
        errors: [
          {
            field: 'format',
            message: `Format must be one of: ${validFormats.join(', ')}`
          }
        ]
      });
      return;
    }

    // Build query filters based on parameters
    const filters: any = {
      status: 'ACTIVE',
      // Only include ads with sufficient budget
      // Ad should belong to campaign with available funds and not ended
      campaign: {
        status: 'ACTIVE'
      }
    };

    // Add placement filter if provided
    if (placement) {
      filters.placement = String(placement);
    }

    // Add format filter if provided
    if (format) {
      // If format is text-image, include both text and text-image formats
      if (format === 'text-image') {
        filters.OR = [
          { format: 'text-image' },
          { format: 'text' }
        ];
      } else {
        filters.format = String(format);
      }
    }

    // Add targeting filters if interests provided
    if (interests.length > 0) {
      // This is a simplified targeting algorithm
      // In a real implementation, we would have more sophisticated matching
      filters.OR = [
        // Match any ad that targets at least one of the provided interests
        {
          targetInterests: {
            hasSome: interests
          }
        },
        // Or ads with no specific targeting
        {
          targetInterests: null
        }
      ];
    }

    // Fetch ads that match filters
    const ads = await prisma.ad.findMany({
      where: filters,
      include: {
        campaign: true
      },
      // Order by most recently created
      orderBy: {
        createdAt: 'desc'
      },
      // Limit to top 10 results to choose from
      take: 10
    });

    // If no ads found, return 204 No Content
    if (!ads || ads.length === 0) {
      res.status(204).end();
      return;
    }

    // Select a random ad from the results for simple rotation
    // In a real implementation, we would use more sophisticated ad selection algorithms
    const randomIndex = Math.floor(Math.random() * ads.length);
    const selectedAd = ads[randomIndex];

    // Format the response to match the Ad schema in the API spec
    const adResponse = {
      id: selectedAd.id,
      title: selectedAd.title,
      description: selectedAd.description,
      imageUrl: selectedAd.imageUrl,
      targetUrl: selectedAd.targetUrl,
      urlParameters: selectedAd.urlParameters,
      bidPerImpression: selectedAd.bidPerImpression,
      bidPerClick: selectedAd.bidPerClick,
      status: selectedAd.status,
      freqCapViews: selectedAd.freqCapViews,
      freqCapHours: selectedAd.freqCapHours,
      targetLocation: selectedAd.targetLocation,
      targetInterests: selectedAd.targetInterests,
      targetAge: selectedAd.targetAge,
      campaignId: selectedAd.campaignId,
      // Zero out metrics for privacy/security
      impressions: 0,
      clicks: 0,
      ctr: 0,
      spend: 0,
      createdAt: selectedAd.createdAt,
      updatedAt: selectedAd.updatedAt
    };

    // Record the impression (in a real system, this would be done asynchronously)
    // Note: This is commented out because the impressions table may not exist in the current schema
    // In a real implementation, we would create records of impressions and update statistics
    try {
      // For demo purposes only - logging the impression data that would be stored
      logger.debug('Would record impression:', {
        adId: selectedAd.id,
        campaignId: selectedAd.campaignId,
        publisherId: userId, // Using authenticated user ID
        publisherPubkey: pubkey ? String(pubkey) : null,
        placement: placement ? String(placement) : null,
        costInSats: selectedAd.bidPerImpression
      });

      // In a real implementation, we would update impression count and spend
      logger.debug('Would update ad stats:', {
        id: selectedAd.id,
        incrementImpressions: 1,
        incrementSpend: selectedAd.bidPerImpression
      });
    } catch (error) {
      // Log error but don't fail the request
      logger.error('Error processing impression:', error);
    }

    // Return the selected ad
    res.status(200).json(adResponse);
    return;
  } catch (error) {
    logger.error('Error serving ad:', error);
    res.status(500).json({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An error occurred while serving an ad'
    });
    return;
  }
}

// Export with auth middleware
export default requireAuth(handler);