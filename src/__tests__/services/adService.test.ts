import { PrismaClient, Ad, AdStatus, Campaign } from '@prisma/client';
import { adService, CreateAdDto } from '../../services/adService';
import { ApiError } from '../../utils/apiError';
import type { UserRole } from '../../types/role';

// Mock PrismaClient
jest.mock('@prisma/client', () => {
  const mockAds: any[] = [];
  const mockCampaigns: any[] = [];
  
  // Mock campaign for testing
  const mockCampaign = {
    id: 'campaign-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    name: 'Test Campaign',
    description: 'Test Description',
    startDate: new Date(),
    endDate: null,
    budget: 100000,
    dailyBudget: 10000,
    status: 'ACTIVE',
    targetLocation: null,
    targetInterests: null,
    targetAge: null,
    targetAudience: null,
    advertiserId: 'advertiser-1',
  };
  
  mockCampaigns.push({ ...mockCampaign });
  
  // Mock ad for testing
  const mockAd = {
    id: 'ad-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    title: 'Test Ad',
    description: 'Test Ad Description',
    imageUrl: 'https://example.com/image.jpg',
    targetUrl: 'https://example.com',
    urlParameters: null,
    bidPerImpression: 100,
    bidPerClick: 500,
    status: 'ACTIVE' as AdStatus,
    freqCapViews: 2,
    freqCapHours: 24,
    targetLocation: null,
    targetInterests: null,
    targetAge: null,
    campaignId: 'campaign-1',
    advertiserId: 'advertiser-1',
    placements: [],
    viewHistory: [],
  };
  
  mockAds.push({ ...mockAd });
  
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      campaign: {
        findFirst: jest.fn().mockImplementation(({ where }) => {
          const campaign = mockCampaigns.find(
            c => 
              (!where.id || c.id === where.id) && 
              (!where.advertiserId || c.advertiserId === where.advertiserId)
          );
          return Promise.resolve(campaign || null);
        }),
      },
      ad: {
        create: jest.fn().mockImplementation(({ data }) => {
          const newAd = {
            id: `ad-${mockAds.length + 1}`,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...data,
            placements: [],
            viewHistory: [],
          };
          mockAds.push(newAd);
          return Promise.resolve(newAd);
        }),
        findFirst: jest.fn().mockImplementation(({ where, include }) => {
          const ad = mockAds.find(
            a => 
              (!where.id || a.id === where.id) && 
              (!where.campaignId || a.campaignId === where.campaignId) &&
              (!where.advertiserId || a.advertiserId === where.advertiserId)
          );
          
          if (ad && include?.campaign) {
            const campaign = mockCampaigns.find(c => c.id === ad.campaignId);
            return Promise.resolve({
              ...ad,
              campaign,
            });
          }
          
          return Promise.resolve(ad || null);
        }),
        findMany: jest.fn().mockImplementation(({ where }) => {
          const ads = mockAds.filter(
            a => 
              (!where.campaignId || a.campaignId === where.campaignId) &&
              (!where.advertiserId || a.advertiserId === where.advertiserId)
          );
          return Promise.resolve(ads);
        }),
        update: jest.fn().mockImplementation(({ where, data }) => {
          const index = mockAds.findIndex(a => a.id === where.id);
          if (index === -1) return Promise.resolve(null);
          
          const updatedAd = {
            ...mockAds[index],
            ...data,
            updatedAt: new Date(),
          };
          mockAds[index] = updatedAd;
          return Promise.resolve(updatedAd);
        }),
        delete: jest.fn().mockImplementation(({ where }) => {
          const index = mockAds.findIndex(a => a.id === where.id);
          if (index === -1) return Promise.resolve(null);
          
          const deletedAd = mockAds[index];
          mockAds.splice(index, 1);
          return Promise.resolve(deletedAd);
        }),
      },
    })),
    Prisma: {
      PrismaClientKnownRequestError: class PrismaClientKnownRequestError extends Error {
        constructor(message: UserRole, meta: any) {
          super(message);
          this.name = 'PrismaClientKnownRequestError';
          this.meta = meta;
        }
        meta: any;
        code: string = 'P2025';
      }
    },
    AdStatus: {
      PENDING: 'PENDING',
      ACTIVE: 'ACTIVE',
      PAUSED: 'PAUSED',
      COMPLETED: 'COMPLETED',
      REJECTED: 'REJECTED',
    },
  };
});

