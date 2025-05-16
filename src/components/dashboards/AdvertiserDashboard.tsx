import React from 'react';

interface AdvertiserDashboardProps {
  page?: string;
}

const AdvertiserDashboard: React.FC<AdvertiserDashboardProps> = ({ page = '' }) => {
  // Render different content based on the page path
  const renderContent = () => {
    switch (page) {
      case 'campaigns':
        return <CampaignsContent />;
      case 'ads':
        return <AdsContent />;
      case 'analytics':
        return <AnalyticsContent />;
      case 'billing':
        return <BillingContent />;
      default:
        return <AdvertiserHomeContent />;
    }
  };
  
  return <div>{renderContent()}</div>;
};

// Home content
const AdvertiserHomeContent: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Advertiser Dashboard</h1>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4">
        <h2 className="text-lg font-medium mb-2">Account Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
            <div className="text-sm text-gray-500 dark:text-gray-400">Balance</div>
            <div className="text-xl font-bold">0 sats</div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
            <div className="text-sm text-gray-500 dark:text-gray-400">Active Campaigns</div>
            <div className="text-xl font-bold">0</div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Impressions</div>
            <div className="text-xl font-bold">0</div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-2">Quick Actions</h2>
          <div className="space-y-2">
            <a
              href="/dashboard/advertiser/campaigns/create"
              className="block w-full px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 text-center"
            >
              Create Campaign
            </a>
            <a
              href="/dashboard/billing"
              className="block w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-center"
            >
              Add Funds
            </a>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-2">Recent Activity</h2>
          <div className="text-gray-500 dark:text-gray-400 text-center py-6">
            No recent activity
          </div>
        </div>
      </div>
    </div>
  );
};

// Campaigns content
const CampaignsContent: React.FC = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Your Campaigns</h1>
        <a
          href="/dashboard/advertiser/campaigns/create"
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Create Campaign
        </a>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="text-gray-500 dark:text-gray-400 text-center py-8">
          You don't have any campaigns yet
        </div>
      </div>
    </div>
  );
};

// Ads content
const AdsContent: React.FC = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Your Ads</h1>
        <a
          href="/dashboard/advertiser/campaigns/create"
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Create Campaign
        </a>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="text-gray-500 dark:text-gray-400 text-center py-8">
          You don't have any ads yet. Create a campaign to add ads.
        </div>
      </div>
    </div>
  );
};

// Analytics content
const AnalyticsContent: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Performance Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-2">Impressions Over Time</h2>
          <div className="h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded">
            <span className="text-gray-500 dark:text-gray-400">No data available</span>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-2">Clicks Over Time</h2>
          <div className="h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded">
            <span className="text-gray-500 dark:text-gray-400">No data available</span>
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="text-lg font-medium mb-2">Campaign Performance</h2>
        <div className="text-gray-500 dark:text-gray-400 text-center py-6">
          No campaign data available
        </div>
      </div>
    </div>
  );
};

// Billing content
const BillingContent: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Billing & Payments</h1>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4">
        <h2 className="text-lg font-medium mb-2">Wallet Balance</h2>
        <div className="text-2xl font-bold">0 sats</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">≈ $0.00 USD</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-2">Add Funds</h2>
          <p className="mb-4">Add funds to your advertiser wallet using Lightning Network.</p>
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Generate Invoice
          </button>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-2">Transaction History</h2>
          <div className="text-gray-500 dark:text-gray-400 text-center py-6">
            No transaction history
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvertiserDashboard;