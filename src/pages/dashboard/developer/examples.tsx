import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Typography, Tab, Tabs } from '@/components/ui';
import { ArrowLeft, Download, ExternalLink, Copy } from 'react-feather';
import Link from 'next/link';
import { toast } from '@/utils/toast';

const { Title, Paragraph } = Typography;

const CodeExamplesPage = () => {
  const [activeTab, setActiveTab] = useState('javascript');
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast.success('Copied to clipboard!');
      },
      (err) => {
        console.error('Could not copy text: ', err);
        toast.error('Failed to copy to clipboard');
      }
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/dashboard/developer" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-1" />
            <span>Back to Developer Tools</span>
          </Link>
          <Title level={1}>SDK & Code Examples</Title>
          <Paragraph className="text-lg">
            Get started quickly with our JavaScript SDK and code examples for integrating with Proof Of Reach.
          </Paragraph>
        </div>

        {/* SDK Download Section */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <Title level={3} className="m-0">JavaScript SDK</Title>
            <a 
              href="/sdk/proof-of-reach-sdk.min.js" 
              download
              className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Download SDK
            </a>
          </div>
          <Paragraph>
            Our JavaScript SDK makes it easy to integrate with the Proof Of Reach. It provides a simple
            interface for fetching ads, tracking clicks, and managing your publisher statistics.
          </Paragraph>
          
          <div className="flex items-center mt-4 space-x-4">
            <a 
              href="/sdk/README.md" 
              target="_blank"
              className="inline-flex items-center text-purple-600 hover:text-purple-700"
            >
              <span className="mr-1">Documentation</span>
              <ExternalLink className="w-4 h-4" />
            </a>
            <a 
              href="https://github.com/nostradmarketplace/sdk"
              target="_blank"
              rel="noopener noreferrer" 
              className="inline-flex items-center text-purple-600 hover:text-purple-700"
            >
              <span className="mr-1">GitHub Repository</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Code Examples Tabs */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
          <Title level={3}>Integration Examples</Title>
          <Paragraph>
            Choose your preferred language or framework to see code examples for integrating with our platform.
          </Paragraph>
          
          <Tabs
            activeTab={activeTab}
            onChange={setActiveTab}
            tabs={[
              { id: 'javascript', label: 'JavaScript' },
              { id: 'typescript', label: 'TypeScript' },
              { id: 'react', label: 'React' },
              { id: 'html', label: 'HTML' },
              { id: 'nostr', label: 'Nostr Client' }
            ]}
            className="mt-6"
          />
          
          <div className="mt-6">
            {activeTab === 'javascript' && (
              <div>
                <Title level={4}>Basic JavaScript Integration</Title>
                <Paragraph>
                  This example shows how to fetch and display an ad using vanilla JavaScript.
                </Paragraph>
                <div className="relative mt-4">
                  <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
                    <code className="language-javascript">
{`// Initialize the SDK with your API key
const adSDK = new ProofOfReachSDK({
  apiKey: 'YOUR_API_KEY',
  baseUrl: 'https://api.proofofreachads.com'
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
      const adContainer = document.getElementById('ad-container');
      
      adContainer.innerHTML = \`
        <a href="\${ad.targetUrl}" target="_blank" rel="noopener" 
           onclick="trackAdClick('\${ad.id}', 'sidebar')">
          \${ad.imageUrl ? \`<img src="\${ad.imageUrl}" alt="\${ad.title}">\` : ''}
          <h3>\${ad.title}</h3>
          <p>\${ad.description}</p>
          <button>Learn More</button>
        </a>
      \`;
    }
  } catch (error) {
    console.error('Failed to fetch ad:', error);
  }
}

// Function to track clicks
function trackAdClick(adId, placement) {
  adSDK.trackClick({
    adId: adId,
    placement: placement
  });
}

// Call the function to display the ad
displayAd();`}
                    </code>
                  </pre>
                  <button 
                    onClick={() => copyToClipboard(`// Initialize the SDK with your API key
const adSDK = new ProofOfReachSDK({
  apiKey: 'YOUR_API_KEY',
  baseUrl: 'https://api.proofofreachads.com'
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
      const adContainer = document.getElementById('ad-container');
      
      adContainer.innerHTML = \`
        <a href="\${ad.targetUrl}" target="_blank" rel="noopener" 
           onclick="trackAdClick('\${ad.id}', 'sidebar')">
          \${ad.imageUrl ? \`<img src="\${ad.imageUrl}" alt="\${ad.title}">\` : ''}
          <h3>\${ad.title}</h3>
          <p>\${ad.description}</p>
          <button>Learn More</button>
        </a>
      \`;
    }
  } catch (error) {
    console.error('Failed to fetch ad:', error);
  }
}

// Function to track clicks
function trackAdClick(adId, placement) {
  adSDK.trackClick({
    adId: adId,
    placement: placement
  });
}

// Call the function to display the ad
displayAd();`)}
                    className="absolute top-4 right-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 p-2 rounded-md"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === 'typescript' && (
              <div>
                <Title level={4}>TypeScript Integration</Title>
                <Paragraph>
                  Integrate the SDK with TypeScript for type safety and better developer experience.
                </Paragraph>
                <div className="relative mt-4">
                  <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
                    <code className="language-typescript">
{`import ProofOfReachSDK, { ServeAdOptions, Ad } from 'proof-of-reach-sdk';

// Initialize the SDK with your API key
const adSDK = new ProofOfReachSDK({
  apiKey: process.env.PROOF_OF_REACH_API_KEY || '',
  baseUrl: 'https://api.proofofreachads.com'
});

// Function to fetch an ad with TypeScript types
async function getAdForDisplay(
  placement: string,
  interests: string[]
): Promise<Ad | null> {
  try {
    const options: ServeAdOptions = {
      placement,
      interests,
      format: 'text-image'
    };
    
    return await adSDK.serveAd(options);
  } catch (error) {
    console.error('Error fetching ad:', error);
    return null;
  }
}

// Example usage
async function displayAd() {
  const adContainer = document.getElementById('ad-container');
  if (!adContainer) return;
  
  // Show loading state
  adContainer.innerHTML = '<div>Loading ad...</div>';
  
  // Fetch the ad
  const ad = await getAdForDisplay('sidebar', ['bitcoin', 'nostr']);
  
  if (ad) {
    // Render the ad
    adContainer.innerHTML = \`
      <div class="ad-container">
        <a href="\${ad.targetUrl}" target="_blank" rel="noopener" 
           onclick="handleAdClick('\${ad.id}', event)">
          \${ad.imageUrl ? \`<img src="\${ad.imageUrl}" alt="\${ad.title}" class="ad-image">\` : ''}
          <h3 class="ad-title">\${ad.title}</h3>
          <p class="ad-description">\${ad.description}</p>
          <span class="ad-cta">Learn More</span>
        </a>
      </div>
    \`;
  } else {
    // No ad available
    adContainer.innerHTML = '<div>No ad available</div>';
  }
}

// Global function to handle clicks
(window as any).handleAdClick = function(adId: string, event: MouseEvent) {
  adSDK.trackClick({
    adId,
    placement: 'sidebar'
  });
};`}
                    </code>
                  </pre>
                  <button 
                    onClick={() => copyToClipboard(`import ProofOfReachSDK, { ServeAdOptions, Ad } from 'proof-of-reach-ad-marketplace-sdk';

// Initialize the SDK with your API key
const adSDK = new ProofOfReachSDK({
  apiKey: process.env.NOSTR_AD_API_KEY || '',
  baseUrl: 'https://api.proofofreachads.com'
});

// Function to fetch an ad with TypeScript types
async function getAdForDisplay(
  placement: string,
  interests: string[]
): Promise<Ad | null> {
  try {
    const options: ServeAdOptions = {
      placement,
      interests,
      format: 'text-image'
    };
    
    return await adSDK.serveAd(options);
  } catch (error) {
    console.error('Error fetching ad:', error);
    return null;
  }
}

// Example usage
async function displayAd() {
  const adContainer = document.getElementById('ad-container');
  if (!adContainer) return;
  
  // Show loading state
  adContainer.innerHTML = '<div>Loading ad...</div>';
  
  // Fetch the ad
  const ad = await getAdForDisplay('sidebar', ['bitcoin', 'nostr']);
  
  if (ad) {
    // Render the ad
    adContainer.innerHTML = \`
      <div class="ad-container">
        <a href="\${ad.targetUrl}" target="_blank" rel="noopener" 
           onclick="handleAdClick('\${ad.id}', event)">
          \${ad.imageUrl ? \`<img src="\${ad.imageUrl}" alt="\${ad.title}" class="ad-image">\` : ''}
          <h3 class="ad-title">\${ad.title}</h3>
          <p class="ad-description">\${ad.description}</p>
          <span class="ad-cta">Learn More</span>
        </a>
      </div>
    \`;
  } else {
    // No ad available
    adContainer.innerHTML = '<div>No ad available</div>';
  }
}

// Global function to handle clicks
(window as any).handleAdClick = function(adId: string, event: MouseEvent) {
  adSDK.trackClick({
    adId,
    placement: 'sidebar'
  });
};`)}
                    className="absolute top-4 right-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 p-2 rounded-md"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === 'react' && (
              <div>
                <Title level={4}>React Component Example</Title>
                <Paragraph>
                  A reusable React component for displaying ads from Proof Of Reach.
                </Paragraph>
                <div className="relative mt-4">
                  <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
                    <code className="language-jsx">
{`import React, { useEffect, useState } from 'react';
import ProofOfReachSDK from 'proof-of-reach-sdk';

// Create SDK instance once outside component
const adSDK = new ProofOfReachSDK({
  apiKey: process.env.REACT_APP_PROOF_OF_REACH_API_KEY,
  baseUrl: process.env.REACT_APP_API_BASE_URL || 'https://api.proofofreachads.com'
});

/**
 * ProofOfReachAd component that fetches and displays an advertisement
 */
const ProofOfReachAd = ({ 
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
      <div className={\`proof-of-reach-ad-loading \${className}\`}>
        <div className="loading-indicator">Loading ad...</div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className={\`proof-of-reach-ad-error \${className}\`}>
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
    <div className={\`proof-of-reach-ad-container \${className}\`}>
      <a 
        href={ad.targetUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        onClick={handleClick}
        className="proof-of-reach-ad"
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

export default ProofOfReachAd;

// Usage in another component:
// <NostrAd 
//   placement="sidebar"
//   interests={["bitcoin", "nostr"]}
//   className="my-custom-class"
//   onError={(err) => console.error(err)}
// />`}
                    </code>
                  </pre>
                  <button 
                    onClick={() => copyToClipboard(`import React, { useEffect, useState } from 'react';
import ProofOfReachSDK from 'proof-of-reach-sdk';

// Create SDK instance once outside component
const adSDK = new ProofOfReachSDK({
  apiKey: process.env.REACT_APP_PROOF_OF_REACH_API_KEY,
  baseUrl: process.env.REACT_APP_API_BASE_URL || 'https://api.proofofreachads.com'
});

/**
 * ProofOfReachAd component that fetches and displays an advertisement
 */
const ProofOfReachAd = ({ 
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
      <div className={\`proof-of-reach-ad-loading \${className}\`}>
        <div className="loading-indicator">Loading ad...</div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className={\`proof-of-reach-ad-error \${className}\`}>
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
    <div className={\`proof-of-reach-ad-container \${className}\`}>
      <a 
        href={ad.targetUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        onClick={handleClick}
        className="proof-of-reach-ad"
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

export default ProofOfReachAd;

// Usage in another component:
// <NostrAd 
//   placement="sidebar"
//   interests={["bitcoin", "nostr"]}
//   className="my-custom-class"
//   onError={(err) => console.error(err)}
// />`)}
                    className="absolute top-4 right-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 p-2 rounded-md"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === 'html' && (
              <div>
                <Title level={4}>Simple HTML Integration</Title>
                <Paragraph>
                  Add ads to any HTML page with just a few lines of code.
                </Paragraph>
                <div className="relative mt-4">
                  <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
                    <code className="language-html">
{`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Proof Of Reach Example</title>
  <style>
    .ad-container {
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
      margin: 20px 0;
      max-width: 300px;
    }
    .proof-of-reach-ad {
      display: block;
      padding: 15px;
      text-decoration: none;
      color: inherit;
    }
    .ad-image {
      width: 100%;
      height: auto;
      border-radius: 4px;
      margin-bottom: 10px;
    }
    .ad-title {
      font-size: 18px;
      margin: 0 0 8px 0;
      color: #333;
    }
    .ad-description {
      font-size: 14px;
      margin: 0 0 12px 0;
      color: #555;
    }
    .ad-cta {
      display: inline-block;
      background-color: #5232b5;
      color: white;
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 14px;
    }
    .ad-sponsorship {
      font-size: 12px;
      color: #999;
      margin-top: 8px;
      text-align: right;
    }
  </style>
</head>
<body>
  <h1>My Website</h1>
  
  <div class="content">
    <p>This is my website content...</p>
  </div>
  
  <!-- Ad Container -->
  <div id="ad-container" class="ad-container">
    <div style="padding: 15px; text-align: center;">Loading ad...</div>
  </div>
  
  <!-- More content -->
  <div class="content">
    <p>More website content here...</p>
  </div>

  <!-- Load the Proof Of Reach SDK -->
  <script src="/sdk/proof-of-reach-ad-marketplace-sdk.min.js"></script>
  
  <script>
    // Initialize the SDK
    const adSDK = new ProofOfReachSDK({
      apiKey: 'YOUR_API_KEY'
    });
    
    // Function to load and display an ad
    async function loadAd() {
      try {
        const ad = await adSDK.serveAd({
          placement: 'sidebar',
          interests: ['bitcoin', 'nostr']
        });
        
        const adContainer = document.getElementById('ad-container');
        
        if (ad) {
          adContainer.innerHTML = \`
            <a href="\${ad.targetUrl}" target="_blank" rel="noopener" 
               class="proof-of-reach-ad" onclick="trackAdClick('\${ad.id}')">
              \${ad.imageUrl ? \`<img src="\${ad.imageUrl}" alt="" class="ad-image">\` : ''}
              <h3 class="ad-title">\${ad.title}</h3>
              <p class="ad-description">\${ad.description}</p>
              <span class="ad-cta">Learn More</span>
              <div class="ad-sponsorship">Sponsored</div>
            </a>
          \`;
        } else {
          adContainer.innerHTML = '';
        }
      } catch (error) {
        console.error('Error loading ad:', error);
        document.getElementById('ad-container').innerHTML = '';
      }
    }
    
    // Track ad clicks
    function trackAdClick(adId) {
      adSDK.trackClick({
        adId: adId,
        placement: 'sidebar'
      }).catch(error => {
        console.error('Failed to track click:', error);
      });
    }
    
    // Load the ad when the page loads
    document.addEventListener('DOMContentLoaded', loadAd);
  </script>
</body>
</html>`}
                    </code>
                  </pre>
                  <button 
                    onClick={() => copyToClipboard(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Proof Of Reach Example</title>
  <style>
    .ad-container {
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
      margin: 20px 0;
      max-width: 300px;
    }
    .proof-of-reach-ad {
      display: block;
      padding: 15px;
      text-decoration: none;
      color: inherit;
    }
    .ad-image {
      width: 100%;
      height: auto;
      border-radius: 4px;
      margin-bottom: 10px;
    }
    .ad-title {
      font-size: 18px;
      margin: 0 0 8px 0;
      color: #333;
    }
    .ad-description {
      font-size: 14px;
      margin: 0 0 12px 0;
      color: #555;
    }
    .ad-cta {
      display: inline-block;
      background-color: #5232b5;
      color: white;
      padding: 8px 16px;
      border-radius: 4px;
      font-size: 14px;
    }
    .ad-sponsorship {
      font-size: 12px;
      color: #999;
      margin-top: 8px;
      text-align: right;
    }
  </style>
</head>
<body>
  <h1>My Website</h1>
  
  <div class="content">
    <p>This is my website content...</p>
  </div>
  
  <!-- Ad Container -->
  <div id="ad-container" class="ad-container">
    <div style="padding: 15px; text-align: center;">Loading ad...</div>
  </div>
  
  <!-- More content -->
  <div class="content">
    <p>More website content here...</p>
  </div>

  <!-- Load the Proof Of Reach SDK -->
  <script src="/sdk/proof-of-reach-ad-marketplace-sdk.min.js"></script>
  
  <script>
    // Initialize the SDK
    const adSDK = new ProofOfReachSDK({
      apiKey: 'YOUR_API_KEY'
    });
    
    // Function to load and display an ad
    async function loadAd() {
      try {
        const ad = await adSDK.serveAd({
          placement: 'sidebar',
          interests: ['bitcoin', 'nostr']
        });
        
        const adContainer = document.getElementById('ad-container');
        
        if (ad) {
          adContainer.innerHTML = \`
            <a href="\${ad.targetUrl}" target="_blank" rel="noopener" 
               class="proof-of-reach-ad" onclick="trackAdClick('\${ad.id}')">
              \${ad.imageUrl ? \`<img src="\${ad.imageUrl}" alt="" class="ad-image">\` : ''}
              <h3 class="ad-title">\${ad.title}</h3>
              <p class="ad-description">\${ad.description}</p>
              <span class="ad-cta">Learn More</span>
              <div class="ad-sponsorship">Sponsored</div>
            </a>
          \`;
        } else {
          adContainer.innerHTML = '';
        }
      } catch (error) {
        console.error('Error loading ad:', error);
        document.getElementById('ad-container').innerHTML = '';
      }
    }
    
    // Track ad clicks
    function trackAdClick(adId) {
      adSDK.trackClick({
        adId: adId,
        placement: 'sidebar'
      }).catch(error => {
        console.error('Failed to track click:', error);
      });
    }
    
    // Load the ad when the page loads
    document.addEventListener('DOMContentLoaded', loadAd);
  </script>
</body>
</html>`)}
                    className="absolute top-4 right-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 p-2 rounded-md"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === 'nostr' && (
              <div>
                <Title level={4}>Nostr Client Integration</Title>
                <Paragraph>
                  Integrate ads into your Nostr client by placing them in the feed or sidebar.
                </Paragraph>
                <div className="relative mt-4">
                  <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
                    <code className="language-javascript">
{`// Import the SDK
import ProofOfReachSDK from 'proof-of-reach-ad-marketplace-sdk';

// Initialize SDK once at the application level
const adSDK = new ProofOfReachSDK({
  apiKey: process.env.NOSTR_AD_API_KEY,
  baseUrl: process.env.NOSTR_AD_API_URL || 'https://api.proofofreachads.com'
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
    const interests = getUserInterests();
    
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
    adElement.className = 'proof-of-reach-ad-container';
    adElement.setAttribute('data-ad-id', ad.id);
    
    // Style to match feed posts but with sponsored indicator
    adElement.innerHTML = \`
      <div class="feed-post ad-post">
        <div class="post-header">
          <img src="/img/ad-avatar.png" class="avatar" alt="Sponsored">
          <div class="post-meta">
            <div class="post-author">Sponsored</div>
            <div class="post-timestamp">Ad</div>
          </div>
        </div>
        <div class="post-content">
          <p>\${ad.title}</p>
          <p>\${ad.description}</p>
          \${ad.imageUrl ? \`<img src="\${ad.imageUrl}" class="post-image" alt="">\` : ''}
          <a href="\${ad.targetUrl}" target="_blank" rel="noopener noreferrer" 
             class="ad-cta-button" onclick="trackAdClick('\${ad.id}', 'feed')">
            Learn More
          </a>
        </div>
      </div>
    \`;
    
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
function getUserInterests() {
  // This would be implemented based on your app's data
  // For example, analyze recent viewed posts or user profile
  return ['bitcoin', 'lightning', 'privacy'];
}`}
                    </code>
                  </pre>
                  <button 
                    onClick={() => copyToClipboard(`// Import the SDK
import ProofOfReachSDK from 'proof-of-reach-ad-marketplace-sdk';

// Initialize SDK once at the application level
const adSDK = new ProofOfReachSDK({
  apiKey: process.env.NOSTR_AD_API_KEY,
  baseUrl: process.env.NOSTR_AD_API_URL || 'https://api.proofofreachads.com'
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
    const interests = getUserInterests();
    
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
    adElement.className = 'proof-of-reach-ad-container';
    adElement.setAttribute('data-ad-id', ad.id);
    
    // Style to match feed posts but with sponsored indicator
    adElement.innerHTML = \`
      <div class="feed-post ad-post">
        <div class="post-header">
          <img src="/img/ad-avatar.png" class="avatar" alt="Sponsored">
          <div class="post-meta">
            <div class="post-author">Sponsored</div>
            <div class="post-timestamp">Ad</div>
          </div>
        </div>
        <div class="post-content">
          <p>\${ad.title}</p>
          <p>\${ad.description}</p>
          \${ad.imageUrl ? \`<img src="\${ad.imageUrl}" class="post-image" alt="">\` : ''}
          <a href="\${ad.targetUrl}" target="_blank" rel="noopener noreferrer" 
             class="ad-cta-button" onclick="trackAdClick('\${ad.id}', 'feed')">
            Learn More
          </a>
        </div>
      </div>
    \`;
    
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
function getUserInterests() {
  // This would be implemented based on your app's data
  // For example, analyze recent viewed posts or user profile
  return ['bitcoin', 'lightning', 'privacy'];
}`)}
                    className="absolute top-4 right-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 p-2 rounded-md"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Link back to API docs */}
        <div className="mt-8 text-center">
          <Paragraph>
            Need more information about our API endpoints?
          </Paragraph>
          <Link href="/api-docs">
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors">
              View API Documentation
            </button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CodeExamplesPage;