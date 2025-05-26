import React, { useState, useEffect } from 'react';
import { Bell, Search, Filter, CheckCircle, XCircle, EyeOff } from 'react-feather';
import type { ReactElement } from 'react';
import type { NextPageWithLayout } from '../../_app';
import ImprovedDashboardLayout from '@/components/layout/ImprovedDashboardLayout';

/**
 * Admin Ad Approvals Page
 * 
 * This page allows administrators to review, approve, reject, or flag ads
 * before they go live on the platform. It includes a robust filtering system
 * and detailed ad information.
 */
const AdApprovalsPage: NextPageWithLayout = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [ads, setAds] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedAd, setSelectedAd] = useState<any>(null);

  // Fetch ads data
  useEffect(() => {
    const fetchAds = async () => {
      try {
        // In a real implementation, this would be an API call
        // Simulating API delay
        setTimeout(() => {
          // Sample data for demonstration
          const mockAds = [
            { 
              id: '1', 
              title: 'Bitcoin for Beginners Workshop',
              description: 'Learn the basics of Bitcoin in our comprehensive online workshop. Perfect for beginners!',
              imageUrl: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=500&h=300',
              targetUrl: 'https://example.com/bitcoin-workshop',
              bidPerImpression: 25,
              bidPerClick: 150,
              advertiser: {
                id: 'adv1',
                name: 'Bitcoin Academy',
                npub: 'npub1abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456'
              },
              status: 'pending',
              submittedAt: '2025-05-13T14:23:45Z',
              flags: []
            },
            { 
              id: '2', 
              title: 'Lightning Network Payments Solution',
              description: 'The fastest and most reliable Lightning Network implementation for your business. Accept Bitcoin payments today!',
              imageUrl: 'https://images.unsplash.com/photo-1605792657660-596af9009e82?w=500&h=300',
              targetUrl: 'https://example.com/lightning-solution',
              bidPerImpression: 30,
              bidPerClick: 200,
              advertiser: {
                id: 'adv2',
                name: 'Lightning Labs',
                npub: 'npub2abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456'
              },
              status: 'pending',
              submittedAt: '2025-05-14T09:12:33Z',
              flags: []
            },
            { 
              id: '3', 
              title: 'Secure Bitcoin Hardware Wallet',
              description: 'Keep your Bitcoin safe with our military-grade hardware wallet. 99.99% uptime and industry-leading security.',
              imageUrl: 'https://images.unsplash.com/photo-1526913621366-a4583840d736?w=500&h=300',
              targetUrl: 'https://example.com/hardware-wallet',
              bidPerImpression: 40,
              bidPerClick: 250,
              advertiser: {
                id: 'adv3',
                name: 'SecureCoin',
                npub: 'npub3abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456'
              },
              status: 'approved',
              submittedAt: '2025-05-12T16:45:22Z',
              approvedAt: '2025-05-13T10:22:15Z',
              flags: []
            },
            { 
              id: '4', 
              title: 'Bitcoin Tax Software - 50% Off',
              description: 'Prepare your Bitcoin taxes with ease. Our software handles all cryptocurrency transactions automatically.',
              imageUrl: 'https://images.unsplash.com/photo-1586486855514-8c633cc6fd29?w=500&h=300',
              targetUrl: 'https://example.com/crypto-tax',
              bidPerImpression: 15,
              bidPerClick: 100,
              advertiser: {
                id: 'adv4',
                name: 'CryptoTax Pro',
                npub: 'npub4abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456'
              },
              status: 'rejected',
              submittedAt: '2025-04-30T11:33:12Z',
              rejectedAt: '2025-05-01T09:15:44Z',
              rejectionReason: 'Misleading discount claims',
              flags: ['discount_verification']
            },
            { 
              id: '5', 
              title: 'Premium Bitcoin Market Analysis',
              description: 'Get ahead of the market with our professional Bitcoin trend analysis and forecasts.',
              imageUrl: 'https://images.unsplash.com/photo-1642790551116-18e150f248e5?w=500&h=300',
              targetUrl: 'https://example.com/btc-analysis',
              bidPerImpression: 35,
              bidPerClick: 220,
              advertiser: {
                id: 'adv5',
                name: 'Crypto Insights',
                npub: 'npub5abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456'
              },
              status: 'pending',
              submittedAt: '2025-05-14T08:15:51Z',
              flags: ['review_claims']
            },
          ];
          
          setAds(mockAds);
          setIsLoading(false);
          
          // Set the first ad as selected for preview
          if (mockAds.length > 0) {
            setSelectedAd(mockAds[0]);
          }
        }, 1000);
      } catch (error) {
        console.log('Error fetching ads:', error);
        setIsLoading(false);
      }
    };

    fetchAds();
  }, []);

  // Apply filters and search
  const filteredAds = ads.filter(ad => {
    const matchesSearch = 
      ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.advertiser.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || ad.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Define an interface for the Ad object
  interface Ad {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    targetUrl: string;
    bidPerImpression: number;
    bidPerClick: number;
    advertiser: {
      id: string;
      name: string;
      npub: string;
    };
    status: string;
    submittedAt: string;
    approvedAt?: string;
    rejectedAt?: string;
    rejectionReason?: string;
    flags: string[];
  }

  // Handle ad approval
  const handleApprove = (adId: string) => {
    setAds(prevAds => 
      prevAds.map(ad => 
        ad.id === adId 
          ? { ...ad, status: 'approved', approvedAt: new Date().toISOString() } 
          : ad
      )
    );
    
    if (selectedAd && selectedAd.id === adId) {
      setSelectedAd((prevAd: Ad) => ({ ...prevAd, status: 'approved', approvedAt: new Date().toISOString() }));
    }
  };

  // Handle ad rejection
  const handleReject = (adId: UserRole, reason: string = 'Content policy violation') => {
    setAds(prevAds => 
      prevAds.map(ad => 
        ad.id === adId 
          ? { ...ad, status: 'rejected', rejectedAt: new Date().toISOString(), rejectionReason: reason } 
          : ad
      )
    );
    
    if (selectedAd && selectedAd.id === adId) {
      setSelectedAd((prevAd: Ad) => ({ 
        ...prevAd, 
        status: 'rejected', 
        rejectedAt: new Date().toISOString(),
        rejectionReason: reason
      }));
    }
  };

  // Flag ad for further review
  const handleFlag = (adId: UserRole, flag: string) => {
    setAds(prevAds => 
      prevAds.map(ad => 
        ad.id === adId 
          ? { ...ad, flags: [...ad.flags, flag] } 
          : ad
      )
    );
    
    if (selectedAd && selectedAd.id === adId) {
      setSelectedAd((prevAd: Ad) => ({ 
        ...prevAd, 
        flags: [...(prevAd.flags || []), flag]
      }));
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Ad list and filters */}
        <div className="w-full lg:w-7/12 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Bell className="h-6 w-6 mr-2" />
              Ad Approvals
            </h1>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search ads..."
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-full md:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              
              <div className="relative">
                <select
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none w-full sm:w-auto"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <div className="overflow-hidden">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {filteredAds.length} {filteredAds.length === 1 ? 'ad' : 'ads'} found
              </p>
              
              <div className="space-y-4">
                {filteredAds.length > 0 ? (
                  filteredAds.map((ad) => (
                    <div 
                      key={ad.id}
                      className={`border border-gray-200 dark:border-gray-700 rounded-lg p-4 cursor-pointer transition
                        ${selectedAd && selectedAd.id === ad.id 
                          ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'}`}
                      onClick={() => setSelectedAd(ad)}
                    >
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div className="flex-grow">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{ad.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{ad.description}</p>
                          
                          <div className="flex flex-wrap items-center mt-2 gap-3">
                            <span 
                              className={`px-2 py-1 text-xs font-medium rounded-full 
                                ${ad.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' : ''}
                                ${ad.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : ''}
                                ${ad.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : ''}
                              `}
                            >
                              {ad.status.charAt(0).toUpperCase() + ad.status.slice(1)}
                            </span>
                            
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              From: {ad.advertiser.name}
                            </span>
                            
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Submitted: {formatDate(ad.submittedAt)}
                            </span>
                            
                            {ad.flags.length > 0 && (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                                {ad.flags.length} {ad.flags.length === 1 ? 'Flag' : 'Flags'}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-row sm:flex-col justify-end items-end gap-2 flex-shrink-0">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">
                              <CurrencyAmount amount={ad.bidPerImpression} /> <span className="text-xs">per impression</span>
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">
                              <CurrencyAmount amount={ad.bidPerClick} /> <span className="text-xs">per click</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-gray-600 dark:text-gray-400">No ads found matching your filters</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Ad preview and approval actions */}
        <div className="w-full lg:w-5/12 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          {selectedAd ? (
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Ad Preview</h2>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mb-6">
                {selectedAd.imageUrl && (
                  <div className="relative h-52 bg-gray-100 dark:bg-gray-700">
                    <img 
                      src={selectedAd.imageUrl} 
                      alt={selectedAd.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{selectedAd.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{selectedAd.description}</p>
                  
                  <div className="mt-3 text-sm text-blue-600 dark:text-blue-400 break-all">
                    {selectedAd.targetUrl}
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">Ad Details</h3>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <dt className="text-gray-500 dark:text-gray-400">Advertiser:</dt>
                  <dd className="text-gray-900 dark:text-white font-medium">{selectedAd.advertiser.name}</dd>
                  
                  <dt className="text-gray-500 dark:text-gray-400">Nostr ID:</dt>
                  <dd className="text-gray-900 dark:text-white font-mono text-xs overflow-hidden text-ellipsis">
                    {selectedAd.advertiser.npub.substring(0, 8)}...{selectedAd.advertiser.npub.substring(selectedAd.advertiser.npub.length - 4)}
                  </dd>
                  
                  <dt className="text-gray-500 dark:text-gray-400">Bid per impression:</dt>
                  <dd className="text-gray-900 dark:text-white font-medium">
                    <CurrencyAmount amount={selectedAd.bidPerImpression} />
                  </dd>
                  
                  <dt className="text-gray-500 dark:text-gray-400">Bid per click:</dt>
                  <dd className="text-gray-900 dark:text-white font-medium">
                    <CurrencyAmount amount={selectedAd.bidPerClick} />
                  </dd>
                  
                  <dt className="text-gray-500 dark:text-gray-400">Status:</dt>
                  <dd>
                    <span 
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${selectedAd.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' : ''}
                        ${selectedAd.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : ''}
                        ${selectedAd.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : ''}
                      `}
                    >
                      {selectedAd.status.charAt(0).toUpperCase() + selectedAd.status.slice(1)}
                    </span>
                  </dd>
                  
                  <dt className="text-gray-500 dark:text-gray-400">Submitted:</dt>
                  <dd className="text-gray-900 dark:text-white">{formatDate(selectedAd.submittedAt)}</dd>
                  
                  {selectedAd.approvedAt && (
                    <>
                      <dt className="text-gray-500 dark:text-gray-400">Approved:</dt>
                      <dd className="text-gray-900 dark:text-white">{formatDate(selectedAd.approvedAt)}</dd>
                    </>
                  )}
                  
                  {selectedAd.rejectedAt && (
                    <>
                      <dt className="text-gray-500 dark:text-gray-400">Rejected:</dt>
                      <dd className="text-gray-900 dark:text-white">{formatDate(selectedAd.rejectedAt)}</dd>
                      
                      <dt className="text-gray-500 dark:text-gray-400">Reason:</dt>
                      <dd className="text-gray-900 dark:text-white">{selectedAd.rejectionReason}</dd>
                    </>
                  )}
                  
                  {selectedAd.flags && selectedAd.flags.length > 0 && (
                    <>
                      <dt className="text-gray-500 dark:text-gray-400">Flags:</dt>
                      <dd className="text-gray-900 dark:text-white">
                        {selectedAd.flags.map((flag: UserRole, index: number) => (
                          <span 
                            key={index}
                            className="inline-block px-2 py-1 mr-1 mb-1 text-xs rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                          >
                            {flag.replace('_', ' ')}
                          </span>
                        ))}
                      </dd>
                    </>
                  )}
                </dl>
              </div>
              
              {selectedAd.status === 'pending' && (
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => handleApprove(selectedAd.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center justify-center hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Approve Ad
                    </button>
                    
                    <button 
                      onClick={() => handleReject(selectedAd.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center justify-center hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="h-5 w-5 mr-2" />
                      Reject Ad
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => handleFlag(selectedAd.id, 'needs_review')}
                    className="px-4 py-2 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 rounded-lg flex items-center justify-center hover:bg-orange-200 dark:hover:bg-orange-900/40 transition-colors"
                  >
                    <EyeOff className="h-5 w-5 mr-2" />
                    Flag for Further Review
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <Bell className="h-12 w-12 mb-4 opacity-40" />
              <p>Select an ad to preview and approve</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

AdApprovalsPage.getLayout = function getLayout(page: ReactElement) {
  return <ImprovedDashboardLayout>{page}</ImprovedDashboardLayout>;
};

export default AdApprovalsPage;