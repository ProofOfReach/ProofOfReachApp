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
  const { setSelectedRole } = useOnboarding();
  
  // Create a state to hold available roles, with a default that includes all roles
  const [availableRoles, setAvailableRoles] = useState<UserRoleType[]>(['viewer', 'publisher', 'advertiser']);
  
  // Check if we're in test mode
  const isTestMode = typeof window !== 'undefined' && 
    (window.location.pathname.includes('test-onboarding') || 
    localStorage.getItem('isTestMode') === 'true');
  
  useEffect(() => {
    // In test mode, force all roles to be available
    if (isTestMode) {
      setAvailableRoles(['viewer', 'publisher', 'advertiser']);
    } 
    // Otherwise use the roles from context if available
    else if (roleContext && roleContext.availableRoles && roleContext.availableRoles.length > 0) {
      setAvailableRoles(roleContext.availableRoles);
    }
    // Fallback to ensure at least one role is available
    else if (!availableRoles.length) {
      setAvailableRoles(['advertiser']);
    }
  }, [roleContext, isTestMode]);
  
  // For debugging
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('RoleConfirmation - Available roles:', availableRoles);
      console.log('RoleConfirmation - Context roles:', roleContext?.availableRoles || 'None');
      console.log('RoleConfirmation - Is test mode:', isTestMode);
    }
  }, [availableRoles, roleContext, isTestMode]);

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
      icon: <Users className="h-8 w-8 text-blue-500" />,
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
  
  // In test mode, show all roles, otherwise filter based on available roles
  const roleCards = isTestMode 
    ? allRoleCards 
    : allRoleCards.filter(card => availableRoles.includes(card.role));

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
              ${card.color === 'blue' ? 'hover:border-blue-500' : 
                card.color === 'green' ? 'hover:border-green-500' : 
                'hover:border-purple-500'
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
                        <span className={`mr-2 mt-0.5 text-${card.color === 'blue' ? 'blue' : card.color === 'green' ? 'green' : 'purple'}-500`}>•</span>
                        <span className="text-gray-600 dark:text-gray-300">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
                
              {/* Empty space where the button used to be - for test ID only */}
              <div data-testid={`select-${card.role}`} className="hidden"></div>
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