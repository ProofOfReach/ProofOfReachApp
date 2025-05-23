import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../../components/Layout';
import Link from 'next/link';
import { AlertCircle, ArrowLeft } from 'react-feather';
import AdForm from '../../../../components/AdForm';
import { postWithAuth } from '../../../../lib/api';
import { useAuth } from '../../../../hooks/useAuth';

const EditAdPage: React.FC = () => {
  const { auth } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adData, setAdData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the ad data when the component mounts
  useEffect(() => {
    // First try to get the data from localStorage (coming from the edit button click)
    const storedAdData = localStorage.getItem('editAdData');
    if (storedAdData) {
      try {
        const parsedData = JSON.parse(storedAdData);
        if (parsedData.id === id) {
          setAdData(parsedData);
          setIsLoading(false);
          // Clear localStorage after retrieving the data
          localStorage.removeItem('editAdData');
          return;
        }
      } catch (err) {
        console.log('Error parsing stored ad data:', err);
      }
    }

    // If no data in localStorage or ID mismatch, fetch from API
    if (id) {
      fetchAdData();
    }
  }, [id]);

  const fetchAdData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/ads/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch ad data');
      }

      const data = await response.json();
      setAdData(data);
    } catch (err: any) {
      console.log('Error fetching ad data:', err);
      setError(err.message || 'Failed to load ad data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    setError(null);
    
    // Transform form data to match API expectations
    const adData = {
      ...formData,
      targetUrl: formData.finalDestinationUrl,  // API expects targetUrl, not finalDestinationUrl
    };

    try {
      // Update the ad using the API with PUT method
      const response = await fetch(`/api/ads/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.log || 'Failed to update ad');
      }

      // Redirect to ads list
      router.push('/dashboard/advertiser');
    } catch (err: any) {
      console.log('Ad update error:', err);
      setError(err.message || 'Failed to update the ad. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!auth || !auth.pubkey) {
    return (
      <Layout title="Edit Ad - Nostr Ad Marketplace">
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-300">Please login to edit ads.</p>
          <Link href="/login" className="btn-primary mt-4 inline-block">
            Go to Login
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Edit Ad - Nostr Ad Marketplace">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <Link 
            href="/dashboard/advertiser" 
            className="mr-4 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Ad</h1>
        </div>
        
        {/* Info Card */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-800 dark:text-blue-300">Editing a Pending Ad</h3>
              <p className="text-blue-700 dark:text-blue-400 text-sm mt-1">
                You can update your ad details before it gets approved. Once an ad is approved, 
                it can't be modified.
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

        {isLoading ? (
          <div className="card p-6" data-testid="loading-indicator">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
              <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        ) : adData ? (
          <div className="card">
            <div className="p-6">
              <AdForm 
                onSubmit={handleSubmit} 
                isSubmitting={isSubmitting} 
                initialData={adData}
                editMode={true}
              />
            </div>
          </div>
        ) : (
          <div className="card p-6 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              Ad not found or you don't have permission to edit it.
            </p>
            <Link href="/dashboard/advertiser" className="btn-primary mt-4 inline-block">
              Back to Dashboard
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EditAdPage;