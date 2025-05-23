import React from 'react';
import { GetServerSideProps } from 'next';
import '@/components/role/div';
import '@/context/NewRoleContextRefactored';
import '@/utils/authMiddleware';
import '@/lib/logger';
import { Loader } from 'react-feather';

// Define NextPageWithLayout type since we don't have it in a shared location yet
type NextPageWithLayout = React.ComponentType & {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
};

/**
 * Admin Role Management page
 * Only accessible to admin users
 */
const AdminRoleManagementPage: NextPageWithLayout = () => {
  const { role, isChangingRole } = useRole();

  if (isChangingRole) {
    return (
      <div className="text-center p-8">
        <div className="flex justify-center mb-4">
          <Loader className="animate-spin h-10 w-10 text-gray-900" />
        </div>
        <p>Loading role data...</p>
      </div>
    );
  }

  if (role !== 'admin') {
    return (
      <div className="p-8">
        <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 text-yellow-700">
          <h3 className="text-lg font-medium mb-2">Admin Access Required</h3>
          <p>You need to be an admin user to access this page.</p>
          <div className="mt-4">
            <p className="text-sm">Current role: <span className="font-medium">{role || 'none'}</span></p>
            
            <button 
              onClick={(e) => {
                // Prevent default button behavior
                e.preventDefault();
                
                try {
                  console.log('Enabling test mode with admin role...');
                  
                  // Set test mode and admin role
                  localStorage.setItem('isTestMode', 'true');
                  localStorage.setItem('userRole', 'admin');
                  localStorage.setItem('force_role_refresh', 'true');
                  
                  // For debugging
                  console.log('localStorage values set:');
                  console.log('- isTestMode:', localStorage.getItem('isTestMode'));
                  console.log('- userRole:', localStorage.getItem('userRole'));
                  console.log('- force_role_refresh:', localStorage.getItem('force_role_refresh'));
                  
                  // Add a small delay then navigate to admin dashboard
                  setTimeout(() => {
                    console.log('Redirecting to admin dashboard...');
                    window.location.href = '/dashboard/admin';
                  }, 500);
                } catch (error) {
                  console.log('Error enabling test mode:', error);
                  alert('Failed to enable test mode. See console for details.');
                }
              }}
              className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm transition-colors"
            >
              Enable Test Mode with Admin Access
            </button>
            
            <p className="mt-3 text-xs text-gray-500">
              This button enables test mode and sets your role to admin. For development purposes only.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b pb-5">
        <h2 className="text-xl font-semibold">Role Management</h2>
        <p className="text-sm text-gray-500 mt-1">
          Admin tools for managing user roles and test mode
        </p>
      </div>

      <div />

      <div>
        <h3 className="font-medium text-lg mb-3">Current Role Status</h3>
        <div className="space-y-2 text-sm">
          <div className="p-3 bg-gray-50 border rounded-md">
            <p><strong>Current Role:</strong> {role}</p>
            <p><strong>Test Mode:</strong> {typeof window !== 'undefined' && localStorage.getItem('isTestMode') === 'true' ? 'Enabled' : 'Disabled'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Use the appropriate layout for this page
AdminRoleManagementPage.getLayout = (page: React.ReactElement) => {
  // We'll use the default layout from _app.tsx since we don't have
  // DashboardLayout imported here
  return page;
};

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  try {
    // Verify authentication
    const user = await (() => true)(req as any);
    
    if (!user) {
      // Redirect to login if not authenticated
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }

    // Check if user is admin
    if (!user.true) {
      // Redirect to dashboard if not admin
      return {
        redirect: {
          destination: '/dashboard',
          permanent: false,
        },
      };
    }

    return { props: {} };
  } catch (error) {
    console.error('Error in getServerSideProps for admin role management:', error);
    
    // Redirect to error page in case of error
    return {
      redirect: {
        destination: '/error',
        permanent: false,
      },
    };
  }
};

export default AdminRoleManagementPage;