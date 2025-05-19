import React from 'react';
import { UserRoleType } from '@/types/role';
import { useRole } from '@/context/RoleContext';
import { useOnboarding } from '@/context/OnboardingContext';
import { Users, Radio, Package } from 'react-feather';

type RoleConfirmationProps = {
  onConfirm?: (role: UserRoleType) => void;
};

const RoleConfirmation: React.FC<RoleConfirmationProps> = ({ onConfirm }) => {
  const { availableRoles } = useRole();
  const { setSelectedRole } = useOnboarding();

  const handleRoleSelection = (role: UserRoleType) => {
    setSelectedRole(role);
    
    // If onConfirm prop is provided (for tests), call it
    if (onConfirm) {
      onConfirm(role);
    }
  };

  const roleCards = [
    {
      role: 'viewer' as UserRoleType,
      title: 'Viewer',
      description: 'Browse content and interact with ads across the Nostr network',
      icon: <Users className="h-8 w-8 text-blue-500" />,
      benefits: [
        'Personalized content recommendations',
        'Control over what ads you see',
        'Support content creators you enjoy',
        'Seamless browsing experience'
      ],
      buttonText: 'Set Up as Viewer',
      color: 'blue'
    },
    {
      role: 'publisher' as UserRoleType,
      title: 'Publisher',
      description: 'Monetize your content with relevant ads and earn Bitcoin',
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
      description: 'Create campaigns and reach your target audience on Nostr',
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
  ].filter(card => availableRoles.includes(card.role));

  return (
    <div className="py-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Choose Your Role
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Select how you'd like to use the Nostr Ad Marketplace platform
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {roleCards.map((card) => (
          <div 
            key={card.role}
            className={`border rounded-lg p-6 cursor-pointer transition hover:shadow-md
              ${card.color === 'blue' ? 'hover:border-blue-500' : 
                card.color === 'green' ? 'hover:border-green-500' : 
                'hover:border-purple-500'
              }
            `}
            onClick={() => handleRoleSelection(card.role)}
          >
            <div className="flex flex-col items-center">
              <div className="mb-4">
                {card.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-center text-gray-900 dark:text-white">
                {card.title}
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
              
              <button 
                className={`w-full py-2 px-4 rounded-md transition
                  ${card.color === 'blue' ? 
                    'bg-blue-500 hover:bg-blue-600 text-white' : 
                    card.color === 'green' ? 
                    'bg-green-500 hover:bg-green-600 text-white' : 
                    'bg-purple-500 hover:bg-purple-600 text-white'
                  }
                `}
              >
                {card.buttonText}
              </button>
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
};

export default RoleConfirmation;