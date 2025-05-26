import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { CheckCircle, XCircle, Clock } from 'react-feather';

const PublisherApprovalsPage = () => {
  return (
    <DashboardLayout title="Ad Approvals">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ad Approvals</h1>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No pending approvals
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              All ad requests have been processed.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PublisherApprovalsPage;