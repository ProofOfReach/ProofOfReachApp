import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import DashboardLayout from '../../../../../components/layout/DashboardLayout';
import { useRole } from '../../../../../context/RoleContext';
import { Monitor, MessageSquare, Code, ArrowLeft, Save } from 'react-feather';
import { useAuth } from '../../../../../hooks/useAuth';

// Ad Space type
interface AdSpace {
  id: string;
  name: string;
  type: 'website' | 'nostr-feed' | 'client-integration';
  status: 'ACTIVE' | 'INACTIVE' | 'AWAITING_INTEGRATION';
  location: string;
  description?: string;
  adTypes?: string[];
  targetAudience?: string;
  contentTopics?: string[];
}

const EditAdSpacePage = () => {
  const { role } = useRole();
  const router = useRouter();
  const { id } = router.query;
  const { auth } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [adSpace, setAdSpace] = useState<AdSpace | null>(null);
  const [formData, setFormData] = useState<AdSpace | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not in publisher role
  useEffect(() => {
    if (role !== 'publisher') {
      router.push(`/dashboard${role !== 'user' ? `/${role}` : ''}`);
    }
  }, [role, router]);

  // Fetch ad space data
  useEffect(() => {
    if (id && typeof id === 'string') {
      // In a real app, this would be an API fetch
      // For now, we'll use mock data
      setIsLoading(true);
      
      // Simulate API fetch delay
      setTimeout(() => {
        // Example data - would be from API in real app
        let mockAdSpace: AdSpace;
        
        if (id === 'space-1') {
          mockAdSpace = {
            id: 'space-1',
            name: 'Personal Blog',
            type: 'website',
            status: 'ACTIVE',
            location: 'https://myblog.com',
            description: 'A personal blog about technology and Bitcoin.',
            adTypes: ['banner', 'sidebar'],
            targetAudience: 'Tech enthusiasts',
            contentTopics: ['Bitcoin', 'Technology', 'Programming'],
          };
        } else if (id === 'space-2') {
          mockAdSpace = {
            id: 'space-2',
            name: 'Nostr Feed Integration',
            type: 'nostr-feed',
            status: 'AWAITING_INTEGRATION',
            location: 'npub1aaaa...',
            description: 'Integration with my Nostr feed.',
            adTypes: ['inline'],
            targetAudience: 'Nostr users',
            contentTopics: ['Decentralization', 'Bitcoin'],
          };
        } else if (id === 'space-3') {
          mockAdSpace = {
            id: 'space-3',
            name: 'Bitcoin News App',
            type: 'client-integration',
            status: 'AWAITING_INTEGRATION',
            location: 'Bitcoin News App SDK',
            description: 'A mobile app for Bitcoin news.',
            adTypes: ['banner', 'interstitial'],
            targetAudience: 'Bitcoin enthusiasts',
            contentTopics: ['Bitcoin', 'Finance', 'Economics'],
          };
        } else {
          // If the ID doesn't match, redirect to the spaces list
          router.push('/dashboard/publisher/spaces');
          return;
        }
        
        setAdSpace(mockAdSpace);
        setFormData(mockAdSpace);
        setIsLoading(false);
      }, 500);
    }
  }, [id, router]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      if (!prev) return prev;
      return { ...prev, [name]: value };
    });
  };

  // Handle checkbox/multi-select changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    
    setFormData(prev => {
      if (!prev) return prev;
      
      const currentValues = prev[name as keyof AdSpace] as string[] || [];
      
      if (checked) {
        // Add the value if it's checked
        return { 
          ...prev, 
          [name]: [...currentValues, value]
        };
      } else {
        // Remove the value if it's unchecked
        return { 
          ...prev, 
          [name]: currentValues.filter(v => v !== value)
        };
      }
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      // In a real app, this would be an API call to update the ad space
      // For now, simulate saving the data in localStorage so it persists between pages
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store the updated ad space in localStorage for persistence between pages
      const updatedSpace = {...formData};
      localStorage.setItem(`adspace_${id}`, JSON.stringify(updatedSpace));
      
      // Redirect back to the spaces list after saving
      router.push('/dashboard/publisher/spaces');
    } catch (err) {
      console.error('Error saving ad space:', err);
      setError('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const getSpaceTypeIcon = (type: string) => {
    switch (type) {
      case 'website':
        return <Monitor className="w-5 h-5 text-blue-500" />;
      case 'nostr-feed':
        return <MessageSquare className="w-5 h-5 text-purple-500" />;
      case 'client-integration':
        return <Code className="w-5 h-5 text-green-500" />;
      default:
        return <Monitor className="w-5 h-5 text-blue-500" />;
    }
  };

  const getSpaceTypeLabel = (type: string) => {
    switch (type) {
      case 'website':
        return 'Website';
      case 'nostr-feed':
        return 'Nostr Feed';
      case 'client-integration':
        return 'Client Integration';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!adSpace) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">Ad Space Not Found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">The ad space you're looking for doesn't exist or you don't have permission to edit it.</p>
          <Link 
            href="/dashboard/publisher/spaces"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Ad Spaces
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Ad Space</h1>
        <Link 
          href="/dashboard/publisher/spaces"
          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Ad Spaces
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md text-red-800 dark:text-red-400">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center mb-6">
            <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 mr-4">
              {getSpaceTypeIcon(adSpace.type)}
            </div>
            <div>
              <h2 className="text-xl font-medium text-gray-900 dark:text-white">{adSpace.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {getSpaceTypeLabel(adSpace.type)} • ID: {adSpace.id}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ad Space Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData?.name || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData?.location || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {adSpace.type === 'website' && 'URL of your website'}
                {adSpace.type === 'nostr-feed' && 'Your Nostr public key (npub)'}
                {adSpace.type === 'client-integration' && 'Name of your application'}
              </p>
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData?.description || ''}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Target Audience
              </label>
              <input
                type="text"
                id="targetAudience"
                name="targetAudience"
                value={formData?.targetAudience || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ad Types
              </label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="adType-banner"
                    name="adTypes"
                    value="banner"
                    checked={formData?.adTypes?.includes('banner') || false}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="adType-banner" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Banner Ads
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="adType-sidebar"
                    name="adTypes"
                    value="sidebar"
                    checked={formData?.adTypes?.includes('sidebar') || false}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="adType-sidebar" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Sidebar Ads
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="adType-inline"
                    name="adTypes"
                    value="inline"
                    checked={formData?.adTypes?.includes('inline') || false}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="adType-inline" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Inline / Native Ads
                  </label>
                </div>
                {adSpace.type === 'client-integration' && (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="adType-interstitial"
                      name="adTypes"
                      value="interstitial"
                      checked={formData?.adTypes?.includes('interstitial') || false}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="adType-interstitial" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Interstitial Ads
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/dashboard/publisher/spaces"
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 mr-3"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Wrap the page with our layout
EditAdSpacePage.getLayout = (page: React.ReactElement) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default EditAdSpacePage;