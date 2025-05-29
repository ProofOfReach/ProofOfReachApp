import { useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { LogOut } from 'react-feather';

/**
 * System logout page
 * This page performs a complete cleanup of all roles and state
 * It's a dedicated page to ensure proper cleanup happens when a user logs out
 */
const SystemLogout: NextPage = () => {
  const router = useRouter();
  
  // Clean up all roles and state on mount
  useEffect(() => {
    const performLogout = async () => {
      try {
        // First, clear local state (manual cleanup since clearLocalState doesn't exist)
        // RoleService.clearLocalState();
        
        // Set the prevent_auto_login flag to ensure we don't get auto logged back in
        if (typeof window !== 'undefined') {
          localStorage.setItem('prevent_auto_login', 'true');
          
          // Clear ALL role-related localStorage items that cause conflicts
          localStorage.removeItem('currentRole');
          localStorage.removeItem('userRole');
          localStorage.removeItem('selectedRole');
          localStorage.removeItem('nostr_test_npub');
          localStorage.removeItem('nostr_test_nsec');
          localStorage.removeItem('isTestMode');
          localStorage.removeItem('auth');
          
          // Clear sessionStorage too
          sessionStorage.removeItem('auth');
          sessionStorage.removeItem('currentRole');
          
          // Clear auth-related cookies directly too
          document.cookie = 'nostr_pubkey=; path=/; max-age=0';
          document.cookie = 'auth_token=; path=/; max-age=0';
          document.cookie = 'auth_session=; path=/; max-age=0';
          document.cookie = 'nostr_auth_session=; path=/; max-age=0';
        }
        
        // Then, notify server for cleanup
        try {
          await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
          });
        } catch (error) {
          console.log('Error logging out from server:', error);
        }
        
        // Wait briefly to allow cleanup to complete
        setTimeout(() => {
          // Redirect to home page
          router.push('/');
        }, 1000);
      } catch (error) {
        console.log('Error during logout:', error);
        
        // Even on error, try to set prevent_auto_login flag and redirect
        if (typeof window !== 'undefined') {
          localStorage.setItem('prevent_auto_login', 'true');
          setTimeout(() => router.push('/'), 1000);
        }
      }
    };
    
    performLogout();
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full p-6 space-y-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
        <div className="flex flex-col items-center text-center">
          <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
            <LogOut className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Logging Out
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please wait while we safely log you out of the system...
          </p>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-6">
            <div className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full animate-pulse w-full"></div>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This will only take a moment. You'll be redirected automatically.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SystemLogout;