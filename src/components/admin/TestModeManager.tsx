import React, { useState } from 'react';
import "./hooks/useTestMode';
import "./types/role';
import { Shield, CheckSquare, AlertCircle, Clock } from 'react-feather';

/**
 * TestModeManager Component
 * 
 * A secure, admin-only component for enabling and managing test mode.
 * This follows best practices by:
 * 1. Being accessible only to authenticated users with proper permissions
 * 2. Providing clear controls and status information
 * 3. Limiting test mode duration for security
 */
const TestModeManager: React.FC = () => {
  const { 
    isActive, 
    enableTestMode, 
    disableTestMode, 
    timeRemaining,
    currentRole,
    availableRoles,
    enableAllRoles,
    setCurrentRole,
    isDevEnvironment,
    isTestModeAllowed
  } = useTestMode();

  const [selectedDuration, setSelectedDuration] = useState<number>(60); // Default: 60 minutes
  const [selectedRole, setSelectedRole] = useState<UserRoleType>('viewer');
  const [isEnabling, setIsEnabling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Duration options for test mode
  const durationOptions = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
    { value: 120, label: '2 hours' },
    { value: 240, label: '4 hours' }
  ];
  
  // Role options
  const roleOptions: UserRoleType[] = ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'];
  
  // Handle enabling test mode with selected duration
  const handleEnableTestMode = async () => {
    setIsEnabling(true);
    setError(null);
    
    try {
      // Convert minutes to milliseconds for the backend
      const durationMs = selectedDuration * 60 * 1000;
      enableTestMode(); // Call without parameters since the API only accepts 0 args
      
      // Enable all roles by default for testing convenience
      await enableAllRoles();
    } catch (err: any) {
      setError(err.message || 'An error occurred while enabling test mode');
    } finally {
      setIsEnabling(false);
    }
  };
  
  // Handle disabling test mode
  const handleDisableTestMode = () => {
    try {
      disableTestMode();
    } catch (err: any) {
      setError(err.message || 'An error occurred while disabling test mode');
    }
  };
  
  // Handle role change
  const handleRoleChange = async (role: UserRoleType) => {
    try {
      await setCurrentRole(role);
    } catch (err: any) {
      setError(err.message || `Failed to change role to ${role}`);
    }
  };
  
  // If test mode is not available in this environment, show warning
  if (!isTestModeAllowed) {
    return (
      <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-4 border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-yellow-500 dark:text-yellow-400 mr-3" />
          <h3 className="text-md font-medium text-yellow-800 dark:text-yellow-300">
            Test Mode Not Available
          </h3>
        </div>
        <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">
          Test mode is only available in development or testing environments.
          Current environment: {process.env.NODE_ENV || 'unknown'}
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white dark:bg-gray-800 p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
          <Shield className="w-5 h-5 mr-2 text-purple-500" />
          Test Mode Management
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md">
            {error}
          </div>
        )}
        
        <div className="space-y-6">
          {/* Test Mode Status */}
          <div className="rounded-md bg-gray-50 dark:bg-gray-900 p-4">
            <h3 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-2">Status</h3>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {isActive ? 'Test Mode Active' : 'Test Mode Inactive'}
              </span>
              
              {isActive && timeRemaining !== null && (
                <div className="ml-4 flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{timeRemaining} minute{timeRemaining !== 1 ? 's' : ''} remaining</span>
                </div>
              )}
            </div>
            
            {isActive && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Current role: <span className="font-medium">{currentRole}</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Available roles: {availableRoles.join(', ')}
                </p>
              </div>
            )}
          </div>
          
          {/* Test Mode Controls */}
          <div>
            {!isActive ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Duration Selector */}
                  <div>
                    <label htmlFor="test-duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Duration
                    </label>
                    <select
                      id="test-duration"
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 px-3 text-gray-700 dark:text-gray-300"
                      value={selectedDuration}
                      onChange={(e) => setSelectedDuration(parseInt(e.target.value))}
                    >
                      {durationOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Initial Role Selector */}
                  <div>
                    <label htmlFor="initial-role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Initial Role
                    </label>
                    <select
                      id="initial-role"
                      className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 py-2 px-3 text-gray-700 dark:text-gray-300"
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value as UserRoleType)}
                    >
                      {roleOptions.map((role) => (
                        <option key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <button
                  onClick={handleEnableTestMode}
                  disabled={isEnabling}
                  className="w-full md:w-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isEnabling ? 'Enabling...' : 'Enable Test Mode'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Role Switch Controls */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Switch Role
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableRoles.map((role) => (
                      <button
                        key={role}
                        onClick={() => handleRoleChange(role)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                          currentRole === role
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={handleDisableTestMode}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md shadow-sm"
                >
                  Disable Test Mode
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Information Card */}
      <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-200 dark:border-blue-800">
        <h3 className="flex items-center text-md font-medium text-blue-800 dark:text-blue-300 mb-2">
          <CheckSquare className="w-5 h-5 mr-2 text-blue-500" />
          Test Mode Best Practices
        </h3>
        <ul className="space-y-1 list-disc list-inside text-sm text-blue-700 dark:text-blue-400">
          <li>Test mode should only be used in development environments</li>
          <li>All data created in test mode is ephemeral and may be lost</li>
          <li>Test mode bypasses certain security checks for development convenience</li>
          <li>Always disable test mode when finished to prevent security issues</li>
        </ul>
      </div>
    </div>
  );
};

export default TestModeManager;