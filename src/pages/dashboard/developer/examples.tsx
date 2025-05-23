import { useState, useRef } from 'react';
import { Book, Code, Clipboard, Check, Copy, ExternalLink } from 'react-feather';
import Link from 'next/link';
import "./components/layout/ImprovedDashboardLayout';
import "./components/ui/button';
import "./components/ui/card';
import "./components/ui/Typography';
import "./hooks/useAuth';

const SDKExamplesPage = () => {
  const { auth } = useAuth();
  const pubkey = auth?.pubkey || '';
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('html');
  const scriptRef = useRef<HTMLDivElement>(null);
  
  // SDK code with user's pubkey
  const sdkScript = `<script src="https://cdn.proofofreach.com/sdk/v1.js"></script>
<script>
  window.addEventListener("load", () => {
    ProofOfReachSDK.renderAd("proof-of-reach-ad", {
      pubkey: "${pubkey || 'YOUR_NOSTR_PUBKEY'}",
      testMode: false,
      onPayment: (sats) => {
        console.log(\`Received \${sats} satoshis!\`);
        // Update wallet balance or other UI elements here
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
  const reactExample = `import { useEffect } from 'react';

function ProofOfReachAd({ containerId = "proof-of-reach-ad" }) {
  useEffect(() => {
    // Load the SDK
    const script = document.createElement('script');
    script.src = "https://cdn.proofofreach.com/sdk/v1.js";
    script.async = true;
    
    script.onload = () => {
      // Initialize once SDK is loaded
      if (window.ProofOfReachSDK) {
        window.ProofOfReachSDK.renderAd(containerId, {
          pubkey: "${pubkey || 'YOUR_NOSTR_PUBKEY'}",
          testMode: false
        });
      }
    };
    
    document.body.appendChild(script);
    
    // Cleanup on unmount
    return () => {
      document.body.removeChild(script);
    };
  }, [containerId]);
  
  return <div id={containerId}></div>;
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
 * Description: Integrates ProofOfReach ads into your WordPress site
 * Version: 1.0
 */

// Add the SDK to the footer
function add_proofofreach_sdk() {
  ?>
  <script src="https://cdn.proofofreach.com/sdk/v1.js"></script>
  <script>
    window.addEventListener("load", () => {
      // Find all ad containers
      document.querySelectorAll('.proofofreach-ad').forEach(container => {
        ProofOfReachSDK.renderAd(container.id, {
          pubkey: "${pubkey || 'YOUR_NOSTR_PUBKEY'}",
          testMode: false
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

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    });
  };

  return (
    <ImprovedDashboardLayout title="SDK & Code Examples">
      <div className="space-y-6 max-w-4xl">
        <div>
          <Title level={1}>ProofOfReach SDK</Title>
          <Paragraph className="text-gray-500 dark:text-gray-400">
            Integrate ProofOfReach ads into your website with our easy-to-use SDK.
            Copy the code snippets below to get started.
          </Paragraph>
        </div>

        <Card className="overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Integration Guide</h2>
            <div className="grid gap-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <span className="text-purple-700 dark:text-purple-300 font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-medium">Add the SDK to your website</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Copy the code snippet below and paste it just before the closing <code>&lt;/body&gt;</code> tag in your HTML.
                  </p>
                  <div className="mt-3 relative">
                    <div 
                      className="bg-gray-800 text-gray-200 p-4 rounded-md text-sm overflow-x-auto"
                      ref={scriptRef}
                    >
                      <pre className="whitespace-pre-wrap">{sdkScript}</pre>
                    </div>
                    <button
                      className="absolute top-3 right-3 p-1.5 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
                      onClick={() => handleCopy(sdkScript, 'sdk')}
                    >
                      {copiedSection === 'sdk' ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-300" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <span className="text-purple-700 dark:text-purple-300 font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-medium">Add an ad container</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Create a container element with the ID <code>proof-of-reach-ad</code> where you want the ad to appear.
                  </p>
                  <div className="mt-3 relative">
                    <div className="bg-gray-800 text-gray-200 p-4 rounded-md text-sm">
                      <pre>{`<div id="proof-of-reach-ad"></div>`}</pre>
                    </div>
                    <button
                      className="absolute top-3 right-3 p-1.5 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
                      onClick={() => handleCopy('<div id="proof-of-reach-ad"></div>', 'container')}
                    >
                      {copiedSection === 'container' ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-300" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <span className="text-purple-700 dark:text-purple-300 font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-medium">That's it!</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    The SDK will automatically load and display an ad in your container. You'll earn satoshis whenever users interact with the ads.
                  </p>
                  <div className="mt-3">
                    <Link href="/sdk-demo.html" target="_blank">
                      <Button className="flex items-center space-x-2">
                        <span>Try the interactive demo</span>
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Integration Examples</h2>
            <div>
              <div className="mb-4 border-b border-gray-200 dark:border-gray-700">
                <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
                  <li className="mr-2">
                    <button 
                      className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'html' ? 'text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500' : 'hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'}`} 
                      onClick={() => setActiveTab('html')}
                    >
                      HTML
                    </button>
                  </li>
                  <li className="mr-2">
                    <button 
                      className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'react' ? 'text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500' : 'hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'}`} 
                      onClick={() => setActiveTab('react')}
                    >
                      React
                    </button>
                  </li>
                  <li className="mr-2">
                    <button 
                      className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'wordpress' ? 'text-blue-600 border-blue-600 dark:text-blue-500 dark:border-blue-500' : 'hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'}`} 
                      onClick={() => setActiveTab('wordpress')}
                    >
                      WordPress
                    </button>
                  </li>
                </ul>
              </div>
              
              {activeTab === 'html' && (
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
              )}
              
              {activeTab === 'react' && (
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
              )}
              
              {activeTab === 'wordpress' && (
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
              )}
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
              <pre className="whitespace-pre-wrap">{`ProofOfReachSDK.renderAd("proof-of-reach-ad", {
  pubkey: "${pubkey || 'YOUR_NOSTR_PUBKEY'}",  // Your Nostr public key
  testMode: false,                 // Set to true for testing (no real payments)
  adType: "standard",              // "standard", "small", or "banner"
  refreshInterval: 300000,         // Refresh ad every 5 minutes (in ms)
  defaultStyles: true,             // Apply default container styles
  
  // Event callbacks
  onPayment: (sats) => {           // Called when payment is received
    console.log(\`Received \${sats} satoshis!\`);
  },
  onError: (error) => {            // Called when error occurs
    console.logger.error(\`Ad error: \${error}\`);
  },
  onLoad: () => {                  // Called when ad loads successfully
    console.log("Ad loaded successfully");
  }
});\n`}</pre>
            </div>
          </div>
        </Card>
      </div>
    </ImprovedDashboardLayout>
  );
};

export default SDKExamplesPage;