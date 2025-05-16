import React, { useState } from 'react';
import { AlertCircle } from 'react-feather';

interface SpaceFormProps {
  onSubmit: (spaceData: any) => void;
  isSubmitting: boolean;
  initialData?: any;
  editMode?: boolean;
}

const SpaceForm: React.FC<SpaceFormProps> = ({ 
  onSubmit, 
  isSubmitting, 
  initialData = {}, 
  editMode = false 
}) => {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    description: initialData.description || '',
    website: initialData.website || '',
    minBidPerImpression: initialData.minBidPerImpression || 5, // Default 5 sats
    minBidPerClick: initialData.minBidPerClick || 50, // Default 50 sats
    dimensions: initialData.dimensions || '300x250', // Default Medium Rectangle
    allowedAdTypes: initialData.allowedAdTypes || 'image,text',
    contentCategory: initialData.contentCategory || 'general',
    contentTags: initialData.contentTags || '',
  });

  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Convert numeric inputs to numbers
    const parsedValue = type === 'number' ? parseInt(value) : value;
    
    setFormData({
      ...formData,
      [name]: parsedValue
    });

    // Clear validation error when field is being edited
    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    // Required fields
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.website.trim()) errors.website = 'Website is required';
    if (!formData.dimensions.trim()) errors.dimensions = 'Dimensions are required';
    if (!formData.allowedAdTypes.trim()) errors.allowedAdTypes = 'At least one ad type must be selected';
    if (!formData.contentCategory.trim()) errors.contentCategory = 'Content category is required';
    
    // URL validation for website
    const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/;
    if (formData.website && !urlRegex.test(formData.website)) {
      errors.website = 'Please enter a valid website URL';
    }

    // Dimensions validation
    const dimensionsRegex = /^\d+x\d+$/;
    if (formData.dimensions && !dimensionsRegex.test(formData.dimensions)) {
      errors.dimensions = 'Dimensions must be in format WIDTHxHEIGHT (e.g., 300x250)';
    }

    // Numeric validations
    if (formData.minBidPerImpression <= 0) errors.minBidPerImpression = 'Minimum bid per impression must be greater than 0';
    if (formData.minBidPerClick <= 0) errors.minBidPerClick = 'Minimum bid per click must be greater than 0';
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  // Standard ad sizes
  const standardSizes = [
    { label: 'Medium Rectangle (300x250)', value: '300x250' },
    { label: 'Large Rectangle (336x280)', value: '336x280' },
    { label: 'Leaderboard (728x90)', value: '728x90' },
    { label: 'Mobile Banner (320x50)', value: '320x50' },
    { label: 'Wide Skyscraper (160x600)', value: '160x600' },
    { label: 'Square (250x250)', value: '250x250' },
    { label: 'Custom Size', value: 'custom' }
  ];

  // Content categories
  const contentCategories = [
    'general',
    'technology',
    'finance',
    'crypto',
    'gaming',
    'entertainment',
    'health',
    'education',
    'sports',
    'travel',
    'lifestyle',
    'business',
    'news',
    'other'
  ];

  const [customSize, setCustomSize] = useState(false);

  const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    
    if (value === 'custom') {
      setCustomSize(true);
      setFormData({
        ...formData,
        dimensions: ''
      });
    } else {
      setCustomSize(false);
      setFormData({
        ...formData,
        dimensions: value
      });
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
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ad Space Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`input-field w-full ${validationErrors.name ? 'border-red-500 dark:border-red-500' : ''}`}
                placeholder="Enter a name for your ad space"
              />
              {validationErrors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.name}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className={`input-field w-full ${validationErrors.description ? 'border-red-500 dark:border-red-500' : ''}`}
                placeholder="Describe your ad space and the type of content on your site"
              />
              {validationErrors.description && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.description}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Website URL *
              </label>
              <input
                type="text"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className={`input-field w-full ${validationErrors.website ? 'border-red-500 dark:border-red-500' : ''}`}
                placeholder="https://example.com"
              />
              {validationErrors.website && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.website}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Ad Space Configuration */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Ad Space Configuration</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="adSize" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ad Size *
              </label>
              <select
                id="adSize"
                value={customSize ? 'custom' : formData.dimensions}
                onChange={handleSizeChange}
                className="input-field w-full"
              >
                {standardSizes.map((size) => (
                  <option key={size.value} value={size.value}>
                    {size.label}
                  </option>
                ))}
              </select>
              
              {customSize && (
                <div className="mt-2">
                  <label htmlFor="dimensions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Custom Dimensions (WIDTHxHEIGHT) *
                  </label>
                  <input
                    type="text"
                    id="dimensions"
                    name="dimensions"
                    value={formData.dimensions}
                    onChange={handleChange}
                    className={`input-field w-full ${validationErrors.dimensions ? 'border-red-500 dark:border-red-500' : ''}`}
                    placeholder="e.g., 400x300"
                  />
                  {validationErrors.dimensions && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.dimensions}</p>
                  )}
                </div>
              )}
            </div>
            
            <div>
              <label htmlFor="allowedAdTypes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Allowed Ad Types *
              </label>
              <input
                type="text"
                id="allowedAdTypes"
                name="allowedAdTypes"
                value={formData.allowedAdTypes}
                onChange={handleChange}
                className={`input-field w-full ${validationErrors.allowedAdTypes ? 'border-red-500 dark:border-red-500' : ''}`}
                placeholder="e.g., image,text,video"
              />
              {validationErrors.allowedAdTypes && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.allowedAdTypes}</p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Comma-separated list of allowed ad types (image, text, video)
              </p>
            </div>
          </div>
        </div>
        
        {/* Content & Pricing */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Content & Pricing</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="contentCategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Content Category *
              </label>
              <select
                id="contentCategory"
                name="contentCategory"
                value={formData.contentCategory}
                onChange={handleChange}
                className={`input-field w-full ${validationErrors.contentCategory ? 'border-red-500 dark:border-red-500' : ''}`}
              >
                {contentCategories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
              {validationErrors.contentCategory && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.contentCategory}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="contentTags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Content Tags (Optional)
              </label>
              <input
                type="text"
                id="contentTags"
                name="contentTags"
                value={formData.contentTags}
                onChange={handleChange}
                className="input-field w-full"
                placeholder="e.g., bitcoin, programming, news"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Comma-separated tags to help advertisers find your space
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="minBidPerImpression" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Min Bid per Impression (satoshis) *
                </label>
                <input
                  type="number"
                  id="minBidPerImpression"
                  name="minBidPerImpression"
                  min="1"
                  value={formData.minBidPerImpression}
                  onChange={handleChange}
                  className={`input-field w-full ${validationErrors.minBidPerImpression ? 'border-red-500 dark:border-red-500' : ''}`}
                />
                {validationErrors.minBidPerImpression && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.minBidPerImpression}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="minBidPerClick" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Min Bid per Click (satoshis) *
                </label>
                <input
                  type="number"
                  id="minBidPerClick"
                  name="minBidPerClick"
                  min="1"
                  value={formData.minBidPerClick}
                  onChange={handleChange}
                  className={`input-field w-full ${validationErrors.minBidPerClick ? 'border-red-500 dark:border-red-500' : ''}`}
                />
                {validationErrors.minBidPerClick && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationErrors.minBidPerClick}</p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Integration Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-blue-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Integration Information
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                <p>
                  After creating your ad space, you'll receive an integration code that you can add to your website. This code will load ads that match your criteria and generate revenue for you.
                </p>
              </div>
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
              `${editMode ? 'Update' : 'Create'} Ad Space`
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default SpaceForm;
