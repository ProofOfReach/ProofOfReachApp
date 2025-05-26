import React from 'react';
import { NextPageWithLayout } from '@/pages/_app';
import ImprovedDashboardLayout from '@/components/layout/ImprovedDashboardLayout';

const AdminTransactionsPage: NextPageWithLayout = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Transaction Management
        </h1>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Lightning Network Transactions
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Monitor and manage all Lightning Network transactions across the platform.
        </p>
        
        <div className="mt-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Transaction monitoring and management tools will be available here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

AdminTransactionsPage.getLayout = function getLayout(page: React.ReactElement) {
  return <ImprovedDashboardLayout>{page}</ImprovedDashboardLayout>;
};

export default AdminTransactionsPage;