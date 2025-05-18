import { useState, useEffect } from 'react';
import { getSimplifiedDashboardLayout } from '../../components/layout/SimplifiedDashboardLayout';
import { useLocalRole } from '../../hooks/useLocalRole';
import { UserRole } from '../../context/RoleContext';

/**
 * Main dashboard page using the simplified role switching approach
 */
const MainDashboard = () => {
  const { localRole } = useLocalRole();
  // Add state to track current role for UI updates
  const [displayRole, setDisplayRole] = useState<UserRole>(localRole as UserRole);
  
  // Set test mode flags on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('isTestMode', 'true');
      localStorage.setItem('bypass_api_calls', 'true');
      localStorage.setItem('force_all_roles_available', 'true');
    }
  }, []);
  
  // Listen for role changes
  useEffect(() => {
    console.log("Setting up role listener in main dashboard");
    
    // Update display role when localRole changes
    setDisplayRole(localRole as UserRole);
    
    // Listen for role change events
    const handleRoleChange = (event: Event) => {
      const customEvent = event as CustomEvent<{
        from: string;
        to: string;
        timestamp: string;
      }>;
      
      console.log("Role changed event detected:", customEvent.detail);
      setDisplayRole(customEvent.detail.to as UserRole);
    };
    
    // Add and remove event listener
    document.addEventListener('roleSwitched', handleRoleChange);
    return () => {
      document.removeEventListener('roleSwitched', handleRoleChange);
    };
  }, [localRole]);
  
  // Helper function to get role-specific content based on current display role
  const getRoleContent = () => {
    console.log("Rendering content for role:", displayRole);
    switch (displayRole) {
      case 'advertiser':
        return (
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-300 mb-3">
              Advertiser Dashboard
            </h3>
            <p className="text-orange-700 dark:text-orange-400 mb-4">
              Create and manage your advertising campaigns, monitor performance, and control your budget.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
                <div className="font-semibold mb-1">Active Campaigns</div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-500">3</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
                <div className="font-semibold mb-1">Total Impressions</div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-500">24,578</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
                <div className="font-semibold mb-1">Total Clicks</div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-500">1,245</div>
              </div>
            </div>
            
            <button className="mt-6 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md">
              Create New Campaign
            </button>
          </div>
        );
        
      case 'publisher':
        return (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-3">
              Publisher Dashboard
            </h3>
            <p className="text-green-700 dark:text-green-400 mb-4">
              Manage your ad spaces, review earnings, and customize content preferences.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
                <div className="font-semibold mb-1">Active Ad Spaces</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-500">2</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
                <div className="font-semibold mb-1">Earnings (sats)</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-500">15,420</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
                <div className="font-semibold mb-1">Fill Rate</div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-500">92%</div>
              </div>
            </div>
            
            <button className="mt-6 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md">
              Add New Ad Space
            </button>
          </div>
        );
        
      case 'admin':
        return (
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300 mb-3">
              Admin Dashboard
            </h3>
            <p className="text-purple-700 dark:text-purple-400 mb-4">
              Monitor platform activity, manage users, and review content approvals.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
                <div className="font-semibold mb-1">Total Users</div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-500">378</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
                <div className="font-semibold mb-1">Pending Approvals</div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-500">12</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
                <div className="font-semibold mb-1">Platform Health</div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-500">Good</div>
              </div>
            </div>
            
            <button className="mt-6 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md">
              View Admin Panel
            </button>
          </div>
        );
        
      case 'stakeholder':
        return (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-emerald-800 dark:text-emerald-300 mb-3">
              Stakeholder Dashboard
            </h3>
            <p className="text-emerald-700 dark:text-emerald-400 mb-4">
              Review platform performance, analyze key metrics, and track growth trends.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
                <div className="font-semibold mb-1">Platform Revenue</div>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">1.2M sats</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
                <div className="font-semibold mb-1">Monthly Growth</div>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">28%</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow">
                <div className="font-semibold mb-1">User Retention</div>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-500">85%</div>
              </div>
            </div>
            
            <button className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md">
              View Full Reports
            </button>
          </div>
        );
        
      default: // user role
        return (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">
              Viewer Dashboard
            </h3>
            <p className="text-blue-700 dark:text-blue-400 mb-4">
              Welcome to the Nostr Ad Marketplace. Select a role to see specialized dashboard content.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm">
                <h4 className="font-semibold text-lg mb-2 text-orange-600 dark:text-orange-500">
                  Become an Advertiser
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Create and manage ad campaigns to reach your target audience.
                </p>
                <button className="text-sm bg-orange-100 hover:bg-orange-200 text-orange-800 px-3 py-1 rounded">
                  Learn More
                </button>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm">
                <h4 className="font-semibold text-lg mb-2 text-green-600 dark:text-green-500">
                  Become a Publisher
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Monetize your content by displaying relevant ads to your audience.
                </p>
                <button className="text-sm bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        );
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Welcome to Your Nostr Ad Marketplace Dashboard
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Use the role selector in the sidebar to switch between different user types and see 
          how the dashboard content changes. Your current role is: <strong className="font-semibold">{displayRole}</strong>
        </p>
        
        {getRoleContent()}
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Best Practices Implementation
        </h2>
        
        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-md border border-indigo-100 dark:border-indigo-800">
          <h3 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-2">
            Simplified Role Management Features:
          </h3>
          
          <ul className="list-disc list-inside space-y-1 text-indigo-700 dark:text-indigo-400">
            <li>Immediate UI updates when changing roles</li>
            <li>Smooth visual transitions between roles</li>
            <li>Dynamic sidebar navigation based on role</li>
            <li>LocalStorage persistence for role preference</li>
            <li>Simple implementation with minimal complexity</li>
            <li>Skip API calls in test/development mode</li>
            <li>Role state synchronization between components</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Apply the simplified dashboard layout
MainDashboard.getLayout = function getLayout(page: React.ReactElement) {
  return getSimplifiedDashboardLayout(page, 'Main Dashboard');
};

export default MainDashboard;