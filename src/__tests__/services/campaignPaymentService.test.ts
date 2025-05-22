import { campaignPaymentService } from '../../services/campaignPaymentService';
import { prisma } from '../../lib/prismaClient';
import { walletService } from '../../services/walletService';
import { ApiError } from '../../utils/apiError';

// Mock Prisma
jest.mock('../../lib/prismaClient', () => ({
  prisma: {
    campaign: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}));

// Mock wallet service
jest.mock('../../services/walletService', () => ({
  walletService: {
    updateBalance: jest.fn(),
  },
}));

describe('Campaign Payment Service', () => {
  const mockCampaignId = 'campaign123';
  const mockAdvertiserId = 'advertiser123';
  const mockPublisherId = 'publisher123';
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkCampaignFunding', () => {
    it('should return true if campaign is active and has funds', async () => {
      // Mock data
      const mockCampaign = {
        id: mockCampaignId,
        status: 'ACTIVE',
        advertiserId: mockAdvertiserId,
        advertiser: {
          id: mockAdvertiserId,
          balance: 1000,
        },
      };
      
      // Setup mocks
      (prisma.campaign.findUnique as jest.Mock).mockResolvedValue(mockCampaign);
      
      // Execute
      const result = await campaignPaymentService.checkCampaignFunding(mockCampaignId);
      
      // Verify
      expect(result).toBe(true);
      expect(prisma.campaign.findUnique).toHaveBeenCalledWith({
        where: { id: mockCampaignId },
        include: { advertiser: true },
      });
    });

    it('should return false if campaign is not active', async () => {
      // Mock data
      const mockCampaign = {
        id: mockCampaignId,
        status: 'PAUSED',
        advertiserId: mockAdvertiserId,
        advertiser: {
          id: mockAdvertiserId,
          balance: 1000,
        },
      };
      
      // Setup mocks
      (prisma.campaign.findUnique as jest.Mock).mockResolvedValue(mockCampaign);
      
      // Execute
      const result = await campaignPaymentService.checkCampaignFunding(mockCampaignId);
      
      // Verify
      expect(result).toBe(false);
    });

    it('should return false if advertiser has no balance', async () => {
      // Mock data
      const mockCampaign = {
        id: mockCampaignId,
        status: 'ACTIVE',
        advertiserId: mockAdvertiserId,
        advertiser: {
          id: mockAdvertiserId,
          balance: 0,
        },
      };
      
      // Setup mocks
      (prisma.campaign.findUnique as jest.Mock).mockResolvedValue(mockCampaign);
      
      // Execute
      const result = await campaignPaymentService.checkCampaignFunding(mockCampaignId);
      
      // Verify
      expect(result).toBe(false);
    });
    
    it('should handle case when campaign is not found', async () => {
      // Setup mocks
      (prisma.campaign.findUnique as jest.Mock).mockResolvedValue(null);
      
      // Create a spy to capture the error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Execute
      const result = await campaignPaymentService.checkCampaignFunding('nonexistent');
      
      // Verify
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      // Clean up spy
      consoleErrorSpy.mockRestore();
    });
    
    it('should return false and handle database errors', async () => {
      // Setup mocks
      (prisma.campaign.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      // Execute
      const result = await campaignPaymentService.checkCampaignFunding(mockCampaignId);
      
      // Verify
      expect(result).toBe(false);
    });
  });

  describe('processAdPayment', () => {
    it('should process payment successfully when sufficient funds', async () => {
      // Mock data
      const mockCampaign = {
        id: mockCampaignId,
        status: 'ACTIVE',
        advertiserId: mockAdvertiserId,
        advertiser: {
          id: mockAdvertiserId,
          balance: 1000,
        },
      };
      
      // Setup mocks
      (prisma.campaign.findUnique as jest.Mock).mockResolvedValue(mockCampaign);
      (walletService.updateBalance as jest.Mock).mockResolvedValue({
        transaction: { id: 'tx1' },
        updatedBalance: 900,
      });
      
      // Execute
      const result = await campaignPaymentService.processAdPayment(
        mockCampaignId,
        100,
        'Ad impression payment'
      );
      
      // Verify
      expect(result).toBe(true);
      expect(walletService.updateBalance).toHaveBeenCalledWith({
        userId: mockAdvertiserId,
        amount: 100,
        type: 'AD_PAYMENT',
        description: 'Ad impression payment',
      });
    });

    it('should pause campaign and not process payment with insufficient funds', async () => {
      // Mock data
      const mockCampaign = {
        id: mockCampaignId,
        status: 'ACTIVE',
        advertiserId: mockAdvertiserId,
        advertiser: {
          id: mockAdvertiserId,
          balance: 50,
        },
      };
      
      // Setup mocks
      (prisma.campaign.findUnique as jest.Mock).mockResolvedValue(mockCampaign);
      (prisma.campaign.update as jest.Mock).mockResolvedValue({
        ...mockCampaign,
        status: 'PAUSED',
      });
      
      // Execute
      const result = await campaignPaymentService.processAdPayment(
        mockCampaignId,
        100,
        'Ad impression payment'
      );
      
      // Verify
      expect(result).toBe(false);
      expect(prisma.campaign.update).toHaveBeenCalledWith({
        where: { id: mockCampaignId },
        data: { status: 'PAUSED' },
      });
      expect(walletService.updateBalance).not.toHaveBeenCalled();
    });
    
    it('should return false if campaign not found', async () => {
      // Setup mocks
      (prisma.campaign.findUnique as jest.Mock).mockResolvedValue(null);
      
      // Execute
      const result = await campaignPaymentService.processAdPayment(
        'nonexistent',
        100,
        'Ad impression payment'
      );
      
      // Verify
      expect(result).toBe(false);
    });
    
    it('should return false if campaign is not active', async () => {
      // Mock data
      const mockCampaign = {
        id: mockCampaignId,
        status: 'PAUSED',
        advertiserId: mockAdvertiserId,
        advertiser: {
          id: mockAdvertiserId,
          balance: 1000,
        },
      };
      
      // Setup mocks
      (prisma.campaign.findUnique as jest.Mock).mockResolvedValue(mockCampaign);
      
      // Execute
      const result = await campaignPaymentService.processAdPayment(
        mockCampaignId,
        100,
        'Ad impression payment'
      );
      
      // Verify
      expect(result).toBe(false);
      expect(walletService.updateBalance).not.toHaveBeenCalled();
    });
    
    it('should handle wallet service errors', async () => {
      // Mock data
      const mockCampaign = {
        id: mockCampaignId,
        status: 'ACTIVE',
        advertiserId: mockAdvertiserId,
        advertiser: {
          id: mockAdvertiserId,
          balance: 1000,
        },
      };
      
      // Setup mocks
      (prisma.campaign.findUnique as jest.Mock).mockResolvedValue(mockCampaign);
      (walletService.updateBalance as jest.Mock).mockRejectedValue(new Error('Wallet update failed'));
      
      // Execute
      const result = await campaignPaymentService.processAdPayment(
        mockCampaignId,
        100,
        'Ad impression payment'
      );
      
      // Verify
      expect(result).toBe(false);
    });
    
    it('should handle database errors', async () => {
      // Setup mocks
      (prisma.campaign.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      // Execute
      const result = await campaignPaymentService.processAdPayment(
        mockCampaignId,
        100,
        'Ad impression payment'
      );
      
      // Verify
      expect(result).toBe(false);
    });
  });

  describe('processPublisherEarning', () => {
    it('should process publisher earning correctly', async () => {
      // Mock data
      const mockPublisher = {
        id: mockPublisherId,
        balance: 500,
      };
      
      // Setup mocks
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockPublisher);
      (walletService.updateBalance as jest.Mock).mockResolvedValue({
        transaction: { id: 'tx1' },
        updatedBalance: 550,
      });
      
      // Execute
      const result = await campaignPaymentService.processPublisherEarning(
        mockPublisherId,
        50,
        'Ad revenue share'
      );
      
      // Verify
      expect(result).toBe(true);
      expect(walletService.updateBalance).toHaveBeenCalledWith({
        userId: mockPublisherId,
        amount: 50,
        type: 'PUBLISHER_EARNING',
        description: 'Ad revenue share',
      });
    });

    it('should return false if publisher not found', async () => {
      // Setup mocks
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      
      // Execute
      const result = await campaignPaymentService.processPublisherEarning(
        'nonexistent',
        50,
        'Ad revenue share'
      );
      
      // Verify
      expect(result).toBe(false);
      expect(walletService.updateBalance).not.toHaveBeenCalled();
    });

    it('should handle wallet service errors', async () => {
      // Mock data
      const mockPublisher = {
        id: mockPublisherId,
        balance: 500,
      };
      
      // Setup mocks
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockPublisher);
      (walletService.updateBalance as jest.Mock).mockRejectedValue(new Error('Wallet error'));
      
      // Execute
      const result = await campaignPaymentService.processPublisherEarning(
        mockPublisherId,
        50,
        'Ad revenue share'
      );
      
      // Verify
      expect(result).toBe(false);
    });
  });

  describe('pauseCampaignDueToInsufficientFunds', () => {
    it('should pause a campaign successfully', async () => {
      // Mock data
      const mockCampaign = {
        id: mockCampaignId,
        status: 'ACTIVE',
      };
      
      // Setup mocks
      (prisma.campaign.update as jest.Mock).mockResolvedValue({
        ...mockCampaign,
        status: 'PAUSED',
      });
      
      // Execute
      const result = await campaignPaymentService.pauseCampaignDueToInsufficientFunds(mockCampaignId);
      
      // Verify
      expect(result.status).toBe('PAUSED');
      expect(prisma.campaign.update).toHaveBeenCalledWith({
        where: { id: mockCampaignId },
        data: { status: 'PAUSED' },
      });
    });
    
    it('should handle database errors when pausing', async () => {
      // Setup mocks
      (prisma.campaign.update as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      // Execute & Verify
      await expect(campaignPaymentService.pauseCampaignDueToInsufficientFunds(mockCampaignId))
        .rejects.toThrow('Failed to pause campaign');
    });
  });
  
  describe('resumeCampaignIfFunded', () => {
    it('should resume a previously paused campaign with funds', async () => {
      // Mock data
      const mockCampaign = {
        id: mockCampaignId,
        status: 'PAUSED',
        advertiserId: mockAdvertiserId,
        advertiser: {
          id: mockAdvertiserId,
          balance: 100,
        },
      };
      
      // Setup mocks
      (prisma.campaign.findUnique as jest.Mock).mockResolvedValue(mockCampaign);
      (prisma.campaign.update as jest.Mock).mockResolvedValue({
        ...mockCampaign,
        status: 'ACTIVE',
      });
      
      // Execute
      const result = await campaignPaymentService.resumeCampaignIfFunded(mockCampaignId);
      
      // Verify
      expect(result).not.toBeNull();
      expect(result?.status).toBe('ACTIVE');
      expect(prisma.campaign.update).toHaveBeenCalledWith({
        where: { id: mockCampaignId },
        data: { status: 'ACTIVE' },
      });
    });
    
    it('should not resume a campaign that is not paused', async () => {
      // Mock data
      const mockCampaign = {
        id: mockCampaignId,
        status: 'ACTIVE',
        advertiserId: mockAdvertiserId,
        advertiser: {
          id: mockAdvertiserId,
          balance: 100,
        },
      };
      
      // Setup mocks
      (prisma.campaign.findUnique as jest.Mock).mockResolvedValue(mockCampaign);
      
      // Execute
      const result = await campaignPaymentService.resumeCampaignIfFunded(mockCampaignId);
      
      // Verify
      expect(result).toBeNull();
      expect(prisma.campaign.update).not.toHaveBeenCalled();
    });
    
    it('should not resume a paused campaign without funds', async () => {
      // Mock data
      const mockCampaign = {
        id: mockCampaignId,
        status: 'PAUSED',
        advertiserId: mockAdvertiserId,
        advertiser: {
          id: mockAdvertiserId,
          balance: 0,
        },
      };
      
      // Setup mocks
      (prisma.campaign.findUnique as jest.Mock).mockResolvedValue(mockCampaign);
      
      // Execute
      const result = await campaignPaymentService.resumeCampaignIfFunded(mockCampaignId);
      
      // Verify
      expect(result).toBeNull();
      expect(prisma.campaign.update).not.toHaveBeenCalled();
    });
    
    it('should return null if campaign not found', async () => {
      // Setup mocks
      (prisma.campaign.findUnique as jest.Mock).mockResolvedValue(null);
      
      // Execute
      const result = await campaignPaymentService.resumeCampaignIfFunded('nonexistent');
      
      // Verify
      expect(result).toBeNull();
    });
    
    it('should handle database errors', async () => {
      // Setup mocks
      (prisma.campaign.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      // Execute
      const result = await campaignPaymentService.resumeCampaignIfFunded(mockCampaignId);
      
      // Verify
      expect(result).toBeNull();
    });
  });

  describe('resumePausedCampaignsWithFunds', () => {
    it('should resume paused campaigns with sufficient funds', async () => {
      // Mock data
      const pausedCampaigns = [
        {
          id: 'campaign1',
          status: 'PAUSED',
          advertiser: { id: 'adv1', balance: 100 }
        },
        {
          id: 'campaign2',
          status: 'PAUSED',
          advertiser: { id: 'adv2', balance: 0 }
        },
        {
          id: 'campaign3',
          status: 'PAUSED',
          advertiser: { id: 'adv3', balance: 200 }
        }
      ];
      
      // Setup mocks
      (prisma.campaign.findMany as jest.Mock).mockResolvedValue(pausedCampaigns);
      (prisma.campaign.update as jest.Mock).mockImplementation((params) => {
        return Promise.resolve({
          ...pausedCampaigns.find(c => c.id === params.where.id),
          status: 'ACTIVE'
        });
      });
      
      // Execute
      const resumedCount = await campaignPaymentService.resumePausedCampaignsWithFunds();
      
      // Verify
      expect(resumedCount).toBe(2); // Only 2 of the 3 have sufficient balance
      expect(prisma.campaign.update).toHaveBeenCalledTimes(2);
      expect(prisma.campaign.update).toHaveBeenCalledWith({
        where: { id: 'campaign1' },
        data: { status: 'ACTIVE' }
      });
      expect(prisma.campaign.update).toHaveBeenCalledWith({
        where: { id: 'campaign3' },
        data: { status: 'ACTIVE' }
      });
    });
    
    it('should handle database errors when resuming campaigns', async () => {
      // Setup mocks
      (prisma.campaign.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      // Execute
      const resumedCount = await campaignPaymentService.resumePausedCampaignsWithFunds();
      
      // Verify
      expect(resumedCount).toBe(0);
    });
    
    it('should handle empty results', async () => {
      // Setup mocks
      (prisma.campaign.findMany as jest.Mock).mockResolvedValue([]);
      
      // Execute
      const resumedCount = await campaignPaymentService.resumePausedCampaignsWithFunds();
      
      // Verify
      expect(resumedCount).toBe(0);
      expect(prisma.campaign.update).not.toHaveBeenCalled();
    });
  });
});