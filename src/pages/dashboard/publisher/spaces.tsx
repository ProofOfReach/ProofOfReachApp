import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import useSWR from 'swr';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { useRole } from '../../../context/RoleContext';
import { Edit3, PlusCircle, Filter, ChevronDown, Monitor, MessageSquare, Code, Trash2 } from 'react-feather';
import { useAuth } from '../../../hooks/useAuth';
// CurrencyAmount component replaces hardcoded sats displays with currency-aware component
// that displays values according to user preference (BTC or USD)
import CurrencyAmount from '../../../components/CurrencyAmount';

// Ad Space type
interface AdSpace {
  id: string;
  name: string;
  type: 'website' | 'nostr-feed' | 'client-integration';
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING_APPROVAL' | 'AWAITING_INTEGRATION';
  location: string;
  impressions: number;
  clicks: number;
  ctr: number;
  earnings: number;
  createdAt: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const PublisherSpacesPage = () => {
  const { role } = useRole();
  const router = useRouter();
  const { auth } = useAuth();
  
  // Redirect if not in publisher role
  useEffect(() => {
    if (role !== 'publisher') {
      router.push(`/dashboard${role !== 'user' ? `/${role}` : ''}`);
    }
  }, [role, router]);

  // Default ad spaces data
  const defaultAdSpaces: AdSpace[] = [
    {
      id: 'space-1',
      name: 'Personal Blog',
      type: 'website',
      status: 'ACTIVE',
      location: 'https://myblog.com',
      impressions: 2349,
      clicks: 123,
      ctr: 5.2,
      earnings: 12345,
      createdAt: '2023-03-15T00:00:00Z',
    },
    {
      id: 'space-2',
      name: 'Nostr Feed Integration',
      type: 'nostr-feed',
      status: 'AWAITING_INTEGRATION',
      location: 'npub1aaaa...',
      impressions: 0,
      clicks: 0,
      ctr: 0,
      earnings: 0,
      createdAt: '2023-04-01T00:00:00Z',
    },
    {
      id: 'space-3',
      name: 'Bitcoin News App',
      type: 'client-integration',
      status: 'AWAITING_INTEGRATION', // Changed from PENDING_APPROVAL
      location: 'Bitcoin News App SDK',
      impressions: 0,
      clicks: 0,
      ctr: 0,
      earnings: 0,
      createdAt: '2023-04-25T00:00:00Z',
    },
  ];
  
  // State for managing ad spaces
  const [adSpaces, setAdSpaces] = useState<AdSpace[]>(defaultAdSpaces);
  
  // Load any edited ad spaces from localStorage
  useEffect(() => {
    // Only run on client-side as localStorage is not available on server
    if (typeof window !== 'undefined') {
      try {
        const updatedSpaces = [...defaultAdSpaces];
        
        // Check for edited ad spaces in localStorage
        defaultAdSpaces.forEach((space, index) => {
          const savedData = localStorage.getItem(`adspace_${space.id}`);
          if (savedData) {
            const parsedData = JSON.parse(savedData);
            // Merge the saved data with any fields that might be missing
            updatedSpaces[index] = { 
              ...space, 
              ...parsedData,
              // Make sure these numeric values remain intact
              impressions: space.impressions,
              clicks: space.clicks,
              ctr: space.ctr,
              earnings: space.earnings 
            };
          }
        });
        
        setAdSpaces(updatedSpaces);
      } catch (error) {
        console.error('Error loading ad spaces from localStorage:', error);
      }
    }
  }, []);
  
  // Function to handle deleting an ad space
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this ad space? This action cannot be undone.')) {
      // In a real app, this would make an API call to delete the ad space
      setAdSpaces(adSpaces.filter(space => space.id !== id));
      
      // Also remove from localStorage if it exists there
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`adspace_${id}`);
      }
      
      // Show a notification or toast here (if you have a notification system)
      console.log(`Ad space ${id} deleted`);
    }
  };

  const getSpaceTypeIcon = (type: string) => {
    switch (type) {
      case 'website':
        return <Monitor className="w-4 h-4 text-blue-500" />;
      case 'nostr-feed':
        return <MessageSquare className="w-4 h-4 text-purple-500" />;
      case 'client-integration':
        return <Code className="w-4 h-4 text-green-500" />;
      default:
        return <Monitor className="w-4 h-4 text-blue-500" />;
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

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
      case 'AWAITING_INTEGRATION':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'AWAITING_INTEGRATION':
        return 'Awaiting Integration';
      default:
        return status.charAt(0) + status.slice(1).toLowerCase();
    }
  };

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  // Format sats with correct units
  const formatSats = (sats: number) => {
    return `${formatNumber(sats)} sats`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ad Spaces</h1>
        <div className="flex space-x-2">
          <div className="relative inline-block">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
              <Filter className="w-4 h-4 mr-2" />
              Filter
              <ChevronDown className="w-4 h-4 ml-1" />
            </button>
            {/* Filter dropdown would go here */}
          </div>
          <Link 
            href="/dashboard/publisher/spaces/create"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Create Ad Space
          </Link>
        </div>
      </div>

      <div className="w-full bg-white dark:bg-gray-800 shadow-sm rounded-lg">
        <div className="overflow-x-auto w-full">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ad Space
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Location
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Impressions
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  CTR
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Earnings
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Created
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {adSpaces.map((space) => (
                <tr key={space.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{space.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="mr-2">{getSpaceTypeIcon(space.type)}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{getSpaceTypeLabel(space.type)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(space.status)}`}>
                      {getStatusLabel(space.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {space.location.length > 25 ? `${space.location.substring(0, 25)}...` : space.location}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatNumber(space.impressions)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {space.ctr}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <CurrencyAmount sats={space.earnings} showTooltip={false} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(space.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <Link 
                        href={`/dashboard/publisher/spaces/${space.id}/edit`}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                      >
                        <Edit3 size={14} className="mr-1" />
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(space.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 flex items-center"
                      >
                        <Trash2 size={14} className="mr-1" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Wrap the page with our layout
PublisherSpacesPage.getLayout = (page: React.ReactElement) => {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default PublisherSpacesPage;