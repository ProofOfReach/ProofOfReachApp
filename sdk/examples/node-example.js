/**
 * Nostr Ad Marketplace SDK - Node.js Example
 * 
 * This example demonstrates how to use the SDK in a Node.js environment
 * to fetch ads and track clicks server-side.
 */

// Import the SDK
const NostrAdMarketplaceSDK = require('../index.js');

// Initialize the SDK with your API key
const adSDK = new NostrAdMarketplaceSDK({
  apiKey: process.env.NOSTR_AD_API_KEY || 'TEST_API_KEY_000', 
  baseUrl: process.env.API_BASE_URL || 'http://localhost:5000',
  debug: true
});

async function main() {
  console.log('Nostr Ad Marketplace SDK - Node.js Example\n');
  
  try {
    // Fetch an ad for the sidebar
    console.log('Fetching sidebar ad...');
    const sidebarAd = await adSDK.serveAd({
      placement: 'sidebar',
      interests: ['bitcoin', 'lightning', 'nostr'],
      format: 'text-image'
    });
    
    if (sidebarAd) {
      console.log('\nSidebar Ad:');
      console.log(`- Title: ${sidebarAd.title}`);
      console.log(`- Description: ${sidebarAd.description}`);
      console.log(`- Target URL: ${sidebarAd.targetUrl}`);
      console.log(`- Image URL: ${sidebarAd.imageUrl || 'No image'}`);
      console.log(`- Bid per impression: ${sidebarAd.bidPerImpression} sats`);
      console.log(`- Bid per click: ${sidebarAd.bidPerClick} sats`);
      
      // Simulate tracking a click
      console.log('\nSimulating a click on this ad...');
      try {
        await adSDK.trackClick({
          adId: sidebarAd.id,
          pubkey: 'npub1example000000000000000000000000000000000000000000000',
          placement: 'sidebar'
        });
        console.log('Click tracked successfully!');
      } catch (clickError) {
        console.error('Error tracking click:', clickError.message);
      }
    } else {
      console.log('No sidebar ad available');
    }
    
    // Fetch publisher stats
    console.log('\nFetching publisher stats...');
    try {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      
      const startDate = formatDate(monthAgo);
      const endDate = formatDate(new Date());
      
      const stats = await adSDK.fetchPublisherStats({
        startDate,
        endDate
      });
      
      console.log('\nPublisher Stats:');
      console.log(`- Total impressions: ${stats.impressions}`);
      console.log(`- Total clicks: ${stats.clicks}`);
      console.log(`- CTR: ${stats.ctr.toFixed(2)}%`);
      console.log(`- Total earnings: ${stats.earnings} sats`);
      
      if (stats.daily && stats.daily.length > 0) {
        console.log('\nRecent daily stats:');
        stats.daily.slice(-5).forEach(day => {
          console.log(`- ${day.date}: ${day.impressions} imps, ${day.clicks} clicks, ${day.earnings} sats`);
        });
      }
    } catch (statsError) {
      console.error('Error fetching publisher stats:', statsError.message);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Helper function to format dates as YYYY-MM-DD
function formatDate(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-');
}

// Run the example
main().catch(console.error);