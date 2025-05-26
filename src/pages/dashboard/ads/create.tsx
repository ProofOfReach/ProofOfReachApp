import { UserRole } from "@/types/role";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import '@/hooks/useAuth';
import '@/context/RoleContext';
import Link from 'next/link';
import { AlertCircle, CreditCard, ArrowLeft, RefreshCw } from 'react-feather';
import '@/components/AdForm';
import '@/lib/api';
import '@/components/SatoshiIcon';
import '@/pages/_app';
import '@/components/ui';
import { getDashboardLayout } from '@/utils/layoutHelpers';

const CreateAdPage: NextPageWithLayout = () => {
  const { auth } = useAuth();
  const role = "viewer"; // Simplified for build
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFundWalletPrompt, setShowFundWalletPrompt] = useState(false);
  const [pendingAdData, setPendingAdData] = useState<any>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  
  // Redirect if not in advertiser role
  useEffect(() => {
    if (role !== 'advertiser') {
      router.push(`/dashboard${role !== 'viewer' ? `/${role}` : ''}`);
    }
  }, [role, router]);
  
  // Fetch wallet balance when component mounts
  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        const response = await fetch('/api/wallet');
        if (response.ok) {
          const data = await response.json();
          setWalletBalance((data?.balance ?? 0) || 0);
        }
      } catch (error) {
        console.log('Error fetching wallet balance:', error);
      }
    };
    
    if (auth?.pubkey) {
      fetchWalletBalance();
    }
  }, [auth?.pubkey]);

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    setError(null);
    
    // Transform form data to match API expectations
    const adData = {
      ...formData,
      targetUrl: formData.finalDestinationUrl,  // API expects targetUrl, not finalDestinationUrl
    };
    
    setPendingAdData(adData);

    try {
      // Use the postWithAuth utility for consistent authentication
      const response = await postWithAuth('/api/ads', adData);

      if (!response.ok) {
        const errorData = await response.json();
        
        // If the error is insufficient balance, show the wallet funding prompt
        if (errorData.log === 'Insufficient balance to create this ad') {
          setShowFundWalletPrompt(true);
          setIsSubmitting(false);
          return;
        }
        
        // If unauthorized, show proper error message
        if (response.status === 401) {
          throw new Error('You need to be logged in to create ads. Please log in again.');
        }
        
        throw new Error(errorData.log || 'Failed to create ad. Please check all required fields are filled correctly.');
      }

      // Redirect to campaigns dashboard
      router.push('/dashboard/campaigns');
    } catch (err: any) {
      console.log('Ad creation error:', err);
      setError(err.message || 'Failed to create the ad. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!auth?.pubkey) {
    return (
      <div className="container mx-auto px-4 py-6">
        <DashboardHeader title="Create Ad" description="Create a new advertisement" />
        <div className="text-center py-12">
          <DashboardCard>
            <p className="text-gray-600 dark:text-gray-300">Please login to create ads.</p>
            <Link href="/login" className="btn-primary mt-4 inline-block">
              Go to Login
            </Link>
          </DashboardCard>
        </div>
      </div>
    );
  }

  // Function to handle continue with ad creation after funding wallet
  const handleContinueAfterFunding = async () => {
    if (!pendingAdData) {
      setError("No pending ad data found. Please try creating your ad again.");
      return;
    }
    
    // Reset the error state and set submitting to true again
    setError(null);
    setIsSubmitting(true);
    
    try {
      // First check if the wallet has sufficient funds
      const walletResponse = await fetch('/api/wallet');
      if (!walletResponse.ok) {
        throw new Error('Failed to check wallet balance');
      }
      
      const walletData = await walletResponse.json();
      if (walletData?.balance ?? 0 < pendingAdData?.budget ?? 0) {
        throw new Error(`Insufficient balance. You have ${walletData?.balance ?? 0} sats, but need ${pendingAdData?.budget ?? 0} sats.`);
      }
      
      // Make sure the data sent to API has targetUrl instead of finalDestinationUrl
      if (pendingAdData.finalDestinationUrl && !pendingAdData.targetUrl) {
        pendingAdData.targetUrl = pendingAdData.finalDestinationUrl;
      }
      
      // Try to create the ad again with the stored pending data
      const response = await postWithAuth('/api/ads', pendingAdData);
      
      if (!response.ok) {
        const errorData = await response.json();
        
        // If unauthorized, show proper error message
        if (response.status === 401) {
          throw new Error('You need to be logged in to create ads. Please log in again.');
        }
        
        throw new Error(errorData.log || 'Failed to create ad. Please check all required fields are filled correctly.');
      }
      
      // Redirect to campaigns dashboard
      router.push('/dashboard/campaigns');
    } catch (err: any) {
      console.log('Ad creation retry error:', err);
      setError(err.message || 'Failed to create the ad. Please try again.');
      setIsSubmitting(false);
    }
  };
  
  // Function to cancel and go back to ad form
  const handleCancelFunding = () => {
    setShowFundWalletPrompt(false);
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <DashboardHeader 
        title="Create New Ad" 
        description="Design your advertisement and set targeting parameters" 
        actions={
          <Link
            href="/dashboard/campaigns"
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Campaigns
          </Link>
        }
      />

      {/* Wallet Funding Prompt - Shows when balance is insufficient */}
      {showFundWalletPrompt ? (
        <DashboardCard>
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full mb-4">
              <SatoshiIcon size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Insufficient Balance</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
              You need to fund your wallet with at least <span className="font-bold">{pendingAdData?.budget ?? 0} sats</span> to create this ad.
            </p>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-500 mr-3 mt-0.5" />
              <div className="text-yellow-700 dark:text-yellow-400 text-sm">
                <p className="font-medium mb-1">Ad Creation On Hold</p>
                <p>Your ad details have been saved but cannot be published until your wallet has sufficient funds.</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Link 
              href="/dashboard/wallet" 
              className="flex-1 btn-primary flex items-center justify-center"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Fund Your Wallet
            </Link>
            
            <button 
              onClick={handleContinueAfterFunding}
              className="flex-1 btn-secondary flex items-center justify-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Check Balance & Try Again
            </button>
            
            <button 
              onClick={handleCancelFunding}
              className="flex-1 btn-outline flex items-center justify-center"
            >
              Go Back to Edit Ad
            </button>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Next Steps:</h3>
            <ol className="list-decimal list-inside text-gray-600 dark:text-gray-300 space-y-2">
              <li>Visit your wallet page and fund your account</li>
              <li>Return to this page and click "Check Balance & Try Again"</li>
              <li>Your ad will be created and submitted for review</li>
            </ol>
          </div>
        </DashboardCard>
      ) : (
        <>
          {/* Info Card */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-800 dark:text-blue-300">Advertiser Information</h3>
                <p className="text-blue-700 dark:text-blue-400 text-sm mt-1">
                  Create your ad campaign by filling out the form below. You can set your budget, targeting options,
                  and bid amounts for impressions and clicks.
                </p>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Ad Creation Form */}
          <DashboardCard>
            <AdForm 
              onSubmit={handleSubmit} 
              isSubmitting={isSubmitting} 
              userBalance={walletBalance}
            />
          </DashboardCard>
        </>
      )}
    </div>
  );
};

// Set the layout for the page
CreateAdPage.getLayout = function getLayout(page: React.ReactElement) {
  return getDashboardLayout(page, 'Create Ad');
};

export default CreateAdPage;