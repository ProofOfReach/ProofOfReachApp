import { useAuth } from '../../hooks/useAuth';

/**
 * A component that displays the current authentication status
 * and provides login/logout functionality.
 * 
 * This component uses the stable useAuth system for reliable authentication.
 */
export default function AuthStatusBar() {
  const { auth, logout } = useAuth();
  
  const isAuthenticated = auth?.isLoggedIn || false;
  const pubkey = auth?.pubkey || '';
  const isTestMode = auth?.isTestMode || false;
  const currentRole = auth?.availableRoles?.[0] || 'viewer';
  
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