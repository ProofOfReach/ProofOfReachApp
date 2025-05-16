/**
 * Nostr Ad Marketplace SDK - Nostr Client Integration Examples
 * 
 * This file contains code snippets for integrating the SDK into a Nostr client.
 * These are examples of how ads can be integrated into various parts of a Nostr client UI.
 */

/**
 * Example 1: Feed Integration
 * 
 * This example shows how to integrate an ad into a Nostr feed
 * between posts. It fetches an ad every N posts and inserts it.
 */

// Import the SDK
import NostrAdMarketplaceSDK from 'nostr-ad-marketplace-sdk';

// Initialize SDK once at the application level
const adSDK = new NostrAdMarketplaceSDK({
  apiKey: process.env.NOSTR_AD_API_KEY,
  baseUrl: process.env.NOSTR_AD_API_URL || 'https://api.nostradmarketplace.com'
});

// Store recently shown ads to implement frequency capping
const recentlyShownAds = new Set();

// Get user's Nostr pubkey for better tracking
function getUserPubkey() {
  // This would come from your app's auth system
  return window.nostr?.getPublicKey() || localStorage.getItem('nostr_pubkey') || null;
}

// Configuration for ad frequency
const AD_FREQUENCY = 10; // Show an ad every 10 posts
const MAX_RECENTLY_SHOWN_ADS = 5; // Don't show the same 5 ads repeatedly

// Function to render an ad within a feed
async function renderAdInFeed(feedElement, postIndex) {
  // Only inject ads at the specified frequency
  if (postIndex % AD_FREQUENCY !== 0 || postIndex === 0) {
    return;
  }
  
  try {
    // Get users's pubkey for better tracking
    const pubkey = getUserPubkey();
    
    // Get interests from recent posts or user profile
    const interests = await getUserInterests();
    
    // Fetch an ad from the marketplace
    const ad = await adSDK.serveAd({
      placement: 'feed',
      interests,
      pubkey,
      format: 'text-image'
    });
    
    // Skip if no ad available or we recently showed this ad
    if (!ad || recentlyShownAds.has(ad.id)) {
      return;
    }
    
    // Add to recently shown ads and remove oldest if needed
    recentlyShownAds.add(ad.id);
    if (recentlyShownAds.size > MAX_RECENTLY_SHOWN_ADS) {
      const firstAdId = Array.from(recentlyShownAds)[0];
      recentlyShownAds.delete(firstAdId);
    }
    
    // Create ad element
    const adElement = document.createElement('div');
    adElement.className = 'nostr-ad-container';
    adElement.setAttribute('data-ad-id', ad.id);
    
    // Style to match feed posts but with sponsored indicator
    adElement.innerHTML = `
      <div class="feed-post ad-post">
        <div class="post-header">
          <img src="/img/ad-avatar.png" class="avatar" alt="Sponsored">
          <div class="post-meta">
            <div class="post-author">Sponsored</div>
            <div class="post-timestamp">Ad</div>
          </div>
        </div>
        <div class="post-content">
          <p>${ad.title}</p>
          <p>${ad.description}</p>
          ${ad.imageUrl ? `<img src="${ad.imageUrl}" class="post-image" alt="">` : ''}
          <a href="${ad.targetUrl}" target="_blank" rel="noopener noreferrer" 
             class="ad-cta-button" onclick="trackAdClick('${ad.id}', 'feed')">
            Learn More
          </a>
        </div>
      </div>
    `;
    
    // Insert the ad after the current post
    const posts = feedElement.querySelectorAll('.feed-post');
    if (posts[postIndex]) {
      posts[postIndex].insertAdjacentElement('afterend', adElement);
    }
  } catch (error) {
    console.error('Error rendering ad in feed:', error);
  }
}

// Function to track ad clicks
window.trackAdClick = function(adId, placement) {
  const pubkey = getUserPubkey();
  
  adSDK.trackClick({
    adId,
    placement,
    pubkey
  }).catch(error => {
    console.error('Failed to track click:', error);
  });
};

// Helper function to get user interests based on content
async function getUserInterests() {
  // This would be implemented based on your app's data
  // For example, analyze recent viewed posts or user profile
  return ['bitcoin', 'lightning', 'privacy'];
}

/**
 * Example 2: Sidebar Integration
 * 
 * This example shows how to add an ad to the sidebar of a Nostr client.
 */

class SidebarAdManager {
  constructor(sidebarElement, refreshInterval = 300000) { // 5 minutes
    this.sidebarElement = sidebarElement;
    this.adContainer = document.createElement('div');
    this.adContainer.className = 'sidebar-ad-container';
    this.sidebarElement.appendChild(this.adContainer);
    
    // Initial load
    this.loadAd();
    
    // Refresh periodically
    setInterval(() => this.loadAd(), refreshInterval);
  }
  
  async loadAd() {
    try {
      const pubkey = getUserPubkey();
      
      const ad = await adSDK.serveAd({
        placement: 'sidebar',
        pubkey,
        format: 'text-image'
      });
      
      if (!ad) {
        this.adContainer.innerHTML = '';
        return;
      }
      
      this.adContainer.innerHTML = `
        <div class="sidebar-ad">
          <div class="ad-label">Sponsored</div>
          ${ad.imageUrl ? `<img src="${ad.imageUrl}" class="ad-image" alt="">` : ''}
          <h4 class="ad-title">${ad.title}</h4>
          <p class="ad-description">${ad.description}</p>
          <a href="${ad.targetUrl}" target="_blank" rel="noopener noreferrer" 
             class="ad-link" onclick="trackAdClick('${ad.id}', 'sidebar')">
            Learn More
          </a>
        </div>
      `;
    } catch (error) {
      console.error('Error loading sidebar ad:', error);
      this.adContainer.innerHTML = '';
    }
  }
}

/**
 * Example 3: Profile Stats Integration
 * 
 * For publishers, this example shows how to display ad performance
 * stats on their profile page.
 */

class PublisherStatsWidget {
  constructor(containerElement) {
    this.containerElement = containerElement;
    this.loadStats();
  }
  
  async loadStats() {
    try {
      // Get the previous 30 days of stats
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const stats = await adSDK.fetchPublisherStats({
        startDate,
        endDate
      });
      
      this.containerElement.innerHTML = `
        <div class="publisher-stats">
          <h3>Ad Performance (Last 30 Days)</h3>
          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-value">${stats.impressions.toLocaleString()}</div>
              <div class="stat-label">Impressions</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${stats.clicks.toLocaleString()}</div>
              <div class="stat-label">Clicks</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${stats.ctr.toFixed(2)}%</div>
              <div class="stat-label">CTR</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${stats.earnings.toLocaleString()} sats</div>
              <div class="stat-label">Earnings</div>
            </div>
          </div>
          
          <div class="earnings-chart">
            <!-- Chart would be rendered here using chart.js or similar -->
          </div>
        </div>
      `;
      
      // In a real implementation, you would render a chart 
      // with the daily stats from stats.daily
    } catch (error) {
      console.error('Error loading publisher stats:', error);
      this.containerElement.innerHTML = `
        <div class="publisher-stats-error">
          <p>Unable to load ad performance stats. Please try again later.</p>
        </div>
      `;
    }
  }
}