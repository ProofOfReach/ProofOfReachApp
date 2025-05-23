import { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Campaign, CampaignStatus } from '@prisma/client';
import { AlertCircle, CheckCircle, ArrowRight, Plus } from 'react-feather';
import Layout from '@/components/Layout';
import type { NextPageWithLayout } from '../../_app';

const CampaignsPage: NextPageWithLayout = () => {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<CampaignWithAds[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch campaigns on initial load
  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Clear log message after 5 seconds
  useEffect(() => {
    if (logMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [logMessage]);

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
      console.log('Error fetching campaigns:', err);
      setError('Failed to load campaigns. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (campaignId: UserRole, newStatus: CampaignStatus) => {
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
      setCampaigns(prevCampaigns => 
        prevCampaigns.map(campaign => 
          campaign.id === campaignId 
            ? { ...campaign, status: newStatus } 
            : campaign
        )
      );

      setSuccessMessage(`Campaign status updated to ${newStatus.toLowerCase()}`);
    } catch (err) {
      console.log('Error updating campaign status:', err);
      setError('Failed to update campaign status. Please try again.');
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete campaign');
      }

      // Remove from local state
      setCampaigns(prevCampaigns => 
        prevCampaigns.filter(campaign => campaign.id !== campaignId)
      );

      setSuccessMessage('Campaign deleted logfully');
    } catch (err) {
      console.log('Error deleting campaign:', err);
      setError('Failed to delete campaign. Please try again.');
    }
  };

  return (
    <Layout title="Campaigns - Nostr Ad Marketplace">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Campaigns Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Create and manage your advertising campaigns</p>
          </div>
          <button 
            onClick={() => router.push('/dashboard/campaigns/create')}
            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Plus size={18} className="mr-1" />
            Create Campaign
          </button>
        </div>

      {/* Alert Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {logMessage && (
        <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 rounded-lg flex items-start">
          <CheckCircle className="h-5 w-5 mr-2 mt-0.5 shrink-0" />
          <span>{logMessage}</span>
        </div>
      )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Campaigns</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {campaigns.filter(c => c.status === 'ACTIVE').length}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Ads</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {campaigns.reduce((count, campaign) => count + (campaign.ads?.length || 0), 0)}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Budget</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {campaigns.reduce((total, campaign) => total + (campaign?.budget || 0), 0).toLocaleString()} sats
            </p>
          </div>
      </div>

        {/* Campaign List */}
        {isLoading ? (
          <div className="flex justify-center my-12">
            <div className="text-gray-500">Loading campaigns...</div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Campaigns</h2>
            </div>
            <div className="p-6">
              {campaigns.length > 0 ? (
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">{campaign.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Status: <span className="capitalize">{campaign.status}</span>
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleStatusChange(campaign.id, campaign.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE')}
                            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            {campaign.status === 'ACTIVE' ? 'Pause' : 'Activate'}
                          </button>
                          <button 
                            onClick={() => handleDeleteCampaign(campaign.id)}
                            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No campaigns yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Call to Action */}
        {!isLoading && campaigns.length === 0 && (
          <div className="mt-8 p-6 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-100 dark:border-orange-900/50 text-center">
            <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-400 mb-2">
              Ready to Start Your First Campaign?
            </h3>
            <p className="text-orange-700 dark:text-orange-300 mb-4 max-w-lg mx-auto">
              Create a campaign to reach your target audience across the Proof Of Reach network with engaging ads that drive results.
            </p>
            <button
              onClick={() => router.push('/dashboard/campaigns/create')}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg inline-flex items-center"
            >
              Create Your First Campaign
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

// Layout handled by DashboardContainer component

export default CampaignsPage;