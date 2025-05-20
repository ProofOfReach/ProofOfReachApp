/**
 * Proof Of Reach JavaScript SDK
 * 
 * A lightweight client library for interacting with the Proof Of Reach API.
 * This SDK makes it easy for publishers to display ads on their platforms.
 */

class ProofOfReachSDK {
  /**
   * Creates a new instance of the ProofOfReachSDK
   * 
   * @param {Object} config - Configuration options
   * @param {string} config.apiKey - Your API key for authentication
   * @param {string} [config.baseUrl] - Optional base URL for the API (defaults to production)
   * @param {boolean} [config.debug] - Enable debug logging
   */
  constructor(config) {
    if (!config || !config.apiKey) {
      throw new Error('API key is required to initialize the SDK');
    }

    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.proofofreach.com';
    this.debug = config.debug || false;

    // Bind methods
    this.serveAd = this.serveAd.bind(this);
    this.trackClick = this.trackClick.bind(this);
    this.fetchPublisherStats = this.fetchPublisherStats.bind(this);
  }

  /**
   * Log debug messages if debug mode is enabled
   * 
   * @param {string} message - The message to log
   * @param {any} [data] - Optional data to log
   * @private
   */
  _log(message, data) {
    if (this.debug) {
      console.log(`[ProofOfReachSDK] ${message}`, data || '');
    }
  }

  /**
   * Make an API request
   * 
   * @param {string} endpoint - API endpoint path
   * @param {Object} options - Fetch options
   * @returns {Promise<any>} - The API response
   * @private
   */
  async _request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers
    };

    const config = {
      ...options,
      headers
    };

    this._log(`Fetching ${options.method || 'GET'} ${url}`, config);

    try {
      const response = await fetch(url, config);
      
      // Handle 204 No Content responses
      if (response.status === 204) {
        return null;
      }

      // For all other responses, try to parse as JSON
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `API error: ${response.status}`);
      }

      return data;
    } catch (error) {
      this._log('API request failed', error);
      throw error;
    }
  }

  /**
   * Retrieve a targeted ad for display
   * 
   * @param {Object} options - Ad serving options
   * @param {string} [options.placement] - Placement type (feed, sidebar, banner, etc.)
   * @param {string} [options.pubkey] - Publisher's Nostr public key
   * @param {string|string[]} [options.interests] - Content interests for targeting
   * @param {string} [options.format] - Ad format (text, image, text-image, rich)
   * @returns {Promise<Object|null>} - The ad to display or null if no suitable ad is found
   */
  async serveAd(options = {}) {
    const queryParams = new URLSearchParams();
    
    if (options.placement) queryParams.append('placement', options.placement);
    if (options.pubkey) queryParams.append('pubkey', options.pubkey);
    if (options.format) queryParams.append('format', options.format);
    
    // Handle interests as array or string
    if (options.interests) {
      const interestsValue = Array.isArray(options.interests) 
        ? options.interests.join(',') 
        : options.interests;
      queryParams.append('interests', interestsValue);
    }

    const queryString = queryParams.toString();
    const endpoint = `/api/ads/serve${queryString ? `?${queryString}` : ''}`;

    try {
      const response = await this._request(endpoint);
      return response;
    } catch (error) {
      // Return null instead of throwing if no ad is available (204 response)
      if (error.message.includes('204')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Track an ad click
   * 
   * @param {Object} options - Click tracking options
   * @param {string} options.adId - The ID of the ad that was clicked
   * @param {string} [options.pubkey] - Publisher's Nostr public key
   * @param {string} [options.placement] - Where the ad was displayed
   * @returns {Promise<Object>} - Tracking confirmation
   */
  async trackClick(options) {
    if (!options.adId) {
      throw new Error('adId is required for tracking clicks');
    }

    const endpoint = `/api/ads/${options.adId}/click`;
    
    const payload = {
      pubkey: options.pubkey,
      placement: options.placement
    };

    return this._request(endpoint, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  /**
   * Fetch publisher statistics
   * 
   * @param {Object} options - Options for fetching stats
   * @param {string} [options.startDate] - Start date for the stats period (YYYY-MM-DD)
   * @param {string} [options.endDate] - End date for the stats period (YYYY-MM-DD)
   * @returns {Promise<Object>} - Publisher statistics
   */
  async fetchPublisherStats(options = {}) {
    const queryParams = new URLSearchParams();
    
    if (options.startDate) queryParams.append('startDate', options.startDate);
    if (options.endDate) queryParams.append('endDate', options.endDate);

    const queryString = queryParams.toString();
    const endpoint = `/api/publisher/stats${queryString ? `?${queryString}` : ''}`;

    return this._request(endpoint);
  }
}

// Export for CommonJS environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProofOfReachSDK;
}

// Export for ES modules environments
if (typeof exports !== 'undefined') {
  exports.ProofOfReachSDK = ProofOfReachSDK;
}

// Make available in the browser
if (typeof window !== 'undefined') {
  window.ProofOfReachSDK = ProofOfReachSDK;
}