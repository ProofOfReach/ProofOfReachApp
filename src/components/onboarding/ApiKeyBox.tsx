import React, { useState } from 'react';
import { Eye, EyeOff, Copy, CheckCircle, RefreshCw } from 'react-feather';

interface ApiKeyBoxProps {
  apiKey: string;
  isFallback?: boolean;
  onRefresh: () => Promise<void>;
}

const ApiKeyBox: React.FC<ApiKeyBoxProps> = ({ 
  apiKey, 
  isFallback = false,
  onRefresh
}) => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const toggleApiKeyVisibility = () => {
    setShowApiKey(prev => !prev);
  };

  const copyApiKey = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Error copying API key:', error);
    }
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
      setShowApiKey(true); // Show the key after refresh
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center">
        <div>
          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Publisher API Key
            {isFallback && <span className="ml-2 text-xs text-yellow-600 dark:text-yellow-400">(Fallback)</span>}
          </h5>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={toggleApiKeyVisibility}
            className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center"
          >
            {showApiKey ? (
              <>
                <Eye size={12} className="mr-1" />
                Hide
              </>
            ) : (
              <>
                <EyeOff size={12} className="mr-1" />
                Show
              </>
            )}
          </button>
          <button 
            onClick={copyApiKey}
            className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center"
            disabled={copySuccess}
          >
            {copySuccess ? (
              <>
                <CheckCircle size={12} className="mr-1" />
                Copied!
              </>
            ) : (
              <>
                <Copy size={12} className="mr-1" />
                Copy
              </>
            )}
          </button>
          <button 
            onClick={handleRefresh}
            className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center"
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <div className="animate-spin h-3 w-3 border-b-2 border-purple-500 rounded-full mr-1"></div>
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw size={12} className="mr-1" />
                Refresh
              </>
            )}
          </button>
        </div>
      </div>
      <div className="mt-3 p-3 font-mono text-sm bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded">
        {showApiKey ? apiKey : '•'.repeat(Math.min(40, apiKey.length))}
      </div>
    </div>
  );
};

export default ApiKeyBox;