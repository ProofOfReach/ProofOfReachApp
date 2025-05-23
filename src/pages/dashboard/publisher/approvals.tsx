import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import useSWR from 'swr';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { defaultUseRole } from '../../../context/RoleContext';
import { CheckSquare, Filter, ChevronDown, ThumbsUp, ThumbsDown, Eye } from 'react-feather';
import { useAuth } from '../../../hooks/useAuth';

// Ad Approval Request type
interface ApprovalRequest {
  id: string;
  adId: string;
  adTitle: string;
  adImage: string;
  adDescription: string;
  advertiserName: string;
  advertiserPubkey: string;
  spaceId: string;
  spaceName: string;
  requestedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  budget: number;
  bidPerImpression: number;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const PublisherApprovalsPage = () => {
  const { role } = defaultUseRole();
  const router = useRouter();
  const { auth } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('pending');
  
  // Redirect if not in publisher role
  useEffect(() => {
    if (role !== 'publisher') {
      router.push(`/dashboard${role !== 'viewer' ? `/${role}` : ''}`);
    }
  }, [role, router]);

  // Mock approval requests data - this will be replaced with API data
  const [requestsData, setRequestsData] = useState<ApprovalRequest[]>([
    {
      id: 'req-1',
      adId: 'ad-1',
      adTitle: 'Lightning Network Wallet',
      adDescription: 'The best Lightning wallet for your Bitcoin needs',
      adImage: 'https://example.com/ad1.jpg',
      advertiserName: 'Bitcoin Solutions Inc.',
      advertiserPubkey: 'npub1aaa111...',
      spaceId: 'space-1',
      spaceName: 'Personal Blog',
      requestedAt: '2023-04-20T12:00:00Z',
      status: 'PENDING',
      budget: 25000,
      bidPerImpression: 10,
    },
    {
      id: 'req-2',
      adId: 'ad-2',
      adTitle: 'Hardware Wallet Sale',
      adDescription: 'Save 15% on all hardware wallets',
      adImage: 'https://example.com/ad2.jpg',
      advertiserName: 'Secure Bitcoin Storage',
      advertiserPubkey: 'npub1bbb222...',
      spaceId: 'space-2',
      spaceName: 'Nostr Feed Integration',
      requestedAt: '2023-04-18T14:30:00Z',
      status: 'APPROVED',
      budget: 35000,
      bidPerImpression: 15,
    },
    {
      id: 'req-3',
      adId: 'ad-3',
      adTitle: 'Bitcoin Conference 2023',
      adDescription: 'Join us for the biggest Bitcoin event of the year',
      adImage: 'https://example.com/ad3.jpg',
      advertiserName: 'BTC Events',
      advertiserPubkey: 'npub1ccc333...',
      spaceId: 'space-1',
      spaceName: 'Personal Blog',
      requestedAt: '2023-04-15T09:45:00Z',
      status: 'REJECTED',
      budget: 50000,
      bidPerImpression: 20,
    },
    {
      id: 'req-4',
      adId: 'ad-4',
      adTitle: 'Learn Nostr Development',
      adDescription: 'Online course for Nostr application development',
      adImage: 'https://example.com/ad4.jpg',
      advertiserName: 'Nostr Academy',
      advertiserPubkey: 'npub1ddd444...',
      spaceId: 'space-2',
      spaceName: 'Nostr Feed Integration',
      requestedAt: '2023-04-22T16:20:00Z',
      status: 'PENDING',
      budget: 45000,
      bidPerImpression: 18,
    },
  ]);

  // Filter approval requests based on active tab
  const filteredRequests = requestsData.filter(request => {
    if (activeTab === 'all') return true;
    return request.status.toLowerCase() === activeTab.toLowerCase();
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'PENDING':
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
  };

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  };

  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  // Format sats with correct units
  const formatSats = (sats: number) => {
    return `${formatNumber(sats)} sats`;
  };

  // Handle approval or rejection
  const handleApproval = async (requestId: UserRole, approved: boolean) => {
    try {
      // This would be an API call in a real application
      console.log(`${approved ? 'Approving' : 'Rejecting'} request ${requestId}`);
      
      // Update UI optimistically - simulate API response for demo
      // Replace the mock array with the updated version
      const updatedRequests = requestsData.map((req) => {
        if (req.id === requestId) {
          return {
            ...req,
            status: approved ? 'APPROVED' : 'REJECTED'
          };
        }
        return req;
      });
      
      // Update the state with the new data
      setRequestsData(updatedRequests);
    } catch (error) {
      console.error('Error updating request status:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CheckSquare className="h-8 w-8 text-green-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ad Approvals</h1>
        </div>
        <div className="flex space-x-2">
          <div className="relative inline-block">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
              <Filter className="w-4 h-4 mr-2" />
              Filter
              <ChevronDown className="w-4 h-4 ml-1" />
            </button>
            {/* Filter dropdown would go here */}
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'all' 
              ? 'text-green-600 dark:text-green-400 border-b-2 border-green-500' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('all')}
        >
          All
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'pending' 
              ? 'text-green-600 dark:text-green-400 border-b-2 border-green-500' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('pending')}
        >
          Pending
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'approved' 
              ? 'text-green-600 dark:text-green-400 border-b-2 border-green-500' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('approved')}
        >
          Approved
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'rejected' 
              ? 'text-green-600 dark:text-green-400 border-b-2 border-green-500' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('rejected')}
        >
          Rejected
        </button>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">No {activeTab !== 'all' ? activeTab : ''} approval requests found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredRequests.map((request) => (
            <div 
              key={request.id} 
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{request.adTitle}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      From {request.advertiserName} • For {request.spaceName}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(request.status)}`}>
                  {request.status}
                </span>
              </div>
              <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-1">
                  <div className="bg-gray-100 dark:bg-gray-900 rounded-lg h-40 flex items-center justify-center">
                    <div className="text-sm text-gray-500">Ad Preview Image</div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Budget</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{formatSats(request?.budget ?? 0)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Bid/Impression</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{request.bidPerImpression} sats</div>
                    </div>
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-sm text-gray-900 dark:text-white">
                    <div className="mb-4">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Description</div>
                      <p>{request.adDescription}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Advertiser</div>
                        <p className="truncate">{request.advertiserPubkey}</p>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">Requested</div>
                        <p>{formatDate(request.requestedAt)}</p>
                      </div>
                    </div>
                  </div>
                  
                  {request.status === 'PENDING' && (
                    <div className="mt-4 flex justify-end space-x-2">
                      <button 
                        onClick={() => handleApproval(request.id, false)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <ThumbsDown className="w-4 h-4 mr-2 text-red-500" />
                        Reject
                      </button>
                      <button 
                        onClick={() => handleApproval(request.id, true)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <ThumbsUp className="w-4 h-4 mr-2" />
                        Approve
                      </button>
                    </div>
                  )}
                  
                  {request.status !== 'PENDING' && (
                    <div className="mt-4 flex justify-end">
                      <Link 
                        href={`/dashboard/publisher/approvals/${request.id}`}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <Eye className="w-4 h-4 mr-2 text-blue-500" />
                        View Details
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Wrap the page with our layout
PublisherApprovalsPage.getLayout = (page: React.ReactElement) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default PublisherApprovalsPage;