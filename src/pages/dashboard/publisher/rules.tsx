import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Shield, Plus } from 'react-feather';

const PublisherRulesPage = () => {
  return (
    <DashboardLayout title="Publisher Rules">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Content Rules</h1>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Rule</span>
          </button>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-center py-12">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No content rules configured
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Set up rules to automatically filter ad content for your spaces.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PublisherRulesPage;