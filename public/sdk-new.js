/**
 * ProofOfReach SDK v1.0.0
 * Nostr Ad Marketplace Lightning-powered SDK
 */

(function() {
  'use strict';

  // SDK namespace
  const ProofOfReachSDK = {
    baseUrl: window.location.hostname.includes('localhost') || window.location.hostname.includes('replit.app') 
      ? window.location.origin
      : 'https://api.proofofreach.com',
    
    // Configuration defaults
    config: {
      testMode: false,
      defaultStyles: true,
      adType: 'standard', // standard, small, or banner
      refreshInterval: 300000, // 5 minutes in milliseconds
    },
    
    // Store rendered ad instances
    instances: [],

    /**
     * Initialize the SDK
     * @param {Object} options - Configuration options
     */
    init: function(options = {}) {
      this.config = { ...this.config, ...options };
      console.log('🚀 ProofOfReach SDK initialized with options:', this.config);
      
      // Report initialization
      this._sendAnalytics('sdk_init', {
        url: window.location.href,
        testMode: this.config.testMode,
      });
      
      return this;
    },
    
    /**
     * Render an ad in the specified container
     * @param {string} containerId - DOM element ID where ad should be rendered
     * @param {Object} options - Ad-specific options
     * @returns {Object} - Control interface for the ad
     */
    renderAd: function(containerId, options = {}) {
      const container = document.getElementById(containerId);
      if (!container) {
        console.error(`❌ ProofOfReach SDK: Container #${containerId} not found`);
        return null;
      }
      
      // Merge global config with ad-specific options
      const adOptions = { ...this.config, ...options };
      
      console.log(`🎯 ProofOfReach SDK: Rendering ad in #${containerId}`, adOptions);
      
      // Clear existing content
      container.innerHTML = '';
      
      // Apply container styles if defaultStyles is enabled
      if (adOptions.defaultStyles) {
        container.style.border = '1px solid #e5e7eb';
        container.style.borderRadius = '6px';
        container.style.padding = '16px';
        container.style.backgroundColor = '#fff';
        container.style.boxShadow = '0 1px 3px rgba(0,0,0,0.12)';
        container.style.position = 'relative';
        container.style.overflow = 'hidden';
      }
      
      // Create ad instance
      const adInstance = {
        id: `por-ad-${Math.random().toString(36).substring(2, 9)}`,
        container,
        options: adOptions,
        loaded: false,
      };
      
      // Create loading indicator
      const loadingEl = document.createElement('div');
      loadingEl.innerHTML = 'Loading ProofOfReach ad...';
      loadingEl.style.textAlign = 'center';
      loadingEl.style.padding = '20px';
      loadingEl.style.color = '#6b7280';
      container.appendChild(loadingEl);
      
      // Store instance
      this.instances.push(adInstance);
      
      // Fetch and render ad
      this._fetchAd(adInstance)
        .then(adData => {
          this._renderAdContent(adInstance, adData);
          // Set up refresh timer if needed
          if (adOptions.refreshInterval > 0) {
            adInstance.refreshTimer = setInterval(() => {
              this._fetchAd(adInstance)
                .then(freshData => this._renderAdContent(adInstance, freshData));
            }, adOptions.refreshInterval);
          }
        })
        .catch(error => {
          console.error('❌ ProofOfReach SDK: Error fetching ad:', error);
          container.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #9C27B0;">
              <p style="margin: 0; font-weight: 500;">Ad space available</p>
              <p style="margin: 5px 0; font-size: 12px;">Powered by ProofOfReach</p>
            </div>
          `;
        });
      
      // Return public interface for controlling this ad
      return {
        refresh: () => this._refreshAd(adInstance),
        remove: () => this._removeAd(adInstance),
        getStats: () => this._getAdStats(adInstance),
      };
    },
    
    /**
     * Internal method to fetch ad content
     * @private
     */
    _fetchAd: function(adInstance) {
      // For demo purposes, we're simulating an API call
      if (adInstance.options.testMode) {
        return new Promise((resolve) => {
          // Simulate network delay
          setTimeout(() => {
            resolve(this._getTestAd(adInstance.options));
          }, 700);
        });
      } else {
        // In real implementation, fetch from API
        const endpoint = `${this.baseUrl}/api/ads/serve`;
        const params = new URLSearchParams({
          pubkey: adInstance.options.pubkey || '',
          slot: adInstance.options.slot || 'default',
          adType: adInstance.options.adType,
          testMode: adInstance.options.testMode,
        });
        
        return fetch(`${endpoint}?${params}`)
          .then(response => {
            if (!response.ok) {
              throw new Error(`HTTP error ${response.status}`);
            }
            return response.json();
          });
      }
    },
    
    /**
     * Create test ad content for demo purposes
     * @private
     */
    _getTestAd: function(options) {
      // Generate a test ad with image focus, using proper Bitcoin-themed images
      const testAds = [
        {
          id: 'test-ad-1',
          title: 'Learn Bitcoin Development',
          description: 'Master Bitcoin and Lightning Network development with our online courses.',
          imageUrl: '/images/ads/bitcoin_development.jpg',
          targetUrl: 'https://example.com/bitcoin-dev',
          sponsor: 'Bitcoin Academy',
          callToAction: 'Start Learning',
          styles: {
            background: 'linear-gradient(135deg, #9333ea 0%, #4f46e5 100%)',
            color: '#ffffff',
          }
        },
        {
          id: 'test-ad-2',
          title: 'Bitcoin Hardware Wallet',
          description: 'Secure your Bitcoin with our military-grade hardware wallet.',
          imageUrl: '/images/ads/hardware_wallet.jpg',
          targetUrl: 'https://example.com/hardware-wallet',
          sponsor: 'SecureSats',
          callToAction: 'Shop Now',
          styles: {
            background: 'linear-gradient(135deg, #f59e0b 0%, #f43f5e 100%)',
            color: '#ffffff',
          }
        },
        {
          id: 'test-ad-3',
          title: 'Join the Lightning Network',
          description: 'Start accepting Bitcoin payments instantly with our Lightning solution.',
          imageUrl: '/images/ads/lightning_network.jpg',
          targetUrl: 'https://example.com/lightning',
          sponsor: 'Lightning Labs',
          callToAction: 'Get Started',
          styles: {
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            color: '#ffffff',
          }
        }
      ];
      
      // If adIndex is specified, use that specific ad, otherwise select randomly
      if (options && typeof options.adIndex === 'number' && options.adIndex >= 0 && options.adIndex < testAds.length) {
        return testAds[options.adIndex];
      }
      
      // Select a random ad if no specific index is requested
      return testAds[Math.floor(Math.random() * testAds.length)];
    },
    
    /**
     * Render ad content in the container
     * @private
     */
    _renderAdContent: function(adInstance, adData) {
      const container = adInstance.container;
      const options = adInstance.options;
      
      // Clear container
      container.innerHTML = '';
      
      // Create ad elements
      const adElement = document.createElement('div');
      adElement.className = 'proof-of-reach-ad';
      adElement.style.cursor = 'pointer';
      adElement.style.position = 'relative';
      adElement.style.width = '300px';
      adElement.style.height = '250px';
      adElement.style.boxSizing = 'border-box';
      
      // Apply ad styles if any
      if (adData.styles) {
        Object.keys(adData.styles).forEach(key => {
          adElement.style[key] = adData.styles[key];
        });
      }
      
      // Create ad content HTML formatted for standard 300x250 size
      adElement.innerHTML = `
        <div style="padding: 12px; position: relative; z-index: 2; height: 226px; box-sizing: border-box;">
          <div style="margin-bottom: 8px;">
            <h3 style="margin: 0; font-size: 16px; font-weight: 600;">${adData.title}</h3>
          </div>
          ${adData.imageUrl ? 
            `<div style="margin: 8px 0; text-align: center;">
              <img src="${adData.imageUrl}" alt="${adData.title}" 
                style="width: 100%; height: 120px; object-fit: cover; border-radius: 4px; display: block;">
             </div>` : ''}
          <p style="margin: 6px 0; font-size: 12px; max-height: 36px; overflow: hidden;">${adData.description}</p>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
            <span style="font-size: 10px;">By ${adData.sponsor}</span>
            <button style="background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3); border-radius: 4px; padding: 4px 10px; font-size: 12px; color: inherit; cursor: pointer;">${adData.callToAction}</button>
          </div>
          <div style="position: absolute; bottom: 5px; right: 5px; font-size: 9px; opacity: 0.7;">
            ⚡ ProofOfReach
          </div>
        </div>
      `;
      
      // Track user engagement
      let viewStartTime = Date.now();
      let engagementTimer = null;
      let hasEarnedFromEngagement = false;
      
      // Function to handle view earnings after 5 seconds
      const checkEngagementEarnings = () => {
        const viewDuration = (Date.now() - viewStartTime) / 1000;
        
        // Only pay once per ad view if user lingers for > 5 seconds
        if (viewDuration > 5 && !hasEarnedFromEngagement && options.testMode && typeof options.onPayment === 'function') {
          // Simulate payment for linger engagement (7-15 sats)
          const sats = Math.floor(Math.random() * 9) + 7;
          options.onPayment(sats);
          
          this._sendAnalytics('ad_engagement_reward', {
            adId: adData.id,
            pubkey: options.pubkey,
            duration: Math.round(viewDuration),
            sats: sats
          });
          
          hasEarnedFromEngagement = true;
          
          // Show engagement notification
          const notificationEl = document.createElement('div');
          notificationEl.style.position = 'absolute';
          notificationEl.style.top = '10px';
          notificationEl.style.right = '10px';
          notificationEl.style.background = 'rgba(0,0,0,0.7)';
          notificationEl.style.color = 'white';
          notificationEl.style.padding = '8px 12px';
          notificationEl.style.borderRadius = '4px';
          notificationEl.style.fontSize = '12px';
          notificationEl.style.opacity = '0';
          notificationEl.style.transition = 'opacity 0.3s ease';
          notificationEl.textContent = `+${sats} sats earned!`;
          
          container.appendChild(notificationEl);
          
          // Animate notification
          setTimeout(() => {
            notificationEl.style.opacity = '1';
            setTimeout(() => {
              notificationEl.style.opacity = '0';
              setTimeout(() => notificationEl.remove(), 300);
            }, 2000);
          }, 10);
        }
      };
      
      // Set up engagement timer to check every second
      engagementTimer = setInterval(checkEngagementEarnings, 1000);
      
      // Handle ad click
      adElement.addEventListener('click', (e) => {
        // Prevent default navigation
        e.preventDefault();
        
        // Track click
        this._sendAnalytics('ad_click', {
          adId: adData.id,
          pubkey: options.pubkey,
        });
        
        // Process Lightning payment if in test mode & not already earned through engagement
        if (options.testMode && typeof options.onPayment === 'function' && !hasEarnedFromEngagement) {
          // Simulate payment for click (5-12 sats)
          const sats = Math.floor(Math.random() * 8) + 5;
          options.onPayment(sats);
          
          // Mark as earned to prevent double payment
          hasEarnedFromEngagement = true;
          
          // Clear engagement timer - no need to check anymore
          if (engagementTimer) {
            clearInterval(engagementTimer);
          }
        }
        
        // Open ad URL in new tab
        if (adData.targetUrl) {
          window.open(adData.targetUrl, '_blank');
        }
      });
      
      // Handle cleanup when element is removed
      adInstance.cleanup = () => {
        if (engagementTimer) {
          clearInterval(engagementTimer);
        }
      };
      
      // Add ad to container
      container.appendChild(adElement);
      
      // Mark ad as loaded
      adInstance.loaded = true;
      
      // Track impression
      this._sendAnalytics('ad_impression', {
        adId: adData.id,
        pubkey: options.pubkey,
      });
      
      console.log('✅ ProofOfReach SDK: Ad rendered successfully', adData);
    },
    
    /**
     * Refresh an ad instance
     * @private
     */
    _refreshAd: function(adInstance) {
      console.log('🔄 ProofOfReach SDK: Refreshing ad', adInstance.id);
      return this._fetchAd(adInstance)
        .then(adData => this._renderAdContent(adInstance, adData));
    },
    
    /**
     * Remove an ad instance
     * @private
     */
    _removeAd: function(adInstance) {
      // Clear refresh timer if exists
      if (adInstance.refreshTimer) {
        clearInterval(adInstance.refreshTimer);
      }
      
      // Remove from DOM
      adInstance.container.innerHTML = '';
      
      // Remove from instances array
      const index = this.instances.findIndex(inst => inst.id === adInstance.id);
      if (index !== -1) {
        this.instances.splice(index, 1);
      }
      
      console.log('🗑️ ProofOfReach SDK: Ad removed', adInstance.id);
    },
    
    /**
     * Get stats for an ad instance
     * @private
     */
    _getAdStats: function(adInstance) {
      // In a real implementation, this would fetch stats from the server
      return {
        id: adInstance.id,
        loaded: adInstance.loaded,
        impressions: 1, // Mock data
        clicks: 0,      // Mock data
      };
    },
    
    /**
     * Send analytics event to server
     * @private
     */
    _sendAnalytics: function(eventType, data) {
      // In a real implementation, this would send data to an analytics endpoint
      console.log(`📊 ProofOfReach Analytics: ${eventType}`, data);
      
      if (this.config.testMode) {
        // Don't actually send analytics in test mode
        return Promise.resolve();
      }
      
      // Real implementation would send a fetch request
      // return fetch(`${this.baseUrl}/api/analytics`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ event: eventType, ...data, timestamp: Date.now() }),
      // });
    },
  };

  // Expose the SDK globally
  window.ProofOfReachSDK = ProofOfReachSDK;
})();

// Initialize with default settings
if (window.ProofOfReachSDK) {
  window.ProofOfReachSDK.init();
}

console.log('💫 ProofOfReach SDK loaded successfully!');