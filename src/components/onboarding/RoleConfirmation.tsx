import React, { useEffect, useState } from 'react';
import { UserRoleType } from '@/types/role';
import { useRole } from '@/context/RoleContext';
import { useOnboarding } from '@/context/OnboardingContext';
import { Users, Radio, Package } from 'react-feather';

type RoleConfirmationProps = {
  onConfirm?: (role: UserRoleType) => void;
};

const RoleConfirmation: React.FC<RoleConfirmationProps> = ({ onConfirm }) => {
  const roleContext = useRole();
  const { setSelectedRole, selectedRole } = useOnboarding();
  
  // Add isClient state to prevent hydration mismatches
  const [isClient, setIsClient] = useState(false);
  
  // Create a state to hold available roles, with a default that includes all roles
  const [availableRoles, setAvailableRoles] = useState<UserRoleType[]>(['viewer', 'publisher', 'advertiser']);
  
  // Set client-side state after mount
  useEffect(() => {
    setIsClient(true);
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
      console.log('RoleConfirmation - Forcing all roles to be available for onboarding');
    }
  }, [isClient]);
  
  // For debugging
  useEffect(() => {
    if (isClient && process.env.NODE_ENV !== 'test') {
      console.log('RoleConfirmation - Available roles:', availableRoles);
      console.log('RoleConfirmation - Context roles:', roleContext?.availableRoles || 'None');
      console.log('RoleConfirmation - Is test mode:', isTestMode);
    }
  }, [availableRoles, roleContext, isTestMode, isClient]);

  const handleRoleSelection = (role: UserRoleType) => {
    // First call the context function to update the selected role
    setSelectedRole(role);
    
    // Then, if onConfirm prop is provided (for tests), call it
    if (typeof onConfirm === 'function') {
      onConfirm(role);
    }
  };

  const allRoleCards = [
    {
      role: 'viewer' as UserRoleType,
      title: 'Viewer',
      description: 'Browse ads, earn Bitcoin, and enjoy content across the Proof Of Reach network',
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
      role: 'publisher' as UserRoleType,
      title: 'Publisher',
      description: 'Monetize your content with Bitcoin through the Proof Of Reach network',
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
      role: 'advertiser' as UserRoleType,
      title: 'Advertiser',
      description: 'Promote your products and services on the Proof Of Reach network',
      icon: <Radio className="h-8 w-8 text-[#1a73e8]" />,
      benefits: [
        'Target specific audience interests',
        'Pay only for actual engagement',
        'Detailed performance analytics',
        'Lightning-fast campaign setup'
      ],
      buttonText: 'Set Up as Advertiser',
      color: 'blue'
    }
  ];
  
  // Always show all role cards during onboarding
  const roleCards = allRoleCards;

  // For server-side rendering or initial client load, use a placeholder 
  // with a similar structure to prevent hydration mismatch
  if (!isClient) {
    return (
      <div className="py-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Select your role
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Select how you'd like to use the Proof Of Reach platform
          </p>
        </div>

        {/* Placeholder for role cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div 
              key={i}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 flex flex-col h-full"
            >
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full mb-4"></div>
                <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                
                <div className="w-full mb-5 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="flex items-start">
                        <div className="w-1 h-1 rounded-full bg-gray-200 dark:bg-gray-700 mr-2 mt-0.5"></div>
                        <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-auto">
                <div className="w-full h-10 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            You can change roles or manage multiple roles after completing onboarding.
          </p>
        </div>
      </div>
    );
  }

  // Client-side rendering
  return (
    <div className="py-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Select your role
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Select how you'd like to use the Proof Of Reach platform
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {roleCards.map((card) => (
          <div 
            key={card.role}
            data-testid="role-card"
            className={`border rounded-lg p-6 cursor-pointer transition hover:shadow-md flex flex-col h-full
              ${selectedRole === card.role ? 'border-[#1a73e8] shadow-md' : 'border-gray-200 dark:border-gray-700'}
              ${card.color === 'blue' ? 'hover:border-[#1a73e8]' : 
                card.color === 'green' ? 'hover:border-green-500' : 
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
                        <span className={`mr-2 mt-0.5 ${card.color === 'green' ? 'text-green-500' : 'text-[#1a73e8]'}`}>•</span>
                        <span className="text-gray-600 dark:text-gray-300">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Add back the button for each role */}
              <div className="mt-auto">
                <button
                  className={`w-full py-2 px-4 rounded-md text-white font-medium
                    ${card.color === 'green' ? 'bg-green-500 hover:bg-green-600' : 'bg-[#1a73e8] hover:bg-[#1765cc]'}
                    transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 
                    ${card.color === 'green' ? 'focus:ring-green-500' : 'focus:ring-[#1a73e8]'}
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
            <p className="font-mono">Context roles: {roleContext?.availableRoles?.join(', ') || 'None'}</p>
            <p className="font-mono">Showing roles: {roleCards.map(r => r.role).join(', ')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleConfirmation;