import { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { ArrowLeft, AlertCircle, CheckCircle, Image as ImageIcon, Link as LinkIcon, Target, DollarSign } from 'react-feather';

import.*./components/layout/DashboardLayout';

interface FormData {
  title: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
  urlParameters: string;
  bidPerImpression: number;
  bidPerClick: number;
  freqCapViews: number;
  freqCapHours: number;
  targetLocation: string;
  targetInterests: string;
  targetAge: string;
}

interface Campaign {
  id: string;
  name: string;
  description: string;
  status: string;
  budget: number;
  startDate: string;
  endDate: string | null;
}

const CreateAdPage: NextPage = () => {
  const router = useRouter();
  const { id: campaignId } = router.query;
  
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    imageUrl: '',
    targetUrl: '',
    urlParameters: '',
    bidPerImpression: 100,
    bidPerClick: 500,
    freqCapViews: 2,
    freqCapHours: 24,
    targetLocation: '',
    targetInterests: '',
    targetAge: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Fetch campaign data when page loads
  useEffect(() => {
    if (campaignId) {
      fetchCampaign();
    }
  }, [campaignId]);

  const fetchCampaign = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch campaign');
      }
      
      const data = await response.json();
      setCampaign(data);
    } catch (err) {
      console.logger.error('Error fetching campaign:', err);
      setError('Could not load campaign details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle numerical inputs
    if (['bidPerImpression', 'bidPerClick', 'freqCapViews', 'freqCapHours'].includes(name)) {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 0,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // Validation
      if (!formData.title || !formData.description || !formData.targetUrl) {
        throw new Error('Please fill in all required fields.');
      }

      // Ensure bid values are valid
      if (formData.bidPerImpression <= 0) {
        throw new Error('Bid per impression must be greater than zero.');
      }

      if (formData.bidPerClick <= 0) {
        throw new Error('Bid per click must be greater than zero.');
      }

      // Format the data for the API
      const apiData = {
        ...formData,
        // Convert empty strings to null for optional fields
        imageUrl: formData.imageUrl || null,
        urlParameters: formData.urlParameters || null,
        targetLocation: formData.targetLocation || null,
        targetInterests: formData.targetInterests 
          ? formData.targetInterests.split(',').map(t => t.trim()) 
          : null,
        targetAge: formData.targetAge || null,
      };

      // Send to the API
      const response = await fetch(`/api/campaigns/${campaignId}/ads`, {
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
      
      // Show success state
      setSuccess(true);
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push(`/dashboard/advertiser/campaigns/${campaignId}`);
      }, 1500);
    } catch (err) {
      console.logger.error('Error creating ad:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    router.push(`/dashboard/advertiser/campaigns/${campaignId}`);
  };

  return (
    <DashboardLayout title="Create Ad" role="advertiser">
      <div className="container mx-auto max-w-3xl px-4 py-6">
        <div className="mb-6">
          <button
            onClick={goBack}
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Campaign
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          {campaign && (
            <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-100 dark:border-orange-900/30">
              <h2 className="text-lg font-semibold text-orange-800 dark:text-orange-400 mb-1">
                Creating Ad for Campaign:
              </h2>
              <p className="text-orange-700 dark:text-orange-300">
                {campaign.name}
              </p>
            </div>
          )}

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Create a New Ad
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Design your ad to engage your target audience across the Nostr network.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 rounded-lg flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 rounded-lg flex items-start">
              <CheckCircle className="h-5 w-5 mr-2 mt-0.5 shrink-0" />
              <span>Ad created successfully! Redirecting...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Ad Content Section */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <ImageIcon className="h-5 w-5 mr-2 text-orange-500" />
                Ad Content
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ad Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                    placeholder="e.g., Experience Lightning Fast Bitcoin Payments"
                    required
                    maxLength={80}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Maximum 80 characters. Currently: {formData.title.length}/80
                  </p>
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ad Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                    placeholder="Describe your product or service in a compelling way..."
                    required
                    maxLength={256}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Maximum 256 characters. Currently: {formData.description.length}/256
                  </p>
                </div>
                
                <div>
                  <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Image URL <span className="text-gray-500 text-xs">(optional)</span>
                  </label>
                  <input
                    type="url"
                    id="imageUrl"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Use a 16:9 or square image for best results. Recommended size: 1200x675px.
                  </p>
                </div>
              </div>
            </div>

            {/* Ad Link Section */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <LinkIcon className="h-5 w-5 mr-2 text-orange-500" />
                Ad Link
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="targetUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Target URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    id="targetUrl"
                    name="targetUrl"
                    value={formData.targetUrl}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                    placeholder="https://example.com/landing-page"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="urlParameters" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    URL Parameters <span className="text-gray-500 text-xs">(optional)</span>
                  </label>
                  <input
                    type="text"
                    id="urlParameters"
                    name="urlParameters"
                    value={formData.urlParameters}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                    placeholder="utm_source=nostr&utm_medium=ad&utm_campaign=summer2023"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Add tracking parameters to your URL. These will be appended automatically.
                  </p>
                </div>
              </div>
            </div>

            {/* Bid & Budget Section */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-orange-500" />
                Bidding & Budget
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="bidPerImpression" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bid per Impression <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="number"
                      id="bidPerImpression"
                      name="bidPerImpression"
                      value={formData.bidPerImpression}
                      onChange={handleChange}
                      min="10"
                      step="10"
                      className="focus:ring-orange-500 focus:border-orange-500 block w-full pr-12 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400 sm:text-sm">sats</span>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Minimum 10 sats per 1000 impressions
                  </p>
                </div>
                
                <div>
                  <label htmlFor="bidPerClick" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bid per Click <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="number"
                      id="bidPerClick"
                      name="bidPerClick"
                      value={formData.bidPerClick}
                      onChange={handleChange}
                      min="100"
                      step="50"
                      className="focus:ring-orange-500 focus:border-orange-500 block w-full pr-12 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400 sm:text-sm">sats</span>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Minimum 100 sats per click
                  </p>
                </div>
              </div>
              
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Frequency Capping
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="freqCapViews" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Maximum Views per User
                    </label>
                    <input
                      type="number"
                      id="freqCapViews"
                      name="freqCapViews"
                      value={formData.freqCapViews}
                      onChange={handleChange}
                      min="1"
                      max="10"
                      className="focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="freqCapHours" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Time Period (hours)
                    </label>
                    <input
                      type="number"
                      id="freqCapHours"
                      name="freqCapHours"
                      value={formData.freqCapHours}
                      onChange={handleChange}
                      min="1"
                      max="168"
                      className="focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                    />
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Limit how many times a user sees your ad within a specific time period.
                </p>
              </div>
            </div>
            
            {/* Ad Targeting Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Target className="h-5 w-5 mr-2 text-orange-500" />
                Ad-Specific Targeting <span className="text-gray-500 text-xs ml-2">(optional)</span>
              </h2>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                These settings override campaign-level targeting for this specific ad. Leave blank to use campaign targeting.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="targetLocation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Target Location
                  </label>
                  <input
                    type="text"
                    id="targetLocation"
                    name="targetLocation"
                    value={formData.targetLocation}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                    placeholder="e.g., North America, Europe, Global"
                  />
                </div>
                
                <div>
                  <label htmlFor="targetInterests" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Target Interests
                  </label>
                  <input
                    type="text"
                    id="targetInterests"
                    name="targetInterests"
                    value={formData.targetInterests}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                    placeholder="e.g., bitcoin, cryptocurrency, technology (comma separated)"
                  />
                </div>
                
                <div>
                  <label htmlFor="targetAge" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Target Age Range
                  </label>
                  <select
                    id="targetAge"
                    name="targetAge"
                    value={formData.targetAge}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                  >
                    <option value="">Use campaign targeting</option>
                    <option value="18-24">18-24</option>
                    <option value="25-34">25-34</option>
                    <option value="35-44">35-44</option>
                    <option value="45-54">45-54</option>
                    <option value="55+">55+</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={goBack}
                className="mr-4 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || success}
                className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 flex items-center ${
                  (isSubmitting || success) ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Created!
                  </>
                ) : (
                  'Create Ad'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateAdPage;