# Nostr Ad Marketplace JavaScript SDK

This JavaScript SDK makes it easy to integrate the Nostr Ad Marketplace with your web application, allowing publishers to display ads and earn cryptocurrency.

## Installation

### NPM (Node.js, React, Vue, etc.)

```bash
npm install nostr-ad-marketplace-sdk
```

### CDN (Direct browser usage)

```html
<script src="https://cdn.nostradmarketplace.com/sdk/latest.js"></script>
```

## Quick Start

```javascript
// Import the SDK
const NostrAdMarketplaceSDK = require('nostr-ad-marketplace-sdk');
// OR with ES modules:
// import NostrAdMarketplaceSDK from 'nostr-ad-marketplace-sdk';

// Initialize the SDK with your API key
const adSDK = new NostrAdMarketplaceSDK({
  apiKey: 'YOUR_API_KEY',
  // debug: true // Uncomment to enable debug logging
});

// Fetch an ad to display
async function displayAd() {
  try {
    const ad = await adSDK.serveAd({
      placement: 'sidebar',
      interests: ['bitcoin', 'nostr', 'programming'],
      format: 'text-image'
    });
    
    if (ad) {
      // Render the ad to your page
      renderAd(ad);
    } else {
      console.log('No suitable ad available');
    }
  } catch (error) {
    console.error('Failed to fetch ad:', error);
  }
}

// Track ad clicks
function trackAdClick(adId) {
  adSDK.trackClick({
    adId: adId,
    pubkey: 'YOUR_NOSTR_PUBKEY' // Optional
  }).catch(error => {
    console.error('Failed to track click:', error);
  });
}

// Example function to render an ad (implement your own UI)
function renderAd(ad) {
  const adContainer = document.getElementById('ad-container');
  
  // Create ad element
  const adElement = document.createElement('div');
  adElement.className = 'nostr-ad';
  
  // Create ad content
  adElement.innerHTML = `
    <a href="${ad.targetUrl}" target="_blank" rel="noopener" 
       onclick="trackAdClick('${ad.id}')">
      ${ad.imageUrl ? `<img src="${ad.imageUrl}" alt="${ad.title}">` : ''}
      <h3>${ad.title}</h3>
      <p>${ad.description}</p>
      <button>Learn More</button>
    </a>
  `;
  
  // Add to page
  adContainer.innerHTML = '';
  adContainer.appendChild(adElement);
}
```

## Complete Documentation

### Initialization

```javascript
const adSDK = new NostrAdMarketplaceSDK({
  apiKey: 'YOUR_API_KEY',       // Required
  baseUrl: 'https://custom-api.example.com', // Optional, defaults to production URL
  debug: false                  // Optional, default is false
});
```

### Serving Ads

The `serveAd` method retrieves a targeted ad for display:

```javascript
// Basic usage
const ad = await adSDK.serveAd();

// With targeting options
const ad = await adSDK.serveAd({
  placement: 'feed',              // Where the ad will be displayed
  pubkey: 'YOUR_NOSTR_PUBKEY',    // Your Nostr public key
  interests: ['bitcoin', 'gaming'], // Content interests for better targeting
  format: 'text-image'            // Requested ad format
});
```

#### Parameters

- `placement` (string, optional): Where the ad will be displayed ('feed', 'sidebar', 'banner', 'sponsored', 'native')
- `pubkey` (string, optional): Publisher's Nostr public key
- `interests` (string or string[], optional): Content interests for better targeting
- `format` (string, optional): Ad format ('text', 'image', 'text-image', 'rich')

### Tracking Clicks

When a user clicks on an ad, track the click to receive payment:

```javascript
// Basic usage (only adId is required)
await adSDK.trackClick({
  adId: 'AD_ID_HERE'
});

// With additional context
await adSDK.trackClick({
  adId: 'AD_ID_HERE',
  pubkey: 'YOUR_NOSTR_PUBKEY',
  placement: 'sidebar'
});
```

#### Parameters

- `adId` (string, required): The ID of the ad that was clicked
- `pubkey` (string, optional): Publisher's Nostr public key
- `placement` (string, optional): Where the ad was displayed

### Fetching Statistics

Get your publisher statistics to track earnings:

```javascript
// Get all-time stats
const stats = await adSDK.fetchPublisherStats();

// Get stats for a specific date range
const stats = await adSDK.fetchPublisherStats({
  startDate: '2023-01-01',
  endDate: '2023-01-31'
});
```

#### Parameters

- `startDate` (string, optional): Start date for the stats period (YYYY-MM-DD)
- `endDate` (string, optional): End date for the stats period (YYYY-MM-DD)

## Example: React Component

Here's a simple React component that displays an ad:

```jsx
import React, { useEffect, useState } from 'react';
import NostrAdMarketplaceSDK from 'nostr-ad-marketplace-sdk';

// Initialize outside component to avoid recreating on each render
const adSDK = new NostrAdMarketplaceSDK({
  apiKey: process.env.REACT_APP_NOSTR_AD_API_KEY
});

function AdComponent({ placement = 'sidebar', interests = [] }) {
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch ad when component mounts
    async function fetchAd() {
      try {
        setLoading(true);
        const adData = await adSDK.serveAd({
          placement,
          interests,
          format: 'text-image'
        });
        setAd(adData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAd();
  }, [placement, interests]);

  // Handle ad click
  const handleClick = (e) => {
    // Don't track clicks during development
    if (process.env.NODE_ENV === 'production' && ad) {
      adSDK.trackClick({
        adId: ad.id,
        placement
      });
    }
  };

  if (loading) return <div className="ad-placeholder">Loading ad...</div>;
  if (error) return <div className="ad-error">Ad could not be loaded</div>;
  if (!ad) return null; // No ad available

  return (
    <div className="nostr-ad-container">
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
}

export default AdComponent;
```

## Support

For questions or issues, please contact our support team at support@nostradmarketplace.com.

## License

MIT License