import { UserRole } from "@/types/role";
import React, { useEffect } from 'react';
import { ChevronRight, DollarSign, PieChart, Users } from 'react-feather';
import { defaultUseRole } from '../../../context/RoleContext';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import StatCard from '../../../components/ui/StatCard';
import '@/components/layout/DashboardLayout';

export default function StakeholderDashboard(): React.ReactElement {
  const { role } = defaultUseRole();

  // Log for debugging
  useEffect(() => {
    console.log('Stakeholder dashboard mounted, current role:', role);
  }, [role]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold mb-0 text-gray-900 dark:text-white">Stakeholder Dashboard</h1>
      </div>

      <p className="text-gray-500 dark:text-gray-400">
        Welcome to the Stakeholder Dashboard. Here you can view financial metrics and analytics on platform performance.
      </p>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Platform Revenue"
          value="$142,857" 
          change="12.5" 
          icon={<DollarSign className="text-green-500" />}
          helperText="Total revenue (USD)"
        />
        
        <StatCard 
          title="Active Campaigns"
          value="32" 
          change="8.3" 
          icon={<PieChart className="text-blue-500" />}
          helperText="Running ad campaigns"
        />
        
        <StatCard 
          title="Publishers"
          value="205" 
          change="15.2" 
          icon={<Users className="text-purple-500" />}
          helperText="Total active publishers"
        />
        
        <StatCard 
          title="Avg. Daily Volume"
          value="$4,125" 
          change="7.8" 
          icon={<DollarSign className="text-orange-500" />}
          helperText="Previous 7 days"
        />
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Financial Metrics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Revenue Breakdown</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              View detailed platform revenue streams and forecasts.
            </p>
            <a
              href="/dashboard/stakeholder/financials"
              className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center text-sm"
            >
              View Breakdown 
              <ChevronRight className="ml-1 h-4 w-4" />
            </a>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Growth Analytics</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Explore user growth and engagement metrics.
            </p>
            <a
              href="/dashboard/stakeholder/analytics" 
              className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center text-sm"
            >
              View Analytics
              <ChevronRight className="ml-1 h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// Use the improved dashboard layout
StakeholderDashboard.getLayout = (page: React.ReactElement) => {
  return <DashboardLayout title="Stakeholder Dashboard">{page}</DashboardLayout>;
};