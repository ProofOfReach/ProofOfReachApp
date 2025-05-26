import React from 'react';
import type { NextPageWithLayout } from '../../_app';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

/**
 * Admin Role Management Page
 * Placeholder page to prevent build errors
 */
const AdminRoleManagementPage: NextPageWithLayout = () => {
  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Role Management
        </h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">
            Admin role management functionality will be available here.
          </p>
        </div>
      </div>
    </div>
  );
};

AdminRoleManagementPage.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout>{page}</DashboardLayout>;
};

export default AdminRoleManagementPage;