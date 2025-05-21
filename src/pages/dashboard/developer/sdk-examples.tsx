import React, { useState } from 'react';
import ImprovedDashboardLayout from '@/components/layout/ImprovedDashboardLayout';
import { Title, Paragraph } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Check, Copy, ExternalLink } from 'react-feather';
import Link from 'next/link';
import { useAuthSwitch } from '@/hooks/useAuthSwitch';

const SDKExamplesPage = () => {
  const { pubkey } = useAuthSwitch();
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('html');
  
  // Use the user's pubkey or a placeholder
  const userPubkey = pubkey || 'YOUR_NOSTR_PUBKEY';
  
  // SDK code with pubkey
  const sdkScript = `<script src="/sdk-new.js"></script>
<script>
  window.addEventListener("load", () => {
    ProofOfReachSDK.renderAd("proof-of-reach-ad", {
      pubkey: "${userPubkey}",
      testMode: false,
      defaultStyles: true,
      adType: "standard",
      onPayment: (sats) => {
        console.log(\`Received \${sats} satoshis!\`);
        // Update wallet balance or other UI elements here
        
        // To display a wallet balance notification, you can do:
        // const walletBalance = document.getElementById('wallet-balance');
        // if (walletBalance) {
        //   const currentBalance = parseInt(walletBalance.textContent || '0');
        //   walletBalance.textContent = (currentBalance + sats).toString();
        // }
      }
    });
  });
</script>`;

  // HTML code example
  const htmlExample = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Website</title>
</head>
<body>
  <header>
    <h1>My Website</h1>
  </header>
  
  <main>
    <article>
      <h2>Article Title</h2>
      <p>This is the first paragraph of my article...</p>
      
      <!-- ProofOfReach Ad Container -->
      <div id="proof-of-reach-ad"></div>
      
      <p>This is the rest of my article content...</p>
    </article>
  </main>
  
  <footer>
    <p>&copy; 2025 My Website</p>
  </footer>
  
  <!-- ProofOfReach SDK -->
  ${sdkScript}
</body>
</html>`;

  // React example
  const reactExample = `import { useEffect, useState } from 'react';

function ProofOfReachAd({ containerId = "proof-of-reach-ad" }) {
  const [earnings, setEarnings] = useState(0);

  useEffect(() => {
    // Load the SDK
    const script = document.createElement('script');
    script.src = "https://cdn.proofofreach.com/sdk/v1.js";
    script.async = true;
    
    script.onload = () => {
      // Initialize once SDK is loaded
      if (window.ProofOfReachSDK) {
        window.ProofOfReachSDK.renderAd(containerId, {
          pubkey: "${userPubkey}",
          testMode: false,
          defaultStyles: true,
          adType: "standard",
          onPayment: (sats) => {
            console.log(\`Received \${sats} satoshis!\`);
            // Update component state with new earnings
            setEarnings(prev => prev + sats);
          }
        });
      }
    };
    
    document.body.appendChild(script);
    
    // Cleanup on unmount
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [containerId]);
  
  return (
    <div className="relative">
      <div id={containerId}></div>
      {earnings > 0 && (
        <div className="mt-2 text-sm font-medium text-green-600">
          You've earned {earnings} satoshis from this ad!
        </div>
      )}
    </div>
  );
}

// Usage in your React app
function MyArticle() {
  return (
    <article>
      <h2>Article Title</h2>
      <p>This is the first paragraph of my article...</p>
      
      <ProofOfReachAd />
      
      <p>This is the rest of my article content...</p>
    </article>
  );
}`;

  // WordPress example
  const wordpressExample = `<?php
/**
 * Plugin Name: ProofOfReach Integration
 * Description: Integrates ProofOfReach ads into your WordPress site with satoshi earnings
 * Version: 1.1
 */

// Add the SDK to the footer
function add_proofofreach_sdk() {
  ?>
  <script src="//proofofreach.xyz/sdk-new.js"></script>
  <script>
    window.addEventListener("load", () => {
      // Track total earnings in this session
      let totalEarnings = 0;
      
      // Create floating earnings counter
      const earningsCounter = document.createElement('div');
      earningsCounter.style.position = 'fixed';
      earningsCounter.style.bottom = '20px';
      earningsCounter.style.right = '20px';
      earningsCounter.style.background = 'rgba(0, 0, 0, 0.7)';
      earningsCounter.style.color = '#fff';
      earningsCounter.style.padding = '10px 15px';
      earningsCounter.style.borderRadius = '20px';
      earningsCounter.style.fontWeight = 'bold';
      earningsCounter.style.zIndex = '9999';
      earningsCounter.style.display = 'none';
      earningsCounter.innerHTML = '⚡ <span id="por-earnings">0</span> sats earned';
      document.body.appendChild(earningsCounter);
      
      // Find all ad containers
      document.querySelectorAll('.proofofreach-ad').forEach(container => {
        ProofOfReachSDK.renderAd(container.id, {
          pubkey: "${userPubkey}",
          testMode: false,
          defaultStyles: true,
          adType: "standard",
          onPayment: (sats) => {
            // Update total earnings
            totalEarnings += sats;
            document.getElementById('por-earnings').textContent = totalEarnings;
            
            // Show the earnings counter if not already visible
            earningsCounter.style.display = 'block';
          }
        });
      });
    });
  </script>
  <?php
}
add_action('wp_footer', 'add_proofofreach_sdk');

// Create shortcode for inserting ads
function proofofreach_ad_shortcode($atts) {
  static $ad_count = 0;
  $ad_count++;
  
  $container_id = 'proofofreach-ad-' . $ad_count;
  
  return '<div id="' . $container_id . '" class="proofofreach-ad"></div>';
}
add_shortcode('proofofreach_ad', 'proofofreach_ad_shortcode');

// Usage in posts: [proofofreach_ad]
?>`;

  const advancedConfig = `ProofOfReachSDK.renderAd("proof-of-reach-ad", {
  // Core configuration
  pubkey: "${userPubkey}",         // Your Nostr public key (required)
  testMode: false,                 // Set to true for testing with mock payments
  
  // Ad appearance
  adType: "standard",              // "standard" (300×250), "small" (160×600), or "banner" (728×90)
  defaultStyles: true,             // Apply default container styles 
  
  // Visibility tracking
  visibilityThreshold: 0.9,        // Requires 90% of ad to be visible (0.0-1.0)
  engagementTime: 5,               // Seconds ad must be visible before payment (default: 5)
  
  // Performance settings
  refreshInterval: 300000,         // Refresh ad every 5 minutes (in ms)
  analyticsEnabled: true,          // Enable anonymous analytics
  
  // Event callbacks
  onPayment: (sats) => {           // Called when payment is received after visibility period
    console.log(\`Received \${sats} satoshis!\`);
    
    // Example: Update a wallet balance display
    const balance = document.getElementById('wallet-balance');
    if (balance) {
      const current = parseInt(balance.textContent || '0');
      balance.textContent = (current + sats).toString();
    }
  },
  onVisibilityChange: (isVisible) => {  // Called when ad visibility changes
    console.log(\`Ad visibility: \${isVisible ? 'visible' : 'hidden'}\`);
  },
  onError: (error) => {            // Called when error occurs
    console.error(\`Ad error: \${error}\`);
  },
  onLoad: () => {                  // Called when ad loads successfully
    console.log("Ad loaded successfully");
  }
});\n`;

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    });
  };

  const integrationSteps = [
    {
      title: 'Add the SDK to your website',
      description: 'Copy the code snippet below and paste it just before the closing </body> tag in your HTML.',
      code: sdkScript,
      onCopy: () => handleCopy(sdkScript, 'sdk')
    },
    {
      title: 'Add an ad container',
      description: 'Create a container element with the ID proof-of-reach-ad where you want the ad to appear.',
      code: '<div id="proof-of-reach-ad"></div>',
      onCopy: () => handleCopy('<div id="proof-of-reach-ad"></div>', 'container')
    },
    {
      title: 'That\'s it!',
      description: 'The SDK will automatically load and display an ad in your container. You\'ll earn satoshis whenever users interact with the ads.',
      actionLink: '/paste-sdk-demo.html',
      actionText: 'Try the interactive demo'
    }
  ];

  return (
    <ImprovedDashboardLayout title="SDK & Code Examples">
      <div className="space-y-6">
        <div>
          <Title level={1}>ProofOfReach SDK</Title>
          <Paragraph className="text-gray-500 dark:text-gray-400">
            Integrate ProofOfReach ads into your website with our easy-to-use SDK.
            Copy the code snippets below to get started.
          </Paragraph>
        </div>

        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Integration Guide</h2>
            <div className="space-y-6">
              {integrationSteps.map((step, index) => (
                <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0 last:pb-0">
                  <div className="flex mb-2">
                    <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 font-medium h-6 w-6 rounded-full flex items-center justify-center text-sm mr-2">
                      {index + 1}
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{step.title}</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">{step.description}</p>
                  {step.code && (
                    <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto text-sm font-mono relative">
                      <pre>{step.code}</pre>
                      <button
                        className="absolute top-3 right-3 p-1.5 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
                        onClick={step.onCopy}
                      >
                        {copiedSection === (index === 0 ? 'sdk' : 'container') ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-300" />
                        )}
                      </button>
                    </div>
                  )}
                  {step.actionLink && (
                    <div className="mt-3">
                      <Link href={step.actionLink} target="_blank">
                        <button className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md">
                          <span>{step.actionText}</span>
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Integration Examples</h2>
            
            {/* Simple tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
              <div className="flex -mb-px space-x-8">
                {['html', 'react', 'wordpress'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-1 py-3 text-sm font-medium border-b-2 ${
                      activeTab === tab
                        ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            {/* HTML Example */}
            <div className={activeTab === 'html' ? '' : 'hidden'}>
              <div className="relative">
                <div className="bg-gray-800 text-gray-200 p-4 rounded-md text-sm overflow-x-auto">
                  <pre className="whitespace-pre-wrap">{htmlExample}</pre>
                </div>
                <button
                  className="absolute top-3 right-3 p-1.5 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
                  onClick={() => handleCopy(htmlExample, 'html')}
                >
                  {copiedSection === 'html' ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-300" />
                  )}
                </button>
              </div>
            </div>
            
            {/* React Example */}
            <div className={activeTab === 'react' ? '' : 'hidden'}>
              <div className="relative">
                <div className="bg-gray-800 text-gray-200 p-4 rounded-md text-sm overflow-x-auto">
                  <pre className="whitespace-pre-wrap">{reactExample}</pre>
                </div>
                <button
                  className="absolute top-3 right-3 p-1.5 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
                  onClick={() => handleCopy(reactExample, 'react')}
                >
                  {copiedSection === 'react' ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-300" />
                  )}
                </button>
              </div>
            </div>
            
            {/* WordPress Example */}
            <div className={activeTab === 'wordpress' ? '' : 'hidden'}>
              <div className="relative">
                <div className="bg-gray-800 text-gray-200 p-4 rounded-md text-sm overflow-x-auto">
                  <pre className="whitespace-pre-wrap">{wordpressExample}</pre>
                </div>
                <button
                  className="absolute top-3 right-3 p-1.5 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
                  onClick={() => handleCopy(wordpressExample, 'wordpress')}
                >
                  {copiedSection === 'wordpress' ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-300" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Advanced Configuration</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              The SDK supports additional configuration options for customizing your ad integration.
            </p>
            <div className="bg-gray-800 text-gray-200 p-4 rounded-md text-sm overflow-x-auto">
              <pre className="whitespace-pre-wrap">{advancedConfig}</pre>
            </div>
          </div>
        </Card>
      </div>
    </ImprovedDashboardLayout>
  );
};

export default SDKExamplesPage;