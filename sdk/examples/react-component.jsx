/**
 * Nostr Ad Marketplace SDK React Component Example
 * 
 * This example shows how to create a reusable React component
 * that integrates with the Nostr Ad Marketplace SDK.
 */

import React, { useEffect, useState } from 'react';
import NostrAdMarketplaceSDK from 'nostr-ad-marketplace-sdk';

// Create SDK instance once outside component
// Use environment variable for API key (never hardcode in production)
const SDK_API_KEY = process.env.REACT_APP_NOSTR_AD_API_KEY;
const SDK_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.nostradmarketplace.com';

// Create SDK instance once to avoid recreating on each render
const adSDK = new NostrAdMarketplaceSDK({
  apiKey: SDK_API_KEY,
  baseUrl: SDK_BASE_URL
});

/**
 * NostrAd component that fetches and displays an advertisement
 */
const NostrAd = ({ 
  placement = 'sidebar',
  interests = [],
  format = 'text-image',
  pubkey = null,
  className = '',
  onError = () => {}
}) => {
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch an ad when the component mounts or props change
  useEffect(() => {
    let isMounted = true;
    
    const fetchAd = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Convert interests to array if provided as string
        const processedInterests = typeof interests === 'string' 
          ? interests.split(',').map(i => i.trim()) 
          : interests;
        
        // Fetch ad from API
        const adData = await adSDK.serveAd({
          placement,
          interests: processedInterests,
          format,
          pubkey
        });
        
        // Update state if component still mounted
        if (isMounted) {
          setAd(adData);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
          onError(err);
        }
      }
    };
    
    fetchAd();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [placement, interests, format, pubkey, onError]);
  
  // Handle ad click
  const handleClick = (e) => {
    if (!ad) return;
    
    // Track the click through SDK
    adSDK.trackClick({
      adId: ad.id,
      placement,
      pubkey
    }).catch(error => {
      console.error('Failed to track click:', error);
    });
  };
  
  // Render loading state
  if (loading) {
    return (
      <div className={`nostr-ad-loading ${className}`}>
        <div className="loading-indicator">Loading ad...</div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className={`nostr-ad-error ${className}`}>
        <p>Ad could not be loaded</p>
      </div>
    );
  }
  
  // Render empty state (no ad available)
  if (!ad) {
    return null;
  }
  
  // Render the ad
  return (
    <div className={`nostr-ad-container ${className}`}>
      <a 
        href={ad.targetUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        onClick={handleClick}
        className="nostr-ad"
      >
        {ad.imageUrl && (
          <img src={ad.imageUrl} alt={ad.title} className="ad-image" />
        )}
        <div className="ad-content">
          <h3 className="ad-title">{ad.title}</h3>
          <p className="ad-description">{ad.description}</p>
          <span className="ad-cta">Learn More</span>
        </div>
        <div className="ad-sponsorship">Sponsored</div>
      </a>
    </div>
  );
};

export default NostrAd;

/**
 * Usage example:
 * 
 * import NostrAd from './NostrAd';
 * 
 * function App() {
 *   return (
 *     <div className="app">
 *       <main>
 *         <h1>My Nostr App</h1>
 *         <p>Content goes here...</p>
 *       </main>
 *       <aside>
 *         <NostrAd 
 *           placement="sidebar"
 *           interests={["bitcoin", "nostr"]}
 *           format="text-image"
 *           pubkey="npub1..."
 *           className="custom-ad-style"
 *           onError={(err) => console.error('Ad error:', err)}
 *         />
 *       </aside>
 *     </div>
 *   );
 * }
 */