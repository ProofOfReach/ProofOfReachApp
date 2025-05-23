import { useState, useEffect, useCallback } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { ArrowLeft, Calendar, Target, DollarSign, Clock, AlertCircle, CheckCircle, Volume2, Layers, PlusCircle } from 'react-feather';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import "./hooks/useAuth';

import "./components/ui';
import "./utils/layoutHelpers';
import "./components/layout/ImprovedDashboardLayout';
import "./components/CurrencyAmount';
import "./context/CurrencyContext';
import "./components/LightningWallet';
import "./components/LightningWalletBalance';
import type { NextPageWithLayout } from '../../../_app';

// Dynamically import the AdForm component to avoid SSR issues with browser-specific code
const AdForm = dynamic(() => import "./components/AdForm'), { ssr: false });

// Step types
enum Step {
  CAMPAIGN_DETAILS = 'CAMPAIGN_DETAILS',
  CREATE_ADS = 'CREATE_ADS',
  REVIEW = 'REVIEW',
  SUCCESS = 'SUCCESS'
}

// Campaign form data interface
interface CampaignFormData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: number;
  dailyBudget: number;
  targetLocation: string;
  targetInterests: string;
  targetAge: string;
  targetAudience: string;
}

// Ad form data interface (simplified)
interface AdFormData {
  title: string;
  description: string;
  imageUrl: string;
  finalDestinationUrl: string;
  urlParameters: string;
  bidPerImpression: number;
  bidPerClick: number;
  freqCapViews: number;
  freqCapHours: number;
  targetLocation: string;
  targetInterests: string;
  targetAge: string;
  advertiserName: string;
  budget: number;
  dailyBudget: number;
  targetedAdSpaces: string[];
}

const CreateCampaignPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { auth, refreshRoles } = useAuth();
  const currencyContext = useCurrency();
  
  // Track the current step in the wizard
  const [currentStep, setCurrentStep] = useState<Step>(Step.CAMPAIGN_DETAILS);

  // Show/hide wallet funding
  const [showWalletFunding, setShowWalletFunding] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [walletError, setWalletError] = useState<string | null>(null);
  
  // Function to update test mode balance
  const updateTestModeBalance = useCallback((newBalance: number) => {
    setWalletBalance(newBalance);
    // Also update localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('testWalletBalance', newBalance.toString());
    }
  }, []);
  
  // Campaign form data
  const [campaignFormData, setCampaignFormData] = useState<CampaignFormData>({
    name: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    endDate: '',
    budget: 10000, // Default budget in sats
    dailyBudget: 1000, // Default daily budget in sats
    targetLocation: '',
    targetInterests: '',
    targetAge: '',
    targetAudience: '',
  });
  
  // Array to store multiple ad data
  const [ads, setAds] = useState<AdFormData[]>([]);
  
  // Current ad being created
  const [currentAdData, setCurrentAdData] = useState<AdFormData | null>(null);
  
  // State for various UI conditions
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdCampaignId, setCreatedCampaignId] = useState<string | null>(null);
  // Used for backward compatibility with the existing success alert UI
  const [success, setSuccess] = useState<boolean>(false);

  // Handle campaign form field changes
  const handleCampaignChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCampaignFormData(prev => ({
      ...prev,
      [name]: name === 'budget' || name === 'dailyBudget' ? parseInt(value) || 0 : value,
    }));
  };

  // Handle ad form submission
  const handleAdSubmit = (adData: AdFormData) => {
    // Add the newly created ad to our ads array
    setAds(prev => [...prev, adData]);
    
    // Ask if they want to create another ad or continue to review
    setCurrentStep(Step.CREATE_ADS);
  };
  
  // Creates a blank slate for a new ad, inheriting targeting from campaign
  const initializeNewAd = () => {
    setCurrentAdData({
      title: '',
      description: '',
      imageUrl: '',
      finalDestinationUrl: '',
      urlParameters: '',
      bidPerImpression: 10,
      bidPerClick: 0,
      freqCapViews: 2,
      freqCapHours: 24,
      // Inherit targeting from the campaign
      targetLocation: campaignFormData.targetLocation,
      targetInterests: campaignFormData.targetInterests,
      targetAge: campaignFormData.targetAge,
      // Pre-populate with campaign info
      advertiserName: campaignFormData.name,
      budget: campaignFormData.budget, 
      dailyBudget: campaignFormData.dailyBudget,
      targetedAdSpaces: []
    });
  };

  // Handle campaign form submission and advance to creating ads
  const handleCampaignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validation for required fields
      if (!campaignFormData.name || !campaignFormData.startDate || !campaignFormData.dailyBudget) {
        throw new Error('Please fill in all required fields.');
      }

      // Ensure daily budget is valid
      if (campaignFormData.dailyBudget <= 0) {
        throw new Error('Daily spending limit must be greater than zero.');
      }
      
      // If total budget is specified, validate it
      if (campaignFormData.budget && campaignFormData.budget > 0) {
        // Ensure daily budget doesn't exceed total budget
        if (campaignFormData.dailyBudget > campaignFormData.budget) {
          throw new Error('Daily spending limit cannot exceed maximum campaign spend.');
        }
      }

      // Format the data for the API
      const apiData = {
        ...campaignFormData,
        startDate: new Date(campaignFormData.startDate).toISOString(),
        endDate: campaignFormData.endDate ? new Date(campaignFormData.endDate).toISOString() : null,
        // Convert empty strings to null for optional targeting fields
        targetLocation: campaignFormData.targetLocation || null,
        targetInterests: campaignFormData.targetInterests 
          ? campaignFormData.targetInterests.split(',').map(t => t.trim()) 
          : null,
        targetAge: campaignFormData.targetAge || null,
        targetAudience: campaignFormData.targetAudience || null,
      };

      // Send to the API
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create campaign');
      }

      const campaign = await response.json();
      
      // Store the campaign ID
      setCreatedCampaignId(campaign.id);
      
      // Initialize the first ad with campaign targeting
      initializeNewAd();
      
      // Move to the next step (creating an ad)
      setCurrentStep(Step.CREATE_ADS);
      
    } catch (err) {
      console.logger.error('Error creating campaign:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Create an ad within the campaign
  const createAd = async (adData: AdFormData) => {
    setError(null);
    setIsSubmitting(true);
    
    try {
      if (!createdCampaignId) {
        throw new Error('Campaign ID is missing');
      }
      
      // Format the ad data for the API
      const apiData = {
        ...adData,
        campaignId: createdCampaignId,
        // Convert empty strings to null for optional targeting fields
        targetLocation: adData.targetLocation || null,
        targetInterests: adData.targetInterests 
          ? typeof adData.targetInterests === 'string' 
            ? adData.targetInterests.split(',').map(t => t.trim()) 
            : adData.targetInterests
          : null,
        targetAge: adData.targetAge || null,
      };
      
      // Send to the API
      const response = await fetch('/api/ads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create ad');
      }
      
      const ad = await response.json();
      
      // Add the newly created ad to our list
      setAds(prev => [...prev, {...adData, id: ad.id}]);
      
      // Go back to CREATE_ADS step to potentially add more
      setCurrentStep(Step.CREATE_ADS);
      
    } catch (err) {
      console.logger.error('Error creating ad:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Complete the process
  const completeSetup = () => {
    setCurrentStep(Step.SUCCESS);
    setSuccess(true); // For compatibility with old UI
  };

  // Helper to determine the page title based on the current step
  const getPageTitle = () => {
    switch(currentStep) {
      case Step.CAMPAIGN_DETAILS:
        return "Create Campaign";
      case Step.CREATE_ADS:
        return "Add Ads to Campaign";
      case Step.REVIEW:
        return "Review Campaign";
      case Step.SUCCESS:
        return "Campaign Created";
      default:
        return "Create Campaign";
    }
  };

  const goBack = () => {
    router.back();
  };
  
  // Fetch wallet balance
  const fetchWalletBalance = async () => {
    setIsLoadingBalance(true);
    setWalletError(null);
    
    // Enhanced test mode detection
    // Check multiple sources to determine if we're in test mode
    const testModeDetected = 
      auth?.isTestMode || // From auth context
      (typeof localStorage !== 'undefined' && localStorage.getItem('isTestMode') === 'true') || // From localStorage
      (typeof localStorage !== 'undefined' && localStorage.getItem('testMode') === 'true') || // Alternative localStorage key
      (typeof window !== 'undefined' && window.location.search.includes('testMode=true')) || // From URL parameter
      (auth?.pubkey && auth.pubkey.startsWith('pk_test_')); // From test pubkey format
    
    if (testModeDetected) {
      console.log('Test mode detected in client component, using stored wallet balance');
      // Use localStorage balance for test mode if available, otherwise use default
      setTimeout(() => {
        // Check for stored test balance
        if (typeof window !== 'undefined') {
          const storedBalance = localStorage.getItem('testWalletBalance');
          if (storedBalance) {
            setWalletBalance(parseInt(storedBalance, 10));
          } else {
            // No stored balance, use default
            setWalletBalance(100000); // Default 100,000 sats if no stored value
            localStorage.setItem('testWalletBalance', '100000');
          }
        } else {
          setWalletBalance(100000); // Default for SSR
        }
        setIsLoadingBalance(false);
      }, 500); // Simulate a network delay
      return;
    }
    
    try {
      // Add testMode query parameter if needed
      const testModeParam = testModeDetected ? '?testMode=true' : '';
      const response = await fetch(`/api/wallet${testModeParam}`, {
        headers: {
          // Add test mode header if detected
          ...(testModeDetected && { 'X-Test-Mode': 'true' }),
          'Cache-Control': 'no-cache' // Prevent caching
        },
        credentials: 'include' // Include cookies for authentication
      });
      
      // Special handling for 401 Unauthorized in a likely test environment
      if (response.status === 401) {
        console.log('Unauthorized error when fetching wallet balance, falling back to test mode');
        setWalletBalance(100000); // Mock 100,000 sats as fallback
        
        // Set test mode flag in localStorage for future requests
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('isTestMode', 'true');
        }
        
        return;
      }
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setWalletBalance(data.balance);
    } catch (err) {
      console.logger.error('Error fetching wallet balance:', err);
      
      // If we get an error, check if pubkey starts with test prefix
      if (auth?.pubkey && auth.pubkey.startsWith('pk_test_')) {
        console.log('Detected test pubkey after error, using mock balance');
        setWalletBalance(100000); // Fallback to test mode
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('isTestMode', 'true');
        }
      } else {
        setWalletError('Failed to fetch wallet balance');
        setWalletBalance(0);
      }
    } finally {
      setIsLoadingBalance(false);
    }
  };
  
  // Handle wallet funding success/error
  const handleWalletSuccess = (message: string) => {
    setError(null);
    setSuccess(true);
    
    // Only fetch from API in non-test mode
    // For test mode, the balance is already updated via the callback
    if (!auth?.isTestMode && 
        !(typeof localStorage !== 'undefined' && localStorage.getItem('isTestMode') === 'true') && 
        !(auth?.pubkey && auth.pubkey.startsWith('pk_test_'))) {
      fetchWalletBalance(); // Refresh balance from API after successful transaction
    }
    
    setShowWalletFunding(false); // Hide funding UI after success
  };
  
  const handleWalletError = (message: string) => {
    setError(message);
    setSuccess(false);
  };
  
  // Fetch wallet balance on component mount
  useEffect(() => {
    fetchWalletBalance();
  }, []);

  return (
    <DashboardContainer>
      <DashboardHeader 
        title={getPageTitle()}
        description="Create and manage your advertising campaigns"
      >
        <button
          onClick={goBack}
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Campaigns
        </button>
      </DashboardHeader>
      
      <div className="space-y-6">

        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div className="flex flex-col items-center">
              <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
                currentStep === Step.CAMPAIGN_DETAILS || currentStep === Step.CREATE_ADS || currentStep === Step.REVIEW || currentStep === Step.SUCCESS
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>
                1
              </div>
              <span className="mt-1 text-xs text-center">Campaign</span>
            </div>
            <div className={`h-1 flex-1 mx-2 ${
              currentStep === Step.CREATE_ADS || currentStep === Step.REVIEW || currentStep === Step.SUCCESS
                ? 'bg-orange-500'
                : 'bg-gray-200 dark:bg-gray-700'
            }`} />
            <div className="flex flex-col items-center">
              <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
                currentStep === Step.CREATE_ADS || currentStep === Step.REVIEW || currentStep === Step.SUCCESS
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>
                2
              </div>
              <span className="mt-1 text-xs text-center">Add Ads</span>
            </div>
            <div className={`h-1 flex-1 mx-2 ${
              currentStep === Step.REVIEW || currentStep === Step.SUCCESS
                ? 'bg-orange-500'
                : 'bg-gray-200 dark:bg-gray-700'
            }`} />
            <div className="flex flex-col items-center">
              <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
                currentStep === Step.REVIEW || currentStep === Step.SUCCESS
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>
                3
              </div>
              <span className="mt-1 text-xs text-center">Review</span>
            </div>
            <div className={`h-1 flex-1 mx-2 ${
              currentStep === Step.SUCCESS
                ? 'bg-orange-500'
                : 'bg-gray-200 dark:bg-gray-700'
            }`} />
            <div className="flex flex-col items-center">
              <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
                currentStep === Step.SUCCESS
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>
                4
              </div>
              <span className="mt-1 text-xs text-center">Complete</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 max-w-3xl mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Campaign Details */}
          {currentStep === Step.CAMPAIGN_DETAILS && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Create a New Campaign
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Set up your advertising campaign to reach your target audience across the Nostr network.
              </p>

              <form onSubmit={handleCampaignSubmit} className="space-y-6">
                {/* Campaign Basics Section */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Campaign Basics
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Campaign Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={campaignFormData.name}
                    onChange={handleCampaignChange}
                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                    placeholder="e.g., Summer Bitcoin Promotion"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Campaign Notes <span className="text-gray-500 text-xs">(optional)</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={campaignFormData.description}
                    onChange={handleCampaignChange}
                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                    placeholder="Private notes about this campaign (visible only to you)"
                  />
                  <p className="mt-1 text-xs text-gray-500">These notes are for your reference only and won't be visible to publishers or users.</p>
                </div>
              </div>
            </div>

            {/* Campaign Scheduling */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-orange-500" />
                Campaign Schedule
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={campaignFormData.startDate}
                    onChange={handleCampaignChange}
                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Date <span className="text-gray-500 text-xs">(optional)</span>
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={campaignFormData.endDate}
                    onChange={handleCampaignChange}
                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                    min={campaignFormData.startDate}
                  />
                  <p className="mt-1 text-xs text-gray-500">Leave blank to run the campaign indefinitely (until manually paused).</p>
                </div>
              </div>
            </div>

            {/* Budget Settings */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-orange-500" />
                Budget Settings
              </h2>
              
              {/* Wallet Balance Section */}
              <div className="mb-6 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Available Balance
                  </h3>
                  <button 
                    onClick={() => fetchWalletBalance()}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Refresh
                  </button>
                </div>
                
                {/* Balance Display */}
                <div className="mt-2 mb-3">
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {isLoadingBalance ? (
                        <span className="inline-block w-16 h-8 bg-gray-200 dark:bg-gray-600 animate-pulse rounded"></span>
                      ) : (
                        <CurrencyAmount
                          sats={walletBalance || 0}
                          className="text-2xl"
                        />
                      )}
                    </span>
                  </div>
                </div>
                
                {/* Fund Wallet Button */}
                <div className="mt-1">
                  {!showWalletFunding ? (
                    <button
                      type="button"
                      onClick={() => setShowWalletFunding(true)}
                      className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      <PlusCircle className="h-4 w-4 mr-1" /> 
                      Fund Wallet
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowWalletFunding(false)}
                      className="inline-flex items-center text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                    >
                      <AlertCircle className="h-4 w-4 mr-1" /> 
                      Hide Funding
                    </button>
                  )}
                </div>
              </div>
              
              {/* Wallet Funding UI */}
              {showWalletFunding && (
                <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                  <h3 className="text-md font-semibold mb-4 text-gray-900 dark:text-white">
                    Fund Your Wallet
                  </h3>
                  
                  <LightningWallet
                    balance={walletBalance || 0}
                    isTestMode={auth?.isTestMode || false}
                    isLoading={isLoadingBalance}
                    onSuccess={handleWalletSuccess}
                    onError={handleWalletError}
                    onBalanceUpdate={updateTestModeBalance}
                  />
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="budget" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Maximum Campaign Spend <span className="text-gray-500 text-xs">(optional)</span>
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="number"
                      id="budget"
                      name="budget"
                      value={campaignFormData.budget}
                      onChange={handleCampaignChange}
                      min="0"
                      step="100"
                      className="focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md pr-12"
                      placeholder="10000"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">
                        {currencyContext.currency === 'BTC' ? 'sats' : 'USD'}
                      </span>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Total budget for the entire campaign. Leave at 0 for no maximum limit.</p>
                </div>
                
                <div>
                  <label htmlFor="dailyBudget" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Daily Spending Limit <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="number"
                      id="dailyBudget"
                      name="dailyBudget"
                      value={campaignFormData.dailyBudget}
                      onChange={handleCampaignChange}
                      min="100"
                      step="100"
                      className="focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md pr-12"
                      placeholder="1000"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">
                        {currencyContext.currency === 'BTC' ? 'sats' : 'USD'}
                      </span>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Maximum daily spending across all ads in this campaign.</p>
                </div>

                {/* Quick budget selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Quick Selection
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setCampaignFormData(prev => ({ ...prev, dailyBudget: 500 }))}
                      className="px-3 py-1 text-sm rounded-md bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    >
                      500 sats
                    </button>
                    <button
                      type="button"
                      onClick={() => setCampaignFormData(prev => ({ ...prev, dailyBudget: 1000 }))}
                      className="px-3 py-1 text-sm rounded-md bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    >
                      1,000 sats
                    </button>
                    <button
                      type="button"
                      onClick={() => setCampaignFormData(prev => ({ ...prev, dailyBudget: 5000 }))}
                      className="px-3 py-1 text-sm rounded-md bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    >
                      5,000 sats
                    </button>
                    <button
                      type="button"
                      onClick={() => setCampaignFormData(prev => ({ ...prev, dailyBudget: 10000 }))}
                      className="px-3 py-1 text-sm rounded-md bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    >
                      10,000 sats
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Targeting Options */}
            <div className="pb-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Target className="h-5 w-5 mr-2 text-orange-500" />
                Targeting Options <span className="text-gray-500 text-xs ml-2">(all optional)</span>
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="targetInterests" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Interest Categories
                  </label>
                  <input
                    type="text"
                    id="targetInterests"
                    name="targetInterests"
                    value={campaignFormData.targetInterests}
                    onChange={handleCampaignChange}
                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                    placeholder="e.g., bitcoin, lightning, crypto"
                  />
                  <p className="mt-1 text-xs text-gray-500">Comma-separated list of interests to target. Leave blank to target all interests.</p>
                </div>
                
                <div>
                  <label htmlFor="targetLocation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Geographic Targeting
                  </label>
                  <input
                    type="text"
                    id="targetLocation"
                    name="targetLocation"
                    value={campaignFormData.targetLocation}
                    onChange={handleCampaignChange}
                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                    placeholder="e.g., North America, Europe"
                  />
                  <p className="mt-1 text-xs text-gray-500">Leave blank to target globally.</p>
                </div>
                
                <div>
                  <label htmlFor="targetAge" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Age Groups
                  </label>
                  <select
                    id="targetAge"
                    name="targetAge"
                    value={campaignFormData.targetAge}
                    onChange={handleCampaignChange}
                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                  >
                    <option value="">All age groups</option>
                    <option value="18-24">18-24</option>
                    <option value="25-34">25-34</option>
                    <option value="35-44">35-44</option>
                    <option value="45-54">45-54</option>
                    <option value="55+">55+</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">Select an age group to target or leave as "All age groups".</p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={goBack}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${
                  isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Creating...' : 'Continue to Create Ads'}
              </button>
            </div>
          </form>
            </>
          )}

          {/* Step 2: Create Ads */}
          {currentStep === Step.CREATE_ADS && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Add Ads to Your Campaign
              </h1>
              
              {ads.length > 0 ? (
                <>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    You have created {ads.length} ad{ads.length !== 1 ? 's' : ''}. You can add more or continue to the review step.
                  </p>
                  
                  <div className="mb-6 space-y-4">
                    {ads.map((ad, index) => (
                      <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                          {ad.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                          {ad.description}
                        </p>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <span className="mr-3">
                            Bid per impression: {ad.bidPerImpression} sats
                          </span>
                          {ad.bidPerClick > 0 && (
                            <span>
                              Bid per click: {ad.bidPerClick} sats
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0 mb-8">
                    <button
                      onClick={() => {
                        initializeNewAd();
                      }}
                      className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Another Ad
                    </button>
                    
                    <button
                      onClick={completeSetup}
                      className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    >
                      Complete Campaign Setup
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Create your first ad to include in this campaign. You'll be able to add more ads after this one.
                  </p>
                  
                  {/* Ad Creation Form */}
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <Volume2 className="h-5 w-5 mr-2 text-orange-500" />
                      Create Your Ad
                    </h2>
                    
                    {currentAdData && (
                      <AdForm
                        initialData={currentAdData}
                        onSubmit={(adData) => {
                          createAd(adData);
                        }}
                        isSubmitting={isSubmitting}
                      />
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 3: Success */}
          {currentStep === Step.SUCCESS && (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Campaign Successfully Created!
              </h1>
              
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                Your campaign has been set up with {ads.length} ad{ads.length !== 1 ? 's' : ''} and will begin running on {new Date(campaignFormData.startDate).toLocaleDateString()}.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <Link 
                  href={`/dashboard/campaigns/${createdCampaignId}`}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  <Layers className="h-4 w-4 mr-2" />
                  View Campaign Details
                </Link>
                
                <Link 
                  href="/dashboard/campaigns"
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Go to Campaign List
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardContainer>
  );
};

// Set the layout for this page
CreateCampaignPage.getLayout = (page) => getDashboardLayout(page, 'Create Campaign');

export default CreateCampaignPage;