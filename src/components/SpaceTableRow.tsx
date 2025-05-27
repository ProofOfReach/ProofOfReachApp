import React, { useState, useEffect, useRef } from 'react';
import { Monitor, Code, Trash2, Edit, ChevronDown, ChevronRight, Check, X, Clock, ExternalLink } from 'react-feather';
import Link from 'next/link';
import useSWR from 'swr';
import { UserRole } from '@/types/role';

interface SpaceTableRowProps {
  space: any;
  onDelete: (spaceId: string) => void;
  onShowCode: (space: any) => void;
  onApproveAd: (placementId: string) => Promise<any>;
  onRejectAd: (placementId: string) => Promise<any>;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

const SpaceTableRow: React.FC<SpaceTableRowProps> = ({ 
  space, 
  onDelete, 
  onShowCode,
  onApproveAd,
  onRejectAd
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('approved'); // 'approved', 'pending', 'rejected'
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  
  // Listen for column resize events
  useEffect(() => {
    const handleColumnResize = (e: CustomEvent) => {
      setColumnWidths(prev => ({
        ...prev,
        [e.detail.column]: e.detail.width
      }));
    };
    
    document.addEventListener('column-resize', handleColumnResize as EventListener);
    return () => {
      document.removeEventListener('column-resize', handleColumnResize as EventListener);
    };
  }, []);

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
  const pendingCount = pendingPlacements.length;
  const approvedCount = approvedPlacements.length;
  const rejectedCount = rejectedPlacements.length;

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header Row */}
      <div className="grid grid-cols-12 divide-x divide-gray-200 dark:divide-gray-700 items-center bg-white dark:bg-gray-800 p-4">
        {/* Space Name & Toggle */}
        <div 
          className="col-span-3 flex items-center space-x-2" 
          style={{ width: columnWidths.name || 'auto' }}
          data-column="name"
        >
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 p-1"
          >
            {isExpanded ? (
              <ChevronDown className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </button>
          <div>
            <h3 className="text-md font-bold text-gray-900 dark:text-white">{space.name}</h3>
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <ExternalLink className="h-3 w-3 mr-1" />
              <a href={space.website} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                {space.website}
              </a>
            </div>
          </div>
        </div>
        
        {/* Dimensions */}
        <div 
          className="col-span-1 text-center px-2" 
          style={{ width: columnWidths.dimensions || 'auto' }}
          data-column="dimensions"
        >
          <div className="text-sm font-medium text-gray-900 dark:text-white">{width}×{height}</div>
        </div>
        
        {/* Category */}
        <div 
          className="col-span-2 text-center px-2" 
          style={{ width: columnWidths.contentCategory || 'auto' }}
          data-column="contentCategory"
        >
          <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{space.contentCategory}</div>
        </div>
        
        {/* CPM */}
        <div 
          className="col-span-1 text-center px-2" 
          style={{ width: columnWidths.minBidPerImpression || 'auto' }}
          data-column="minBidPerImpression"
        >
          <div className="text-sm font-medium text-gray-900 dark:text-white">{space.minBidPerImpression} sats</div>
        </div>
        
        {/* CPC */}
        <div 
          className="col-span-1 text-center px-2" 
          style={{ width: columnWidths.minBidPerClick || 'auto' }}
          data-column="minBidPerClick"
        >
          <div className="text-sm font-medium text-gray-900 dark:text-white">{space.minBidPerClick} sats</div>
        </div>
        
        {/* Stats */}
        <div 
          className="col-span-1 text-center px-2" 
          style={{ width: columnWidths.impressions || 'auto' }}
          data-column="impressions"
        >
          <div className="text-sm font-medium text-gray-900 dark:text-white">{totalImpressions}</div>
        </div>
        
        <div 
          className="col-span-1 text-center px-2" 
          style={{ width: columnWidths.clicks || 'auto' }}
          data-column="clicks"
        >
          <div className="text-sm font-medium text-gray-900 dark:text-white">{totalClicks}</div>
        </div>
        
        {/* Actions */}
        <div className="col-span-2 flex justify-end space-x-2 px-2">
          <button
            onClick={() => onShowCode(space)}
            className="py-1 px-2 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded flex items-center"
          >
            <Code className="h-3 w-3 mr-1" />
            Code
          </button>
          
          <Link
            href={`/dashboard/spaces/edit/${space.id}`}
            className="py-1 px-2 text-xs bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded flex items-center"
            aria-label="Edit"
          >
            <Edit className="h-3 w-3" />
          </Link>
          
          <button
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete ${space.name}?`)) {
                onDelete(space.id);
              }
            }}
            className="py-1 px-2 text-xs bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 rounded flex items-center"
            aria-label="Delete"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Expanded Section with Ad Placements */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          {/* Ad Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
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
                {approvedCount > 0 && (
                  <span className="ml-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 rounded-full text-xs px-2">
                    {approvedCount}
                  </span>
                )}
              </div>
            </button>
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
                {pendingCount > 0 && (
                  <span className="ml-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 rounded-full text-xs px-2">
                    {pendingCount}
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
                {rejectedCount > 0 && (
                  <span className="ml-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 rounded-full text-xs px-2">
                    {rejectedCount}
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
                  <div key={placement.id} className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
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
                  <div key={placement.id} className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
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
                  <div key={placement.id} className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
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

export default SpaceTableRow;