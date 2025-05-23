import { useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Campaign, CampaignStatus } from '@prisma/client';
import { AlertCircle, CheckCircle, ArrowRight, Plus } from 'react-feather';

import "./components/campaigns/CampaignList';
import "./components/campaigns/CampaignDataTable';
import "./components/ui/Loading';
import "./components/ui/button';
import "./components/ui';
import "./utils/layoutHelpers';
import type { NextPageWithLayout } from '../../_app';

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
      console.logger.error('Error fetching campaigns:', err);
      setError('Failed to load campaigns. Please try again.');
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
      setCampaigns(prevCampaigns => 
        prevCampaigns.map(campaign => 
          campaign.id === campaignId 
            ? { ...campaign, status: newStatus } 
            : campaign
        )
      );

      setSuccessMessage(`Campaign status updated to ${newStatus.toLowerCase()}`);
    } catch (err) {
      console.logger.error('Error updating campaign status:', err);
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

      setSuccessMessage('Campaign deleted successfully');
    } catch (err) {
      console.logger.error('Error deleting campaign:', err);
      setError('Failed to delete campaign. Please try again.');
    }
  };

  return (
    <DashboardContainer>
      <DashboardHeader 
        title="Campaigns Dashboard"
        description="Create and manage your advertising campaigns"
      >
        <Button 
          onClick={() => router.push('/dashboard/campaigns/create')}
          className="inline-flex items-center"
        >
          <Plus size={18} className="mr-1" />
          Create Campaign
        </Button>
      </DashboardHeader>

      {/* Alert Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 rounded-lg flex items-start">
          <CheckCircle className="h-5 w-5 mr-2 mt-0.5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashboardCard title="Active Campaigns">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {campaigns.filter(c => c.status === 'ACTIVE').length}
          </p>
        </DashboardCard>
        
        <DashboardCard title="Total Ads">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {campaigns.reduce((count, campaign) => count + campaign.ads.length, 0)}
          </p>
        </DashboardCard>
        
        <DashboardCard title="Total Budget">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {campaigns.reduce((total, campaign) => total + campaign.budget, 0).toLocaleString()} sats
          </p>
        </DashboardCard>
      </div>

      {/* Campaign List */}
      {isLoading ? (
        <div className="flex justify-center my-12">
          <Loading size="large" />
        </div>
      ) : (
        <DashboardCard title="Campaigns">
          <CampaignDataTable 
            campaigns={campaigns} 
            onStatusChange={handleStatusChange}
            onDelete={handleDeleteCampaign}
          />
        </DashboardCard>
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
          <Button
            onClick={() => router.push('/dashboard/campaigns/create')}
            variant="default"
            className="bg-orange-600 hover:bg-orange-700 dark:bg-orange-700 dark:hover:bg-orange-600 inline-flex items-center"
          >
            Create Your First Campaign
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </DashboardContainer>
  );
};

// Set the layout for this page
CampaignsPage.getLayout = (page) => getDashboardLayout(page, 'Campaigns');

export default CampaignsPage;