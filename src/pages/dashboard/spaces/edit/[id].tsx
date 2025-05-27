import { UserRole } from "@/types/role";
import React, { useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../../components/Layout';
// Remove NostrAuthContext import - using modern auth system
import Link from 'next/link';
import { AlertCircle } from 'react-feather';
import SpaceForm from '../../../../components/SpaceForm';

const EditSpacePage: React.FC = () => {
  // Using modern auth system - removing legacy NostrAuthContext
  const router = useRouter();
  const { id } = router.query;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [spaceData, setSpaceData] = useState<any>(null);

  // Fetch space data when component mounts
  useEffect(() => {
    const fetchSpaceData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/spaces/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch ad space details');
        }
        
        const data = await response.json();
        setSpaceData(data);
      } catch (err: any) {
        console.log('Error fetching space data:', err);
        setError(err.message || 'Failed to load ad space details');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchSpaceData();
    }
  }, [id]);

  const handleSubmit = async (updatedSpaceData: any) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/spaces/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify(updatedSpaceData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.log || 'Failed to update ad space');
      }

      // Redirect to publisher dashboard
      router.push('/dashboard/publisher');
    } catch (err: any) {
      console.log('Space update error:', err);
      setError(err.message || 'Failed to update the ad space. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Skip auth check for now - handle authentication in the API layer
  // if (!auth.pubkey) {
  //   return (
  //     <Layout title="Edit Ad Space - Nostr Ad Marketplace">
  //       <div className="text-center py-12">
  //         <p className="text-gray-600 dark:text-gray-300">Please login to edit ad spaces.</p>
  //         <Link href="/login" className="btn-primary mt-4 inline-block">
  //           Go to Login
  //         </Link>
  //       </div>
  //     </Layout>
  //   );
  // }

  return (
    <Layout title="Edit Ad Space - Nostr Ad Marketplace">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Edit Ad Space</h1>

        {/* Info Card */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-800 dark:text-blue-300">Publisher Information</h3>
              <p className="text-blue-700 dark:text-blue-400 text-sm mt-1">
                Update your ad space settings below. Changing these settings will affect how advertisers target your space.
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

        {/* Loading State */}
        {isLoading ? (
          <div className="card p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="h-20 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        ) : spaceData ? (
          <div className="card">
            <div className="p-6">
              <SpaceForm 
                onSubmit={handleSubmit} 
                isSubmitting={isSubmitting} 
                initialData={spaceData}
                editMode={true}
              />
            </div>
          </div>
        ) : (
          <div className="card p-6 text-center">
            <p className="text-gray-600 dark:text-gray-300">Could not load ad space data. Please try again.</p>
            <Link href="/dashboard/publisher" className="btn-primary mt-4 inline-block">
              Back to Publisher Dashboard
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EditSpacePage;