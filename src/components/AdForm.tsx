import React, { useState, useEffect } from 'react';
import { AlertCircle, Info, Check, RefreshCw, DollarSign } from 'react-feather';
import LightningWalletBalance from './LightningWalletBalance';
import Tooltip from './ui/Tooltip';

interface AdSpace {
  id: string;
  name: string;
  description: string;
  website: string;
  dimensions: string;
}

interface AdFormProps {
  onSubmit: (adData: any) => void;
  isSubmitting: boolean;
  initialData?: any;
  editMode?: boolean;
  userBalance?: number;
}

const AdForm: React.FC<AdFormProps> = ({ 
  onSubmit, 
  isSubmitting, 
  initialData = {}, 
  editMode = false,
  userBalance = 0
}) => {
  const [formData, setFormData] = useState({
    advertiserName: initialData.advertiserName || '',
    title: initialData.title || '',
    description: initialData.description || '',
    imageUrl: initialData.imageUrl || '',
    finalDestinationUrl: initialData.finalDestinationUrl || initialData.targetUrl || '',
    urlParameters: initialData.urlParameters || '',
    budget: initialData?.budget ?? 0 || 10000, // Default 10,000 sats
    dailyBudget: initialData.dailyBudget || 1000, // Default 1,000 sats
    bidPerImpression: initialData.bidPerImpression || initialData.bidPerImpression === 0 ? 0 : 10, // Default 10 sats
    bidPerClick: initialData.bidPerClick || initialData.bidPerClick === 0 ? 0 : 0, // Default to 0, user must choose one
    freqCapViews: initialData.freqCapViews || 2, // Default 2 views per user
    freqCapHours: initialData.freqCapHours || 24, // Default 24 hours
    targetLocation: initialData.targetLocation || '',
    targetInterests: initialData.targetInterests || '',
    targetAge: initialData.targetAge || '',
    targetedAdSpaces: initialData.targetedAdSpaces || []
  });

  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [availableAdSpaces, setAvailableAdSpaces] = useState<AdSpace[]>([]);
  const [isLoadingAdSpaces, setIsLoadingAdSpaces] = useState(false);
  const [adSpacesError, setAdSpacesError] = useState('');
  
  // Fetch ad spaces when component mounts
  useEffect(() => {
    fetchAdSpaces();
  }, []);
  
  // Function to fetch available ad spaces from the API
  const fetchAdSpaces = async () => {
    setIsLoadingAdSpaces(true);
    setAdSpacesError('');
    
    try {
      // Use the new query parameter to get all spaces
      const response = await fetch('/api/spaces?all=true');
      if (!response.ok) {
        throw new Error('Failed to fetch ad spaces');
      }
      
      const data = await response.json();
      setAvailableAdSpaces(data);
    } catch (error) {
      console.log('Error fetching ad spaces:', error);
      setAdSpacesError('Could not load available ad spaces. Please try again later.');
    } finally {
      setIsLoadingAdSpaces(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Convert numeric inputs to numbers
    const parsedValue = type === 'number' ? parseInt(value) : value;
    
    // Special logic for CPM and CPC (bidPerImpression and bidPerClick)
    const updatedFormData = { ...formData, [name]: parsedValue };
    
    // If setting bidPerImpression (CPM) to a value greater than 0, set bidPerClick (CPC) to 0
    if (name === 'bidPerImpression' && typeof parsedValue === 'number' && parsedValue > 0) {
      updatedFormData.bidPerClick = 0;
    }
    
    // If setting bidPerClick (CPC) to a value greater than 0, set bidPerImpression (CPM) to 0
    if (name === 'bidPerClick' && typeof parsedValue === 'number' && parsedValue > 0) {
      updatedFormData.bidPerImpression = 0;
    }
    
    setFormData(updatedFormData);

    // Clear validation error when field is being edited
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: ''
      });
    }
  };
  
  // Handle toggling ad space selection
  const handleAdSpaceToggle = (spaceId: string) => {
    // Check if the ad space is already selected
    const isSelected = formData.targetedAdSpaces.includes(spaceId);
    
    // Update the targetedAdSpaces array
    if (isSelected) {
      // Remove the space if it's already selected
      setFormData({
        ...formData,
        targetedAdSpaces: formData.targetedAdSpaces.filter((id: string) => id !== spaceId)
      });
    } else {
      // Add the space if it's not already selected
      setFormData({
        ...formData,
        targetedAdSpaces: [...formData.targetedAdSpaces, spaceId]
      });
    }
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    // Required fields
    if (!formData.advertiserName.trim()) errors.advertiserName = 'Advertiser Name is required';
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.finalDestinationUrl?.trim()) errors.finalDestinationUrl = 'Final Destination URL is required';
    
    // Required budget fields (with type checking)
    if (typeof formData?.budget ?? 0 !== 'number' || formData?.budget ?? 0 <= 0) errors?.budget ?? 0 = 'Total budget is required and must be greater than 0';
    if (typeof formData.dailyBudget !== 'number' || formData.dailyBudget <= 0) errors.dailyBudget = 'Daily budget is required and must be greater than 0';
    
    // CPM or CPC validation - at least one must be greater than 0
    const hasCPM = typeof formData.bidPerImpression === 'number' && formData.bidPerImpression > 0;
    const hasCPC = typeof formData.bidPerClick === 'number' && formData.bidPerClick > 0;
    
    if (!hasCPM && !hasCPC) {
      errors.bidPerImpression = 'Either CPM or CPC must be set';
      errors.bidPerClick = 'Either CPM or CPC must be set';
    }
    
    // URL validation for finalDestinationUrl
    const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/;
    if (formData.finalDestinationUrl && !urlRegex.test(formData.finalDestinationUrl)) {
      errors.finalDestinationUrl = 'Please enter a valid URL';
    }

    // Image URL validation if provided
    const imageUrlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?(\.jpg|\.jpeg|\.png|\.gif)$/i;
    if (formData.imageUrl && !imageUrlRegex.test(formData.imageUrl)) {
      errors.imageUrl = 'Please enter a valid image URL ending with .jpg, .jpeg, .png, or .gif';
    }
    
    // URL parameters validation (only validate format if provided)
    // Make sure user doesn't input a leading ? (we'll add it when needed)
    if (formData.urlParameters) {
      if (formData.urlParameters.startsWith('?')) {
        errors.urlParameters = 'Please enter parameters without the leading ? character';
      } else if (!/^([\w-]+=[\w%+.=-]*)(&[\w-]+=[\w%+.=-]*)*$/.test(formData.urlParameters)) {
        errors.urlParameters = 'Please enter valid URL parameters (e.g., "utm_source=nostr&utm_medium=ad")';
      }
    }
    
    // Validate CPM and CPC only if they are being used
    if (hasCPM && (typeof formData.bidPerImpression !== 'number' || formData.bidPerImpression <= 0)) {
      errors.bidPerImpression = 'CPM must be greater than 0';
    }
    
    if (hasCPC && (typeof formData.bidPerClick !== 'number' || formData.bidPerClick <= 0)) {
      errors.bidPerClick = 'CPC must be greater than 0';
    }
    
    // Daily budget cannot exceed total budget (with type check)
    if (typeof formData.dailyBudget === 'number' && 
        typeof formData?.budget ?? 0 === 'number' && 
        formData.dailyBudget > formData?.budget ?? 0) {
      errors.dailyBudget = 'Daily budget cannot exceed total budget';
    }
    
    // Frequency capping validation
    if (typeof formData.freqCapViews !== 'number' || formData.freqCapViews < 1) {
      errors.freqCapViews = 'Frequency cap views must be at least 1';
    }
    
    if (typeof formData.freqCapHours !== 'number' || formData.freqCapHours < 1) {
      errors.freqCapHours = 'Frequency cap time period must be at least 1 hour';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Basic Information</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="advertiserName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Advertiser Name *
              </label>
              <input
                type="text"
                id="advertiserName"
                name="advertiserName"
                value={formData.advertiserName}
                onChange={handleChange}
                className={`input-field w-full ${validationErrors.advertiserName ? 'border-red-500 dark:border-red-500' : ''}`}
                placeholder="Enter your company or brand name"
              />
              {validationErrors.advertiserName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.advertiserName}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ad Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`input-field w-full ${validationErrors.title ? 'border-red-500 dark:border-red-500' : ''}`}
                placeholder="Enter a descriptive title for your ad"
              />
              {validationErrors.title && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.title}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ad Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className={`input-field w-full ${validationErrors.description ? 'border-red-500 dark:border-red-500' : ''}`}
                placeholder="Describe your ad in detail"
              />
              {validationErrors.description && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.description}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="finalDestinationUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Final Destination URL *
              </label>
              <input
                type="text"
                id="finalDestinationUrl"
                name="finalDestinationUrl"
                value={formData.finalDestinationUrl}
                onChange={handleChange}
                className={`input-field w-full ${validationErrors.finalDestinationUrl ? 'border-red-500 dark:border-red-500' : ''}`}
                placeholder="https://example.com"
              />
              {validationErrors.finalDestinationUrl && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.finalDestinationUrl}</p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                The page where users will land after clicking your ad
              </p>
            </div>
            
            <div>
              <label htmlFor="urlParameters" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                URL Parameters (Optional)
              </label>
              <input
                type="text"
                id="urlParameters"
                name="urlParameters"
                value={formData.urlParameters}
                onChange={handleChange}
                className={`input-field w-full ${validationErrors.urlParameters ? 'border-red-500 dark:border-red-500' : ''}`}
                placeholder="utm_source=nostr&utm_medium=ad"
              />
              {validationErrors.urlParameters && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.urlParameters}</p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Add tracking parameters that will be appended to your URL (e.g., utm_source=nostr&utm_campaign=spring)
              </p>
            </div>
            
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Image URL (Optional)
              </label>
              <input
                type="text"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                className={`input-field w-full ${validationErrors.imageUrl ? 'border-red-500 dark:border-red-500' : ''}`}
                placeholder="https://example.com/image.jpg"
              />
              {validationErrors.imageUrl && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.imageUrl}</p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Add an image URL for your ad (recommended size: 600x400px)
              </p>
            </div>
          </div>
        </div>
        
        {/* Budget Settings */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Budget & Bidding</h3>
          
          <div className="space-y-4">
            {/* Frequency Capping */}
            <div>
              <div className="mb-3 flex items-center">
                <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  Frequency Capping
                </h3>
                <Tooltip 
                  text={
                    <div>
                      <p className="font-medium mb-1">Frequency Capping</p>
                      <p>Limit how often the same user sees your ad to prevent ad fatigue and improve campaign effectiveness.</p>
                    </div>
                  }
                  width="wide"
                  className="ml-1"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="freqCapViews" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Maximum Views Per User
                  </label>
                  <input
                    type="number"
                    id="freqCapViews"
                    name="freqCapViews"
                    min="1"
                    value={formData.freqCapViews}
                    onChange={handleChange}
                    className={`input-field w-full ${validationErrors.freqCapViews ? 'border-red-500 dark:border-red-500' : ''}`}
                  />
                  {validationErrors.freqCapViews && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.freqCapViews}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="freqCapHours" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Time Period (hours)
                  </label>
                  <input
                    type="number"
                    id="freqCapHours"
                    name="freqCapHours"
                    min="1"
                    max="168"
                    value={formData.freqCapHours}
                    onChange={handleChange}
                    className={`input-field w-full ${validationErrors.freqCapHours ? 'border-red-500 dark:border-red-500' : ''}`}
                  />
                  {validationErrors.freqCapHours && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.freqCapHours}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Default: 2 views every 24 hours per user
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Total Budget (satoshis) *
              </label>
              
              {/* Current Wallet Balance Display */}
              <LightningWalletBalance 
                compact={true} 
                displayBefore="Available: " 
                className="mb-2"
              />
              
              <input
                type="number"
                id="budget"
                name="budget"
                min="1"
                value={formData?.budget ?? 0}
                onChange={handleChange}
                className={`input-field w-full ${validationErrors?.budget ?? 0 ? 'border-red-500 dark:border-red-500' : ''}`}
              />
              {validationErrors?.budget ?? 0 && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors?.budget ?? 0}</p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Total amount you want to spend on this ad campaign (in satoshis)
              </p>
            </div>
            
            <div>
              <label htmlFor="dailyBudget" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Daily Budget (satoshis) *
              </label>
              <input
                type="number"
                id="dailyBudget"
                name="dailyBudget"
                min="1"
                value={formData.dailyBudget}
                onChange={handleChange}
                className={`input-field w-full ${validationErrors.dailyBudget ? 'border-red-500 dark:border-red-500' : ''}`}
              />
              {validationErrors.dailyBudget && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.dailyBudget}</p>
              )}
            </div>
            
            {/* CPM/CPC Explanation */}
            <div className="mb-3">
              <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200 flex items-center">
                Pricing Model: Choose CPM or CPC
                <Tooltip 
                  text={
                    <div>
                      <p className="font-medium mb-1">Pricing Models</p>
                      <p className="mb-1"><span className="font-medium">CPM (Cost per Mille):</span> Pay for every 1,000 ad impressions. Best for brand awareness campaigns.</p>
                      <p className="mb-1"><span className="font-medium">CPC (Cost per Click):</span> Pay only when users click your ad. Best for conversion-focused campaigns.</p>
                      <p className="mt-1">Note: You can only use one pricing model per ad. Both fields are mutually exclusive.</p>
                    </div>
                  }
                  width="wide"
                  className="ml-1"
                />
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="bidPerImpression" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  CPM (Cost per Mille/1000 Impressions) *
                </label>
                <input
                  type="number"
                  id="bidPerImpression"
                  name="bidPerImpression"
                  min="0"
                  value={formData.bidPerImpression}
                  onChange={handleChange}
                  disabled={typeof formData.bidPerClick === 'number' && formData.bidPerClick > 0}
                  className={`input-field w-full ${validationErrors.bidPerImpression ? 'border-red-500 dark:border-red-500' : ''} ${typeof formData.bidPerClick === 'number' && formData.bidPerClick > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                {validationErrors.bidPerImpression && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.bidPerImpression}</p>
                )}
                {typeof formData.bidPerClick === 'number' && formData.bidPerClick > 0 && (
                  <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">CPC is currently active. Clear CPC to use CPM.</p>
                )}
              </div>
              
              <div>
                <label htmlFor="bidPerClick" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  CPC (Cost per Click) *
                </label>
                <input
                  type="number"
                  id="bidPerClick"
                  name="bidPerClick"
                  min="0"
                  value={formData.bidPerClick}
                  onChange={handleChange}
                  disabled={typeof formData.bidPerImpression === 'number' && formData.bidPerImpression > 0}
                  className={`input-field w-full ${validationErrors.bidPerClick ? 'border-red-500 dark:border-red-500' : ''} ${typeof formData.bidPerImpression === 'number' && formData.bidPerImpression > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                {validationErrors.bidPerClick && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.bidPerClick}</p>
                )}
                {typeof formData.bidPerImpression === 'number' && formData.bidPerImpression > 0 && (
                  <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">CPM is currently active. Clear CPM to use CPC.</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Targeting Options */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Targeting Options</h3>
          
          <div className="mb-4">
            <div className="flex items-center">
              <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">
                Targeting Options
              </h3>
              <Tooltip 
                text={
                  <div>
                    <p className="font-medium mb-1">Limited Targeting in MVP</p>
                    <p>The targeting options below are basic in this MVP version. More sophisticated targeting will be available in future updates.</p>
                  </div>
                }
                width="wide"
                className="ml-1"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Ad Spaces Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Target Ad Spaces
              </label>
              
              {isLoadingAdSpaces ? (
                <div className="animate-pulse space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  ))}
                </div>
              ) : adSpacesError ? (
                <div className="p-3 border border-red-200 dark:border-red-800 rounded-md">
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {adSpacesError}
                  </p>
                  <button
                    type="button"
                    onClick={fetchAdSpaces}
                    className="mt-2 text-sm text-purple-600 dark:text-purple-400 flex items-center"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" /> Retry
                  </button>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-3">
                  {availableAdSpaces.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No ad spaces available. Default will be "All Inventory".
                    </p>
                  ) : (
                    <>
                      <div className="mb-3">
                        <label className="flex items-center p-2 border border-gray-200 dark:border-gray-700 rounded-md mb-2 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <input
                            type="checkbox"
                            checked={formData.targetedAdSpaces.length === 0}
                            onChange={() => setFormData({...formData, targetedAdSpaces: []})}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-gray-700 dark:text-gray-300">All Inventory (Default)</span>
                        </label>
                      </div>
                      
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {availableAdSpaces.map((space) => (
                          <label 
                            key={space.id} 
                            className="flex items-center justify-between p-2 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.targetedAdSpaces.includes(space.id)}
                                onChange={() => handleAdSpaceToggle(space.id)}
                                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-gray-700 dark:text-gray-300">{space.name}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {space.description ? space.description.substring(0, 30) + '...' : 'No description'}
                              </div>
                              <div className="text-xs text-right font-medium text-blue-500 dark:text-blue-400">
                                {space.website}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Select specific ad spaces for your ad to appear in, or choose "All Inventory" to display everywhere
              </p>
            </div>
            
            <div>
              <label htmlFor="targetLocation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Target Location (Optional)
              </label>
              <input
                type="text"
                id="targetLocation"
                name="targetLocation"
                value={formData.targetLocation}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="e.g., US, Europe, Global"
              />
            </div>
            
            <div>
              <label htmlFor="targetInterests" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Target Interests (Optional)
              </label>
              <input
                type="text"
                id="targetInterests"
                name="targetInterests"
                value={formData.targetInterests}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="e.g., crypto, technology, finance"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Comma-separated list of interests to target
              </p>
            </div>
            
            <div>
              <label htmlFor="targetAge" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Target Age Range (Optional)
              </label>
              <input
                type="text"
                id="targetAge"
                name="targetAge"
                value={formData.targetAge}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="e.g., 18-35, 25-54"
              />
            </div>
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`btn-primary ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              `${editMode ? 'Update' : 'Create'} Ad`
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default AdForm;
