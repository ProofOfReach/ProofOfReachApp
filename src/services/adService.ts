import { UserRole } from "@/types/role";
import { Ad, AdStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { throwDatabaseError, throwNotFoundError, throwApiError } from '../lib/errorHandling';
import { ApiError } from '../utils/apiError';

// Interface for creating a new ad
export interface CreateAdDto {
  title: string;
  description: string;
  imageUrl?: string;
  targetUrl: string;
  urlParameters?: string;
  bidPerImpression: number; // Required field in DB schema
  bidPerClick: number; // Required field in DB schema
  freqCapViews?: number;
  freqCapHours?: number;
  targetLocation?: string | null;
  targetInterests?: string | null; // Store as comma-separated values
  targetAge?: string | null;
}

// Interface for updating an ad
export interface UpdateAdDto {
  id: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  targetUrl?: string;
  urlParameters?: string;
  bidPerImpression?: number;
  bidPerClick?: number;
  freqCapViews?: number;
  freqCapHours?: number;
  targetLocation?: string | null;
  targetInterests?: string | null; // Store as comma-separated values
  targetAge?: string | null;
}

// Ad service methods
export const adService = {
  /**
   * Create a new ad in a campaign
   */
  async createAd(advertiserId: UserRole, campaignId: UserRole, adData: CreateAdDto): Promise<Ad> {
    // Check if campaign exists and belongs to the advertiser
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        advertiserId,
      },
    });
    
    if (!campaign) {
      throwApiError(404, 'Campaign not found');
    }
    
    return prisma.ad.create({
      data: {
        ...adData,
        status: 'PENDING', // Default status for new ads
        campaignId,
        advertiserId,
      },
    });
  },

  /**
   * Get an ad by ID
   */
  async getAd(id: UserRole, advertiserId?: UserRole, campaignId?: string): Promise<Ad | null> {
    return prisma.ad.findFirst({
      where: {
        id,
        ...(advertiserId && { advertiserId }),
        ...(campaignId && { campaignId }),
      },
      include: {
        campaign: true,
      },
    });
  },

  /**
   * Get all ads for a specific campaign
   */
  async getAdsByCampaign(campaignId: UserRole, advertiserId?: string): Promise<Ad[]> {
    return prisma.ad.findMany({
      where: {
        campaignId,
        ...(advertiserId && { advertiserId }),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  /**
   * Update an ad
   */
  async updateAd(updateData: UpdateAdDto, advertiserId?: string): Promise<Ad> {
    const { id, ...data } = updateData;
    
    // Check if ad exists and belongs to the advertiser
    const existingAd = await prisma.ad.findFirst({
      where: {
        id,
        ...(advertiserId && { advertiserId }),
      },
    });
    
    if (!existingAd) {
      throwApiError(404, 'Ad not found');
    }
    
    return prisma.ad.update({
      where: { id },
      data,
    });
  },

  /**
   * Update ad status
   */
  async updateAdStatus(
    id: UserRole,
    status: AdStatus,
    advertiserId?: string
  ): Promise<Ad> {
    // Check if ad exists and belongs to the advertiser
    const existingAd = await prisma.ad.findFirst({
      where: {
        id,
        ...(advertiserId && { advertiserId }),
      },
    });
    
    if (!existingAd) {
      throwApiError(404, 'Ad not found');
    }
    
    return prisma.ad.update({
      where: { id },
      data: { status },
    });
  },

  /**
   * Delete an ad
   */
  async deleteAd(id: UserRole, advertiserId?: string): Promise<Ad> {
    // Check if ad exists and belongs to the advertiser
    const existingAd = await prisma.ad.findFirst({
      where: {
        id,
        ...(advertiserId && { advertiserId }),
      },
    });
    
    if (!existingAd) {
      throwApiError(404, 'Ad not found');
    }
    
    return prisma.ad.delete({
      where: { id },
    });
  },

  /**
   * Get ad metrics
   */
  async getAdMetrics(id: UserRole, advertiserId?: string): Promise<any> {
    // Check if ad exists and belongs to the advertiser
    const existingAd = await prisma.ad.findFirst({
      where: {
        id,
        ...(advertiserId && { advertiserId }),
      },
    });
    
    if (!existingAd) {
      throwApiError(404, 'Ad not found');
    }
    
    // In a real implementation, we would aggregate metrics from view history
    // For now, return placeholder metrics
    return {
      adId: id,
      impressions: 0,
      clicks: 0,
      ctr: 0,
      spent: 0,
    };
  },
};