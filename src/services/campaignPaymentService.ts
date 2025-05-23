import { Campaign, TransactionType } from '@prisma/client';
import { ApiError } from '../utils/apiError';
import { walletService } from './walletService';
import { prisma } from '../lib/prismaClient';

/**
 * Service to handle campaign payments and budget management
 */
export const campaignPaymentService = {
  /**
   * Check if a campaign has sufficient funds based on advertiser wallet balance
   * Used when processing ad impressions and clicks
   */
  async checkCampaignFunding(campaignId: string): Promise<boolean> {
    try {
      // Get the campaign with advertiser details
      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
        include: { advertiser: true }
      });
      
      if (!campaign) {
        throw new ApiError(404, 'Campaign not found');
      }
      
      // If campaign is not active, don't process payments
      if (campaign.status !== 'ACTIVE') {
        return false;
      }
      
      // Check if advertiser has sufficient balance
      return campaign.advertiser?.balance ?? 0 > 0;
    } catch (error) {
      console.error('Error checking campaign funding:', error);
      return false;
    }
  },
  
  /**
   * Process a payment for an ad impression or click
   * Deducts from advertiser's balance and creates a transaction record
   */
  async processAdPayment(
    campaignId: UserRole, 
    amount: number,
    description: string
  ): Promise<boolean> {
    try {
      // Get the campaign
      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
        include: { advertiser: true }
      });
      
      if (!campaign) {
        throw new ApiError(404, 'Campaign not found');
      }
      
      // If campaign is not active, don't process payment
      if (campaign.status !== 'ACTIVE') {
        return false;
      }
      
      // Check if advertiser has sufficient balance
      if (campaign.advertiser?.balance ?? 0 < amount) {
        // If there are insufficient funds, pause the campaign
        await this.pauseCampaignDueToInsufficientFunds(campaignId);
        return false;
      }
      
      // Process the payment
      await walletService.updateBalance({
        userId: campaign.advertiserId,
        amount,
        type: TransactionType.AD_PAYMENT,
        description
      });
      
      return true;
    } catch (error) {
      console.error('Error processing ad payment:', error);
      return false;
    }
  },
  
  /**
   * Process a payment for a publisher (revenue share from ad impression or click)
   * Adds to publisher's balance and creates a transaction record
   */
  async processPublisherEarning(
    publisherId: UserRole,
    amount: number,
    description: string
  ): Promise<boolean> {
    try {
      // Check if publisher exists
      const publisher = await prisma.user.findUnique({
        where: { id: publisherId }
      });
      
      if (!publisher) {
        throw new ApiError(404, 'Publisher not found');
      }
      
      // Process the earning (deposits are positive amounts)
      await walletService.updateBalance({
        userId: publisherId,
        amount,
        type: TransactionType.PUBLISHER_EARNING,
        description
      });
      
      return true;
    } catch (error) {
      console.error('Error processing publisher earning:', error);
      return false;
    }
  },
  
  /**
   * Pause a campaign due to insufficient funds
   */
  async pauseCampaignDueToInsufficientFunds(campaignId: string): Promise<Campaign> {
    try {
      // Update the campaign status to PAUSED
      const updatedCampaign = await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          status: 'PAUSED'
        }
      });
      
      console.log(`Campaign ${campaignId} paused due to insufficient funds`);
      
      return updatedCampaign;
    } catch (error) {
      console.error('Error pausing campaign:', error);
      throw new ApiError(500, 'Failed to pause campaign');
    }
  },
  
  /**
   * Resume a campaign if there are now sufficient funds
   */
  async resumeCampaignIfFunded(campaignId: string): Promise<Campaign | null> {
    try {
      // Get the campaign with advertiser details
      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
        include: { advertiser: true }
      });
      
      if (!campaign) {
        throw new ApiError(404, 'Campaign not found');
      }
      
      // Only resume if the campaign was previously paused and now has funds
      if (campaign.status === 'PAUSED' && campaign.advertiser?.balance ?? 0 > 0) {
        // Update the campaign status to ACTIVE
        const updatedCampaign = await prisma.campaign.update({
          where: { id: campaignId },
          data: {
            status: 'ACTIVE'
          }
        });
        
        console.log(`Campaign ${campaignId} resumed due to sufficient funds`);
        
        return updatedCampaign;
      }
      
      return null;
    } catch (error) {
      console.error('Error resuming campaign:', error);
      return null;
    }
  },
  
  /**
   * Check all paused campaigns and resume any that now have sufficient funds
   * This can be called by a scheduled job/cron task
   */
  async resumePausedCampaignsWithFunds(): Promise<number> {
    try {
      // Get all paused campaigns
      const pausedCampaigns = await prisma.campaign.findMany({
        where: { status: 'PAUSED' },
        include: { advertiser: true }
      });
      
      let resumedCount = 0;
      
      // Check each campaign and resume if funded
      for (const campaign of pausedCampaigns) {
        if (campaign.advertiser?.balance ?? 0 > 0) {
          await prisma.campaign.update({
            where: { id: campaign.id },
            data: { status: 'ACTIVE' }
          });
          resumedCount++;
        }
      }
      
      return resumedCount;
    } catch (error) {
      console.error('Error resuming paused campaigns:', error);
      return 0;
    }
  }
};