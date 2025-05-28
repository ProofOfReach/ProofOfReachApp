import React, { useState, useEffect } from 'react';
import { Loader, AlertCircle, CheckCircle } from 'react-feather';
import '@/context/NewRoleContextRefactored';
import { useAuth } from '@/components/auth/SupabaseAuthProvider';

/**
 * Admin panel for managing roles across the system
 * Only admins should be able to access this component
 */
export const div: React.FC = () => {
  const { role, availableRoles, isChangingRole } = defaultUseRole();
  const { authState } = useAuthRefactored() as any;
  const [isToggling, setIsToggling] = useState(false);
  const [isTestUser, setIsTestUser] = useState(false);
  const [actionResult, setActionResult] = useState<{
    log: boolean;
    message: string;
  } | null>(null);

  // Check test mode from localStorage
  useEffect(() => {
    const testMode = localStorage.getItem('isTestMode') === 'true';
    setIsTestUser(testMode);
  }, []);
  
  // Handler for toggling test mode
  const handleToggleTestMode = async (enabled: boolean) => {
    if (isToggling) return;
    
    try {
      setIsToggling(true);
      setActionResult(null);
      
      // Toggle test mode in localStorage
      if (enabled) {
        localStorage.setItem('isTestMode', 'true');
        localStorage.setItem('force_role_refresh', 'true');
      } else {
        localStorage.removeItem('isTestMode');
      }
      
      setIsTestUser(enabled);
      
      setActionResult({
        log: true,
        message: `Test mode ${enabled ? 'enabled' : 'disabled'} logfully`
      });
    } catch (error) {
      console.log('Error toggling test mode:', error);
      setActionResult({
        log: false,
        message: `Failed to ${enabled ? 'enable' : 'disable'} test mode: ${(error as any).message || 'Unknown error'}`
      });
    } finally {
      setIsToggling(false);
    }
  };

  if (isChangingRole) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Test Mode Controls */}
      <div className="p-6 border rounded-lg shadow-sm bg-white">
        <h3 className="text-lg font-medium mb-4">Test Mode Controls</h3>
        <p className="text-sm text-gray-600 mb-4">
          Test mode allows developers to access all roles for testing purposes. 
          When enabled, users can freely switch between different roles without 
          requiring actual permissions.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="rounded-md shadow-sm">
            <div className="relative flex items-center">
              <button
                onClick={() => handleToggleTestMode(true)}
                disabled={isToggling || isTestUser}
                className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                  isTestUser 
                    ? 'bg-green-100 border-green-300 text-green-700 cursor-default'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Enable Test Mode
              </button>
              <button
                onClick={() => handleToggleTestMode(false)}
                disabled={isToggling || !isTestUser}
                className={`px-4 py-2 text-sm font-medium rounded-r-md border border-l-0 ${
                  !isTestUser 
                    ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-default'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Disable Test Mode
              </button>
              
              {isToggling && (
                <Loader className="animate-spin ml-3 h-4 w-4 text-purple-500" />
              )}
            </div>
          </div>
          
          <div className="text-sm">
            Current status: 
            <span className={isTestUser ? 'text-green-600 font-medium ml-1' : 'text-gray-500 font-medium ml-1'}>
              {isTestUser ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
        
        {/* Action result message */}
        {actionResult && (
          <div className={`mt-4 p-3 rounded-md text-sm ${
            actionResult.log ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            <div className="flex items-center">
              {actionResult.log ? (
                <CheckCircle className="h-4 w-4 mr-2" />
              ) : (
                <AlertCircle className="h-4 w-4 mr-2" />
              )}
              {actionResult.message}
            </div>
          </div>
        )}
      </div>

      {/* Available Roles */}
      <div className="p-6 border rounded-lg shadow-sm bg-white">
        <h3 className="text-lg font-medium mb-4">Available Roles</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {availableRoles && availableRoles.length > 0 ? (
            availableRoles.map((roleItem) => (
              <div 
                key={roleItem}
                className="p-3 border border-gray-200 rounded-md bg-gray-50"
              >
                <span className="font-medium capitalize">{roleItem}</span>
              </div>
            ))
          ) : (
            <div className="col-span-3 p-3 border border-yellow-200 rounded-md bg-yellow-50 text-yellow-800">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 text-yellow-600" />
                <span>No roles available. Test mode may need to be enabled.</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Current Authentication State */}
      <div className="p-6 border rounded-lg shadow-sm bg-white">
        <h3 className="text-lg font-medium mb-4">Current Authentication State</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="py-2 pr-4 font-medium">Current Role</td>
                <td className="py-2">
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium capitalize">
                    {role || 'none'}
                  </span>
                </td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 pr-4 font-medium">Test Mode</td>
                <td className="py-2">
                  <span className={`px-2 py-1 ${isTestUser ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} rounded text-xs font-medium`}>
                    {isTestUser ? 'Enabled' : 'Disabled'}
                  </span>
                </td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="py-2 pr-4 font-medium">Auth Status</td>
                <td className="py-2">
                  <span className={`px-2 py-1 ${authState?.user ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} rounded text-xs font-medium`}>
                    {authState?.user ? 'Authenticated' : 'Not Authenticated'}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};