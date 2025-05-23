import React, { useEffect, useState } from 'react';
import { Loader, RefreshCw } from 'react-feather';
import { useRouter } from 'next/router';
import "./context/NewRoleContextRefactored';
import "./lib/logger';

/**
 * Simple page to enable test mode with admin role
 * Used as a direct URL for quickly enabling test mode
 */
const EnableAdminMode: React.FC = () => {
  const router = useRouter();
  const { setRole, availableRoles } = useRoleRefactored();
  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(true);
  const [debugInfo, setDebugInfo] = useState<Record<string, any>>({});
  const [showDebug, setShowDebug] = useState(false);
  
  useEffect(() => {
    try {
      // Ensure we have a clean state
      localStorage.removeItem('force_role_refresh');
      
      // Get current state for debugging
      const currentState = {
        currentRole: localStorage.getItem('userRole'),
        isTestMode: localStorage.getItem('isTestMode'),
        availableRoles
      };
      
      // Set test mode and admin role
      localStorage.setItem('isTestMode', 'true');
      localStorage.setItem('userRole', 'admin');
      localStorage.setItem('force_role_refresh', 'true');
      
      logger.log('Admin test mode enabled successfully');
      
      // Capture debug info
      setDebugInfo({
        before: currentState,
        after: {
          currentRole: localStorage.getItem('userRole'),
          isTestMode: localStorage.getItem('isTestMode')
        }
      });
      
      // Use both approaches to ensure it works: direct role setting and navigation
      setRole('admin', '/dashboard/admin')
        .then((success) => {
          logger.log('Role set via context:', success);
          
          if (!success) {
            // Fall back to direct navigation if context update fails
            setTimeout(() => {
              window.location.href = '/dashboard/admin';
            }, 1500);
          }
        })
        .catch(err => {
          logger.logger.error('Error in setRole:', err);
          // Fall back to direct navigation
          setTimeout(() => {
            window.location.href = '/dashboard/admin';
          }, 1500);
        });
      
      return () => {}; // No cleanup needed
    } catch (err) {
      console.logger.error('Error enabling admin test mode:', err);
      setError('Failed to enable test mode. Please try again or check console for details.');
      setIsRedirecting(false);
    }
  }, [router, setRole, availableRoles]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-xl font-bold text-center text-gray-800 mb-4">
          Test Mode Configuration
        </h1>
        
        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        ) : (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Loader className="h-8 w-8 text-purple-500 animate-spin" />
            </div>
            <p className="text-gray-600">
              Enabling admin test mode...
            </p>
            <p className="text-gray-500 text-sm mt-2">
              You will be redirected to the admin dashboard in a moment.
            </p>
          </div>
        )}
        
        {!isRedirecting && (
          <div className="mt-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        )}
        
        <div className="mt-6 border-t pt-4">
          <button
            onClick={() => {
              // Manual hard reload approach
              localStorage.setItem('isTestMode', 'true');
              localStorage.setItem('userRole', 'admin');
              localStorage.setItem('force_role_refresh', 'true');
              window.location.href = '/dashboard/admin'; // Hard navigation
            }}
            className="w-full flex items-center justify-center px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Force Refresh with Admin Role
          </button>
        </div>
        
        <div className="mt-4 text-xs text-gray-500 text-center">
          <p>
            This page enables test mode and sets your role to admin. 
            For development purposes only.
          </p>
          <p className="mt-2">
            If automatic redirection doesn't work, use the Force Refresh button above.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnableAdminMode;