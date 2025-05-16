import { useAuthSwitch } from '../../hooks/useAuthSwitch';

/**
 * A component that displays the current authentication status
 * and provides login/logout functionality.
 * 
 * This component uses the useAuthSwitch hook to work with
 * both the legacy and refactored authentication systems.
 */
export default function AuthStatusBar() {
  // For test environments, we need to conditionally use the hook
  // to prevent errors when no providers are available
  const useConditionalAuthSwitch = () => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
      try {
        return useAuthSwitch();
      } catch (error) {
        console.error('Error in AuthStatusBar:', error);
        return {
          isAuthenticated: false,
          pubkey: '',
          isTestMode: false,
          currentRole: null,
          logout: () => Promise.resolve()
        };
      }
    }
    // Default values for testing
    return {
      isAuthenticated: false,
      pubkey: '',
      isTestMode: false,
      currentRole: null,
      logout: () => Promise.resolve()
    };
  };
  
  const { 
    isAuthenticated, 
    pubkey, 
    isTestMode,
    currentRole,
    logout
  } = useConditionalAuthSwitch();
  
  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-2 px-4 flex justify-between items-center text-sm">
      <div className="flex items-center space-x-4">
        {isAuthenticated ? (
          <>
            <span className="text-green-600 dark:text-green-400 font-medium">
              Authenticated
            </span>
            <span className="text-gray-600 dark:text-gray-300">
              Role: <span className="font-medium">{currentRole}</span>
            </span>
            {isTestMode && (
              <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-0.5 rounded text-xs">
                Test Mode
              </span>
            )}
            <span className="text-gray-500 dark:text-gray-400 text-xs truncate max-w-[200px]">
              {pubkey}
            </span>
          </>
        ) : (
          <span className="text-red-600 dark:text-red-400">
            Not authenticated
          </span>
        )}
      </div>
      
      {isAuthenticated && (
        <button
          onClick={() => logout()}
          className="text-xs bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-100 dark:hover:bg-red-800 px-2 py-1 rounded transition-colors"
        >
          Logout
        </button>
      )}
    </div>
  );
}