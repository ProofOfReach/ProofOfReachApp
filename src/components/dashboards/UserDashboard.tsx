import React from 'react';

interface ViewerDashboardProps {
  page?: string;
}

const ViewerDashboard: React.FC<ViewerDashboardProps> = ({ page = '' }) => {
  // Render different content based on the page path
  const renderContent = () => {
    switch (page) {
      case 'settings':
        return <ViewerSettingsContent />;
      case 'wallet':
        return <ViewerWalletContent />;
      case 'developer':
        return <ViewerDeveloperContent />;
      default:
        return <ViewerHomeContent />;
    }
  };
  
  return <div>{renderContent()}</div>;
};

// Home content
const ViewerHomeContent: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Viewer Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-2">Welcome to Nostr Ad Marketplace</h2>
          <p className="text-gray-600 dark:text-gray-400">
            This is your personal dashboard. From here you can manage your account and preferences.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-2">Quick Links</h2>
          <ul className="space-y-2">
            <li>
              <a href="/nostr-feed" className="text-blue-500 dark:text-blue-400 hover:underline">
                Browse Nostr Feed
              </a>
            </li>
            <li>
              <a href="/dashboard/user/settings" className="text-blue-500 dark:text-blue-400 hover:underline">
                Account Settings
              </a>
            </li>
            <li>
              <a href="/dashboard/user/wallet" className="text-blue-500 dark:text-blue-400 hover:underline">
                Manage Wallet
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Settings content
const ViewerSettingsContent: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Viewer Settings</h1>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="text-lg font-medium mb-2">Account Preferences</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Display Name</label>
            <input
              type="text"
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              placeholder="Your display name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email Notifications</label>
            <div className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span>Receive email notifications</span>
            </div>
          </div>
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

// Wallet content
const UserWalletContent: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Wallet</h1>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4">
        <h2 className="text-lg font-medium mb-2">Balance</h2>
        <div className="text-2xl font-bold">0 sats</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">≈ $0.00 USD</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-2">Deposit</h2>
          <p className="mb-4">Add funds to your wallet using Lightning Network.</p>
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Generate Invoice
          </button>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-2">Withdraw</h2>
          <p className="mb-4">Withdraw funds from your wallet via Lightning Network.</p>
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Create Withdrawal
          </button>
        </div>
      </div>
    </div>
  );
};

// Developer content
const UserDeveloperContent: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Developer Tools</h1>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4">
        <h2 className="text-lg font-medium mb-2">API Access</h2>
        <p className="mb-4">Manage your API keys and access the Nostr Ad Marketplace API.</p>
        <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Create API Key
        </button>
      </div>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="text-lg font-medium mb-2">Documentation</h2>
        <p className="mb-4">Access API documentation and developer resources.</p>
        <a
          href="/api-docs"
          className="inline-block px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          View API Docs
        </a>
      </div>
    </div>
  );
};

export default UserDashboard;