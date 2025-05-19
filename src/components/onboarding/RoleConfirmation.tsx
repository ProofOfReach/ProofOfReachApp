import React from 'react';
import { UserRole } from '@/types/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface RoleConfirmationProps {
  selectedRole: UserRole;
  onRoleSelect: (role: UserRole) => void;
  pubkey: string;
}

const RoleConfirmation: React.FC<RoleConfirmationProps> = ({
  selectedRole,
  onRoleSelect,
  pubkey,
}) => {
  const roleDescriptions = {
    viewer: {
      title: 'Viewer',
      description: 'Browse content and earn by viewing relevant ads',
      benefits: [
        'Earn satoshis by viewing relevant ads',
        'Control your privacy settings',
        'Support your favorite publishers',
      ],
    },
    publisher: {
      title: 'Publisher',
      description: 'Monetize your Nostr content with targeted ads',
      benefits: [
        'Easy integration with your existing content',
        'Set your own ad preferences and pricing',
        'Get paid directly via Lightning Network',
      ],
    },
    advertiser: {
      title: 'Advertiser',
      description: 'Reach the Nostr community with targeted campaigns',
      benefits: [
        'Create and manage multiple ad campaigns',
        'Target specific audiences and interests',
        'Pay only for actual impressions and clicks',
      ],
    },
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Connected with Nostr key</p>
        <p className="font-mono text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded">
          {pubkey.length > 30 ? `${pubkey.substring(0, 15)}...${pubkey.substring(pubkey.length - 15)}` : pubkey}
        </p>
        <p className="mt-4 text-base">Choose how you'd like to use the Nostr Ad Marketplace:</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(['viewer', 'publisher', 'advertiser'] as UserRole[]).map((role) => (
          <Card 
            key={role}
            className={`cursor-pointer transition-all ${
              selectedRole === role 
                ? 'ring-2 ring-purple-500 dark:ring-purple-400' 
                : 'hover:shadow-md'
            }`}
            onClick={() => onRoleSelect(role)}
          >
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">{roleDescriptions[role].title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                {roleDescriptions[role].description}
              </p>
              <ul className="text-sm space-y-2">
                {roleDescriptions[role].benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center mt-6">
        <Button 
          size="lg"
          onClick={() => onRoleSelect(selectedRole)}
        >
          Continue as {roleDescriptions[selectedRole].title}
        </Button>
      </div>
    </div>
  );
};

export default RoleConfirmation;