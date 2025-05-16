import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Shield } from 'react-feather';
import { useRouter } from 'next/router';

interface BackupKeysBannerProps {
  pubkey: string;
  privateKey?: string;
}

const BackupKeysBanner: React.FC<BackupKeysBannerProps> = ({ pubkey, privateKey }) => {
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  // Check if keys have been backed up on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasBackedUpKeys = localStorage.getItem(`keys_backed_up_${pubkey}`) === 'true';
      setIsVisible(!hasBackedUpKeys);
    }
  }, [pubkey]);
  
  // If there's no private key to back up and we're using an extension, don't show the banner
  useEffect(() => {
    if (!privateKey && window?.nostr) {
      setIsVisible(false);
    }
  }, [privateKey]);

  const handleDismiss = () => {
    setIsVisible(false);
  };
  
  const handleGoToSettings = () => {
    router.push('/dashboard/settings#backup-keys');
  };

  if (!isVisible) return null;
  
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-1 mb-4 rounded-md shadow-sm" data-testid="backup-keys-banner">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3 flex-1 md:flex md:justify-between">
          <p className="text-sm text-yellow-700">
            <strong className="font-medium">Important:</strong> Please back up your Nostr keys to avoid losing account access.
          </p>
          <div className="mt-3 md:mt-0 md:ml-6 flex gap-2">
            <button
              type="button"
              onClick={handleGoToSettings}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              <Shield className="h-4 w-4 mr-2" />
              Back Up Keys
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="ml-1 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupKeysBanner;