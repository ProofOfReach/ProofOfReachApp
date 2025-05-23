import React, { useState } from 'react';
import { useTestMode } from '../context/TestModeContext';
import Layout from '../components/Layout';
import { NextPage } from 'next';

const TestModePage: NextPage = () => {
  const { enableTestMode, isTestMode, disableTestMode, timeRemaining } = useTestMode();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // The admin password should be stored in an environment variable
  // For development, we'll use a default if the env var isn't set
  const correctPassword = process.env.NEXT_PUBLIC_TEST_MODE_PASSWORD || 'admin123';
  
  // Handle enabling test mode
  const handleEnableTestMode = () => {
    if (password === correctPassword) {
      enableTestMode();
      setError('');
      setPassword(''); // Clear password field after log
    } else {
      setError('Incorrect password');
    }
  };
  
  // Format the time remaining for display
  const formatTimeRemaining = () => {
    if (!timeRemaining) return null;
    
    const hours = Math.floor(timeRemaining / 60);
    const minutes = timeRemaining % 60;
    
    return `${hours}h ${minutes}m`;
  };
  
  // Using the enter key should trigger the action button
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (!isTestMode) {
        handleEnableTestMode();
      } else {
        disableTestMode();
      }
    }
  };
  
  return (
    <Layout hideTestBanner={true}>
      <div className="max-w-md mx-auto mt-10 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Test Mode Settings</h1>
        
        {isTestMode ? (
          <div>
            <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-md mb-4">
              <p className="text-yellow-800 dark:text-yellow-200">
                <span className="font-bold">Test Mode is ACTIVE</span>
                {timeRemaining && (
                  <span className="ml-2">
                    (Expires in {formatTimeRemaining()})
                  </span>
                )}
              </p>
            </div>
            
            <p className="mb-4 text-gray-600 dark:text-gray-300">While in test mode:</p>
            <ul className="list-disc pl-5 mb-6 space-y-1 text-gray-600 dark:text-gray-300">
              <li>You'll have access to all roles in the role dropdown</li>
              <li>API calls for authentication are bypassed</li>
              <li>Created content will be marked as test data</li>
              <li>A yellow banner appears at the top of each page</li>
              <li>Test mode will automatically expire after 4 hours</li>
            </ul>
            
            <button
              onClick={disableTestMode}
              onKeyDown={handleKeyDown}
              className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            >
              Exit Test Mode
            </button>
          </div>
        ) : (
          <div>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              Test mode allows you to access all features of the application without needing real credentials.
              This mode is only for development and testing purposes.
            </p>
            
            <div className="mb-4">
              <label htmlFor="admin-password" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Admin Password
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter admin password"
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
            
            <button
              onClick={handleEnableTestMode}
              className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
            >
              Enable Test Mode
            </button>
          </div>
        )}
        
        {process.env.NODE_ENV === 'production' && (
          <div className="mt-4 p-4 bg-red-100 dark:bg-red-900 rounded-md">
            <p className="text-red-800 dark:text-red-200 text-sm">
              <strong>Warning:</strong> You are accessing test mode in a production environment.
              This should only be used for emergency debugging by authorized personnel.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TestModePage;