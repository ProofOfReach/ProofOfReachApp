/**
 * Phase 1: Private Ad Interaction Vault
 * Landing page for testing the private vault functionality
 */

import React, { useState, useEffect } from 'react';
import { usePrivateVault } from '../hooks/usePrivateVault';

const TestAd: React.FC<{
  adId: string;
  title: string;
  content: string;
  onView: () => void;
  onClick: () => void;
}> = ({ adId, title, content, onView, onClick }) => {
  const [viewStartTime, setViewStartTime] = useState<number | null>(null);

  useEffect(() => {
    // Start tracking view time when component mounts
    const startTime = Date.now();
    setViewStartTime(startTime);
    
    // Log view after 1 second
    const viewTimer = setTimeout(() => {
      onView();
    }, 1000);

    return () => {
      clearTimeout(viewTimer);
    };
  }, [onView]);

  const handleClick = () => {
    const duration = viewStartTime ? Date.now() - viewStartTime : 0;
    onClick();
  };

  return (
    <div className="border-2 border-blue-200 rounded-lg p-6 bg-blue-50 max-w-md">
      <h3 className="text-lg font-semibold text-blue-900 mb-2">{title}</h3>
      <p className="text-blue-800 mb-4">{content}</p>
      <button
        onClick={handleClick}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
      >
        Click Ad
      </button>
      <p className="text-xs text-blue-600 mt-2">Ad ID: {adId}</p>
    </div>
  );
};

const VaultDashboard: React.FC<{
  interactions: any[];
  stats: any;
  onExport: () => void;
  onClear: () => void;
}> = ({ interactions, stats, onExport, onClear }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Your Private Ad Vault</h2>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-2xl font-bold text-gray-900">{stats.totalInteractions}</div>
          <div className="text-sm text-gray-600">Total Interactions</div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-2xl font-bold text-gray-900">{stats.uniqueAds}</div>
          <div className="text-sm text-gray-600">Unique Ads</div>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <div className="text-2xl font-bold text-gray-900">
            {stats.lastInteraction 
              ? new Date(stats.lastInteraction).toLocaleDateString()
              : 'Never'
            }
          </div>
          <div className="text-sm text-gray-600">Last Activity</div>
        </div>
      </div>

      {/* Recent Interactions */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">Recent Interactions</h3>
        {interactions.length === 0 ? (
          <p className="text-gray-500 italic">No interactions yet. Try viewing or clicking the test ads above.</p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {interactions.slice(-10).reverse().map((interaction, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <span className="font-medium">{interaction.ad_id}</span>
                  <span className={`ml-2 px-2 py-1 text-xs rounded ${
                    interaction.action === 'click' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {interaction.action}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(interaction.timestamp).toLocaleTimeString()}
                  {interaction.duration_ms > 0 && (
                    <span className="ml-2">({interaction.duration_ms}ms)</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={onExport}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
        >
          Export Data
        </button>
        <button
          onClick={onClear}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
        >
          Clear Vault
        </button>
      </div>
    </div>
  );
};

export default function Phase1() {
  const {
    isUnlocked,
    isLoading,
    npub,
    hasNostrExtension,
    interactions,
    stats,
    unlockVault,
    lockVault,
    logInteraction,
    exportData,
    clearVault
  } = usePrivateVault();

  const [message, setMessage] = useState<string>('');
  const [viewedAds, setViewedAds] = useState<Set<string>>(new Set());

  const handleUnlock = async () => {
    try {
      const success = await unlockVault();
      if (success) {
        setMessage('✅ Vault unlocked successfully!');
      } else {
        setMessage('❌ Failed to unlock vault');
      }
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleAdView = async (adId: string) => {
    if (!isUnlocked) return;
    
    try {
      await logInteraction(adId, 'view', 1000);
      setViewedAds(prev => new Set(Array.from(prev).concat(adId)));
      setMessage(`📊 Logged view for ${adId}`);
    } catch (error) {
      setMessage(`❌ Failed to log view: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleAdClick = async (adId: string) => {
    if (!isUnlocked) return;
    
    try {
      await logInteraction(adId, 'click', 2500);
      setMessage(`🖱️ Logged click for ${adId}`);
    } catch (error) {
      setMessage(`❌ Failed to log click: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleExport = async () => {
    try {
      await exportData();
      setMessage('📁 Data exported successfully!');
    } catch (error) {
      setMessage(`❌ Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleClear = async () => {
    if (confirm('Are you sure you want to clear all vault data? This cannot be undone.')) {
      try {
        await clearVault();
        setViewedAds(new Set());
        setMessage('🗑️ Vault cleared successfully');
      } catch (error) {
        setMessage(`❌ Clear failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Phase 1: Private Ad Interaction Vault
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            A private, encrypted system for tracking ad interactions using your Nostr identity. 
            All data is stored locally and encrypted with your keys.
          </p>
        </div>

        {/* Authentication Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Authentication</h2>
          
          {!hasNostrExtension ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">
                ⚠️ Nostr extension not detected. Please install{' '}
                <a href="https://getalby.com/" target="_blank" rel="noopener noreferrer" className="underline">
                  Alby
                </a>{' '}
                or{' '}
                <a href="https://github.com/fiatjaf/nos2x" target="_blank" rel="noopener noreferrer" className="underline">
                  nos2x
                </a>{' '}
                to continue.
              </p>
            </div>
          ) : !isUnlocked ? (
            <div>
              <p className="text-gray-600 mb-4">
                Connect with your Nostr key to unlock your private ad interaction vault.
              </p>
              <button
                onClick={handleUnlock}
                disabled={isLoading}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Connecting...' : 'Unlock Vault with Nostr'}
              </button>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <div>
                <p className="text-green-600 font-medium">✅ Vault Unlocked</p>
                <p className="text-sm text-gray-600 font-mono">{npub}</p>
              </div>
              <button
                onClick={lockVault}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                Lock Vault
              </button>
            </div>
          )}
        </div>

        {/* Privacy Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h3 className="font-medium text-blue-900 mb-2">🔒 Privacy & Security</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• All interaction data is encrypted locally using your Nostr keys</li>
            <li>• No data is posted to public relays or shared without your consent</li>
            <li>• You maintain full control and ownership of your data vault</li>
            <li>• Data can be exported or cleared at any time</li>
          </ul>
        </div>

        {/* Test Ads Section */}
        {isUnlocked && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Test Ads</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <TestAd
                adId="test-ad-001"
                title="Bitcoin Hardware Wallet"
                content="Secure your Bitcoin with the latest hardware wallet technology."
                onView={() => handleAdView('test-ad-001')}
                onClick={() => handleAdClick('test-ad-001')}
              />
              <TestAd
                adId="test-ad-002"
                title="Lightning Network Course"
                content="Learn how to build on the Lightning Network with this comprehensive course."
                onView={() => handleAdView('test-ad-002')}
                onClick={() => handleAdClick('test-ad-002')}
              />
              <TestAd
                adId="test-ad-003"
                title="Nostr Client App"
                content="Experience the decentralized social web with our new Nostr client."
                onView={() => handleAdView('test-ad-003')}
                onClick={() => handleAdClick('test-ad-003')}
              />
            </div>
          </div>
        )}

        {/* Dashboard */}
        {isUnlocked && (
          <VaultDashboard
            interactions={interactions}
            stats={stats}
            onExport={handleExport}
            onClear={handleClear}
          />
        )}

        {/* Status Messages */}
        {message && (
          <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
            <p className="text-sm">{message}</p>
            <button
              onClick={() => setMessage('')}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
}