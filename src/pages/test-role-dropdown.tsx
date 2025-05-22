import React, { useEffect } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import RoleDropdown from '@/components/role/RoleDropdown';
import { UserRole } from '@/context/RoleContext';
import { triggerRoleRefresh } from '@/utils/roleEvents';

/**
 * Test page for Role Dropdown
 * This page helps test the role dropdown component in isolation
 */
const TestRoleDropdownPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = React.useState<UserRole>('user');

  const handleRoleChange = (role: UserRole) => {
    console.log('Role changed to:', role);
    setSelectedRole(role);
  };

  // Use the imported triggerRoleRefresh from the top

  // Effect to manually load the test script and register global force refresh function
  useEffect(() => {
    // Expose a global force refresh function for the role dropdown
    // This will be called by our test panel
    if (typeof window !== 'undefined') {
      (window as any).forceRoleRefresh = () => {
        console.log('Force refreshing roles from test page...');
        // Use our utility function to trigger role refresh
        triggerRoleRefresh();
      };
    }
    
    // Manual script injection to ensure it runs
    const script = document.createElement('script');
    script.src = '/test-role-dropdown.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Clean up script when component unmounts
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      
      // Clean up global function
      if (typeof window !== 'undefined') {
        delete (window as any).forceRoleRefresh;
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <Head>
        <title>Role Dropdown Test</title>
        {/* Inline script to ensure the test panel tools are available */}
        <script dangerouslySetInnerHTML={{ __html: `
          console.log('Inline script running...');
          window.createTestPanelInline = function() {
            if (typeof createTestPanel === 'function') {
              console.log('Calling createTestPanel from inline script');
              createTestPanel();
            } else {
              console.log('createTestPanel not available yet, will try again');
              setTimeout(window.createTestPanelInline, 1000);
            }
          };
          
          // Call after a delay to ensure the script has loaded
          setTimeout(window.createTestPanelInline, 1000);
        `}} />
      </Head>
      
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Role Dropdown Test Page
        </h1>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Role Selector
          </h2>
          
          <div className="w-64 mb-8">
            <RoleDropdown 
              skipNavigation={true} 
              onRoleChange={handleRoleChange}
            />
          </div>
          
          <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-700 rounded-md">
            <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">
              Current State
            </h3>
            <div className="font-mono text-sm">
              <div className="mb-1">
                <span className="font-bold">Selected Role:</span> {selectedRole}
              </div>
              <div className="mb-1">
                <span className="font-bold">Test Mode:</span> {typeof window !== 'undefined' && localStorage.getItem('isTestMode') === 'true' ? 'Enabled' : 'Disabled'}
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-gray-200">
              Instructions
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li>Use the test buttons on the bottom right to set different available roles</li>
              <li>Toggle test mode to switch between test and production behavior</li>
              <li>Verify that only authorized roles appear in the dropdown</li>
              <li>Check that test mode shows a message indicating all roles are available</li>
              <li>Verify that with only one role, a message appears indicating limited access</li>
            </ol>
          </div>
          
          {/* Manual test panel trigger button */}
          <div className="mt-8">
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              onClick={() => {
                if (typeof window !== 'undefined' && typeof (window as any).createTestPanel === 'function') {
                  (window as any).createTestPanel();
                }
              }}
            >
              Show Test Panel
            </button>
          </div>
        </div>
      </div>
      
      {/* Include the test tools script */}
      <Script 
        src="/test-role-dropdown.js" 
        strategy="afterInteractive"
        onLoad={() => {
          console.log('Test script loaded from Next.js Script component');
          if (typeof window !== 'undefined' && typeof (window as any).createTestPanel === 'function') {
            console.log('Creating test panel after script load');
            (window as any).createTestPanel();
          }
        }}
      />
    </div>
  );
};

export default TestRoleDropdownPage;