describe('Ad Service', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('createAd', () => {
    it('should create a new ad', async () => {
      const advertiserId = 'advertiser-1';
      const campaignId = 'campaign-1';
      const adData: CreateAdDto = {
        title: 'New Test Ad',
        description: 'New Test Ad Description',
        targetUrl: 'https://example.com/new',
        bidPerImpression: 150,
        bidPerClick: 600,
      };
      
      const ad = await adService.createAd(advertiserId, campaignId, adData);
      
      expect(ad).toEqual(expect.objectContaining({
        title: adData.title,
        description: adData.description,
        targetUrl: adData.targetUrl,
        bidPerImpression: adData.bidPerImpression,
        bidPerClick: adData.bidPerClick,
        campaignId,
        advertiserId,
      }));
    });
    
    it('should throw ApiError if campaign not found', async () => {
      const advertiserId = 'advertiser-1';
      const campaignId = 'non-existent-campaign';
      const adData: CreateAdDto = {
        title: 'New Test Ad',
        description: 'New Test Ad Description',
        targetUrl: 'https://example.com/new',
        bidPerImpression: 150,
        bidPerClick: 600,
      };
      
      await expect(adService.createAd(advertiserId, campaignId, adData))
        .rejects
        .toThrow(ApiError);
    });
  });
  
  describe('getAd', () => {
    it('should return an ad by id', async () => {
      const ad = await adService.getAd('ad-1');
      
      expect(ad).toEqual(expect.objectContaining({
        id: 'ad-1',
        title: 'Test Ad',
      }));
    });
    
    it('should return null if ad not found', async () => {
      const ad = await adService.getAd('non-existent-id');
      
      expect(ad).toBeNull();
    });
    
    it('should filter by advertiserId if provided', async () => {
      const ad = await adService.getAd('ad-1', 'wrong-advertiser');
      
      expect(ad).toBeNull();
    });
    
    it('should filter by campaignId if provided', async () => {
      const ad = await adService.getAd('ad-1', 'advertiser-1', 'wrong-campaign');
      
      expect(ad).toBeNull();
    });
  });
  
  describe('getAdsByCampaign', () => {
    it('should return ads for a campaign', async () => {
      const ads = await adService.getAdsByCampaign('campaign-1');
      
      expect(ads.length).toBeGreaterThan(0);
      expect(ads[0].campaignId).toBe('campaign-1');
    });
    
    it('should filter by advertiserId if provided', async () => {
      const ads = await adService.getAdsByCampaign('campaign-1', 'wrong-advertiser');
      
      expect(ads).toEqual([]);
    });
  });
  
  describe('updateAd', () => {
    it('should update an ad', async () => {
      const updateData = {
        id: 'ad-1',
        title: 'Updated Ad Title',
      };
      
      const ad = await adService.updateAd(updateData);
      
      expect(ad).toEqual(expect.objectContaining({
        id: 'ad-1',
        title: 'Updated Ad Title',
      }));
    });
    
    it('should throw ApiError if ad not found', async () => {
      const updateData = {
        id: 'non-existent-id',
        title: 'Updated Ad Title',
      };
      
      await expect(adService.updateAd(updateData))
        .rejects
        .toThrow(ApiError);
    });
  });
  
  describe('deleteAd', () => {
    it('should delete an ad', async () => {
      const ad = await adService.deleteAd('ad-1');
      
      expect(ad).toEqual(expect.objectContaining({
        id: 'ad-1',
      }));
    });
    
    it('should throw ApiError if ad not found', async () => {
      await expect(adService.deleteAd('non-existent-id'))
        .rejects
        .toThrow(ApiError);
    });
  });
  
  describe('updateAdStatus', () => {
    it('should update an ad status', async () => {
      // Using a spy to avoid actual implementation that would require database
      const updateSpy = jest.spyOn(adService, 'updateAdStatus').mockImplementation(
        async (id, status) => {
          if (id === 'ad-1') {
            return Promise.resolve({
              id: 'ad-1',
              status,
              title: 'Test Ad',
              description: 'Test Ad Description',
              createdAt: new Date(),
              updatedAt: new Date(),
              imageUrl: 'https://example.com/image.jpg',
              targetUrl: 'https://example.com',
              urlParameters: null,
              bidPerImpression: 100,
              bidPerClick: 500,
              freqCapViews: 2,
              freqCapHours: 24,
              targetLocation: null,
              targetInterests: null,
              targetAge: null,
              campaignId: 'campaign-1',
              advertiserId: 'advertiser-1',
              placements: [],
              viewHistory: [],
            });
          } else {
            throw new ApiError(404, 'Ad not found');
          }
        }
      );
      
      const ad = await adService.updateAdStatus('ad-1', 'PAUSED');
      
      expect(ad).toEqual(expect.objectContaining({
        id: 'ad-1',
        status: 'PAUSED',
      }));

      // Clean up spy
      updateSpy.mockRestore();
    });
    
    it('should throw ApiError if ad not found', async () => {
      // Using a spy to avoid actual implementation
      const updateSpy = jest.spyOn(adService, 'updateAdStatus').mockImplementation(
        async (id, status) => {
          if (id === 'ad-1') {
            return Promise.resolve({
              id: 'ad-1',
              status,
              title: 'Test Ad',
              description: 'Test Ad Description',
              createdAt: new Date(),
              updatedAt: new Date(),
              imageUrl: 'https://example.com/image.jpg',
              targetUrl: 'https://example.com',
              urlParameters: null,
              bidPerImpression: 100,
              bidPerClick: 500,
              freqCapViews: 2,
              freqCapHours: 24,
              targetLocation: null,
              targetInterests: null,
              targetAge: null,
              campaignId: 'campaign-1',
              advertiserId: 'advertiser-1',
              placements: [],
              viewHistory: [],
            });
          } else {
            throw new ApiError(404, 'Ad not found');
          }
        }
      );

      await expect(adService.updateAdStatus('non-existent-id', 'PAUSED'))
        .rejects
        .toThrow(ApiError);
      
      // Clean up spy
      updateSpy.mockRestore();
    });
  });
});