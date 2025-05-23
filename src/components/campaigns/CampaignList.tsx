import React, { useState, useEffect } from 'react';
import { Campaign, Ad, CampaignStatus } from '@prisma/client';
import { 
  ChevronDown, 
  ChevronRight, 
  ChevronUp, 
  Edit, 
  Trash2, 
  Layers, 
  PlusCircle,
  AlertCircle,
  Clock,
  Play,
  Pause,
  Square
} from 'react-feather';
import Link from 'next/link';
import "./components/ui/button";

// Extended Campaign type with ads array
export interface CampaignWithAds extends Campaign {
  ads: Ad[];
}

interface CampaignListProps {
  campaigns: CampaignWithAds[];
  onStatusChange?: (campaignId: string, newStatus: CampaignStatus) => Promise<void>;
  onDelete?: (campaignId: string) => Promise<void>;
}

const CampaignList: React.FC<CampaignListProps> = ({ 
  campaigns,
  onStatusChange,
  onDelete
}) => {
  const [expandedCampaignIds, setExpandedCampaignIds] = useState<Set<string>>(new Set());
  const [changingStatusId, setChangingStatusId] = useState<string | null>(null);

  const toggleCampaign = (campaignId: string) => {
    setExpandedCampaignIds(prevState => {
      const newState = new Set(prevState);
      if (newState.has(campaignId)) {
        newState.delete(campaignId);
      } else {
        newState.add(campaignId);
      }
      return newState;
    });
  };

  const handleStatusChange = async (campaignId: string, newStatus: CampaignStatus) => {
    if (!onStatusChange) return;
    
    setChangingStatusId(campaignId);
    try {
      await onStatusChange(campaignId, newStatus);
    } finally {
      setChangingStatusId(null);
    }
  };

  const handleDelete = async (campaignId: string) => {
    if (!onDelete) return;
    
    if (window.confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      await onDelete(campaignId);
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatBudget = (sats: number) => {
    return new Intl.NumberFormat('en-US').format(sats) + ' sats';
  };

  const getStatusBadgeClass = (status: CampaignStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'PAUSED':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'ENDED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'DRAFT':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'REVIEW':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: CampaignStatus) => {
    switch (status) {
      case 'ACTIVE':
        return <Play className="h-3 w-3 mr-1" />;
      case 'PAUSED':
        return <Pause className="h-3 w-3 mr-1" />;
      case 'ENDED':
        return <Square className="h-3 w-3 mr-1" />;
      case 'SCHEDULED':
        return <Clock className="h-3 w-3 mr-1" />;
      case 'DRAFT':
        return <Edit className="h-3 w-3 mr-1" />;
      case 'REVIEW':
        return <AlertCircle className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {campaigns.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400 mb-4">You don't have any campaigns yet.</p>
          <Button asChild>
            <Link href="/dashboard/advertiser/campaigns/create">
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Your First Campaign
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Your Campaigns
            </h2>
            <Button asChild size="sm">
              <Link href="/dashboard/advertiser/campaigns/create">
                <PlusCircle className="h-4 w-4 mr-1" />
                New Campaign
              </Link>
            </Button>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                <div 
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-900/30 ${
                    expandedCampaignIds.has(campaign.id) ? 'bg-gray-50 dark:bg-gray-900/20' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => toggleCampaign(campaign.id)}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                      >
                        {expandedCampaignIds.has(campaign.id) ? 
                          <ChevronDown className="h-5 w-5" /> : 
                          <ChevronRight className="h-5 w-5" />
                        }
                      </button>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {campaign.name}
                        </h3>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(campaign.startDate)} 
                          {campaign.endDate && ` - ${formatDate(campaign.endDate)}`}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatBudget(campaign.budget)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {campaign.ads.length} ads
                        </div>
                      </div>
                      
                      <div>
                        {changingStatusId === campaign.id ? (
                          <div className="animate-pulse flex h-6 w-20 items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full">
                            <div className="h-2 w-2 bg-gray-400 dark:bg-gray-500 rounded-full mr-1"></div>
                            <div className="h-2 w-10 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                          </div>
                        ) : (
                          <div className="relative group">
                            <div className={`px-3 py-1 rounded-full inline-flex items-center text-xs font-medium ${getStatusBadgeClass(campaign.status)}`}>
                              {getStatusIcon(campaign.status)}
                              {campaign.status}
                            </div>
                            
                            {onStatusChange && (
                              <div className="absolute z-10 right-0 mt-1 w-36 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden transform scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-150 origin-top-right">
                                <div className="py-1">
                                  {campaign.status !== 'ACTIVE' && (
                                    <Button 
                                      onClick={() => handleStatusChange(campaign.id, 'ACTIVE')} 
                                      variant="ghost" 
                                      size="sm"
                                      className="w-full px-4 py-2 text-xs text-left justify-start font-normal h-auto"
                                    >
                                      <Play className="h-3 w-3 mr-1.5" />
                                      Set Active
                                    </Button>
                                  )}
                                  
                                  {campaign.status !== 'PAUSED' && (
                                    <Button 
                                      onClick={() => handleStatusChange(campaign.id, 'PAUSED')} 
                                      variant="ghost" 
                                      size="sm"
                                      className="w-full px-4 py-2 text-xs text-left justify-start font-normal h-auto"
                                    >
                                      <Pause className="h-3 w-3 mr-1.5" />
                                      Set Paused
                                    </Button>
                                  )}
                                  
                                  {campaign.status !== 'ENDED' && (
                                    <Button 
                                      onClick={() => handleStatusChange(campaign.id, 'ENDED')} 
                                      variant="ghost" 
                                      size="sm"
                                      className="w-full px-4 py-2 text-xs text-left justify-start font-normal h-auto"
                                    >
                                      <Square className="h-3 w-3 mr-1.5" />
                                      Set Ended
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-1">
                        <Button asChild variant="ghost" size="icon" className="h-7 w-7">
                          <Link 
                            href={`/dashboard/advertiser/campaigns/${campaign.id}/edit`}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        
                        {onDelete && (
                          <Button
                            onClick={() => handleDelete(campaign.id)}
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Expanded campaign details with ads */}
                {expandedCampaignIds.has(campaign.id) && (
                  <div className="px-4 pb-4 pt-1 bg-gray-50 dark:bg-gray-900/20">
                    <div className="pl-8 space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                          <Layers className="h-4 w-4 mr-1.5" />
                          Campaign Ads ({campaign.ads.length})
                        </h4>
                        
                        <Button asChild variant="secondary" size="sm" className="text-xs">
                          <Link href={`/dashboard/advertiser/campaigns/${campaign.id}/ads/create`}>
                            <PlusCircle className="h-3 w-3 mr-1" />
                            Add Ad
                          </Link>
                        </Button>
                      </div>
                      
                      {campaign.ads.length === 0 ? (
                        <div className="text-center py-6 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                          <p className="text-gray-500 dark:text-gray-400 text-sm">
                            No ads in this campaign yet.
                          </p>
                          <Link 
                            href={`/dashboard/advertiser/campaigns/${campaign.id}/ads/create`}
                            className="mt-2 text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 text-sm inline-block"
                          >
                            Create your first ad
                          </Link>
                        </div>
                      ) : (
                        <div className="grid gap-3 md:grid-cols-2">
                          {campaign.ads.map(ad => (
                            <div 
                              key={ad.id}
                              className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-3 flex"
                            >
                              {ad.imageUrl && (
                                <div className="w-16 h-16 mr-3 rounded-md overflow-hidden shrink-0">
                                  <img 
                                    src={ad.imageUrl} 
                                    alt={ad.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              
                              <div className="flex-1 min-w-0">
                                <h5 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                                  {ad.title}
                                </h5>
                                <p className="text-gray-500 dark:text-gray-400 text-xs line-clamp-2 mt-0.5">
                                  {ad.description}
                                </p>
                                <div className="flex justify-between items-center mt-2">
                                  <div className={`px-2 py-0.5 rounded-full text-xs inline-flex items-center font-medium ${getStatusBadgeClass(ad.status)}`}>
                                    {ad.status}
                                  </div>
                                  <Button asChild variant="link" size="sm" className="text-xs h-auto p-0 text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300">
                                    <Link href={`/dashboard/advertiser/campaigns/${campaign.id}/ads/${ad.id}`}>
                                      View Details
                                    </Link>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <button 
                        onClick={() => toggleCampaign(campaign.id)}
                        className="ml-auto block text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex items-center"
                      >
                        <ChevronUp className="h-4 w-4 mr-1" />
                        Collapse
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CampaignList;