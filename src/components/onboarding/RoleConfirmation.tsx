import React, { useEffect, useState } from 'react';
import { UserRole } from '@/types/role';
import { useOnboarding } from '@/context/OnboardingContext';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Users, Radio, Package, Shield, Key } from 'react-feather';
import { logger } from '@/lib/logger';
import { nip19 } from 'nostr-tools';

type RoleConfirmationProps = {
  onConfirm?: (role: string) => void;
};

// Helper function to convert hex to npub
const hexToNpub = (hex: string): string | null => {
  try {
    return nip19.npubEncode(hex);
  } catch (error) {
    return null;
  }
};

const RoleConfirmation: React.FC<RoleConfirmationProps> = ({ onConfirm }) => {
  const { setSelectedRole, selectedRole } = useOnboarding();
  const { user } = useSupabaseAuth();
  
  // Add isClient state to prevent hydration mismatches
  const [isClient, setIsClient] = useState(false);
  
  // Create a state to hold available roles, with a default that includes all roles
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>(['viewer', 'publisher', 'advertiser']);
  
  // State for tracking if pubkey was copied
  const [pubkeyCopied, setPubkeyCopied] = useState(false);
  
  // Set client-side state after mount with a slight delay to ensure DOM is fully ready
  useEffect(() => {
    // Delay state update to ensure DOM is fully loaded and Nostr extension is ready
    const timer = setTimeout(() => {
      setIsClient(true);
    }, 10);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Check if we're in test mode - Only check localStorage on client-side
  const isTestMode = isClient && 
    (window.location.pathname.includes('test-onboarding') || 
    localStorage.getItem('isTestMode') === 'true');
  
  useEffect(() => {
    // Skip during server-side rendering
    if (!isClient) return;
    
    // During onboarding, ALWAYS show all roles regardless of context
    // This ensures users can select from all possible roles during onboarding
    setAvailableRoles(['viewer', 'publisher', 'advertiser']);
    
    // Log for debugging
    if (process.env.NODE_ENV !== 'production') {
      logger.debug('RoleConfirmation - Forcing all roles to be available for onboarding');
    }
  }, [isClient]);
  
  // For debugging
  useEffect(() => {
    if (isClient && process.env.NODE_ENV !== 'test') {
      logger.debug(`RoleConfirmation - Available roles: ${availableRoles.join(', ')}`);
      logger.debug(`RoleConfirmation - Is test mode: ${isTestMode ? 'Yes' : 'No'}`);
    }
  }, [availableRoles, isTestMode, isClient]);

  const handleRoleSelection = (role: string) => {
    // First call the context function to update the selected role
    setSelectedRole(role);
    
    // Then, if onConfirm prop is provided (for tests), call it
    if (typeof onConfirm === 'function') {
      onConfirm(role);
    }
  };

  const copyPubkeyToClipboard = () => {
    if (!isClient || !user?.user_metadata?.pubkey) return;
    
    // Convert hex to npub if possible
    const npubKey = hexToNpub(user.user_metadata.pubkey) || user.user_metadata.pubkey;
    
    navigator.clipboard.writeText(npubKey)
      .then(() => {
        setPubkeyCopied(true);
        setTimeout(() => setPubkeyCopied(false), 2000);
      })
      .catch(err => {
        logger.log('Failed to copy pubkey to clipboard', err);
      });
  };

  // Format pubkey for display (truncate in the middle)
  const formatPubkey = (pubkey: string): string => {
    if (!pubkey) return '';
    
    // Check if it's already an npub
    const displayKey = pubkey.startsWith('npub') ? pubkey : hexToNpub(pubkey) || pubkey;
    
    // If key is less than 16 chars, don't truncate
    if (displayKey.length <= 16) return displayKey;
    
    // Otherwise, truncate in the middle
    return `${displayKey.substring(0, 8)}...${displayKey.substring(displayKey.length - 8)}`;
  };

  const allRoleCards = [
    {
      role: 'viewer' as UserRole,
      title: 'Viewer',
      description: 'Browse ads and content across the Proof Of Reach network',
      icon: <Users className="h-8 w-8 text-[#1a73e8]" />,
      benefits: [
        'Earn Bitcoin for viewing ads',
        'Personalized content recommendations',
        'Control over what ads you see',
        'Support content creators you enjoy'
      ],
      buttonText: 'Set Up as Viewer',
      color: 'blue'
    },
    {
      role: 'publisher' as UserRole,
      title: 'Publisher',
      description: 'Monetize your content through the Proof Of Reach network',
      icon: <Package className="h-8 w-8 text-green-500" />,
      benefits: [
        'Earn Bitcoin for your content',
        'Control ad placement and categories',
        'Get insights about your audience',
        'Automatic Lightning payments'
      ],
      buttonText: 'Set Up as Publisher',
      color: 'green'
    },
    {
      role: 'advertiser' as UserRole,
      title: 'Advertiser',
      description: 'Promote your products on the Proof Of Reach network',
      icon: <Radio className="h-8 w-8 text-purple-500" />,
      benefits: [
        'Target specific audience interests',
        'Pay only for actual engagement',
        'Detailed performance analytics',
        'Lightning-fast campaign setup'
      ],
      buttonText: 'Set Up as Advertiser',
      color: 'purple'
    }
  ];
  
  // Always show all role cards during onboarding
  const roleCards = allRoleCards;

  // For server-side rendering, use a simple minimal structure that matches the client structure
  // This helps avoid hydration mismatches by ensuring consistent DOM structure
  if (!isClient) {
    return (
      <div className="py-6" data-testid="role-selection-loading">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Loading...
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Empty placeholder that matches grid structure */}
          <div className="border rounded-lg p-6 opacity-0"></div>
          <div className="border rounded-lg p-6 opacity-0"></div>
          <div className="border rounded-lg p-6 opacity-0"></div>
        </div>
      </div>
    );
  }

  // Client-side rendering
  return (
    <div className="py-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2" data-testid="role-selection-title">
          Select Your Role
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Choose how you'd like to use the Proof Of Reach platform
        </p>
        
        {/* Nostr pubkey display */}
        {user?.user_metadata?.pubkey && (
          <div className="mt-4 inline-flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-2">
            <Key className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
            <span className="text-sm font-mono text-gray-700 dark:text-gray-300" data-testid="user-pubkey">
              {formatPubkey(user.user_metadata.pubkey)}
            </span>
            <button 
              onClick={copyPubkeyToClipboard}
              className="ml-2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title="Copy your Nostr public key"
              data-testid="copy-pubkey-button"
            >
              {pubkeyCopied ? (
                <Shield className="h-4 w-4 text-green-500" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {roleCards.map((card) => (
          <div 
            key={card.role}
            data-testid="role-card"
            className={`border rounded-lg p-6 cursor-pointer transition hover:shadow-md flex flex-col h-full
              ${selectedRole === card.role ? 
                card.color === 'green' ? 'border-green-500 shadow-md' : 
                card.color === 'purple' ? 'border-purple-500 shadow-md' :
                'border-[#1a73e8] shadow-md' 
              : 'border-gray-200 dark:border-gray-700'}
              ${card.color === 'green' ? 'hover:border-green-500' : 
                card.color === 'purple' ? 'hover:border-purple-500' : 
                'hover:border-[#1a73e8]'
              }
            `}
            onClick={() => handleRoleSelection(card.role)}
          >
            <div className="flex flex-col h-full">
              <div className="flex flex-col items-center">
                <div className="mb-4">
                  {card.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-center text-gray-900 dark:text-white" data-testid={`${card.role}-title`}>
                  <span data-testid={`${card.role}-label`}>{card.title}</span>
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-center mb-4">
                  {card.description}
                </p>
                
                <div className="w-full mb-5 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Benefits:
                  </h4>
                  <ul className="space-y-2">
                    {card.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start text-sm">
                        <span className={`mr-2 mt-0.5 ${
                          card.color === 'green' ? 'text-green-500' : 
                          card.color === 'purple' ? 'text-purple-500' :
                          'text-[#1a73e8]'
                        }`}>•</span>
                        <span className="text-gray-600 dark:text-gray-300">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Button for each role */}
              <div className="mt-auto">
                <button
                  className={`w-full py-2 px-4 rounded-md text-white font-medium
                    ${card.color === 'green' ? 'bg-green-500 hover:bg-green-600' : 
                      card.color === 'purple' ? 'bg-purple-500 hover:bg-purple-600' : 
                      'bg-[#1a73e8] hover:bg-[#1765cc]'
                    }
                    transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 
                    ${card.color === 'green' ? 'focus:ring-green-500' : 
                      card.color === 'purple' ? 'focus:ring-purple-500' :
                      'focus:ring-[#1a73e8]'
                    }
                  `}
                  onClick={() => handleRoleSelection(card.role)}
                  role="button"
                  aria-label={card.role}
                  data-testid={`select-${card.role}`}
                >
                  {card.buttonText}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>
          You can change roles or manage multiple roles after completing onboarding.
        </p>
        
        {/* Debug info for test mode */}
        {isTestMode && (
          <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-md text-xs text-left">
            <p className="font-mono"><strong>Debug info:</strong></p>
            <p className="font-mono">Is test mode: {isTestMode ? 'Yes' : 'No'}</p>
            <p className="font-mono">Available roles: {availableRoles.join(', ') || 'None'}</p>
            <p className="font-mono">Showing roles: {roleCards.map(r => r.role).join(', ')}</p>
            <p className="font-mono">User pubkey: {user?.user_metadata?.pubkey || 'Not available'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleConfirmation;