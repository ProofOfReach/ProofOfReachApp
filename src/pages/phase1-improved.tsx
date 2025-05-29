/**
 * Phase 1: Private User-Owned Ad Interaction Vault
 * Improved version with better theming, toast notifications, and accordion expansion
 */

import React, { useState, useEffect } from 'react';
import { usePrivateVault } from '../hooks/usePrivateVault';

const TestAd: React.FC<{
  adId: string;
  title: string;
  content: string;
  onView: () => void;
  onClick: () => void;
  isViewed: boolean;
}> = ({ adId, title, content, onView, onClick, isViewed }) => {
  const [viewStartTime, setViewStartTime] = useState<number | null>(null);

  useEffect(() => {
    const startTime = Date.now();
    setViewStartTime(startTime);
    
    if (!isViewed) {
      const viewTimer = setTimeout(() => {
        onView();
      }, 1000);

      return () => {
        clearTimeout(viewTimer);
      };
    }
  }, [onView, isViewed]);

  const handleClick = () => {
    onClick();
  };

  return (
    <div className={`border-2 rounded-xl p-6 max-w-md transition-all duration-300 shadow-sm ${
      isViewed 
        ? 'border-emerald-300 bg-emerald-50 shadow-emerald-100' 
        : 'border-slate-300 bg-white hover:shadow-md'
    }`}>
      <div className="flex justify-between items-start mb-3">
        <h3 className={`text-lg font-semibold ${isViewed ? 'text-emerald-900' : 'text-slate-800'}`}>
          {title}
        </h3>
        {isViewed && (
          <span className="text-emerald-700 text-sm font-medium bg-emerald-200 px-3 py-1 rounded-full flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Viewed
          </span>
        )}
      </div>
      <p className={`mb-4 text-sm leading-relaxed ${isViewed ? 'text-emerald-800' : 'text-slate-600'}`}>
        {content}
      </p>
      <button
        onClick={handleClick}
        className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium mb-3"
      >
        Learn More
      </button>
      <p className={`text-xs ${isViewed ? 'text-emerald-600' : 'text-slate-500'}`}>
        ID: {adId} {isViewed && '• Tracked this session'}
      </p>
    </div>
  );
};

