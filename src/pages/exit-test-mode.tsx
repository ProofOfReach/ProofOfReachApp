import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { NextPage } from 'next';

const ExitTestModePage: NextPage = () => {
  const router = useRouter();
  
  useEffect(() => {
    // Clear all test-related data from storage
    const clearTestMode = () => {
      // Clear session storage
      sessionStorage.removeItem('testModeExpiry');
      sessionStorage.removeItem('testModeEnabled');
      
      // Clear local storage test flags
      localStorage.removeItem('bypass_api_calls');
      localStorage.removeItem('cachedAvailableRoles');
      localStorage.removeItem('roleCacheTimestamp');
      localStorage.removeItem('isTestMode');
      
      // Dispatch an event to notify components
      window.dispatchEvent(new CustomEvent('test-mode-update', { 
        detail: { isTestMode: false } 
      }));
      
      // Log log message
      console.log('Test mode forcefully disabled, all test flags cleared');
      
      // Redirect back to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    };
    
    clearTestMode();
  }, [router]);
  
  return (
    <Layout hideTestBanner={true}>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center">
          <svg 
            className="mx-auto h-12 w-12 text-green-500 mb-4" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 13l4 4L19 7" 
            />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Test Mode Disabled</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            All test flags have been cleared from your browser.
            You will be redirected to the dashboard shortly.
          </p>
          <div className="animate-pulse">
            <div className="h-2 bg-gray-300 dark:bg-gray-600 rounded-full w-full max-w-xs mx-auto"></div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ExitTestModePage;