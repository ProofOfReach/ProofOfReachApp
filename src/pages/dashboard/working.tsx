import React, { useState, useEffect } from 'react';
import type { UserRole } from '../../context/RoleContext';
import RoleDropdown from '../../components/role/RoleDropdown';

/**
 * Simple dashboard with direct role management
 */
const WorkingDashboard = () => {
  // State to track current role and transitions
  const [currentRole, setCurrentRole] = useState<UserRole>('viewer');
  const [transitionCount, setTransitionCount] = useState(0);
  const [transitionHistory, setTransitionHistory] = useState<string[]>([]);
  
  // Set test mode flags when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Read initial role from localStorage if available
      const savedRole = localStorage.getItem('userRole');
      if (savedRole) {
        setCurrentRole(savedRole as UserRole);
      }
      
      // Set test mode flags
      localStorage.setItem('isTestMode', 'true');
      localStorage.setItem('bypass_api_calls', 'true');
      localStorage.setItem('force_all_roles_available', 'true');
      localStorage.setItem('test_user_role', 'true');
      localStorage.setItem('test_advertiser_role', 'true');
      localStorage.setItem('test_publisher_role', 'true');
      localStorage.setItem('test_admin_role', 'true');
      localStorage.setItem('test_stakeholder_role', 'true');
    }
  }, []);
  
  // Listen for role transition events
  useEffect(() => {
    const handleRoleTransition = (event: Event) => {
      const customEvent = event as CustomEvent<{
        from: string;
        to: string;
        timestamp: string;
      }>;
      
      console.log('Role transition detected:', customEvent.detail);
      
      // Update current role
      setCurrentRole(customEvent.detail.to as UserRole);
      
      // Update transition history
      setTransitionHistory(prev => {
        const newHistory = [...prev, `${customEvent.detail.from} → ${customEvent.detail.to}`];
        return newHistory.slice(-5); // Keep only last 5 transitions
      });
      
      // Increment transition counter
      setTransitionCount(count => count + 1);
    };
    
    // Add and remove event listeners
    document.addEventListener('roleSwitched', handleRoleTransition);
    return () => {
      document.removeEventListener('roleSwitched', handleRoleTransition);
    };
  }, []);
  
  // Handle role change directly
  const handleRoleChange = (newRole: UserRole) => {
    if (currentRole === newRole) return;
    
    // Store previous role for event
    const oldRole = currentRole;
    
    // Update role in localStorage
    localStorage.setItem('userRole', newRole);
    
    // Update current role
    setCurrentRole(newRole);
    
    // Create and dispatch event
    const eventId = `${oldRole}-to-${newRole}-${Date.now()}`;
    const event = new CustomEvent('roleSwitched', {
      detail: {
        id: eventId,
        from: oldRole,
        to: newRole,
        timestamp: new Date().toISOString()
      }
    });
    
    document.dispatchEvent(event);
    console.log('Role changed manually:', { from: oldRole, to: newRole });
  };
  
  // Role-specific dashboard content
  const getDashboardContent = () => {
    switch (currentRole) {
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
          </div>
        );
        
      default: // user role
        return (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">
              Viewer Dashboard
            </h3>
            <p className="text-blue-700 dark:text-blue-400 mb-4">
              Welcome to Proof Of Reach. Select a role to see specialized dashboard content.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm">
                <h4 className="font-semibold text-lg mb-2 text-orange-600 dark:text-orange-500">
                  Become an Advertiser
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Create and manage ad campaigns to reach your target audience.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm">
                <h4 className="font-semibold text-lg mb-2 text-green-600 dark:text-green-500">
                  Become a Publisher
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Monetize your content by displaying relevant ads to your audience.
                </p>
              </div>
            </div>
          </div>
        );
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Working Role Switching Example
        </h1>
        
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            This example implements direct role switching with immediate UI updates. Your current role is:
            <span className={`font-bold ml-2 ${
              currentRole === 'viewer' ? 'text-blue-600 dark:text-blue-300' :
              currentRole === 'advertiser' ? 'text-orange-600 dark:text-orange-300' :
              currentRole === 'publisher' ? 'text-green-600 dark:text-green-300' :
              currentRole === 'admin' ? 'text-purple-600 dark:text-purple-300' :
              'text-emerald-600 dark:text-emerald-300'
            }`}>
              {currentRole}
            </span>
          </p>
          
          <div className="flex gap-4 mb-6">
            <button 
              onClick={() => handleRoleChange('viewer')} 
              className={`px-4 py-2 rounded-md ${currentRole === 'viewer' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}
            >
              Viewer
            </button>
            <button 
              onClick={() => handleRoleChange('advertiser')} 
              className={`px-4 py-2 rounded-md ${currentRole === 'advertiser' 
                ? 'bg-orange-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}
            >
              Advertiser
            </button>
            <button 
              onClick={() => handleRoleChange('publisher')} 
              className={`px-4 py-2 rounded-md ${currentRole === 'publisher' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}
            >
              Publisher
            </button>
            <button 
              onClick={() => handleRoleChange('admin')} 
              className={`px-4 py-2 rounded-md ${currentRole === 'admin' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}
            >
              Admin
            </button>
            <button 
              onClick={() => handleRoleChange('stakeholder')} 
              className={`px-4 py-2 rounded-md ${currentRole === 'stakeholder' 
                ? 'bg-emerald-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}
            >
              Stakeholder
            </button>
          </div>
          
          <div className="flex gap-4 mb-6">
            <div className="w-1/2">
              <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">RoleDropdown Component</h3>
              <RoleDropdown 
                skipNavigation={true} 
                className="w-full" 
                onRoleChange={handleRoleChange} 
              />
            </div>
            
            <div className="w-1/2 bg-indigo-50 dark:bg-indigo-900/20 rounded-md p-4 border border-indigo-100 dark:border-indigo-800">
              <h3 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-2">
                Transition History ({transitionCount} changes):
              </h3>
              
              {transitionHistory.length > 0 ? (
                <ul className="space-y-1">
                  {transitionHistory.map((transition, index) => (
                    <li 
                      key={index} 
                      className="text-indigo-700 dark:text-indigo-400 font-mono text-sm border-l-2 border-indigo-300 dark:border-indigo-700 pl-2"
                    >
                      {transition}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-indigo-600 dark:text-indigo-400 italic">
                  No transitions yet. Try switching roles.
                </p>
              )}
            </div>
          </div>
        </div>
        
        {getDashboardContent()}
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Implementation Details
        </h2>
        
        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-md border border-indigo-100 dark:border-indigo-800">
          <h3 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-2">
            Key Features of This Implementation:
          </h3>
          
          <ul className="list-disc list-inside space-y-1 text-indigo-700 dark:text-indigo-400">
            <li>Local state directly in the dashboard component</li>
            <li>Immediate UI updates when role changes</li>
            <li>Manual event dispatching for transition tracking</li>
            <li>Works with both direct buttons and RoleDropdown component</li>
            <li>Simplified architecture with fewer layers</li>
            <li>Event-based communication</li>
            <li>Deduplication with unique event IDs</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WorkingDashboard;