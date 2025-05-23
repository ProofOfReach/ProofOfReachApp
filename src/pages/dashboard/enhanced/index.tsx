import React from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import.*./context/EnhancedRoleContext';
import.*./components/layout/RoleBasedLayout';
import.*./components/auth/withRoleAccess';
import.*./context/RoleContext';

/**
 * A sample dashboard page that demonstrates the new role management system
 */
const EnhancedDashboardPage: React.FC = () => {
  const { currentRole, isTestMode, availableRoles } = useEnhancedRole();
  
  // Role-specific content
  const getRoleContent = () => {
    switch (currentRole) {
      case 'advertiser':
        return (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
            <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-300 mb-4">
              Advertiser Dashboard
            </h2>
            <p className="text-blue-700 dark:text-blue-400 mb-4">
              Welcome to your advertiser dashboard. Here you can manage your campaigns,
              track performance, and review your ad spend.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Active Campaigns"
                value="5"
                description="You have 5 active campaigns"
                trend="up"
              />
              <StatCard
                title="Impressions"
                value="12.4k"
                description="Last 7 days"
                trend="up"
              />
              <StatCard
                title="Click Rate"
                value="2.3%"
                description="Average CTR"
                trend="down"
              />
            </div>
          </div>
        );
      
      case 'publisher':
        return (
          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
            <h2 className="text-xl font-semibold text-green-800 dark:text-green-300 mb-4">
              Publisher Dashboard
            </h2>
            <p className="text-green-700 dark:text-green-400 mb-4">
              Welcome to your publisher dashboard. Here you can manage your ad spaces,
              track earnings, and review performance metrics.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Active Ad Spaces"
                value="3"
                description="Across your sites"
                trend="up"
              />
              <StatCard
                title="Earnings"
                value="485 sats"
                description="Last 7 days"
                trend="up"
              />
              <StatCard
                title="Fill Rate"
                value="78%"
                description="Average fill rate"
                trend="neutral"
              />
            </div>
          </div>
        );
      
      case 'admin':
        return (
          <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
            <h2 className="text-xl font-semibold text-purple-800 dark:text-purple-300 mb-4">
              Admin Dashboard
            </h2>
            <p className="text-purple-700 dark:text-purple-400 mb-4">
              Welcome to the admin dashboard. Here you can manage users, system settings,
              and monitor platform performance.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Total Users"
                value="1,247"
                description="Active accounts"
                trend="up"
              />
              <StatCard
                title="System Health"
                value="98%"
                description="All systems operational"
                trend="neutral"
              />
              <StatCard
                title="Support Tickets"
                value="12"
                description="Pending resolution"
                trend="down"
              />
            </div>
          </div>
        );
      
      case 'stakeholder':
        return (
          <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-lg border border-amber-200 dark:border-amber-800">
            <h2 className="text-xl font-semibold text-amber-800 dark:text-amber-300 mb-4">
              Stakeholder Dashboard
            </h2>
            <p className="text-amber-700 dark:text-amber-400 mb-4">
              Welcome to the stakeholder dashboard. Here you can view business metrics,
              growth trends, and platform health.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="MRR"
                value="$12.4k"
                description="Monthly Recurring Revenue"
                trend="up"
              />
              <StatCard
                title="Daily Active Users"
                value="843"
                description="Last 7 days average"
                trend="up"
              />
              <StatCard
                title="Conversion Rate"
                value="3.8%"
                description="Free to paid"
                trend="up"
              />
            </div>
          </div>
        );
      
      default: // 'viewer' role
        return (
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-300 mb-4">
              Viewer Dashboard
            </h2>
            <p className="text-gray-700 dark:text-gray-400 mb-4">
              Welcome to your dashboard. Choose a role to get started.
            </p>
            
            {/* Role Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
              {availableRoles.filter(role => role !== 'viewer').map(role => (
                <RoleCard 
                  key={role} 
                  role={role} 
                  isActive={currentRole === role}
                  onSelect={() => {}} // This will be handled by the layout
                />
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <Head>
        <title>Enhanced Dashboard - Proof Of Reach</title>
      </Head>

      <RoleBasedLayout title="Enhanced Dashboard">
        {/* Test Mode Banner */}
        {isTestMode && (
          <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                  Test Mode Enabled
                </h3>
                <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-400">
                  You have access to all roles for testing purposes. Role restrictions are bypassed in this mode.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Role Info */}
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Current Role: <span className="capitalize">{currentRole}</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Available Roles: {availableRoles.map(r => 
              <span key={r} className="inline-block px-2 py-1 m-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-medium capitalize">
                {r}
              </span>
            )}
          </p>
        </div>
        
        {/* Role-Specific Dashboard Content */}
        {getRoleContent()}
      </RoleBasedLayout>
    </>
  );
};

// Role card component
const RoleCard: React.FC<{
  role: UserRole;
  isActive: boolean;
  onSelect: () => void;
}> = ({ role, isActive, onSelect }) => {
  // Role-specific colors
  const colors = {
    advertiser: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400',
    publisher: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400',
    admin: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400',
    stakeholder: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400',
    user: 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-400',
  };
  
  // Role descriptions
  const descriptions = {
    advertiser: 'Create and manage ad campaigns',
    publisher: 'Monetize your content with ads',
    admin: 'Manage platform and users',
    stakeholder: 'View business metrics and analytics',
    user: 'Basic user access',
  };

  return (
    <div 
      className={`cursor-pointer p-4 rounded-lg border ${colors[role]} ${
        isActive ? 'ring-2 ring-offset-2 ring-blue-500' : ''
      }`}
      onClick={onSelect}
    >
      <h3 className="text-lg font-medium capitalize mb-2">{role}</h3>
      <p className="text-sm">{descriptions[role]}</p>
      
      {isActive && (
        <div className="mt-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
          Active
        </div>
      )}
    </div>
  );
};

// Statistics card component
const StatCard: React.FC<{
  title: string;
  value: string;
  description: string;
  trend: 'up' | 'down' | 'neutral';
}> = ({ title, value, description, trend }) => {
  // Trend colors and icons
  const trendConfig = {
    up: {
      color: 'text-green-500',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      ),
    },
    down: {
      color: 'text-red-500',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ),
    },
    neutral: {
      color: 'text-gray-500',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      ),
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</h3>
      <div className="flex items-baseline">
        <span className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</span>
        <span className={`ml-2 flex items-center text-sm ${trendConfig[trend].color}`}>
          {trendConfig[trend].icon}
        </span>
      </div>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
    </div>
  );
};

// This page is accessible to all authenticated users
export default withRoleAccess(EnhancedDashboardPage, ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder']);

// Server-side props
export const getServerSideProps: GetServerSideProps = async (context) => {
  // In a real implementation, we would check the user's authenticated state
  // and do server-side role validation
  
  return {
    props: {},
  };
};