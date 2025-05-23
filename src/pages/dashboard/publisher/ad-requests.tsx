import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { RefreshCw, AlertCircle, Mail } from 'react-feather';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import AdApproval from '../../../components/AdApproval';

// Mock data for demonstration purposes
const mockPendingAds = [
  {
    id: 'ad123',
    title: 'Learn Bitcoin Today',
    description: 'Start your Bitcoin journey with our comprehensive online courses designed for beginners.',
    imageUrl: 'https://images.unsplash.com/photo-1516245834210-c4c142787335',
    finalDestinationUrl: 'https://bitcoin-academy.example.com/courses',
    advertiserNpub: 'npub1abc123def456',
    bidPerImpression: 15,
    bidPerClick: 0,
    status: 'pending',
    createdAt: new Date().toISOString()
  },
  {
    id: 'ad456',
    title: 'Lightning Network Wallet',
    description: 'The fastest and most secure Lightning wallet for your sats. Instant payments, low fees.',
    imageUrl: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d',
    finalDestinationUrl: 'https://suspicious-wallet.example/download',
    advertiserNpub: 'npub1xyz789uvw012',
    bidPerImpression: 0,
    bidPerClick: 50,
    status: 'pending',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

// Mock space data
const mockSpace = {
  id: 'space123',
  name: 'Bitcoin News Blog',
  description: 'Premium ad space on our Bitcoin news website',
  publisher: 'npub1publisher789'
};

// Mock domain blacklist
const mockDomainBlacklist = [
  'suspicious-wallet.example',
  'scam.com',
  'phishing.org'
];

const AdRequestsPage = () => {
  const router = useRouter();
  const [pendingAds, setPendingAds] = useState(mockPendingAds);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchPendingAds = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In production, this would be a real API call
      // const response = await fetch('/api/publisher/ad-requests');
      // const data = await response.json();
      // setPendingAds(data);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Using mock data
      setPendingAds(mockPendingAds);
    } catch (err) {
      console.logger.error('Error fetching pending ads:', err);
      setError('Failed to load pending ad requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingAds();
  }, []);

  const handleApproveAd = async (adId: string, spaceId: string) => {
    setError(null);
    setSuccessMessage(null);
    
    try {
      // In production, this would be a real API call
      // await fetch(`/api/publisher/ads/${adId}/approve`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ spaceId })
      // });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state - remove approved ad
      setPendingAds(prev => prev.filter(ad => ad.id !== adId));
      setSuccessMessage('Ad approved successfully!');
    } catch (err) {
      console.logger.error('Error approving ad:', err);
      setError('Failed to approve ad. Please try again.');
    }
  };

  const handleRejectAd = async (adId: string, spaceId: string, reason: string) => {
    setError(null);
    setSuccessMessage(null);
    
    try {
      // In production, this would be a real API call
      // await fetch(`/api/publisher/ads/${adId}/reject`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ spaceId, reason })
      // });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state - remove rejected ad
      setPendingAds(prev => prev.filter(ad => ad.id !== adId));
      setSuccessMessage('Ad rejected successfully');
    } catch (err) {
      console.logger.error('Error rejecting ad:', err);
      setError('Failed to reject ad. Please try again.');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Pending Ad Requests
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Review and approve ads submitted to your ad spaces
            </p>
          </div>
          
          <button
            onClick={fetchPendingAds}
            disabled={isLoading}
            className="btn-secondary"
          >
            <RefreshCw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                  Error
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-400">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800 dark:text-green-300">
                  Success
                </h3>
                <div className="mt-2 text-sm text-green-700 dark:text-green-400">
                  <p>{successMessage}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {pendingAds.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
              No pending ad requests
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              There are currently no ads waiting for your approval.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingAds.map(ad => (
              <AdApproval
                key={ad.id}
                ad={ad}
                space={mockSpace}
                onApprove={handleApproveAd}
                onReject={handleRejectAd}
                domainBlacklist={mockDomainBlacklist}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdRequestsPage;