import React, { useState } from 'react';
import Link from 'next/link';
import { Edit2, Trash2, Play, Pause, AlertCircle, ChevronDown, ChevronUp } from 'react-feather';
import '@/types/campaign';

interface CampaignListProps {
  campaigns: CampaignWithAds[];
  onStatusChange: (campaignId: string, newStatus: CampaignStatus) => void;
  onDelete: (campaignId: string) => void;
}

const CampaignList: React.FC<CampaignListProps> = ({ campaigns, onStatusChange, onDelete }) => {
  const [expandedCampaignId, setExpandedCampaignId] = useState<string | null>(null);

  const toggleExpand = (campaignId: string) => {
    setExpandedCampaignId(prev => prev === campaignId ? null : campaignId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleStatusChange = (campaignId: string, currentStatus: CampaignStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    onStatusChange(campaignId, newStatus);
  };

  const handleDeleteConfirm = (campaignId: string) => {
    if (window.confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      onDelete(campaignId);
    }
  };

  if (campaigns.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col items-center justify-center py-6">
          <AlertCircle className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Campaigns Yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4 text-center max-w-md">
            You haven't created any campaigns yet. Create your first campaign to start advertising on the Nostr network.
          </p>
          <Link
            href="/dashboard/advertiser/campaigns/create"
            className="btn-primary bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-600"
          >
            Create Campaign
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Budget</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Started</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ads</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {campaigns.map((campaign) => (
              <React.Fragment key={campaign.id}>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <button 
                        onClick={() => toggleExpand(campaign.id)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mr-2"
                      >
                        {expandedCampaignId === campaign.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{campaign.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">ID: {campaign.id.substring(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${campaign.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400' 
                        : campaign.status === 'PAUSED'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-400'
                      }`}
                    >
                      {campaign.status.charAt(0) + campaign.status.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {campaign.budget.toLocaleString()} sats
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(campaign.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {campaign.ads.length}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleStatusChange(campaign.id, campaign.status)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        title={campaign.status === 'ACTIVE' ? 'Pause Campaign' : 'Activate Campaign'}
                      >
                        {campaign.status === 'ACTIVE' ? <Pause size={18} /> : <Play size={18} />}
                      </button>
                      <Link
                        href={`/dashboard/advertiser/campaigns/${campaign.id}/edit`}
                        className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Edit Campaign"
                      >
                        <Edit2 size={18} />
                      </Link>
                      <button
                        onClick={() => handleDeleteConfirm(campaign.id)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete Campaign"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedCampaignId === campaign.id && (
                  <tr className="bg-gray-50 dark:bg-gray-750">
                    <td colSpan={6} className="px-6 py-4">
                      <div className="mb-3">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Campaign Details</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                          <span className="font-medium">Description:</span> {campaign.description || 'No description provided'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-medium">Target Audience:</span> {campaign.targetAudience || 'General audience'}
                        </p>
                      </div>
                      
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Ads in this Campaign</h4>
                      {campaign.ads.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {campaign.ads.map(ad => (
                            <div key={ad.id} className="border border-gray-200 dark:border-gray-700 rounded p-3 bg-white dark:bg-gray-800">
                              <div className="font-medium text-gray-900 dark:text-white mb-1">{ad.title}</div>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{ad.description}</p>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                <span className="font-medium">Impressions:</span> {ad.impressions || 0} | 
                                <span className="font-medium ml-2">Clicks:</span> {ad.clicks || 0}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">No ads have been created for this campaign yet.</p>
                      )}
                      
                      <div className="mt-3 flex justify-end">
                        <Link
                          href={`/dashboard/advertiser/campaigns/${campaign.id}/ads/create`}
                          className="text-sm text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300"
                        >
                          Add New Ad to Campaign
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CampaignList;