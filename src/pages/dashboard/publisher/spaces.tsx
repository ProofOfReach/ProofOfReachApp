import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Grid, Plus } from 'react-feather';

const PublisherSpacesPage = () => {
  return (
    <DashboardLayout title="Ad Spaces">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ad Spaces</h1>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Create Space</span>
          </button>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-center py-12">
            <Grid className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No ad spaces created
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Create your first ad space to start earning revenue from your content.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PublisherSpacesPage;