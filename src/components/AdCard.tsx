import React, { useState } from 'react';
import { Target, Check, X, Pause, RefreshCw, Clock, Eye, MousePointer, Edit, Trash2, ChevronDown, ChevronUp, ExternalLink, Calendar } from 'react-feather';
import SatoshiIcon from './SatoshiIcon';

interface AdCardProps {
  ad: any;
  onStatusChange?: (adId: UserRole, newStatus: string) => void;
  onDelete?: (adId: string) => void;
  onEdit?: (ad: any) => void;
  showControls?: boolean;
}

const AdCard: React.FC<AdCardProps> = ({ ad, onStatusChange, onDelete, onEdit, showControls = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Calculate total impressions and clicks across all placements
  const totalImpressions = ad.placements?.reduce((sum: number, placement: any) => sum + placement.impressions, 0) || 0;
  const totalClicks = ad.placements?.reduce((sum: number, placement: any) => sum + placement.clicks, 0) || 0;

  // Helper function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'PAUSED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Helper function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Check className="h-4 w-4 mr-1" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 mr-1" />;
      case 'PAUSED':
        return <Pause className="h-4 w-4 mr-1" />;
      case 'COMPLETED':
        return <RefreshCw className="h-4 w-4 mr-1" />;
      case 'REJECTED':
        return <X className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };
  
  // Helper to format URLs with parameters
  const formattedUrl = `${ad.finalDestinationUrl || ad.targetUrl}${ad.urlParameters ? '?' + ad.urlParameters : ''}`;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Main row - always visible */}
      <div className="p-3 flex items-center gap-4">
        {/* Row toggle and title section */}
        <div 
          className="flex-grow flex items-center cursor-pointer" 
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="mr-2">
            {isExpanded ? 
              <ChevronUp className="h-4 w-4 text-gray-400" /> : 
              <ChevronDown className="h-4 w-4 text-gray-400" />
            }
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white truncate max-w-xs">{ad.title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">{ad.description}</p>
          </div>
        </div>
        
        {/* Status badge */}
        <div className="flex-shrink-0 mx-2">
          <span 
            data-testid="status-badge" 
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ad.status)}`}
          >
            {getStatusIcon(ad.status)}
            {ad.status.charAt(0) + ad.status.slice(1).toLowerCase()}
          </span>
        </div>
        
        {/* Action buttons */}
        {showControls && (
          <div className="flex-shrink-0 flex space-x-2">
            {ad.status === 'PENDING' && onEdit && (
              <button
                data-testid="edit-button"
                onClick={() => onEdit(ad)}
                className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                title="Edit Ad"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
            
            {ad.status === 'PENDING' && onDelete && (
              <button
                data-testid="delete-button"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this pending ad?')) {
                    onDelete(ad.id);
                  }
                }}
                className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                title="Delete Ad"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            
            {ad.status === 'ACTIVE' && onStatusChange && (
              <button
                data-testid="pause-button"
                onClick={() => onStatusChange(ad.id, 'PAUSED')}
                className="p-2 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300"
                title="Pause Ad"
              >
                <Pause className="h-4 w-4" />
              </button>
            )}
            
            {ad.status === 'PAUSED' && onStatusChange && (
              <button
                data-testid="resume-button"
                onClick={() => onStatusChange(ad.id, 'ACTIVE')}
                className="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                title="Resume Ad"
              >
                <Check className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 border-t border-gray-100 dark:border-gray-700">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Left column */}
            <div className="space-y-4">
              {/* Ad Image - Show at 25% size for pending ads */}
              {ad.imageUrl && (
                <div>
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Ad Image</h4>
                  <img 
                    src={ad.imageUrl} 
                    alt={ad.title} 
                    className={`rounded border border-gray-200 dark:border-gray-700 ${ad.status === 'PENDING' ? 'w-1/3' : 'w-1/2'}`}
                  />
                  {ad.status === 'PENDING' && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
                      Preview at reduced size
                    </p>
                  )}
                </div>
              )}
              
              {/* Final Destination URL */}
              <div>
                <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  <div className="flex items-center">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Destination URL
                  </div>
                </h4>
                <div className="text-sm text-gray-700 dark:text-gray-300 break-all">
                  <a 
                    href={formattedUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    {ad.finalDestinationUrl || ad.targetUrl}
                  </a>
                </div>
                {ad.urlParameters && (
                  <div className="mt-1">
                    <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">URL Parameters</h4>
                    <div className="text-xs text-gray-700 dark:text-gray-300 break-all">
                      {ad.urlParameters}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Performance Stats */}
              {ad.placements && ad.placements.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <Eye className="h-3 w-3 mr-1" />
                      Impressions
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white">{totalImpressions}</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <MousePointer className="h-3 w-3 mr-1" />
                      Clicks
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white">{totalClicks}</div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Right column */}
            <div className="space-y-4">
              {/* Budget Info */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <SatoshiIcon size={12} className="mr-1" />
                    Total Budget
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white">{0 // TODO: implement budget} sats</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    Daily Budget
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white">{ad.dailyBudget} sats</div>
                </div>
              </div>
              
              {/* Bid Info */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <Eye className="h-3 w-3 mr-1" />
                    Per Impression
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white">{ad.bidPerImpression} sats</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <MousePointer className="h-3 w-3 mr-1" />
                    Per Click
                  </div>
                  <div className="font-medium text-gray-900 dark:text-white">{ad.bidPerClick} sats</div>
                </div>
              </div>
              
              {/* Targeting */}
              {(ad.targetLocation || ad.targetInterests || ad.targetAge || (ad.targetedAdSpaces && ad.targetedAdSpaces.length > 0)) && (
                <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                    <Target className="h-3 w-3 mr-1" />
                    Targeting
                  </div>
                  
                  <div className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
                    {ad.targetLocation && (
                      <div>
                        <span className="font-medium">Location:</span> {ad.targetLocation}
                      </div>
                    )}
                    
                    {ad.targetInterests && (
                      <div>
                        <span className="font-medium">Interests:</span> {ad.targetInterests}
                      </div>
                    )}
                    
                    {ad.targetAge && (
                      <div>
                        <span className="font-medium">Age Range:</span> {ad.targetAge}
                      </div>
                    )}
                    
                    {ad.targetedAdSpaces && ad.targetedAdSpaces.length > 0 && (
                      <div>
                        <span className="font-medium">Ad Spaces:</span> {ad.targetedAdSpaces.length} selected
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Pending message */}
              {ad.status === 'PENDING' && (
                <div 
                  data-testid="pending-message"
                  className="text-sm text-gray-500 dark:text-gray-400 p-2 border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 rounded"
                >
                  Your ad is pending activation
                </div>
              )}
            </div>
          </div>
          
          {/* Full-width controls for mobile view */}
          {showControls && onStatusChange && (
            <div className="mt-4 flex gap-2 md:hidden">
              {ad.status === 'ACTIVE' && (
                <button
                  data-testid="pause-button-mobile"
                  onClick={() => onStatusChange(ad.id, 'PAUSED')}
                  className="flex-1 py-2 px-3 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 rounded flex items-center justify-center"
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Pause Ad
                </button>
              )}

              {ad.status === 'PAUSED' && (
                <button
                  data-testid="resume-button-mobile"
                  onClick={() => onStatusChange(ad.id, 'ACTIVE')}
                  className="flex-1 py-2 px-3 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded flex items-center justify-center"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Resume Ad
                </button>
              )}

              {ad.status === 'PENDING' && (
                <>
                  {onEdit && (
                    <button
                      data-testid="edit-button-mobile"
                      onClick={() => onEdit(ad)}
                      className="flex-1 py-2 px-3 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded flex items-center justify-center"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Ad
                    </button>
                  )}
                  
                  {onDelete && (
                    <button
                      data-testid="delete-button-mobile"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this pending ad?')) {
                          onDelete(ad.id);
                        }
                      }}
                      className="flex-1 py-2 px-3 bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 rounded flex items-center justify-center"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Ad
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdCard;
