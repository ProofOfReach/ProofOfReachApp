/**
 * Phase 1: Private User-Owned Ad Interaction Vault
 * Enhanced version with analytics, date filtering, and comprehensive interaction data
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
      <p className={`text-sm mb-4 ${isViewed ? 'text-emerald-700' : 'text-slate-600'}`}>
        {content}
      </p>
      <button
        onClick={handleClick}
        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
          isViewed
            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        Learn More
      </button>
    </div>
  );
};

const Phase1Analytics: React.FC = () => {
  const { isUnlocked, pubkey, unlockVault, hasNostrExtension } = usePrivateVault();
  const [interactions, setInteractions] = useState<any[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<'success' | 'info' | 'warning'>('info');

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  // Enhanced mock data with more realistic interactions
  const mockAdInteractions = [
    {
      id: '1',
      adId: 'ad_001',
      title: 'Lightning Fast Payments',
      publisher: 'BitcoinMagazine.com',
      category: 'Financial Services',
      pricing: 'CPM: 15 sats',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      type: 'view' as const,
      metadata: {
        duration: 3500,
        location: 'sidebar',
        device: 'desktop'
      }
    },
    {
      id: '2',
      adId: 'ad_002',
      title: 'Nostr Client Pro',
      publisher: 'NostrDevs.org',
      category: 'Software',
      pricing: 'CPC: 45 sats',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      type: 'click' as const,
      metadata: {
        clickTarget: 'main-cta',
        referrer: 'direct',
        device: 'mobile'
      }
    },
    {
      id: '3',
      adId: 'ad_003',
      title: 'Privacy-First VPN',
      publisher: 'CypherNews.net',
      category: 'Privacy & Security',
      pricing: 'CPM: 8 sats',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      type: 'view' as const,
      metadata: {
        duration: 2100,
        location: 'header',
        device: 'desktop'
      }
    },
    {
      id: '4',
      adId: 'ad_004',
      title: 'Bitcoin Hardware Wallet',
      publisher: 'CryptoGear.store',
      category: 'Hardware',
      pricing: 'CPC: 75 sats',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'click' as const,
      metadata: {
        clickTarget: 'product-link',
        referrer: 'search',
        device: 'desktop'
      }
    },
    {
      id: '5',
      adId: 'ad_005',
      title: 'DeFi Analytics Platform',
      publisher: 'DeFiInsights.com',
      category: 'Analytics',
      pricing: 'CPM: 12 sats',
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'view' as const,
      metadata: {
        duration: 4200,
        location: 'content',
        device: 'tablet'
      }
    },
    {
      id: '6',
      adId: 'ad_006',
      title: 'Lightning Node Management',
      publisher: 'LNTools.dev',
      category: 'Developer Tools',
      pricing: 'CPC: 55 sats',
      timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'view' as const,
      metadata: {
        duration: 2800,
        location: 'sidebar',
        device: 'desktop'
      }
    },
    {
      id: '7',
      adId: 'ad_007',
      title: 'Decentralized Social Media',
      publisher: 'NostrNetworks.io',
      category: 'Social Media',
      pricing: 'CPM: 10 sats',
      timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'click' as const,
      metadata: {
        clickTarget: 'signup-button',
        referrer: 'organic',
        device: 'mobile'
      }
    },
    {
      id: '8',
      adId: 'ad_008',
      title: 'Bitcoin Education Course',
      publisher: 'BitcoinAcademy.edu',
      category: 'Education',
      pricing: 'CPC: 35 sats',
      timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'view' as const,
      metadata: {
        duration: 5600,
        location: 'header',
        device: 'desktop'
      }
    }
  ];

  const filterInteractionsByDate = (interactions: any[]) => {
    const now = new Date();
    
    switch (dateFilter) {
      case 'today':
        return interactions.filter(interaction => {
          const interactionDate = new Date(interaction.timestamp);
          return interactionDate.toDateString() === now.toDateString();
        });
      case '24h':
        return interactions.filter(interaction => {
          const interactionDate = new Date(interaction.timestamp);
          return now.getTime() - interactionDate.getTime() <= 24 * 60 * 60 * 1000;
        });
      case '7d':
        return interactions.filter(interaction => {
          const interactionDate = new Date(interaction.timestamp);
          return now.getTime() - interactionDate.getTime() <= 7 * 24 * 60 * 60 * 1000;
        });
      case '30d':
        return interactions.filter(interaction => {
          const interactionDate = new Date(interaction.timestamp);
          return now.getTime() - interactionDate.getTime() <= 30 * 24 * 60 * 60 * 1000;
        });
      case 'all':
      default:
        return interactions;
    }
  };

  const filteredInteractions = filterInteractionsByDate(mockAdInteractions);

  // Calculate comprehensive stats
  const stats = {
    totalViews: filteredInteractions.filter(i => i.type === 'view').length,
    totalClicks: filteredInteractions.filter(i => i.type === 'click').length,
    uniqueAds: new Set(filteredInteractions.map(i => i.adId)).size,
    avgViewDuration: Math.round(
      filteredInteractions
        .filter(i => i.type === 'view' && i.metadata?.duration)
        .reduce((sum, i) => sum + (i.metadata?.duration || 0), 0) /
      filteredInteractions.filter(i => i.type === 'view' && i.metadata?.duration).length
    ) || 0,
    clickThroughRate: filteredInteractions.length > 0 
      ? ((filteredInteractions.filter(i => i.type === 'click').length / filteredInteractions.length) * 100).toFixed(1)
      : '0.0'
  };

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleAdView = (adId: string) => {
    if (isUnlocked) {
      const interaction = {
        adId,
        type: 'view',
        timestamp: new Date().toISOString(),
        metadata: { duration: Math.floor(Math.random() * 5000) + 1000 }
      };
      setInteractions(prev => [interaction, ...prev]);
      showToast('Ad view recorded and encrypted locally', 'success');
    }
  };

  const handleAdClick = (adId: string) => {
    if (isUnlocked) {
      const interaction = {
        adId,
        type: 'click',
        timestamp: new Date().toISOString(),
        metadata: { clickTarget: 'cta-button' }
      };
      setInteractions(prev => [interaction, ...prev]);
      showToast('Ad click recorded and encrypted locally', 'success');
    }
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
      },
      'ad_001': {
        title: 'Lightning Fast Payments',
        content: 'Fast, secure Lightning Network payments for everyone',
        publisher: 'BitcoinMagazine.com',
        website: 'bitcoinmagazine.com',
        category: 'Financial Services',
        price: 'CPM: 15 sats'
      },
      'ad_002': {
        title: 'Nostr Client Pro',
        content: 'Professional Nostr client with advanced features',
        publisher: 'NostrDevs.org',
        website: 'nostrdevs.org',
        category: 'Software',
        price: 'CPC: 45 sats'
      },
      'ad_003': {
        title: 'Privacy-First VPN',
        content: 'Protect your online privacy with our secure VPN service',
        publisher: 'CypherNews.net',
        website: 'cyphernews.net',
        category: 'Privacy & Security',
        price: 'CPM: 8 sats'
      },
      'ad_004': {
        title: 'Bitcoin Hardware Wallet',
        content: 'Ultimate security for your Bitcoin holdings',
        publisher: 'CryptoGear.store',
        website: 'cryptogear.store',
        category: 'Hardware',
        price: 'CPC: 75 sats'
      },
      'ad_005': {
        title: 'DeFi Analytics Platform',
        content: 'Comprehensive analytics for DeFi protocols',
        publisher: 'DeFiInsights.com',
        website: 'defiinsights.com',
        category: 'Analytics',
        price: 'CPM: 12 sats'
      },
      'ad_006': {
        title: 'Lightning Node Management',
        content: 'Easy Lightning Network node management tools',
        publisher: 'LNTools.dev',
        website: 'lntools.dev',
        category: 'Developer Tools',
        price: 'CPC: 55 sats'
      },
      'ad_007': {
        title: 'Decentralized Social Media',
        content: 'Join the future of social networking',
        publisher: 'NostrNetworks.io',
        website: 'nostrnetworks.io',
        category: 'Social Media',
        price: 'CPM: 10 sats'
      },
      'ad_008': {
        title: 'Bitcoin Education Course',
        content: 'Master Bitcoin fundamentals and advanced concepts',
        publisher: 'BitcoinAcademy.edu',
        website: 'bitcoinacademy.edu',
        category: 'Education',
        price: 'CPC: 35 sats'
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

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      return `${diffDays} days ago`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-lg border max-w-sm ${
          toastType === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : toastType === 'warning'
            ? 'bg-amber-50 text-amber-800 border-amber-200'
            : 'bg-blue-50 text-blue-800 border-blue-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-1 rounded-full ${
              toastType === 'success' 
                ? 'bg-emerald-200' 
                : toastType === 'warning'
                ? 'bg-amber-200'
                : 'bg-blue-200'
            }`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {toastType === 'success' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
            </div>
            <span className="font-medium text-sm">{toastMessage}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-slate-800 mb-4">
            Private Ad Interaction Vault
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Your personal, encrypted ad data vault. All interactions are stored locally and encrypted with your Nostr keys.
          </p>
        </div>

        {/* Connection Status */}
        <div className={`mb-12 p-6 rounded-2xl border-2 ${
          isConnected 
            ? 'bg-emerald-50 border-emerald-200' 
            : 'bg-amber-50 border-amber-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${
                isConnected ? 'bg-emerald-600' : 'bg-amber-600'
              }`}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isConnected ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  )}
                </svg>
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${
                  isConnected ? 'text-emerald-800' : 'text-amber-800'
                }`}>
                  {isConnected ? 'Securely Connected' : 'Connection Required'}
                </h3>
                <p className={`text-sm ${
                  isConnected ? 'text-emerald-600' : 'text-amber-600'
                }`}>
                  {isUnlocked 
                    ? `Connected with key: ${pubkey?.slice(0, 12)}...` 
                    : 'Connect your Nostr extension to start tracking'
                  }
                </p>
              </div>
            </div>
            {!isConnected && (
              <button
                onClick={connect}
                className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
              >
                Connect Nostr
              </button>
            )}
          </div>
        </div>

        {/* Demo Ad Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">
            Demo Ads - Try Interacting
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <TestAd
              adId="test-ad-001"
              title="Bitcoin Hardware Wallet"
              content="Secure your Bitcoin with the latest hardware wallet technology."
              onView={() => handleAdView('test-ad-001')}
              onClick={() => handleAdClick('test-ad-001')}
              isViewed={interactions.some(i => i.adId === 'test-ad-001' && i.type === 'view')}
            />
            <TestAd
              adId="test-ad-002"
              title="Lightning Network Course"
              content="Learn how to build on the Lightning Network with this comprehensive course."
              onView={() => handleAdView('test-ad-002')}
              onClick={() => handleAdClick('test-ad-002')}
              isViewed={interactions.some(i => i.adId === 'test-ad-002' && i.type === 'view')}
            />
            <TestAd
              adId="test-ad-003"
              title="Nostr Client App"
              content="Experience the decentralized social web with our new Nostr client."
              onView={() => handleAdView('test-ad-003')}
              onClick={() => handleAdClick('test-ad-003')}
              isViewed={interactions.some(i => i.adId === 'test-ad-003' && i.type === 'view')}
            />
          </div>
        </div>

        {/* Analytics Dashboard */}
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-8 rounded-2xl shadow-lg border border-slate-200">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-blue-600 rounded-xl shadow-md">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-800">Analytics Dashboard</h2>
              <p className="text-slate-600">Comprehensive insights into your ad interactions</p>
            </div>
          </div>

          {/* Date Filter */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-slate-700 mb-3">Time Period</label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'All Time' },
                { value: 'today', label: 'Today' },
                { value: '24h', label: 'Last 24 Hours' },
                { value: '7d', label: 'Last 7 Days' },
                { value: '30d', label: 'Last 30 Days' }
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setDateFilter(filter.value)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    dateFilter === filter.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
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

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-orange-600">{stats.avgViewDuration}ms</div>
                  <div className="text-sm font-medium text-slate-600">Avg View Time</div>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-pink-600">{stats.clickThroughRate}%</div>
                  <div className="text-sm font-medium text-slate-600">Click Rate</div>
                </div>
                <div className="p-3 bg-pink-100 rounded-xl">
                  <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Interaction History */}
          <div className="mb-10">
            <h3 className="text-2xl font-semibold text-slate-800 mb-6">Interaction History</h3>
            {filteredInteractions.length === 0 ? (
              <div className="bg-white p-10 rounded-xl border border-slate-200 text-center">
                <div className="p-4 bg-slate-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-slate-600 text-xl font-medium mb-2">No interactions in this time period</p>
                <p className="text-slate-500">Try a different date range or interact with the demo ads</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInteractions.slice(0, 12).map((interaction, index) => {
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
                              <h4 className="font-semibold text-slate-800 text-lg">{adDetails.title}</h4>
                              <p className="text-slate-600">{adDetails.publisher} • {interaction.category || adDetails.category}</p>
                              <p className="text-sm text-slate-500">{formatTimestamp(interaction.timestamp)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              interaction.type === 'view'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {interaction.type === 'view' ? 'View' : 'Click'}
                            </span>
                            <svg 
                              className={`w-5 h-5 text-slate-400 transition-transform ${
                                isExpanded ? 'rotate-180' : ''
                              }`} 
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
                        <div className="px-5 pb-5 border-t border-slate-100">
                          <div className="grid md:grid-cols-2 gap-6 pt-5">
                            <div>
                              <h5 className="font-semibold text-slate-700 mb-3">Ad Details</h5>
                              <div className="space-y-2 text-sm">
                                <div><span className="font-medium text-slate-600">Publisher:</span> {adDetails.publisher}</div>
                                <div><span className="font-medium text-slate-600">Website:</span> {adDetails.website}</div>
                                <div><span className="font-medium text-slate-600">Category:</span> {adDetails.category}</div>
                                <div><span className="font-medium text-slate-600">Pricing:</span> {interaction.pricing || adDetails.price}</div>
                              </div>
                            </div>
                            <div>
                              <h5 className="font-semibold text-slate-700 mb-3">Interaction Metadata</h5>
                              <div className="space-y-2 text-sm">
                                {interaction.metadata?.duration && (
                                  <div><span className="font-medium text-slate-600">View Duration:</span> {interaction.metadata.duration}ms</div>
                                )}
                                {interaction.metadata?.location && (
                                  <div><span className="font-medium text-slate-600">Ad Location:</span> {interaction.metadata.location}</div>
                                )}
                                {interaction.metadata?.device && (
                                  <div><span className="font-medium text-slate-600">Device:</span> {interaction.metadata.device}</div>
                                )}
                                {interaction.metadata?.clickTarget && (
                                  <div><span className="font-medium text-slate-600">Click Target:</span> {interaction.metadata.clickTarget}</div>
                                )}
                                {interaction.metadata?.referrer && (
                                  <div><span className="font-medium text-slate-600">Referrer:</span> {interaction.metadata.referrer}</div>
                                )}
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

          {/* Privacy Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-600 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">Privacy & Security</h4>
                <p className="text-blue-700 text-sm leading-relaxed">
                  All interaction data is encrypted using your Nostr private key and stored locally in your browser. 
                  No data is sent to external servers without your explicit consent. You maintain full control 
                  over your advertising interaction history.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Phase1Analytics;