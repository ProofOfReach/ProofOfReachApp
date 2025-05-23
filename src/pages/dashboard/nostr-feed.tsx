import React, { useState } from 'react';
import Head from 'next/head';
import { ChevronDown, Settings } from 'react-feather';
import '@/components/SimpleNostrFeed';
import type { NextPageWithLayout } from '../_app';
import { getDashboardLayout } from '@/utils/layoutHelpers';

const NostrFeedPage: NextPageWithLayout = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [limit, setLimit] = useState(20);
  const [showAds, setShowAds] = useState(true);
  const [adFrequency, setAdFrequency] = useState(5);
  
  // Custom relays for demonstration
  const [relays, setRelays] = useState([
    'wss://relay.damus.io',
    'wss://relay.nostr.band',
    'wss://nos.lol',
    'wss://relay.current.fyi'
  ]);
  
  const [newRelay, setNewRelay] = useState('');
  
  const addRelay = () => {
    if (newRelay && !relays.includes(newRelay)) {
      setRelays([...relays, newRelay]);
      setNewRelay('');
    }
  };
  
  const removeRelay = (relay: string) => {
    setRelays(relays.filter(r => r !== relay));
  };
  
  const resetSettings = () => {
    setLimit(20);
    setShowAds(true);
    setAdFrequency(5);
    setRelays([
      'wss://relay.damus.io',
      'wss://relay.nostr.band',
      'wss://nos.lol',
      'wss://relay.current.fyi'
    ]);
  };
  
  return (
    <>
      <Head>
        <title>Nostr Feed | Nostr Ad Marketplace</title>
        <meta name="description" content="View the latest posts from the Nostr network" />
      </Head>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Nostr Feed Demo
              </h1>
              
              <button 
                onClick={() => setShowSettings(!showSettings)} 
                className="flex items-center text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
              >
                <Settings className="h-5 w-5 mr-1" />
                <span className="mr-1 text-sm">Settings</span>
                <ChevronDown 
                  className={`h-4 w-4 transition-transform ${showSettings ? 'transform rotate-180' : ''}`} 
                />
              </button>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              This demo shows a real-time feed of content from the Nostr network, integrated with our ad marketplace.
            </p>
          </div>
          
          {/* Settings panel */}
          {showSettings && (
            <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Feed Settings
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Number of posts
                  </label>
                  <select
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                    className="input-field"
                  >
                    <option value={5}>5 posts</option>
                    <option value={10}>10 posts</option>
                    <option value={20}>20 posts</option>
                    <option value={50}>50 posts</option>
                  </select>
                </div>
                
                <div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="showAds"
                      checked={showAds}
                      onChange={(e) => setShowAds(e.target.checked)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <label htmlFor="showAds" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Show ads in feed
                    </label>
                  </div>
                </div>
                
                {showAds && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ad frequency
                    </label>
                    <select
                      value={adFrequency}
                      onChange={(e) => setAdFrequency(Number(e.target.value))}
                      className="input-field"
                    >
                      <option value={3}>Every 3 posts</option>
                      <option value={5}>Every 5 posts</option>
                      <option value={10}>Every 10 posts</option>
                    </select>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Relays
                  </label>
                  <div className="space-y-2 mb-2">
                    {relays.map((relay, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded-md">
                        <span className="text-sm text-gray-700 dark:text-gray-300 font-mono truncate">
                          {relay}
                        </span>
                        <button 
                          onClick={() => removeRelay(relay)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex mt-2">
                    <input
                      type="text"
                      value={newRelay}
                      onChange={(e) => setNewRelay(e.target.value)}
                      placeholder="wss://relay.example.com"
                      className="input-field flex-1 mr-2"
                    />
                    <button 
                      onClick={addRelay}
                      className="btn-secondary"
                      disabled={!newRelay}
                    >
                      Add Relay
                    </button>
                  </div>
                </div>
                
                <div className="pt-2 flex justify-between">
                  <button 
                    onClick={resetSettings}
                    className="btn-outline"
                  >
                    Reset to Defaults
                  </button>
                  
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="btn-primary"
                  >
                    Apply Settings
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Nostr feed component */}
          <SimpleNostrFeed 
            showAds={showAds}
            adFrequency={adFrequency}
          />
        </div>
      </div>
    </>
  );
};

// Use the consistent dashboard layout helper
NostrFeedPage.getLayout = (page: React.ReactElement) => {
  return getDashboardLayout(page, "Nostr Feed");
};

export default NostrFeedPage;