const VaultDashboard: React.FC<{
  interactions: any[];
  stats: any;
  onExport: () => void;
  onClear: () => void;
}> = ({ interactions, stats, onExport, onClear }) => {
  const [expandedItems, setExpandedItems] = React.useState<Set<number>>(new Set());

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const getAdDetails = (adId: string) => {
    const adMap: Record<string, any> = {
      'test-ad-001': {
        title: 'Bitcoin Hardware Wallet',
        content: 'Secure your Bitcoin with the latest hardware wallet technology.',
        publisher: 'CryptoGear Store',
        website: 'cryptogear.com',
        category: 'Hardware',
        price: '$129.99'
      },
      'test-ad-002': {
        title: 'Lightning Network Course',
        content: 'Learn how to build on the Lightning Network with this comprehensive course.',
        publisher: 'Bitcoin Academy',
        website: 'bitcoinacademy.io',
        category: 'Education',
        price: '$49.99'
      },
      'test-ad-003': {
        title: 'Nostr Client App',
        content: 'Experience the decentralized social web with our new Nostr client.',
        publisher: 'DecentralApp',
        website: 'decentral.app',
        category: 'Software',
        price: 'Free'
      }
    };
    return adMap[adId] || { 
      title: 'Unknown Ad', 
      content: '', 
      publisher: 'Unknown Publisher', 
      website: 'unknown.com',
      category: 'Unknown', 
      price: 'N/A' 
    };
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-8 rounded-2xl shadow-lg border border-slate-200">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-blue-600 rounded-xl shadow-md">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Your Private Ad Vault</h2>
          <p className="text-slate-600">Encrypted ad interactions stored locally</p>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-blue-600">{stats.totalViews}</div>
              <div className="text-sm font-medium text-slate-600">Total Views</div>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-emerald-600">{stats.totalClicks}</div>
              <div className="text-sm font-medium text-slate-600">Total Clicks</div>
            </div>
            <div className="p-3 bg-emerald-100 rounded-xl">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-purple-600">{stats.uniqueAds}</div>
              <div className="text-sm font-medium text-slate-600">Unique Ads</div>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Interaction History */}
      <div className="mb-10">
        <h3 className="text-2xl font-semibold text-slate-800 mb-6">Interaction History</h3>
        {interactions.length === 0 ? (
          <div className="bg-white p-10 rounded-xl border border-slate-200 text-center">
            <div className="p-4 bg-slate-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-slate-600 text-xl font-medium mb-2">No interactions yet</p>
            <p className="text-slate-500">View or click some ads above to see your private data here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {interactions.slice(0, 8).map((interaction, index) => {
              const adDetails = getAdDetails(interaction.adId);
              const isExpanded = expandedItems.has(index);
              
              return (
                <div key={index} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div 
                    className="p-5 cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => toggleExpanded(index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${
                          interaction.type === 'view' 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'bg-emerald-100 text-emerald-600'
                        }`}>
                          {interaction.type === 'view' ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 text-lg">
                            {interaction.type === 'view' ? 'Viewed' : 'Clicked'} • {adDetails.title}
                          </div>
                          <div className="text-sm text-slate-500 mt-1">
                            {new Date(interaction.timestamp).toLocaleString()}
                            {interaction.duration_ms > 0 && (
                              <span className="ml-2">• {interaction.duration_ms}ms engagement</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-medium">
                          {adDetails.category}
                        </span>
                        <svg 
                          className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50">
                      <div className="pt-5 space-y-4">
                        <div>
                          <div className="text-sm font-semibold text-slate-700 mb-2">Ad Content</div>
                          <div className="text-sm text-slate-600 bg-white p-3 rounded-lg border border-slate-200">
                            {adDetails.content}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <div className="text-sm font-semibold text-slate-700 mb-1">Publisher</div>
                            <div className="text-sm text-slate-600">{adDetails.publisher}</div>
                            <div className="text-xs text-slate-500">{adDetails.website}</div>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-700 mb-1">Category</div>
                            <div className="text-sm text-slate-600">{adDetails.category}</div>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-700 mb-1">Price</div>
                            <div className="text-sm font-medium text-emerald-600">{adDetails.price}</div>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-700 mb-2">Ad Identifier</div>
                          <div className="text-xs font-mono text-slate-500 bg-white px-3 py-2 rounded-lg border border-slate-200 inline-block">
                            {interaction.adId}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={onExport}
          className="flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-colors font-semibold shadow-lg hover:shadow-xl"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export Data
        </button>
        <button
          onClick={onClear}
          className="flex items-center gap-3 bg-red-600 text-white px-8 py-4 rounded-xl hover:bg-red-700 transition-colors font-semibold shadow-lg hover:shadow-xl"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear Vault
        </button>
      </div>
    </div>
  );
};

export default function Phase1Improved() {
  const {
    isUnlocked,
    isLoading,
    npub,
    hasNostrExtension,
    interactions,
    stats,
    unlockVault,
    exportData,
    clearVault,
    recordView,
    recordClick
  } = usePrivateVault();

  const [toast, setToast] = useState<string | null>(null);
  const [viewedAds, setViewedAds] = useState<Set<string>>(new Set());

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 4000);
  };

  const handleAdView = async (adId: string) => {
    if (!viewedAds.has(adId)) {
      await recordView(adId);
      setViewedAds(prev => new Set([...prev, adId]));
      showToast(`Ad view recorded: ${adId}`);
    }
  };

  const handleAdClick = async (adId: string) => {
    await recordClick(adId);
    showToast(`Ad click recorded: ${adId}`);
  };

  const handleExport = () => {
    exportData();
    showToast('Data exported successfully!');
  };

  const handleClear = () => {
    clearVault();
    setViewedAds(new Set());
    showToast('Vault cleared successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
      {/* Enhanced Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-slide-in">
          <div className="bg-white border-l-4 border-blue-500 text-slate-800 px-6 py-4 rounded-lg shadow-xl max-w-md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-1 bg-blue-100 rounded-full">
                  <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{toast}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-slate-800 mb-4">
            Private Ad Vault
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Your personal, encrypted ad interaction vault powered by Nostr keys. 
            All data stays on your device with client-side encryption.
          </p>
        </div>

        {!hasNostrExtension ? (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
            <div className="text-center">
              <div className="p-4 bg-amber-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">Nostr Extension Required</h2>
              <p className="text-slate-600 mb-6">
                You need a Nostr browser extension like nos2x or Alby to use the private vault.
              </p>
              <a
                href="https://github.com/fiatjaf/nos2x"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Install nos2x Extension
              </a>
            </div>
          </div>
        ) : !isUnlocked ? (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
            <div className="text-center">
              <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">Unlock Your Private Vault</h2>
              <p className="text-slate-600 mb-6">
                Connect your Nostr identity to access your encrypted ad interaction data.
              </p>
              <button
                onClick={unlockVault}
                disabled={isLoading}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Connecting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                    Unlock Vault
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-green-700 font-medium">Vault Unlocked</span>
              </div>
              <p className="text-slate-600">
                Connected as: <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded">{npub}</span>
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">Test Ads</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                <TestAd
                  adId="test-ad-001"
                  title="Bitcoin Hardware Wallet"
                  content="Secure your Bitcoin with the latest hardware wallet technology. Military-grade security for your digital assets."
                  onView={() => handleAdView('test-ad-001')}
                  onClick={() => handleAdClick('test-ad-001')}
                  isViewed={viewedAds.has('test-ad-001')}
                />
                <TestAd
                  adId="test-ad-002"
                  title="Lightning Network Course"
                  content="Learn how to build on the Lightning Network with this comprehensive course from industry experts."
                  onView={() => handleAdView('test-ad-002')}
                  onClick={() => handleAdClick('test-ad-002')}
                  isViewed={viewedAds.has('test-ad-002')}
                />
                <TestAd
                  adId="test-ad-003"
                  title="Nostr Client App"
                  content="Experience the decentralized social web with our new Nostr client. Connect with freedom."
                  onView={() => handleAdView('test-ad-003')}
                  onClick={() => handleAdClick('test-ad-003')}
                  isViewed={viewedAds.has('test-ad-003')}
                />
              </div>
            </div>

            <VaultDashboard
              interactions={interactions}
              stats={stats}
              onExport={handleExport}
              onClear={handleClear}
            />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}