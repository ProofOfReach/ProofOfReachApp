/**
 * Nostr Ad Marketplace SDK - Unit Tests Example
 * 
 * This example shows how to write tests for code that uses the SDK.
 * 
 * To run this test, you would typically:
 * npm install --save-dev jest fetch-mock
 * 
 * Then add to your package.json:
 * "scripts": {
 *   "test": "jest"
 * }
 */

// Import the SDK and testing libraries
const NostrAdMarketplaceSDK = require('../index.js');
const fetchMock = require('fetch-mock');

// Mock data for testing
const mockAd = {
  id: 'ad123',
  title: 'Test Ad',
  description: 'This is a test advertisement',
  imageUrl: 'https://example.com/image.jpg',
  targetUrl: 'https://example.com/landing',
  bidPerImpression: 10,
  bidPerClick: 50,
  status: 'ACTIVE',
  campaignId: 'campaign123',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z'
};

const mockStats = {
  impressions: 1000,
  clicks: 50,
  ctr: 5.0,
  earnings: 15000,
  daily: [
    { date: '2023-01-01', impressions: 250, clicks: 15, earnings: 3750 },
    { date: '2023-01-02', impressions: 300, clicks: 10, earnings: 3500 },
    { date: '2023-01-03', impressions: 450, clicks: 25, earnings: 7750 }
  ]
};

// Test suite
describe('NostrAdMarketplaceSDK', () => {
  let sdk;
  
  // Setup before each test
  beforeEach(() => {
    // Create fresh SDK instance for each test
    sdk = new NostrAdMarketplaceSDK({
      apiKey: 'test-api-key',
      baseUrl: 'https://api.test.com'
    });
    
    // Reset all fetch mocks between tests
    fetchMock.restore();
  });
  
  describe('constructor', () => {
    test('should throw an error if API key is not provided', () => {
      expect(() => new NostrAdMarketplaceSDK({})).toThrow('API key is required');
    });
    
    test('should use the provided base URL', () => {
      const customSdk = new NostrAdMarketplaceSDK({
        apiKey: 'test-api-key',
        baseUrl: 'https://custom.api.com'
      });
      
      // Setup mock for a request
      fetchMock.get('https://custom.api.com/api/ads/serve', mockAd);
      
      // Make request and verify correct URL is used
      return customSdk.serveAd()
        .then(() => {
          expect(fetchMock.called('https://custom.api.com/api/ads/serve')).toBe(true);
        });
    });
  });
  
  describe('serveAd', () => {
    test('should fetch an ad with no parameters', () => {
      fetchMock.get('https://api.test.com/api/ads/serve', mockAd);
      
      return sdk.serveAd()
        .then(ad => {
          expect(ad).toEqual(mockAd);
          expect(fetchMock.lastOptions().headers.Authorization).toBe('Bearer test-api-key');
        });
    });
    
    test('should include query parameters when provided', () => {
      fetchMock.get('https://api.test.com/api/ads/serve?placement=sidebar&interests=bitcoin%2Clightning&format=text-image', mockAd);
      
      return sdk.serveAd({
        placement: 'sidebar',
        interests: ['bitcoin', 'lightning'],
        format: 'text-image'
      }).then(ad => {
        expect(ad).toEqual(mockAd);
      });
    });
    
    test('should convert interests string to comma-separated value', () => {
      fetchMock.get('https://api.test.com/api/ads/serve?interests=bitcoin%2Clightning', mockAd);
      
      return sdk.serveAd({
        interests: 'bitcoin,lightning'
      }).then(ad => {
        expect(ad).toEqual(mockAd);
      });
    });
    
    test('should return null for 204 No Content response', () => {
      fetchMock.get('https://api.test.com/api/ads/serve', { status: 204 });
      
      return sdk.serveAd()
        .then(ad => {
          expect(ad).toBeNull();
        });
    });
    
    test('should throw an error for failed requests', () => {
      fetchMock.get('https://api.test.com/api/ads/serve', {
        status: 400,
        body: { message: 'Bad request' }
      });
      
      return expect(sdk.serveAd()).rejects.toThrow('Bad request');
    });
  });
  
  describe('trackClick', () => {
    test('should throw error if adId is not provided', () => {
      return expect(sdk.trackClick({})).rejects.toThrow('adId is required');
    });
    
    test('should track a click successfully', () => {
      fetchMock.post('https://api.test.com/api/ads/ad123/click', {
        success: true,
        message: 'Click tracked'
      });
      
      return sdk.trackClick({ adId: 'ad123', pubkey: 'pub123', placement: 'sidebar' })
        .then(response => {
          expect(response).toEqual({ success: true, message: 'Click tracked' });
          
          // Verify request body
          const lastCall = fetchMock.lastCall();
          const requestBody = JSON.parse(lastCall[1].body);
          expect(requestBody).toEqual({
            pubkey: 'pub123',
            placement: 'sidebar'
          });
        });
    });
  });
  
  describe('fetchPublisherStats', () => {
    test('should fetch publisher stats with no parameters', () => {
      fetchMock.get('https://api.test.com/api/publisher/stats', mockStats);
      
      return sdk.fetchPublisherStats()
        .then(stats => {
          expect(stats).toEqual(mockStats);
        });
    });
    
    test('should include date parameters when provided', () => {
      fetchMock.get('https://api.test.com/api/publisher/stats?startDate=2023-01-01&endDate=2023-01-31', mockStats);
      
      return sdk.fetchPublisherStats({
        startDate: '2023-01-01',
        endDate: '2023-01-31'
      }).then(stats => {
        expect(stats).toEqual(mockStats);
      });
    });
  });
});

// Mocking the SDK in your application tests

describe('AdComponent', () => {
  // Simplified example of testing a component that uses the SDK
  test('should render an ad from the SDK', async () => {
    // Create a mock of the SDK
    const mockSDK = {
      serveAd: jest.fn().mockResolvedValue(mockAd),
      trackClick: jest.fn().mockResolvedValue({ success: true })
    };
    
    // You would inject this mock to your component
    // For example, pass it as a prop or mock the module
    
    // Then test that:
    // 1. serveAd was called with correct parameters
    expect(mockSDK.serveAd).toHaveBeenCalledWith(expect.objectContaining({ 
      placement: 'sidebar'
    }));
    
    // 2. Your component rendered the ad content
    // This would use React Testing Library or similar
    
    // 3. When clicking the ad, trackClick is called
    // fireEvent.click(adElement);
    // expect(mockSDK.trackClick).toHaveBeenCalledWith({ 
    //   adId: 'ad123',
    //   placement: 'sidebar'
    // });
  });
});