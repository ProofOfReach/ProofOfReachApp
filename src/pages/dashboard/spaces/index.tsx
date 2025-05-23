import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { Plus, Search, Code, Trash2, Copy } from 'react-feather';
import useSWR from 'swr';
import SpaceCard from '../../../components/SpaceCard';

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then(res => res.json());

const SpacesListPage: React.FC = () => {
  const auth = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<any>(null);

  // Fetch all spaces created by the user
  const { data: spaces, error, mutate } = useSWR('/api/spaces', fetcher);

  const isLoading = !spaces && !error;

  // Apply filters to spaces
  const filteredSpaces = (spaces && Array.isArray(spaces)) ? spaces.filter((space: any) => {
    // Search filter
    if (searchTerm && !space.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !space.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !space.website.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  }) : [];

  // Function to handle space deletion
  const handleDeleteSpace = async (spaceId: string) => {
    if (!confirm('Are you sure you want to delete this ad space?')) {
      return;
    }

    try {
      const response = await fetch(`/api/spaces/${spaceId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete ad space');
      }
      
      // Refresh the data
      mutate();
    } catch (error) {
      console.log('Error deleting ad space:', error);
      alert('Failed to delete ad space');
    }
  };

  // Function to show integration code
  const handleShowCode = (space: any) => {
    setSelectedSpace(space);
    setShowCodeModal(true);
  };

  // Generate integration code for the selected space
  const generateIntegrationCode = () => {
    if (!selectedSpace) return '';

    return `
<!-- Nostr Ad Marketplace - Ad Space: ${selectedSpace.name} -->
<div id="nostr-ad-space-${selectedSpace.id}" style="width: 100%; min-height: 90px; background-color: #f0f0f0; border: 1px dashed #ccc; overflow: hidden;">
  <!-- Ad will be loaded here -->
</div>
<script>
  (function() {
    // This is a placeholder script for the MVP
    // In the final implementation, this will connect to the marketplace
    // and fetch relevant ads to display
    const spaceId = "${selectedSpace.id}";
    const publisherPubkey = "${auth.auth?.pubkey || ''}";
    
    document.addEventListener('DOMContentLoaded', function() {
      const adSpace = document.getElementById('nostr-ad-space-${selectedSpace.id}');
      adSpace.innerHTML = '<div style="padding: 15px; text-align: center; font-family: sans-serif; color: #666;">Ad space ready to display ads from Nostr Ad Marketplace</div>';
      
      // Future versions will include actual ad loading functionality
    });
  })();
</script>
<!-- End Nostr Ad Space -->
    `;
  };

  // Function to copy code to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Code copied to clipboard!');
    }).catch(err => {
      console.log('Could not copy text: ', err);
    });
  };

  if (!auth.pubkey) {
    return (
      <Layout title="Ad Spaces - Nostr Ad Marketplace">
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-300">Please login to view ad spaces.</p>
          <Link href="/login" className="btn-primary mt-4 inline-block">
            Go to Login
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Ad Spaces - Nostr Ad Marketplace">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">Your Ad Spaces</h1>
          <Link href="/dashboard/spaces/create" className="btn-primary flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Create New Space
          </Link>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search ad spaces..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 w-full"
          />
        </div>

        {/* Ad Space Listings */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-5/6 mb-4"></div>
                <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-full mt-4"></div>
              </div>
            ))}
          </div>
        ) : filteredSpaces?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSpaces.map((space: any) => (
              <SpaceCard
                key={space.id}
                space={space}
                onDelete={() => handleDeleteSpace(space.id)}
                onShowCode={() => handleShowCode(space)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No ad spaces found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {spaces?.length > 0 
                ? "No spaces match your current search."
                : "You haven't created any ad spaces yet."}
            </p>
            {spaces?.length > 0 ? (
              <button
                onClick={() => setSearchTerm('')}
                className="btn-secondary"
              >
                Clear Search
              </button>
            ) : (
              <Link href="/dashboard/spaces/create" className="btn-primary">
                Create Your First Ad Space
              </Link>
            )}
          </div>
        )}

        {/* Integration Code Modal */}
        {showCodeModal && selectedSpace && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full max-h-[80vh] overflow-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Integration Code for {selectedSpace.name}
                  </h3>
                  <button
                    onClick={() => setShowCodeModal(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <Code className="h-5 w-5" />
                  </button>
                </div>

                <div className="mb-4">
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    Copy and paste this code into your website where you want the ad to appear:
                  </p>
                  <div className="relative">
                    <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-x-auto text-sm text-gray-800 dark:text-gray-200">
                      {generateIntegrationCode()}
                    </pre>
                    <button
                      onClick={() => copyToClipboard(generateIntegrationCode())}
                      className="absolute top-2 right-2 p-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                      title="Copy to clipboard"
                    >
                      <Copy className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setShowCodeModal(false)}
                    className="btn-secondary"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SpacesListPage;
