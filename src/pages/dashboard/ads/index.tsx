import React, { useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Plus, Search, Filter } from 'react-feather';
import useSWR from 'swr';
import.*./components/AdCard';
import.*./utils/layoutHelpers';
import.*./pages/_app';
import.*./components/ui';
import.*./hooks/useAuth';

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then(res => res.json());

const AdsListPage: NextPageWithLayout = () => {
  const { auth } = useContext(AuthContext);
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch all ads created by the user
  const { data, error, mutate } = useSWR('/api/ads', fetcher);
  
  // Ensure ads is always an array
  const ads = Array.isArray(data) ? data : [];
  const isLoading = !data && !error;

  // Apply filters to ads
  const filteredAds = ads.filter((ad: any) => {
    // Status filter
    if (statusFilter !== 'all' && ad.status !== statusFilter) {
      return false;
    }
    
    // Search filter
    if (searchTerm && !ad.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !ad.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Handle status change
  const handleStatusChange = async (adId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/ads/${adId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update ad status');
      }
      
      // Refresh the data
      mutate();
    } catch (error) {
      console.logger.error('Error updating ad status:', error);
      alert('Failed to update ad status');
    }
  };

  if (!auth?.pubkey) {
    return (
      <DashboardContainer>
        <DashboardHeader title="Campaign Ads" description="View your ad campaigns" />
        <div className="text-center py-12">
          <DashboardCard>
            <p className="text-gray-600 dark:text-gray-300">Please login to view ads.</p>
            <Link href="/login" className="btn-primary mt-4 inline-block">
              Go to Login
            </Link>
          </DashboardCard>
        </div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <DashboardHeader 
        title="Campaign Ads" 
        description="Manage your ad campaigns"
        actions={
          <Link href="/dashboard/campaigns/create" className="btn-primary flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Create New Campaign
          </Link>
        }
      />
      
      <div className="max-w-6xl mx-auto">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search ads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>
          <div className="relative md:w-48">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field pl-10 w-full appearance-none"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="PAUSED">Paused</option>
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Ad Listings */}
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
        ) : filteredAds?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAds.map((ad: any) => (
              <AdCard
                key={ad.id}
                ad={ad}
                onStatusChange={handleStatusChange}
                showControls={true}
              />
            ))}
          </div>
        ) : (
          <DashboardCard className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No campaign ads found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {ads?.length > 0 
                ? "No ads match your current filters."
                : "You haven't created any campaign ads yet."}
            </p>
            {ads?.length > 0 ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="btn-secondary"
              >
                Clear Filters
              </button>
            ) : (
              <Link href="/dashboard/campaigns/create" className="btn-primary">
                Create Your First Campaign
              </Link>
            )}
          </DashboardCard>
        )}
      </div>
    </DashboardContainer>
  );
};

// Set the layout for the page
AdsListPage.getLayout = function getLayout(page: React.ReactElement) {
  return getDashboardLayout(page, 'Campaign Ads');
};

export default AdsListPage;
