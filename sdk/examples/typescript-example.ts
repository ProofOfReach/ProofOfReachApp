/**
 * Nostr Ad Marketplace SDK - TypeScript Example
 * 
 * This file demonstrates how to use the SDK with TypeScript,
 * taking advantage of type definitions for better developer experience.
 */

// Import the SDK and types
import NostrAdMarketplaceSDK, { 
  ServeAdOptions, 
  TrackClickOptions,
  Ad,
  PublisherStats 
} from 'nostr-ad-marketplace-sdk';

// Create a type-safe configuration
interface AppConfig {
  apiKey: string;
  apiUrl: string;
  debug: boolean;
}

// Get configuration from environment
const config: AppConfig = {
  apiKey: process.env.NOSTR_AD_API_KEY || '',
  apiUrl: process.env.NOSTR_AD_API_URL || 'https://api.nostradmarketplace.com',
  debug: process.env.NODE_ENV !== 'production'
};

// Initialize the SDK with the configuration
const adSDK = new NostrAdMarketplaceSDK({
  apiKey: config.apiKey,
  baseUrl: config.apiUrl,
  debug: config.debug
});

/**
 * Example function to fetch an ad with type safety
 */
async function getAdForUser(placement: string, userInterests: string[]): Promise<Ad | null> {
  try {
    // Create typed options object
    const options: ServeAdOptions = {
      placement,
      interests: userInterests,
      format: 'text-image'
    };
    
    // Fetch the ad with proper type safety
    const ad = await adSDK.serveAd(options);
    return ad;
  } catch (error) {
    console.error('Error fetching ad:', error);
    return null;
  }
}

/**
 * Example function to track a click with type safety
 */
async function trackAdClick(ad: Ad, placement: string, pubkey?: string): Promise<boolean> {
  try {
    // Create typed options object
    const options: TrackClickOptions = {
      adId: ad.id,
      placement,
      pubkey
    };
    
    // Track the click
    await adSDK.trackClick(options);
    return true;
  } catch (error) {
    console.error('Error tracking click:', error);
    return false;
  }
}

/**
 * Example function to get publisher stats for a date range
 */
async function getPublisherPerformance(startDate: Date, endDate: Date): Promise<PublisherStats | null> {
  try {
    // Format dates as YYYY-MM-DD strings
    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = endDate.toISOString().split('T')[0];
    
    // Fetch stats with proper typing
    const stats = await adSDK.fetchPublisherStats({
      startDate: formattedStartDate,
      endDate: formattedEndDate
    });
    
    return stats;
  } catch (error) {
    console.error('Error fetching publisher stats:', error);
    return null;
  }
}

/**
 * Example of React integration with TypeScript
 */
/* 
// In a React component:
import React, { useEffect, useState } from 'react';
import { Ad } from 'nostr-ad-marketplace-sdk';

interface AdComponentProps {
  placement: string;
  interests: string[];
  onAdLoaded?: (ad: Ad | null) => void;
}

const AdComponent: React.FC<AdComponentProps> = ({ 
  placement, 
  interests,
  onAdLoaded 
}) => {
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    async function loadAd() {
      setLoading(true);
      const result = await getAdForUser(placement, interests);
      setAd(result);
      setLoading(false);
      if (onAdLoaded) onAdLoaded(result);
    }
    
    loadAd();
  }, [placement, interests, onAdLoaded]);
  
  if (loading) return <div>Loading ad...</div>;
  if (!ad) return null;
  
  const handleClick = () => {
    trackAdClick(ad, placement);
  };
  
  return (
    <div className="ad-container">
      <a 
        href={ad.targetUrl} 
        onClick={handleClick}
        target="_blank" 
        rel="noopener noreferrer"
      >
        {ad.imageUrl && <img src={ad.imageUrl} alt={ad.title} />}
        <h3>{ad.title}</h3>
        <p>{ad.description}</p>
        <span className="ad-cta">Learn More</span>
      </a>
    </div>
  );
};

export default AdComponent;
*/

// Example of using the functions above
async function main() {
  // Get an ad for a user interested in bitcoin and nostr
  const ad = await getAdForUser('sidebar', ['bitcoin', 'nostr']);
  
  if (ad) {
    console.log(`Ad found: ${ad.title}`);
    
    // Simulate a click on the ad
    const clickTracked = await trackAdClick(ad, 'sidebar');
    console.log(`Click tracked: ${clickTracked}`);
  } else {
    console.log('No suitable ad found');
  }
  
  // Get publisher stats for the last 30 days
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const stats = await getPublisherPerformance(thirtyDaysAgo, now);
  
  if (stats) {
    console.log(`Publisher stats for the last 30 days:`);
    console.log(`Impressions: ${stats.impressions}`);
    console.log(`Clicks: ${stats.clicks}`);
    console.log(`CTR: ${stats.ctr}%`);
    console.log(`Earnings: ${stats.earnings} sats`);
  }
}

// Uncomment to run the example
// main().catch(console.error);