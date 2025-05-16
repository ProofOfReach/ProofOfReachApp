import {
  fetchAdvertiserSummary,
  fetchAdvertiserDailyMetrics,
  fetchCampaignPerformance,
  fetchPublisherEarnings,
  fetchAdSpacePerformance
} from '@/services/analyticsService';

// Mock fetch
global.fetch = jest.fn();

describe('Analytics Service', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('fetchAdvertiserSummary', () => {
    it('should fetch advertiser summary with default params', async () => {
      const mockResponse = {
        impressions: 25000,
        clicks: 1200,
        ctr: 4.8,
        spend: 60000,
        averageCPC: 50,
        trends: {
          impressions: 5.2,
          clicks: 8.7,
          ctr: 3.4,
          spend: 11.2,
          averageCPC: -2.5
        }
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await fetchAdvertiserSummary();
      
      expect(fetch).toHaveBeenCalledWith('/api/analytics/advertiser/summary?');
      expect(result).toEqual(mockResponse);
    });

    it('should include advertiser ID and date range parameters when provided', async () => {
      const mockResponse = { data: 'test' };
      const advertiser = 'adv-123';
      const dateRange = { start: '2023-05-01', end: '2023-05-31' };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      await fetchAdvertiserSummary(advertiser, dateRange);
      
      expect(fetch).toHaveBeenCalledWith(
        '/api/analytics/advertiser/summary?start=2023-05-01&end=2023-05-31&advertiserId=adv-123'
      );
    });

    it('should throw error if response is not ok', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false
      });

      await expect(fetchAdvertiserSummary()).rejects.toThrow('Failed to fetch advertiser summary');
    });
  });

  describe('fetchAdvertiserDailyMetrics', () => {
    it('should fetch advertiser daily metrics with default params', async () => {
      const mockResponse = [
        { date: '2023-05-01', impressions: 4000, clicks: 200, spend: 10000 },
        { date: '2023-05-02', impressions: 4200, clicks: 210, spend: 10500 }
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await fetchAdvertiserDailyMetrics();
      
      expect(fetch).toHaveBeenCalledWith('/api/analytics/advertiser/daily?');
      expect(result).toEqual(mockResponse);
    });

    it('should include advertiser ID and date range parameters when provided', async () => {
      const mockResponse = [{ date: '2023-05-01', impressions: 4000, clicks: 200, spend: 10000 }];
      const advertiser = 'adv-123';
      const dateRange = { start: '2023-05-01', end: '2023-05-01' };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      await fetchAdvertiserDailyMetrics(advertiser, dateRange);
      
      expect(fetch).toHaveBeenCalledWith(
        '/api/analytics/advertiser/daily?start=2023-05-01&end=2023-05-01&advertiserId=adv-123'
      );
    });

    it('should throw error if response is not ok', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false
      });

      await expect(fetchAdvertiserDailyMetrics()).rejects.toThrow('Failed to fetch advertiser daily metrics');
    });
  });

  describe('fetchCampaignPerformance', () => {
    it('should fetch campaign performance with default params', async () => {
      const mockResponse = [
        { id: 'camp-1', name: 'Campaign 1', impressions: 10000, clicks: 500, ctr: 5.0, spend: 25000, status: 'active' },
        { id: 'camp-2', name: 'Campaign 2', impressions: 8000, clicks: 320, ctr: 4.0, spend: 16000, status: 'active' }
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await fetchCampaignPerformance();
      
      expect(fetch).toHaveBeenCalledWith('/api/analytics/advertiser/campaigns?');
      expect(result).toEqual(mockResponse);
    });

    it('should include advertiser ID and date range parameters when provided', async () => {
      const mockResponse = [{ id: 'camp-1', name: 'Campaign 1', impressions: 10000, clicks: 500 }];
      const advertiser = 'adv-123';
      const dateRange = { start: '2023-05-01', end: '2023-05-31' };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      await fetchCampaignPerformance(advertiser, dateRange);
      
      expect(fetch).toHaveBeenCalledWith(
        '/api/analytics/advertiser/campaigns?start=2023-05-01&end=2023-05-31&advertiserId=adv-123'
      );
    });

    it('should throw error if response is not ok', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false
      });

      await expect(fetchCampaignPerformance()).rejects.toThrow('Failed to fetch campaign performance');
    });
  });

  describe('fetchPublisherEarnings', () => {
    it('should fetch publisher earnings with default params', async () => {
      const mockResponse = [
        { date: '2023-05-01', impressions: 3000, clicks: 150, earnings: 7500 },
        { date: '2023-05-02', impressions: 3200, clicks: 160, earnings: 8000 }
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await fetchPublisherEarnings();
      
      expect(fetch).toHaveBeenCalledWith('/api/analytics/publisher/earnings?');
      expect(result).toEqual(mockResponse);
    });

    it('should include publisher ID and date range parameters when provided', async () => {
      const mockResponse = [{ date: '2023-05-01', impressions: 3000, clicks: 150, earnings: 7500 }];
      const publisher = 'pub-123';
      const dateRange = { start: '2023-05-01', end: '2023-05-01' };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      await fetchPublisherEarnings(publisher, dateRange);
      
      expect(fetch).toHaveBeenCalledWith(
        '/api/analytics/publisher/earnings?start=2023-05-01&end=2023-05-01&publisherId=pub-123'
      );
    });

    it('should throw error if response is not ok', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false
      });

      await expect(fetchPublisherEarnings()).rejects.toThrow('Failed to fetch publisher earnings');
    });
  });

  describe('fetchAdSpacePerformance', () => {
    it('should fetch ad space performance with default params', async () => {
      const mockResponse = [
        { id: 'space-1', name: 'Ad Space 1', impressions: 8000, clicks: 400, ctr: 5.0, earnings: 20000, status: 'active' },
        { id: 'space-2', name: 'Ad Space 2', impressions: 6000, clicks: 240, ctr: 4.0, earnings: 12000, status: 'active' }
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await fetchAdSpacePerformance();
      
      expect(fetch).toHaveBeenCalledWith('/api/analytics/publisher/adspaces?');
      expect(result).toEqual(mockResponse);
    });

    it('should include date range parameters when provided', async () => {
      const mockResponse = [{ id: 'space-1', name: 'Ad Space 1', impressions: 8000, clicks: 400 }];
      const dateRange = { start: '2023-05-01', end: '2023-05-31' };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      await fetchAdSpacePerformance(dateRange);
      
      expect(fetch).toHaveBeenCalledWith(
        '/api/analytics/publisher/adspaces?start=2023-05-01&end=2023-05-31'
      );
    });

    it('should throw error if response is not ok', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false
      });

      await expect(fetchAdSpacePerformance()).rejects.toThrow('Failed to fetch ad space performance');
    });
  });
});