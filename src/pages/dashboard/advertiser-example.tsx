import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useProtectedRoute } from '../../hooks/useProtectedRoute';
import { useAuthSwitch } from '../../hooks/useAuthSwitch';
import { useIsAdvertiser } from '../../hooks/useHasRole';
import Layout from '../../components/Layout';

/**
 * Example protected page that uses our new auth hooks
 * This page is only accessible to users with the advertiser role
 */
export default function AdvertiserExamplePage(): React.ReactElement {
  const router = useRouter();
  // This hook will automatically redirect if not authenticated
  // or if the user doesn't have the advertiser role
  const { isAuthenticated, isAuthorized, isLoading } = useProtectedRoute({
    requiredRoles: 'advertiser'
  });
  
  // Get more information from the auth system
  const { pubkey, isTestMode, currentRole } = useAuthSwitch();
  
  // Alternative way to check for the advertiser role
  const isAdvertiser = useIsAdvertiser();
  
  // Wait for authentication to complete before rendering content
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Advertiser Dashboard (New Auth)</h1>
      
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
        
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center">
            <span className="font-medium mr-2">Authentication:</span>
            {isAuthenticated ? (
              <span className="text-green-600 font-medium">Authenticated</span>
            ) : (
              <span className="text-red-600 font-medium">Not Authenticated</span>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center">
            <span className="font-medium mr-2">Authorization:</span>
            {isAuthorized ? (
              <span className="text-green-600 font-medium">Authorized as Advertiser</span>
            ) : (
              <span className="text-red-600 font-medium">Not Authorized</span>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center">
            <span className="font-medium mr-2">Current Role:</span>
            <span className="text-purple-600 font-medium">{currentRole}</span>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center">
            <span className="font-medium mr-2">Is Advertiser:</span>
            {isAdvertiser ? (
              <span className="text-green-600 font-medium">Yes</span>
            ) : (
              <span className="text-red-600 font-medium">No</span>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center">
            <span className="font-medium mr-2">Test Mode:</span>
            {isTestMode ? (
              <span className="text-purple-600 font-medium">Yes</span>
            ) : (
              <span className="text-gray-600 font-medium">No</span>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-start">
            <span className="font-medium mr-2">Pubkey:</span>
            <span className="text-gray-700 dark:text-gray-300 break-all">{pubkey}</span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-4">
        <button 
          onClick={() => router.push('/auth-refactored-test')}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition"
        >
          Go to Auth Test Page
        </button>
        <button 
          onClick={() => router.push('/dashboard/advertiser')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
        >
          Back to Regular Dashboard
        </button>
      </div>
    </div>
  );
}

// Use the regular layout for this page
AdvertiserExamplePage.getLayout = (page: React.ReactNode) => (
  <Layout>{page}</Layout>
);