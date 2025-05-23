import React from 'react';
import { NextPageWithLayout } from '../_app';
import.*./hooks/useAuth';
import.*./components/admin/TestModeManager';
import { Shield, AlertTriangle } from 'react-feather';
import.*./utils/layoutHelpers';

/**
 * Test Mode Management Page
 * 
 * This page provides administrative controls for managing test mode.
 * It follows security best practices by:
 * 1. Being accessible only to logged-in users with admin privileges
 * 2. Providing clear controls and status information
 * 3. Including appropriate warnings about test mode usage
 */
const TestModePage: NextPageWithLayout = () => {
  const { auth } = useAuth();
  
  // Show simple loading state if auth is not yet available
  if (!auth) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Loading...</h1>
      </div>
    );
  }
  
  // Check if user is an admin by looking at the availableRoles 
  const isAdmin = auth.availableRoles.includes('admin');
  
  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Shield className="w-6 h-6 mr-3 text-purple-600" />
        <h1 className="text-2xl font-bold">Test Mode Management</h1>
      </div>
      
      {!isAdmin ? (
        <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-4 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-500 dark:text-yellow-400 mr-3" />
            <h3 className="text-md font-medium text-yellow-800 dark:text-yellow-300">
              Access Restricted
            </h3>
          </div>
          <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">
            This page is only accessible to users with admin privileges.
            Please contact your administrator if you require access.
          </p>
        </div>
      ) : (
        <TestModeManager />
      )}
    </div>
  );
};

// Apply the dashboard layout
TestModePage.getLayout = getDashboardLayout;

export default TestModePage;