import React from 'react';
import { useRole } from '@/context/RoleContext';
import { DashboardContainer, DashboardCard } from '@/components/ui';
import { ChevronRight, ShoppingBag } from 'react-feather';
import Link from 'next/link';
import { getDashboardLayout } from '@/utils/layoutHelpers';
import type { NextPageWithLayout } from '../../_app';
import CurrencyAmount from '@/components/CurrencyAmount';

/**
 * Advertiser Dashboard Page
 * 
 * Displays advertiser-specific dashboard with campaign management tools
 * and wallet balance information.
 */
const AdvertiserDashboard: NextPageWithLayout = () => {
  const { role } = useRole();
  
  return (
    <DashboardContainer>
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-3">
          <ShoppingBag className="h-8 w-8 text-purple-600" />
          <h1 className="text-2xl font-bold mb-0 text-gray-900 dark:text-white">Advertiser Dashboard</h1>
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Wallet Balance</h2>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            <CurrencyAmount sats={42500} />
          </p>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Available for campaigns</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Campaigns</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">View and manage your advertising campaigns.</p>
            <Link 
              href="/dashboard/advertiser/campaigns"
              className="text-purple-600 dark:text-purple-400 hover:underline flex items-center text-sm"
            >
              View Campaigns <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Create Campaign</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Set up a new advertising campaign.</p>
            <Link 
              href="/dashboard/advertiser/campaigns/create"
              className="text-purple-600 dark:text-purple-400 hover:underline flex items-center text-sm"
            >
              Create New Campaign <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </DashboardContainer>
  );
};

// Apply dashboard layout
AdvertiserDashboard.getLayout = getDashboardLayout;

export default AdvertiserDashboard;