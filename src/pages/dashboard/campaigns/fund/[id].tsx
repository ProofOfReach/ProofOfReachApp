import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { NextPageWithLayout } from '../../../_app';
import { getDashboardLayout } from '../../../../utils/layoutHelpers';
import { useAuth } from '../../../../hooks/useAuth';
import { useCurrency } from '../../../../context/CurrencyContext';
import { CurrencyAmount } from '../../../../components/CurrencyAmount';
import { SmartFundingFlow } from '../../../../components/SmartFundingFlow';

interface Campaign {
  id: string;
  name: string;
  description?: string;
  budget: number;
  status: string;
  createdAt: string;
}

const CampaignFundingPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { id } = router.query;
  const { auth } = useAuth();
  const { walletBalance, updateTestModeBalance } = useCurrency();
  
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fundingSuccess, setFundingSuccess] = useState(false);

  // Fetch campaign details
  useEffect(() => {
    if (!id) return;
    
    const fetchCampaign = async () => {
      try {
        const response = await fetch(`/api/campaigns/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch campaign');
        }
        const campaignData = await response.json();
        setCampaign(campaignData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load campaign');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [id]);

  const handleFundingSuccess = (message: string) => {
    setFundingSuccess(true);
    setError(null);
    
    // Update campaign status to ready after successful funding
    setTimeout(() => {
      router.push(`/dashboard/campaigns/${id}`);
    }, 2000);
  };

  const handleFundingError = (message: string) => {
    setError(message);
  };

  const isFullyFunded = campaign && (walletBalance || 0) >= campaign.budget;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error && !campaign) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Campaign Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard/campaigns')}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Back to Campaigns
          </button>
        </div>
      </div>
    );
  }

  if (fundingSuccess) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center">
          <div className="text-green-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Campaign Funded Successfully!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your campaign "{campaign?.name}" is now ready to launch.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Redirecting to campaign details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <button
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 mr-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Fund Your Campaign
          </h1>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <div className="flex items-start">
            <div className="text-blue-500 mr-3 mt-0.5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                Campaign Needs Funding
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Your campaign "{campaign?.name}" requires sufficient wallet balance before it can be launched.
                Add funds to your wallet to activate your campaign.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Summary */}
      {campaign && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Campaign Summary
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-md font-medium text-gray-900 dark:text-white mb-1">
                {campaign.name}
              </h3>
              {campaign.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {campaign.description}
                </p>
              )}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-2 py-1 rounded-full text-xs font-medium">
                    Pending Funding
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Created:</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(campaign.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                Funding Requirements
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Campaign Budget:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    <CurrencyAmount sats={campaign.budget} />
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Current Balance:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    <CurrencyAmount sats={walletBalance || 0} />
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                  <span className="text-gray-600 dark:text-gray-400">Amount Needed:</span>
                  <span className={`font-medium ${
                    isFullyFunded 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {isFullyFunded ? (
                      '✓ Fully Funded'
                    ) : (
                      <CurrencyAmount sats={campaign.budget - (walletBalance || 0)} />
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Funding Interface */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Add Funds to Your Wallet
        </h2>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        <SmartFundingFlow
          isTestMode={auth?.isTestMode || false}
          onSuccess={handleFundingSuccess}
          onError={handleFundingError}
          onBalanceUpdate={updateTestModeBalance}
        />

        {isFullyFunded && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
            <div className="flex items-center">
              <div className="text-green-500 mr-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-green-900 dark:text-green-300 mb-1">
                  Campaign Ready to Launch!
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Your wallet balance now covers the campaign budget. You can proceed to launch your campaign.
                </p>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => router.push(`/dashboard/campaigns/${id}`)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Go to Campaign
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

CampaignFundingPage.getLayout = getDashboardLayout;

export default CampaignFundingPage;