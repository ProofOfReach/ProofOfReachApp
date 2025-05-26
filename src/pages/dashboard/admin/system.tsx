import React from 'react';
import { NextPageWithLayout } from '@/pages/_app';
import ImprovedDashboardLayout from '@/components/layout/ImprovedDashboardLayout';

const AdminSystemPage: NextPageWithLayout = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          System Management
        </h1>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Platform System Settings
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Configure system-wide settings and monitor platform health.
        </p>
        
        <div className="mt-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              System configuration and monitoring tools will be available here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

AdminSystemPage.getLayout = function getLayout(page: React.ReactElement) {
  return <ImprovedDashboardLayout>{page}</ImprovedDashboardLayout>;
};

export default AdminSystemPage;