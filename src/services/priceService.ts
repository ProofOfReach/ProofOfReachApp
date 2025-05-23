/**
 * Service for fetching and caching Bitcoin price data
 * Used for currency conversion throughout the application
 */

// Constants
const BTC_TO_SATS = 100000000; // 1 BTC = 100,000,000 satoshis
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

// Interface for price data
interface PriceData {
  btcPriceUsd: number;
  lastUpdated: number; // timestamp
}

class PriceService {
  private priceData: PriceData | null = null;
  
  /**
   * Get the current BTC price in USD
   * Fetches from API if cache is expired
   */
  async getBtcPriceUsd(): Promise<number> {
    await this.updatePriceIfNeeded();
    
    if (!this.priceData) {
      throw new Error('Failed to get Bitcoin price data');
    }
    
    return this.priceData.btcPriceUsd;
  }
  
  /**
   * Convert satoshis to USD
   * @param sats Amount in satoshis
   * @returns Equivalent amount in USD
   */
  async satsToUsd(sats: number): Promise<number> {
    const btcPriceUsd = await this.getBtcPriceUsd();
    const btcAmount = sats / BTC_TO_SATS;
    return btcAmount * btcPriceUsd;
  }
  
  /**
   * Convert USD to satoshis
   * @param usd Amount in USD
   * @returns Equivalent amount in satoshis
   */
  async usdToSats(usd: number): Promise<number> {
    const btcPriceUsd = await this.getBtcPriceUsd();
    const btcAmount = usd / btcPriceUsd;
    return btcAmount * BTC_TO_SATS;
  }
  
  /**
   * Get the timestamp of the last price update
   * @returns Timestamp in milliseconds or null if never updated
   */
  getLastUpdateTimestamp(): number | null {
    return this.priceData?.lastUpdated || null;
  }
  
  /**
   * Fetch the latest BTC price from CoinGecko API
   * @returns The price data
   */
  private async fetchBtcPrice(): Promise<PriceData> {
    // Set fallback price, in case API calls consistently fail
    // Using this as estimation in case of API issues
    const FALLBACK_BTC_PRICE = 43000;
    
    // Try to get data from localStorage first (as a cache fallback)
    try {
      const cachedData = localStorage.getItem('btc_price_data');
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        // Only use cached data if it's not too old (less than 1 hour)
        if (parsedData && Date.now() - parsedData.lastUpdated < 3600000) {
          console.log('Using localStorage cached BTC price data');
          return parsedData;
        }
      }
    } catch (e) {
      console.warn('Error retrieving from localStorage:', e);
    }
    
    try {
      // Set a reasonable timeout for the fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
        { signal: controller.signal }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API response error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.bitcoin || !data.bitcoin.usd) {
        throw new Error('Invalid API response format');
      }
      
      const priceData = {
        btcPriceUsd: data.bitcoin.usd,
        lastUpdated: Date.now(),
      };
      
      // Cache the result in localStorage
      try {
        localStorage.setItem('btc_price_data', JSON.stringify(priceData));
      } catch (e) {
        console.warn('Error caching in localStorage:', e);
      }
      
      return priceData;
    } catch (error) {
      console.log('Error fetching BTC price:', error);
      
      // If we already have a cached price, try to get it directly from localStorage
      try {
        const cachedData = localStorage.getItem('btc_price_data');
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          if (parsedData && parsedData.btcPriceUsd) {
            console.log('Using localStorage cached BTC price data after fetch error');
            return parsedData;
          }
        }
      } catch (e) {
        console.warn('Error retrieving from localStorage after fetch failure:', e);
      }
      
      // Last resort fallback
      return {
        btcPriceUsd: FALLBACK_BTC_PRICE,
        lastUpdated: Date.now(),
      };
    }
  }
  
  /**
   * Update the cached price data if it's expired or doesn't exist
   */
  private async updatePriceIfNeeded(): Promise<void> {
    const now = Date.now();
    const needsUpdate = !this.priceData || 
      (now - this.priceData.lastUpdated > CACHE_DURATION_MS);
    
    if (needsUpdate) {
      try {
        this.priceData = await this.fetchBtcPrice();
      } catch (error) {
        // If we have existing cached data, keep using it even if expired
        // This prevents service disruption during API outages
        if (!this.priceData) {
          throw error; // Only throw if we have no data at all
        }
        console.warn('Price update failed, using cached data:', error);
      }
    }
  }
}

// Export a singleton instance
export const priceService = new PriceService();