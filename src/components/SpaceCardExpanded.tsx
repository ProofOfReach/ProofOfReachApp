import React, { useState } from 'react';
import { Monitor, Code, Trash2, Eye, MousePointer, ExternalLink, Edit, ChevronDown, ChevronRight, Check, X, Clock } from 'react-feather';
import Link from 'next/link';
import useSWR from 'swr';

interface SpaceCardExpandedProps {
  space: any;
  onDelete: (spaceId: string) => void;
  onShowCode: (space: any) => void;
  onApproveAd: (placementId: string) => Promise<any>;
  onRejectAd: (placementId: string) => Promise<any>;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

const SpaceCardExpanded: React.FC<SpaceCardExpandedProps> = ({ 
  space, 
  onDelete, 
  onShowCode,
  onApproveAd,
  onRejectAd
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'approved'

  // Fetch placements for this space
  const { data: placements, error, mutate } = useSWR(
    isExpanded ? `/api/spaces/${space.id}/placements` : null,
    fetcher
  );

  // Calculate total impressions and clicks across all placements
  const totalImpressions = space.placements?.reduce((sum: number, placement: any) => sum + placement.impressions, 0) || 0;
  const totalClicks = space.placements?.reduce((sum: number, placement: any) => sum + placement.clicks, 0) || 0;

  // Extract dimensions
  const [width, height] = space.dimensions.split('x');

  // Filter placements based on active tab
  const pendingPlacements = placements?.filter((p: any) => p.approvalStatus === 'PENDING') || [];
  const approvedPlacements = placements?.filter((p: any) => p.approvalStatus === 'APPROVED') || [];
  const rejectedPlacements = placements?.filter((p: any) => p.approvalStatus === 'REJECTED') || [];

  const handleApprove = async (placementId: string) => {
    try {
      await onApproveAd(placementId);
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
      await onRejectAd(placementId);
      // Refresh the data
      mutate();
    } catch (error) {
      console.log('Error rejecting ad:', error);
    }
  };

  const hasAds = pendingPlacements.length > 0 || approvedPlacements.length > 0 || rejectedPlacements.length > 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        {/* Header with expand/collapse button */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{space.name}</h3>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <ExternalLink className="h-3 w-3 mr-1" />
              <a href={space.website} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                {space.website}
              </a>
            </div>
          </div>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            {isExpanded ? (
              <ChevronDown className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Space Description */}
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">{space.description}</p>

        {/* Dimensions & Category */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Dimensions
            </div>
            <div className="font-medium text-gray-900 dark:text-white">{width}×{height}</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Category
            </div>
            <div className="font-medium text-gray-900 dark:text-white">{space.contentCategory}</div>
          </div>
        </div>

        {/* Pricing Info */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
              <Eye className="h-3 w-3 mr-1" />
              Min Per Impression
            </div>
            <div className="font-medium text-gray-900 dark:text-white">{space.minBidPerImpression} sats</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
              <MousePointer className="h-3 w-3 mr-1" />
              Min Per Click
            </div>
            <div className="font-medium text-gray-900 dark:text-white">{space.minBidPerClick} sats</div>
          </div>
        </div>

        {/* Performance Stats */}
        {space.placements && space.placements.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                <Eye className="h-3 w-3 mr-1" />
                Total Impressions
              </div>
              <div className="font-medium text-gray-900 dark:text-white">{totalImpressions}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                <MousePointer className="h-3 w-3 mr-1" />
                Total Clicks
              </div>
              <div className="font-medium text-gray-900 dark:text-white">{totalClicks}</div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex space-x-2">
          <button
            onClick={() => onShowCode(space)}
            className="flex-1 py-2 px-4 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded flex items-center justify-center"
          >
            <Code className="h-4 w-4 mr-2" />
            Get Code
          </button>
          
          <Link
            href={`/dashboard/spaces/edit/${space.id}`}
            className="py-2 px-4 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded flex items-center justify-center"
            aria-label="Edit"
            data-testid="edit-button"
          >
            <Edit className="h-4 w-4" />
          </Link>
          
          <button
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete ${space.name}?`)) {
                onDelete(space.id);
              }
            }}
            className="py-2 px-4 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 rounded flex items-center justify-center"
            aria-label="Delete"
            data-testid="delete-button"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Expanded Section with Ad Placements */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          {/* Ad Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 font-medium text-sm border-b-2 ${
                activeTab === 'pending'
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Pending 
                {pendingPlacements.length > 0 && (
                  <span className="ml-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 rounded-full text-xs px-2">
                    {pendingPlacements.length}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`px-4 py-2 font-medium text-sm border-b-2 ${
                activeTab === 'approved'
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Check className="h-4 w-4 mr-1" />
                Approved 
                {approvedPlacements.length > 0 && (
                  <span className="ml-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 rounded-full text-xs px-2">
                    {approvedPlacements.length}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('rejected')}
              className={`px-4 py-2 font-medium text-sm border-b-2 ${
                activeTab === 'rejected'
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center">
                <X className="h-4 w-4 mr-1" />
                Rejected 
                {rejectedPlacements.length > 0 && (
                  <span className="ml-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 rounded-full text-xs px-2">
                    {rejectedPlacements.length}
                  </span>
                )}
              </div>
            </button>
          </div>

          {/* Ad Content */}
          <div className="p-4">
            {/* Loading Indicator */}
            {!placements && !error && (
              <div className="space-y-4 py-2">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-full mb-2"></div>
                    <div className="flex space-x-2 mt-4">
                      <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-20"></div>
                      <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-700 dark:text-red-300">Failed to load ad placements. Please try again later.</p>
              </div>
            )}

            {/* No Ads Message */}
            {placements && !hasAds && (
              <div className="text-center py-8">
                <Monitor className="h-10 w-10 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-1">No ads for this space yet</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  When advertisers submit ads for this space, they'll appear here.
                </p>
              </div>
            )}

            {/* Pending Ads */}
            {activeTab === 'pending' && pendingPlacements.length > 0 && (
              <div className="space-y-4">
                {pendingPlacements.map((placement: any) => (
                  <div key={placement.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-md font-medium text-gray-800 dark:text-white">
                        {placement.ad?.title || 'Untitled Ad'}
                      </h4>
                      <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100">
                        Pending
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                      {placement.ad?.description || 'No description available.'}
                    </p>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleReject(placement.id)}
                        className="px-3 py-1 rounded-md text-xs font-medium text-red-600 bg-red-100 hover:bg-red-200 dark:text-red-400 dark:bg-red-900/30 dark:hover:bg-red-900/50 transition-colors"
                      >
                        <span className="flex items-center">
                          <X className="h-3 w-3 mr-1" />
                          Reject
                        </span>
                      </button>
                      <button
                        onClick={() => handleApprove(placement.id)}
                        className="px-3 py-1 rounded-md text-xs font-medium text-green-600 bg-green-100 hover:bg-green-200 dark:text-green-400 dark:bg-green-900/30 dark:hover:bg-green-900/50 transition-colors"
                      >
                        <span className="flex items-center">
                          <Check className="h-3 w-3 mr-1" />
                          Approve
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Approved Ads */}
            {activeTab === 'approved' && approvedPlacements.length > 0 && (
              <div className="space-y-4">
                {approvedPlacements.map((placement: any) => (
                  <div key={placement.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-md font-medium text-gray-800 dark:text-white">
                        {placement.ad?.title || 'Untitled Ad'}
                      </h4>
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                        Approved
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {placement.ad?.description || 'No description available.'}
                    </p>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="bg-gray-100 dark:bg-gray-600 p-2 rounded text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Impressions:</span> 
                        <span className="font-medium text-gray-800 dark:text-gray-100 ml-1">{placement.impressions || 0}</span>
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-600 p-2 rounded text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Clicks:</span> 
                        <span className="font-medium text-gray-800 dark:text-gray-100 ml-1">{placement.clicks || 0}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Rejected Ads */}
            {activeTab === 'rejected' && rejectedPlacements.length > 0 && (
              <div className="space-y-4">
                {rejectedPlacements.map((placement: any) => (
                  <div key={placement.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-md font-medium text-gray-800 dark:text-white">
                        {placement.ad?.title || 'Untitled Ad'}
                      </h4>
                      <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">
                        Rejected
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {placement.ad?.description || 'No description available.'}
                    </p>
                    {placement.rejectionReason && (
                      <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-600 rounded-md">
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          <span className="font-medium">Reason:</span> {placement.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpaceCardExpanded;