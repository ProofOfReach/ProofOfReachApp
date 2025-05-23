import React from 'react';
import useSWR from 'swr';
import { Check, X, ExternalLink } from 'react-feather';
import Link from 'next/link';
import ClosableInfoBox from './ClosableInfoBox';

interface PendingAdApprovalsProps {
  publisherId: string;
  onApprove: (placementId: string) => Promise<any>;
  onReject: (placementId: string) => Promise<any>;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

const PendingAdApprovals: React.FC<PendingAdApprovalsProps> = ({ publisherId, onApprove, onReject }) => {
  const { data: pendingAds, error, mutate } = useSWR(
    `/api/publisher/pending-approvals`,
    fetcher
  );

  const isLoading = !pendingAds && !error;

  const handleApprove = async (placementId: string) => {
    try {
      await onApprove(placementId);
      // Refresh the data
      mutate();
    } catch (error) {
      console.log('Error approving ad:', error);
    }
  };

  const handleReject = async (placementId: string) => {
    if (!confirm('Are you sure you want to reject this ad?')) {
      return;
    }
    
    try {
      await onReject(placementId);
      // Refresh the data
      mutate();
    } catch (error) {
      console.log('Error rejecting ad:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-5/6 mb-4"></div>
            <div className="flex space-x-2">
              <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
              <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <ClosableInfoBox id="pending-approvals-error" title="Error Loading Pending Approvals" color="red">
        <p>
          There was an error loading your pending ad approvals. Please try again later.
        </p>
      </ClosableInfoBox>
    );
  }

  if (!pendingAds || pendingAds.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
        <Check className="h-12 w-12 text-green-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No pending approvals</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-2">
          You don't have any ads waiting for approval.
        </p>
        <p className="text-gray-500 dark:text-gray-400">
          When advertisers submit ads to your spaces, they'll appear here for your review.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ClosableInfoBox id="pending-approval-instructions" title="Approval Instructions" color="blue">
        <p>
          Review each ad carefully before approving. You can see the ad content, target URL, and other details.
          Approved ads will start displaying in your ad spaces immediately.
        </p>
      </ClosableInfoBox>
      
      {pendingAds.map((item: any) => {
        // Handle both flattened and nested structure
        const placementId = item.id || item.placement?.id;
        const title = item.ad?.title || 'Untitled Ad';
        const spaceName = item.space?.name || 'Unknown Space';
        const description = item.ad?.description || item.ad?.content || 'No content';
        const targetUrl = item.ad?.targetUrl;
        const advertiserPubkey = item.ad?.advertiser?.nostrPubkey || 'Unknown';
        const bidPerImpression = item.ad?.bidPerImpression || 0;
        const bidPerClick = item.ad?.bidPerClick || 0;
        
        return (
          <div 
            key={placementId || Math.random().toString()} 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
          >
            <div className="border-b border-gray-200 dark:border-gray-700 p-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {title}
                </h3>
                <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100">
                  Pending Approval
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                For space: <span className="font-medium text-gray-700 dark:text-gray-300">{spaceName}</span>
              </p>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ad Content</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target URL</h4>
                  <div className="flex items-center">
                    {targetUrl ? (
                      <a 
                        href={targetUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-purple-600 dark:text-purple-400 hover:underline flex items-center"
                      >
                        {targetUrl.length > 50 
                          ? `${targetUrl.substring(0, 50)}...` 
                          : targetUrl}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    ) : (
                      <span className="text-sm text-gray-500">No target URL provided</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Advertiser</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {advertiserPubkey}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bid per Impression</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {bidPerImpression} sats
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bid per Click</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {bidPerClick} sats
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => handleReject(placementId)}
                  className="px-4 py-2 rounded-md text-sm font-medium text-red-600 bg-red-100 hover:bg-red-200 dark:text-red-400 dark:bg-red-900/30 dark:hover:bg-red-900/50 transition-colors"
                >
                  <span className="flex items-center">
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </span>
                </button>
                <button
                  onClick={() => handleApprove(placementId)}
                  className="px-4 py-2 rounded-md text-sm font-medium text-green-600 bg-green-100 hover:bg-green-200 dark:text-green-400 dark:bg-green-900/30 dark:hover:bg-green-900/50 transition-colors"
                >
                  <span className="flex items-center">
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </span>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PendingAdApprovals;