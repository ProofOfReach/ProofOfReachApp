import { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Campaign, CampaignStatus, Ad } from '@prisma/client';
import { AlertCircle, CheckCircle, ArrowRight, Plus } from 'react-feather';
import DashboardHeader from '@/components/ui/DashboardHeader';
import { getDashboardLayout } from '@/utils/layoutHelpers';
import type { NextPageWithLayout } from '../../_app';

// Type definition for campaigns with ads
type CampaignWithAds = Campaign & {
  ads?: Ad[];
};

const CampaignsPage: NextPageWithLayout = () => {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<CampaignWithAds[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch campaigns on initial load
  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchCampaigns = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/campaigns');
      
      if (!response.ok) {
        throw new Error('Failed to fetch campaigns');
      }
      
      const data = await response.json();
      setCampaigns(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (campaignId: string, newStatus: CampaignStatus) => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update campaign status');
      }

      // Update local state
      setCampaigns(prev => 
        prev.map(campaign => 
          campaign.id === campaignId 
            ? { ...campaign, status: newStatus }
            : campaign
        )
      );

      setSuccessMessage('Campaign status updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update campaign');
    }
  };

  const getStatusColor = (status: CampaignStatus) => {
    switch (status) {
      case 'DRAFT':
        return 'text-gray-600 bg-gray-100';
      case 'ACTIVE':
        return 'text-green-600 bg-green-100';
      case 'PAUSED':
        return 'text-yellow-600 bg-yellow-100';
      case 'ENDED':
        return 'text-blue-600 bg-blue-100';
      case 'SCHEDULED':
        return 'text-purple-600 bg-purple-100';
      case 'REVIEW':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <DashboardHeader 
        title="Campaign Management"
        actions={
          <button
            onClick={() => router.push('/dashboard/campaigns/create')}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg inline-flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Campaign
          </button>
        }
      />
      <div className="space-y-6">

        {/* Status Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-green-700">{successMessage}</span>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading campaigns...</p>
          </div>
        )}

        {/* Campaigns Table */}
        {!isLoading && campaigns.length > 0 && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {campaign.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {campaign.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {campaign.budget.toLocaleString()} sats
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(campaign.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => router.push(`/dashboard/campaigns/${campaign.id}`)}
                        className="text-orange-600 hover:text-orange-900 mr-4"
                      >
                        View
                      </button>
                      <button
                        onClick={() => router.push(`/dashboard/campaigns/${campaign.id}/edit`)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && campaigns.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              No campaigns
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by creating your first campaign.
            </p>
            <div className="mt-6">
              <button
                onClick={() => router.push('/dashboard/campaigns/create')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" />
                Create Campaign
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Use the getDashboardLayout function
CampaignsPage.getLayout = function getLayout(page: React.ReactElement) {
  return getDashboardLayout(page, 'Campaigns');
};

export default CampaignsPage;