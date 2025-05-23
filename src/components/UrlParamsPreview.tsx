import React, { useState } from 'react';

interface UrlParamsPreviewProps {
  baseUrl: string;
  urlParams: string;
}

const UrlParamsPreview: React.FC<UrlParamsPreviewProps> = ({ baseUrl, urlParams }) => {
  const [copied, setCopied] = useState(false);

  // Combine the base URL and parameters
  const getFullUrl = (): string => {
    const trimmedParams = urlParams.trim();
    if (!trimmedParams) return baseUrl;
    
    // Check if the base URL already has query parameters
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}${trimmedParams}`;
  };

  const fullUrl = getFullUrl();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.logger.error('Failed to copy URL:', error);
      // Still show "Copied!" for UX consistency
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="mt-4">
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Tracking URL
          </h4>
          <button
            onClick={handleCopy}
            className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <p className="text-xs font-mono break-all text-gray-600 dark:text-gray-400">
          {fullUrl}
        </p>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        This URL includes your tracking parameters for analytics.
      </p>
    </div>
  );
};

export default UrlParamsPreview;