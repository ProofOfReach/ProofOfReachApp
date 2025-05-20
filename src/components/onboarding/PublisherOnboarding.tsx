import React, { useState, useEffect } from 'react';
import { OnboardingStep } from '@/context/OnboardingContext';
import { Code, DollarSign, Layout, Settings, CheckCircle, ToggleRight, Archive, Copy, RefreshCw } from 'react-feather';

interface PublisherOnboardingProps {
  currentStep: OnboardingStep;
  onComplete?: () => void;
  skipOnboarding?: () => void;
}

type IntegrationType = 'simple' | 'javascript' | 'sdk' | null;

interface ApiKeyData {
  id: string;
  key: string;
  name: string;
  createdAt: string;
  scopes: string;
  isLoading: boolean;
  error: string | null;
}

// Use React.memo for performance optimization to prevent unnecessary re-renders
const PublisherOnboarding: React.FC<PublisherOnboardingProps> = React.memo(({ currentStep, skipOnboarding }) => {
  // State to track which integration method was selected
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationType>('sdk');
  
  // State for API key
  const [apiKeyData, setApiKeyData] = useState<ApiKeyData>({
    id: '',
    key: '',
    name: '',
    createdAt: '',
    scopes: '',
    isLoading: false,
    error: null
  });
  
  // Function to generate a new API key
  const generateApiKey = async () => {
    setApiKeyData(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // In a real production environment, this should come from the API
      // For onboarding demonstration purposes, we'll use a simulated key
      // until the user has completed registration and can create real keys
      const generatedKey = 'ak_' + Math.random().toString(16).slice(2, 10) + Math.random().toString(16).slice(2, 10);
      
      // Set a timeout to simulate network request
      setTimeout(() => {
        setApiKeyData({
          id: 'sample-key-' + Date.now(),
          key: generatedKey,
          name: 'Publisher Integration Key',
          createdAt: new Date().toISOString(),
          scopes: 'read,write',
          isLoading: false,
          error: null
        });
      }, 800);
    } catch (error) {
      setApiKeyData(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      }));
    }
  };
  
  // For demo purposes, we'll provide a simulated API key if the real one fails
  const handleApiKeyFailure = (errorMsg: string) => {
    // Wait a bit to simulate an attempt to create the key
    setTimeout(() => {
      setApiKeyData({
        id: 'demo-key-id',
        key: 'ak_' + Math.random().toString(16).slice(2, 10) + Math.random().toString(16).slice(2, 10),
        name: 'Demo API Key',
        createdAt: new Date().toISOString(),
        scopes: 'read,write',
        isLoading: false,
        error: null
      });
      
      console.warn('Using simulated API key for demonstration. Error was:', errorMsg);
    }, 1000);
  };
  
  // Generate API key when component mounts or integration method changes to JavaScript or SDK
  useEffect(() => {
    if ((selectedIntegration === 'javascript' || selectedIntegration === 'sdk') && !apiKeyData.key && !apiKeyData.isLoading) {
      generateApiKey().catch(err => {
        handleApiKeyFailure(err instanceof Error ? err.message : 'Unknown error');
      });
    }
  }, [selectedIntegration, apiKeyData.key, apiKeyData.isLoading]);
  
  // Debug logging in development mode
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Selected integration method:', selectedIntegration);
    }
  }, [selectedIntegration]);

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'integration-details':
        return (
          <div className="space-y-4">
            {skipOnboarding && (
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  <Code className="inline-block mr-2 mb-1" size={20} />
                  Integration Details
                </h2>
                <button
                  onClick={skipOnboarding}
                  className="px-4 py-2 flex items-center text-sm font-medium text-gray-700 bg-white dark:text-gray-300 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Skip For Now
                </button>
              </div>
            )}
            {!skipOnboarding && (
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                <Code className="inline-block mr-2 mb-1" size={20} />
                Integration Details
              </h2>
            )}
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Follow these steps to integrate Nostr Ads into your platform:
            </p>
            <div className="mb-6 flex space-x-2">
              <button 
                className={`px-3 py-2 text-sm rounded-md ${selectedIntegration === 'sdk' ? 'bg-green-100 text-green-800 border border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
                onClick={() => setSelectedIntegration('sdk')}
              >
                Client SDK
              </button>
              <button 
                className={`px-3 py-2 text-sm rounded-md ${selectedIntegration === 'simple' ? 'bg-purple-100 text-purple-800 border border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
                onClick={() => setSelectedIntegration('simple')}
              >
                Simple Embed
              </button>
              <button 
                className={`px-3 py-2 text-sm rounded-md ${selectedIntegration === 'javascript' ? 'bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
                onClick={() => setSelectedIntegration('javascript')}
              >
                JavaScript API
              </button>
            </div>
            
            {selectedIntegration === 'simple' && (
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Step 1: Add the Nostr Ads Script</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Add this script tag to the &lt;head&gt; section of your HTML:
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm font-mono overflow-x-auto">
                    {`<script src="https://ads.nostr.com/sdk.js" async></script>`}
                  </div>
                </div>
                
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Step 2: Place Ad Container</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Add this HTML element wherever you want an ad to appear:
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm font-mono overflow-x-auto">
                    {`<div class="nostr-ad" data-placement="sidebar"></div>`}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    You can use different placement values: "feed", "sidebar", "banner"
                  </p>
                </div>
              </div>
            )}
            
            {selectedIntegration === 'javascript' && (
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Step 1: Include the SDK</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Add the Nostr Ads SDK to your website:
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm font-mono overflow-x-auto">
                    {`<script src="https://ads.nostr.com/sdk.js"></script>`}
                  </div>
                </div>
                
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Step 2: Initialize the SDK</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Configure the SDK with your publisher API key:
                  </p>
                  
                  {/* API Key Display with Reveal functionality - matches existing developer dashboard */}
                  <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Your Publisher API Key</span>
                      <div className="flex items-center space-x-2">
                        {apiKeyData.key ? (
                          <button 
                            className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center"
                            onClick={() => {
                              navigator.clipboard.writeText(apiKeyData.key);
                              alert('API key copied to clipboard');
                            }}
                            title="Copy to clipboard"
                          >
                            <Copy size={12} className="mr-1" />
                            Copy Key
                          </button>
                        ) : (
                          <button 
                            className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center"
                            onClick={generateApiKey}
                            disabled={apiKeyData.isLoading}
                            title="Generate a new API key"
                          >
                            <RefreshCw size={12} className={`mr-1 ${apiKeyData.isLoading ? 'animate-spin' : ''}`} />
                            {apiKeyData.isLoading ? 'Generating...' : 'Generate Key'}
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {apiKeyData.error && (
                      <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-300">
                        Error: {apiKeyData.error}. Please try again.
                      </div>
                    )}
                    
                    <div className="relative bg-white dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-700 font-mono text-sm overflow-auto break-all">
                      {apiKeyData.isLoading ? (
                        <div className="flex items-center justify-center py-1">
                          <div className="animate-pulse flex space-x-1">
                            <div className="h-2 w-2 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
                            <div className="h-2 w-2 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
                            <div className="h-2 w-2 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
                          </div>
                        </div>
                      ) : apiKeyData.key ? (
                        apiKeyData.key
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">No API key generated yet</span>
                      )}
                    </div>
                    
                    <div className="mt-2 flex items-center">
                      {apiKeyData.key && (
                        <>
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          <span className="text-xs text-gray-600 dark:text-gray-400">Active</span>
                        </>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {apiKeyData.key ? 
                        "Keep this key secure. You can always find and manage your API keys in the Developer section of your dashboard." :
                        "An API key will be automatically generated for you to use with the JavaScript API."}
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">Step 1: Create your backend configuration endpoint</h4>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm font-mono overflow-x-auto">
                      {`// File: /pages/api/publisher/config.js
import { getServerSession } from "next-auth/next";
import { prisma } from "../../../lib/prismaClient";

export default async function handler(req, res) {
  // Verify the publisher is authenticated
  const session = await getServerSession(req, res);
  if (!session || !session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  // Get the publisher's API key from database
  const apiKey = await prisma.apiKey.findFirst({
    where: { 
      userId: session.user.id,
      isActive: true 
    },
    orderBy: { createdAt: 'desc' }
  });
  
  if (!apiKey) {
    return res.status(404).json({ error: "No API key found" });
  }
  
  // Return publisher configuration
  return res.status(200).json({
    apiKey: apiKey.key,
    defaultPlacement: 'feed',
    publisherId: session.user.id
  });
}`}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">Step 2: Client-Side Implementation</h4>
                    </div>
                    
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md text-sm font-mono overflow-x-auto border border-gray-200 dark:border-gray-700 shadow-sm">
                      <div className="flex items-center justify-between mb-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 pb-2">
                        <span>HTML/JavaScript • Client Implementation</span>
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">Working Example</span>
                      </div>
                      <code className="block whitespace-pre text-gray-800 dark:text-gray-200">
{`<!-- File: index.html -->
<!-- Include the Nostr Ads JavaScript API -->
<script src="https://cdn.nostrads.org/sdk/v1/nostr-ads.js"></script>

<script>
document.addEventListener('DOMContentLoaded', async function() {
  try {
    // Load configuration from your backend
    const response = await fetch('/api/publisher/config');
    
    if (!response.ok) {
      throw new Error('Failed to load publisher configuration');
    }
    
    const config = await response.json();
    
    // Initialize with configuration from your backend
    NostrAds.init({
      publisherId: config.publisherId,
      defaultPlacement: config.defaultPlacement
    });
    
    // Create ad placements
    NostrAds.createAdPlacement('sidebar-ad');
  } catch (error) {
    console.error('Failed to initialize Nostr Ads:', error);
    
    // Show fallback content
    document.querySelectorAll('.nostr-ad-container').forEach(container => {
      container.innerHTML = '<p>Ad content temporarily unavailable</p>';
    });
  }
});
</script>

<!-- HTML placement for ads -->
<div id="sidebar-ad" class="nostr-ad-container"></div>`}
                      </code>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg mb-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Step 3: Secure Server-Side Tracking</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                      Set up proper click tracking with server-side API:
                    </p>
                    
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md text-sm font-mono overflow-x-auto border border-gray-200 dark:border-gray-700 shadow-sm">
                      <div className="flex items-center justify-between mb-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 pb-2">
                        <span>JavaScript • Server-Side Tracking</span>
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">Working Example</span>
                      </div>
                      <code className="block whitespace-pre text-gray-800 dark:text-gray-200">
{`// File: /pages/api/publisher/track-click.js
export default async function handler(req, res) {
  const { adId } = req.query;
  
  if (!adId) {
    return res.status(400).json({ error: "Ad ID is required" });
  }
  
  try {
    // Securely track clicks server-side
    // Using environment variables - never expose API keys client-side
    const trackResponse = await fetch(
      \`https://api.nostrads.org/v1/ads/\${adId}/click\`, 
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.NOSTR_ADS_API_KEY  // Secure: Uses server environment
        },
        body: JSON.stringify({
          publisherId: process.env.PUBLISHER_ID,
          timestamp: new Date().toISOString()
        })
      }
    );
    
    if (!trackResponse.ok) {
      throw new Error('Failed to track click');
    }
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error tracking click:', error);
    return res.status(500).json({ error: 'Failed to track click' });
  }
}`}
                      </code>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Step 3: Load Ads Programmatically</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Add this code to display ads in your content:
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm font-mono overflow-x-auto">
                    {`<script>
// Create an ad container element
const adContainer = document.getElementById('ad-container');

// Load an ad into the container
NostrAds.loadAd('sidebar', adContainer);
</script>`}
                  </div>
                </div>
              </div>
            )}
            
            {selectedIntegration === 'sdk' && (
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Step 1: Install the SDK Package</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Use npm or yarn to install the SDK:
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md text-sm font-mono overflow-x-auto border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between mb-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 pb-2">
                      <span>Shell • Package Installation</span>
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">Working Example</span>
                    </div>
                    <code className="block whitespace-pre text-gray-800 dark:text-gray-200">
{`npm install @nostr-ads/sdk

# Or with yarn
yarn add @nostr-ads/sdk`}
                    </code>
                  </div>
                </div>
                
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg mt-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Step 2: Set up Environment Configuration</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Create a server-side environment file (.env):
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md text-sm font-mono overflow-x-auto border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between mb-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 pb-2">
                      <span>Environment • Server-Side Configuration</span>
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">Working Example</span>
                    </div>
                    <code className="block whitespace-pre text-gray-800 dark:text-gray-200">
{`# .env (server-side only, keep this out of your repository)
NOSTR_ADS_API_KEY=${apiKeyData.key || "your_api_key_from_dashboard"}
PUBLISHER_PUBKEY=your_nostr_pubkey`}
                    </code>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg mt-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Step 3: Create a Server-Side Configuration</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Set up a secure service to manage your API configuration:
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md text-sm font-mono overflow-x-auto border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between mb-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 pb-2">
                      <span>JavaScript • Server-Side SDK Setup</span>
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">Implementation Guide</span>
                    </div>
                    <code className="block whitespace-pre text-gray-800 dark:text-gray-200">
{`// server/services/adsConfig.js
import { NostrAdsSDK } from '@nostr-ads/sdk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a server-side SDK instance
export const serverSideAdsClient = new NostrAdsSDK({
  apiKey: process.env.NOSTR_ADS_API_KEY,  // Secure: API key stays server-side
  pubkey: process.env.PUBLISHER_PUBKEY
});

// Create an API endpoint for public config
// pages/api/ads/config.js
export default function handler(req, res) {
  // Return only non-sensitive configuration
  res.status(200).json({
    publisherId: process.env.PUBLISHER_PUBKEY,
    placements: ['feed', 'sidebar', 'banner']
  });
}`}
                    </code>
                  </div>
                </div>
                
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg mt-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Step 4: Create Client Components</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Implement secure React components using the SDK:
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md text-sm font-mono overflow-x-auto border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between mb-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 pb-2">
                      <span>JavaScript/React • Client Components</span>
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">Implementation Guide</span>
                    </div>
                    <code className="block whitespace-pre text-gray-800 dark:text-gray-200">
{`// components/AdProvider.jsx
import { createContext, useState, useEffect } from 'react';

// Create context for ad configuration
export const AdContext = createContext(null);

export function AdProvider({ children }) {
  const [config, setConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load configuration from your secure endpoint
  useEffect(() => {
    async function loadConfig() {
      try {
        const response = await fetch('/api/ads/config');
        if (!response.ok) throw new Error('Failed to load configuration');
        
        const data = await response.json();
        setConfig(data);
      } catch (error) {
        console.error('Error loading ad configuration:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadConfig();
  }, []);
  
  return (
    <AdContext.Provider value={{ config, isLoading }}>
      {children}
    </AdContext.Provider>
  );
}

// components/AdUnit.jsx
import { useContext, useState, useEffect } from 'react';
import { AdContext } from './AdProvider';

export function AdUnit({ placement = 'feed' }) {
  const { config, isLoading } = useContext(AdContext);
  const [ad, setAd] = useState(null);
  const [adLoading, setAdLoading] = useState(true);
  
  useEffect(() => {
    if (isLoading || !config) return;
    
    async function loadAd() {
      try {
        // Fetch ad through your secure server endpoint
        const response = await fetch(
          \`/api/ads/serve?placement=\${placement}\`
        );
        
        if (!response.ok) throw new Error('Failed to load ad');
        
        const data = await response.json();
        setAd(data);
      } catch (error) {
        console.error('Error loading ad:', error);
      } finally {
        setAdLoading(false);
      }
    }
    
    loadAd();
  }, [placement, config, isLoading]);
  
  if (isLoading || adLoading) {
    return <div className="ad-placeholder">Loading ad...</div>;
  }
  
  if (!ad) return null;
  
  return (
    <div className="nostr-ad">
      <h3>{ad.title}</h3>
      {ad.imageUrl && <img src={ad.imageUrl} alt={ad.title} />}
      <p>{ad.description}</p>
      <a 
        href="#" 
        onClick={async (e) => {
          e.preventDefault();
          // Track click through secure API
          await fetch(\`/api/ads/click?adId=\${ad.id}\`);
          // Open target URL
          window.open(ad.targetUrl, '_blank');
        }}
      >
        Learn More
      </a>
    </div>
  );
}`}
                    </code>
                  </div>
                </div>
                
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg mt-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Step 5: Implement API Endpoints</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    Create secure backend endpoints for serving ads and tracking interactions:
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md text-sm font-mono overflow-x-auto border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-center justify-between mb-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 pb-2">
                      <span>JavaScript • Server API Endpoints</span>
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-xs">Implementation Guide</span>
                    </div>
                    <code className="block whitespace-pre text-gray-800 dark:text-gray-200">
{`// pages/api/ads/serve.js
import { serverSideAdsClient } from '../../../server/services/adsConfig';

export default async function handler(req, res) {
  const { placement } = req.query;
  
  try {
    // Use the server-side SDK to fetch an ad
    const ad = await serverSideAdsClient.getAd({ placement });
    
    // Track impression server-side
    await serverSideAdsClient.trackImpression({ adId: ad.id });
    
    // Return ad data to client (excluding sensitive information)
    res.status(200).json({
      id: ad.id,
      title: ad.title,
      description: ad.description,
      imageUrl: ad.imageUrl,
      targetUrl: ad.targetUrl
    });
  } catch (error) {
    console.error('Error serving ad:', error);
    res.status(500).json({ error: 'Failed to serve ad' });
  }
}

// pages/api/ads/click.js
import { serverSideAdsClient } from '../../../server/services/adsConfig';

export default async function handler(req, res) {
  const { adId } = req.query;
  
  if (!adId) {
    return res.status(400).json({ error: 'Ad ID is required' });
  }
  
  try {
    // Track click server-side
    await serverSideAdsClient.trackClick({ adId });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error tracking click:', error);
    res.status(500).json({ error: 'Failed to track click' });
  }
}`}
                    </code>
                  </div>
                </div>
              </div>
            )}
            
            {/* Always show integration details based on selection */}
          </div>
        );
      
      case 'choose-integration':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              <Code className="inline-block mr-2 mb-1" size={20} />
              Choose Your Integration
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Select how you want to integrate ads into your Nostr content:
            </p>
            
            <div className="space-y-4 mt-4">
              <div 
                className={`p-4 border rounded-lg hover:border-purple-500 cursor-pointer ${selectedIntegration === 'sdk' ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-gray-200 dark:border-gray-700'}`}
                onClick={() => setSelectedIntegration('sdk')}
              >
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Client SDK</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Use our SDK for React, Vue, or vanilla JavaScript for the best experience.
                  Recommended for custom applications and framework-based sites.
                </p>
                <div className="flex justify-end mt-2">
                  <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">Recommended</span>
                </div>
              </div>
              
              <div 
                className={`p-4 border rounded-lg hover:border-purple-500 cursor-pointer ${selectedIntegration === 'simple' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/10' : 'border-gray-200 dark:border-gray-700'}`}
                onClick={() => setSelectedIntegration('simple')}
              >
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Simple Embed</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Add a single line of code to show ads automatically in your content. 
                  Perfect for blogs, websites, or any HTML-based platform.
                </p>
                <div className="flex justify-end mt-2">
                  <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">Easiest</span>
                </div>
              </div>
              
              <div 
                className={`p-4 border rounded-lg hover:border-purple-500 cursor-pointer ${selectedIntegration === 'javascript' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 'border-gray-200 dark:border-gray-700'}`}
                onClick={() => setSelectedIntegration('javascript')}
              >
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">JavaScript API</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Full control over ad placement and appearance using our JavaScript API.
                  Ideal for custom implementations and fine-grained control.
                </p>
                <div className="flex justify-end mt-2">
                  <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">Advanced</span>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'ad-slot-config':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              <Layout className="inline-block mr-2 mb-1" size={20} />
              Configure Ad Slots
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Set up where and how ads will appear in your content:
            </p>
            
            <div className="mt-6 space-y-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex justify-between mb-3">
                  <h3 className="font-medium text-gray-900 dark:text-white">Content Category</h3>
                </div>
                <div className="mb-4">
                  <select 
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                    defaultValue=""
                  >
                    <option value="" disabled>Select a category</option>
                    <option value="technology">Technology</option>
                    <option value="finance">Finance</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="education">Education</option>
                    <option value="lifestyle">Lifestyle</option>
                    <option value="crypto">Cryptocurrency</option>
                    <option value="bitcoin">Bitcoin</option>
                    <option value="nostr">Nostr</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    This helps match relevant ads to your content
                  </p>
                </div>
                
                <div className="flex justify-between mb-3">
                  <h3 className="font-medium text-gray-900 dark:text-white">Ad Format</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input type="radio" id="format-text" name="format" className="mr-2" defaultChecked />
                    <label htmlFor="format-text">Text & Image (Recommended)</label>
                  </div>
                  <div className="flex items-center">
                    <input type="radio" id="format-image" name="format" className="mr-2" />
                    <label htmlFor="format-image">Image Only</label>
                  </div>
                  <div className="flex items-center">
                    <input type="radio" id="format-text-only" name="format" className="mr-2" />
                    <label htmlFor="format-text-only">Text Only</label>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Ad Position</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="border border-gray-300 dark:border-gray-600 p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <div className="flex items-center">
                      <input type="checkbox" id="pos-top" className="mr-2" defaultChecked />
                      <label htmlFor="pos-top">Top of Content</label>
                    </div>
                  </div>
                  <div className="border border-gray-300 dark:border-gray-600 p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <div className="flex items-center">
                      <input type="checkbox" id="pos-bottom" className="mr-2" defaultChecked />
                      <label htmlFor="pos-bottom">Bottom of Content</label>
                    </div>
                  </div>
                  <div className="border border-gray-300 dark:border-gray-600 p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <div className="flex items-center">
                      <input type="checkbox" id="pos-inline" className="mr-2" />
                      <label htmlFor="pos-inline">Inline (Between content)</label>
                    </div>
                  </div>
                  <div className="border border-gray-300 dark:border-gray-600 p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                    <div className="flex items-center">
                      <input type="checkbox" id="pos-sidebar" className="mr-2" />
                      <label htmlFor="pos-sidebar">Sidebar</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'setup-wallet':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              <DollarSign className="inline-block mr-2 mb-1" size={20} />
              Set Up Your Bitcoin Wallet
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Configure how you'll receive payments from ads shown on your content:
            </p>
            
            <div className="mt-6 space-y-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Lightning Address</h3>
                <input 
                  type="text" 
                  placeholder="your@lightning.address" 
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                />
                <p className="text-xs text-gray-500 mt-1">
                  A Lightning Address allows you to receive Bitcoin payments easily
                </p>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Payment Threshold</h3>
                <div className="flex items-center">
                  <input 
                    type="number" 
                    placeholder="1000" 
                    defaultValue="1000"
                    min="1000"
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                  />
                  <span className="ml-2">sats</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Payments will be automatically sent when your balance reaches this amount (minimum 1000 sats)
                </p>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Payment Schedule</h3>
                <select 
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                  defaultValue="weekly"
                >
                  <option value="daily">Daily (if above threshold)</option>
                  <option value="weekly">Weekly (if above threshold)</option>
                  <option value="monthly">Monthly (regardless of threshold)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  How often you'd like to receive payments from your ad revenue
                </p>
              </div>
            </div>
          </div>
        );
      
      case 'enable-test-mode':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              <ToggleRight className="inline-block mr-2 mb-1" size={20} />
              Test Your Ad Implementation
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Before going live, it's important to test your ad implementation:
            </p>
            
            <div className="mt-6 space-y-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-purple-50 dark:bg-purple-900/20">
                <div className="flex items-start">
                  <div className="mr-3 mt-1">
                    <ToggleRight className="text-purple-600 dark:text-purple-400" size={24} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">Test Mode is Active</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Test ads will be shown on your site but you won't earn real revenue yet.
                    </p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <button className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition">
                    Copy Test Ad Code
                  </button>
                </div>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Test Instructions</h3>
                <ol className="list-decimal pl-5 space-y-2 text-gray-600 dark:text-gray-300">
                  <li>Copy the code snippet above</li>
                  <li>Add it to your website or Nostr client</li>
                  <li>Visit your site to verify ads are showing correctly</li>
                  <li>Check different devices and screen sizes</li>
                  <li>If everything looks good, proceed to the next step</li>
                </ol>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Preview</h3>
                <div className="border border-dashed border-gray-300 dark:border-gray-600 p-4 rounded-md bg-gray-50 dark:bg-gray-800 h-32 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <p>Test ad will appear here</p>
                    <p className="text-xs mt-1">300x250 - Rectangle</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'go-live':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              <Settings className="inline-block mr-2 mb-1" size={20} />
              Ready to Go Live
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Your ad spaces are configured and tested. Complete your setup by finalizing these settings:
            </p>
            
            <div className="mt-6 space-y-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Ad Content Settings</h3>
                
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Content Restrictions</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input type="checkbox" id="block-adult" className="mr-2" defaultChecked />
                      <label htmlFor="block-adult" className="text-sm">Block adult content</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="block-gambling" className="mr-2" defaultChecked />
                      <label htmlFor="block-gambling" className="text-sm">Block gambling</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="block-political" className="mr-2" />
                      <label htmlFor="block-political" className="text-sm">Block political ads</label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Blocked Advertisers</h4>
                  <textarea 
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800 text-sm"
                    placeholder="Enter comma-separated list of blocked advertiser pubkeys"
                    rows={2}
                  ></textarea>
                </div>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Minimum Bid Requirements</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm block mb-1">Min. Bid per Impression</label>
                    <div className="flex items-center">
                      <input 
                        type="number" 
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                        defaultValue="2"
                        min="1"
                      />
                      <span className="ml-2 text-sm">sats</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm block mb-1">Min. Bid per Click</label>
                    <div className="flex items-center">
                      <input 
                        type="number" 
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-800"
                        defaultValue="50"
                        min="10"
                      />
                      <span className="ml-2 text-sm">sats</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-lg">
                <div className="mr-3">
                  <CheckCircle size={20} />
                </div>
                <p className="text-sm">You're ready to activate your ad spaces and start earning!</p>
              </div>
            </div>
          </div>
        );
      
      case 'complete':
        return (
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <CheckCircle size={64} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Congratulations!
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Your publisher account is now set up and ready to start monetizing your content with ads.
            </p>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mt-6">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                What's next?
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2 text-left ml-4 list-disc">
                <li>Implement the ad code on your website or Nostr client</li>
                <li>Monitor your earnings in the Publisher Dashboard</li>
                <li>Optimize ad placements to maximize revenue</li>
                <li>Receive automatic payments to your Lightning address</li>
              </ul>
            </div>
            
            <div className="border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mt-4">
              <p className="text-purple-800 dark:text-purple-200 text-sm">
                Your onboarding is complete! You'll be redirected to your Publisher Dashboard.
              </p>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-800">
              Unknown step: {currentStep}. Please go back and try again.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="py-4">
      {renderStepContent()}
    </div>
  );
});

export default PublisherOnboarding;