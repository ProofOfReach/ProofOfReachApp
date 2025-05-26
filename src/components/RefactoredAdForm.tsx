import React, { useState, useEffect } from 'react';
import { AlertCircle, Info, Check, RefreshCw, DollarSign } from 'react-feather';
import LightningWalletBalance from './LightningWalletBalance';
import Tooltip from './ui/Tooltip';

// Import shadcn/ui components
import { Button } from './ui/Button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectOption } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { 
  Form, 
  FormField, 
  FormItem,
  FormLabel, 
  FormDescription, 
  FormMessage 
} from './ui/form';
// Using the existing Card component to avoid case sensitivity issues
import Card from './ui/Card';
import { Label } from './ui/label';

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

const RefactoredAdForm: React.FC<AdFormProps> = ({ 
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
    if (typeof (formData?.budget ?? 0) !== 'number' || (formData?.budget ?? 0) <= 0) errors.budget = 'Total budget is required and must be greater than 0';
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
    <Form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Basic Information</h3>
          
          <div className="space-y-4">
            <FormField>
              <FormItem>
                <FormLabel required={true}>Advertiser Name</FormLabel>
                <Input
                  id="advertiserName"
                  name="advertiserName"
                  value={formData.advertiserName}
                  onChange={handleChange}
                  error={!!validationErrors.advertiserName}
                  placeholder="Enter your company or brand name"
                />
                {validationErrors.advertiserName && (
                  <FormMessage>{validationErrors.advertiserName}</FormMessage>
                )}
              </FormItem>
            </FormField>
            
            <FormField>
              <FormItem>
                <FormLabel required={true}>Ad Title</FormLabel>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  error={!!validationErrors.title}
                  placeholder="Enter a descriptive title for your ad"
                />
                {validationErrors.title && (
                  <FormMessage>{validationErrors.title}</FormMessage>
                )}
              </FormItem>
            </FormField>
            
            <FormField>
              <FormItem>
                <FormLabel required={true}>Ad Description</FormLabel>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  error={!!validationErrors.description}
                  placeholder="Describe your ad in detail"
                />
                {validationErrors.description && (
                  <FormMessage>{validationErrors.description}</FormMessage>
                )}
              </FormItem>
            </FormField>
            
            <FormField>
              <FormItem>
                <FormLabel required={true}>Final Destination URL</FormLabel>
                <Input
                  id="finalDestinationUrl"
                  name="finalDestinationUrl"
                  value={formData.finalDestinationUrl}
                  onChange={handleChange}
                  error={!!validationErrors.finalDestinationUrl}
                  placeholder="https://example.com"
                />
                {validationErrors.finalDestinationUrl && (
                  <FormMessage>{validationErrors.finalDestinationUrl}</FormMessage>
                )}
                <FormDescription>
                  The page where users will land after clicking your ad
                </FormDescription>
              </FormItem>
            </FormField>
            
            <FormField>
              <FormItem>
                <FormLabel>URL Parameters (Optional)</FormLabel>
                <Input
                  id="urlParameters"
                  name="urlParameters"
                  value={formData.urlParameters}
                  onChange={handleChange}
                  error={!!validationErrors.urlParameters}
                  placeholder="utm_source=nostr&utm_medium=ad"
                />
                {validationErrors.urlParameters && (
                  <FormMessage>{validationErrors.urlParameters}</FormMessage>
                )}
                <FormDescription>
                  Add tracking parameters that will be appended to your URL (e.g., utm_source=nostr&utm_campaign=spring)
                </FormDescription>
              </FormItem>
            </FormField>
            
            <FormField>
              <FormItem>
                <FormLabel>Image URL (Optional)</FormLabel>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  error={!!validationErrors.imageUrl}
                  placeholder="https://example.com/image.jpg"
                />
                {validationErrors.imageUrl && (
                  <FormMessage>{validationErrors.imageUrl}</FormMessage>
                )}
                <FormDescription>
                  Add an image URL for your ad (recommended size: 600x400px)
                </FormDescription>
              </FormItem>
            </FormField>
          </div>
        </div>
        
        {/* Budget Settings */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Budget & Bidding</h3>
          
          <div className="space-y-4">
            {/* Wallet Balance Display */}
            <div className="mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md flex items-center">
                <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="font-medium text-gray-800 dark:text-gray-200">
                    Current Balance: {userBalance.toLocaleString()} sats
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Available for campaign funding
                  </div>
                </div>
              </div>
            </div>
          
            {/* Budget Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField>
                <FormItem>
                  <FormLabel required={true}>Total Budget (satoshis)</FormLabel>
                  <Input
                    type="number"
                    id="budget"
                    name="budget"
                    min="1"
                    value={formData?.budget ?? 0}
                    onChange={handleChange}
                    error={!!validationErrors?.budget ?? 0}
                  />
                  {validationErrors?.budget ?? 0 && (
                    <FormMessage>{validationErrors?.budget ?? 0}</FormMessage>
                  )}
                </FormItem>
              </FormField>
              
              <FormField>
                <FormItem>
                  <FormLabel required={true}>Daily Budget (satoshis)</FormLabel>
                  <Input
                    type="number"
                    id="dailyBudget"
                    name="dailyBudget"
                    min="1"
                    value={formData.dailyBudget}
                    onChange={handleChange}
                    error={!!validationErrors.dailyBudget}
                  />
                  {validationErrors.dailyBudget && (
                    <FormMessage>{validationErrors.dailyBudget}</FormMessage>
                  )}
                </FormItem>
              </FormField>
            </div>
            
            {/* Bidding Strategy */}
            <div>
              <div className="mb-3 flex items-center">
                <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  Bidding Strategy
                </h3>
                <Tooltip 
                  text={
                    <div>
                      <p className="font-medium mb-1">Bidding Strategy</p>
                      <p>Choose whether to pay per impression (CPM) or per click (CPC). You must select at least one.</p>
                    </div>
                  }
                  width="wide"
                  className="ml-1"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField>
                  <FormItem>
                    <FormLabel>Cost Per Mille (CPM)</FormLabel>
                    <div className="relative">
                      <Input
                        type="number"
                        id="bidPerImpression"
                        name="bidPerImpression"
                        min="0"
                        value={formData.bidPerImpression}
                        onChange={handleChange}
                        error={!!validationErrors.bidPerImpression}
                        className="pl-8"
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="text-gray-500 dark:text-gray-400">₿</span>
                      </div>
                    </div>
                    {validationErrors.bidPerImpression && (
                      <FormMessage>{validationErrors.bidPerImpression}</FormMessage>
                    )}
                    <FormDescription>
                      Cost per 1,000 impressions (views)
                    </FormDescription>
                  </FormItem>
                </FormField>
                
                <FormField>
                  <FormItem>
                    <FormLabel>Cost Per Click (CPC)</FormLabel>
                    <div className="relative">
                      <Input
                        type="number"
                        id="bidPerClick"
                        name="bidPerClick"
                        min="0"
                        value={formData.bidPerClick}
                        onChange={handleChange}
                        error={!!validationErrors.bidPerClick}
                        className="pl-8"
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="text-gray-500 dark:text-gray-400">₿</span>
                      </div>
                    </div>
                    {validationErrors.bidPerClick && (
                      <FormMessage>{validationErrors.bidPerClick}</FormMessage>
                    )}
                    <FormDescription>
                      Cost per click on your ad
                    </FormDescription>
                  </FormItem>
                </FormField>
              </div>
            </div>
            
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
                <FormField>
                  <FormItem>
                    <FormLabel>Maximum Views Per User</FormLabel>
                    <Input
                      type="number"
                      id="freqCapViews"
                      name="freqCapViews"
                      min="1"
                      value={formData.freqCapViews}
                      onChange={handleChange}
                      error={!!validationErrors.freqCapViews}
                    />
                    {validationErrors.freqCapViews && (
                      <FormMessage>{validationErrors.freqCapViews}</FormMessage>
                    )}
                  </FormItem>
                </FormField>
                
                <FormField>
                  <FormItem>
                    <FormLabel>Time Period (Hours)</FormLabel>
                    <Input
                      type="number"
                      id="freqCapHours"
                      name="freqCapHours"
                      min="1"
                      value={formData.freqCapHours}
                      onChange={handleChange}
                      error={!!validationErrors.freqCapHours}
                    />
                    {validationErrors.freqCapHours && (
                      <FormMessage>{validationErrors.freqCapHours}</FormMessage>
                    )}
                  </FormItem>
                </FormField>
              </div>
            </div>
          </div>
        </div>
        
        {/* Ad Spaces */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Target Ad Spaces</h3>
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={fetchAdSpaces}
              disabled={isLoadingAdSpaces}
              size="sm"
            >
              {isLoadingAdSpaces ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </>
              )}
            </Button>
          </div>
          
          {adSpacesError && (
            <div className="p-3 mb-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <p className="text-sm">{adSpacesError}</p>
            </div>
          )}
          
          {isLoadingAdSpaces ? (
            <div className="flex justify-center items-center p-8">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : availableAdSpaces && availableAdSpaces.length > 0 ? (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Select the ad spaces where you want your ad to appear:
              </p>
              
              <div className="max-h-60 overflow-y-auto space-y-2">
                {availableAdSpaces.map((space) => (
                  <label 
                    key={space.id} 
                    className="flex items-center justify-between p-2 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-center">
                      <Checkbox
                        id={`space-${space.id}`}
                        checked={formData.targetedAdSpaces.includes(space.id)}
                        onChange={() => handleAdSpaceToggle(space.id)}
                      />
                      <div className="ml-2">
                        <div className="font-medium text-gray-900 dark:text-white text-sm">{space.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{space.description}</div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{space.dimensions}</span>
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
              <p className="text-gray-600 dark:text-gray-400 text-sm text-center">
                No ad spaces available at this time. Please check back later.
              </p>
            </div>
          )}
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
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
              editMode ? 'Save Changes' : 'Create Ad'
            )}
          </Button>
        </div>
      </div>
    </Form>
  );
};

export default RefactoredAdForm;