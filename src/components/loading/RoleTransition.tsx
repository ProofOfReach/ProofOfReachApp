import React from 'react';
import type { UserRole } from '../../context/RoleContext';

// Color schemes based on role
const roleColors = {
  user: 'bg-blue-500',
  advertiser: 'bg-orange-500',
  publisher: 'bg-green-500',
  admin: 'bg-purple-500',
  stakeholder: 'bg-emerald-500'
};

const roleTextColors = {
  user: 'text-blue-700',
  advertiser: 'text-orange-700',
  publisher: 'text-green-700',
  admin: 'text-purple-700',
  stakeholder: 'text-emerald-700'
};

interface RoleTransitionProps {
  role: string;
  isVisible: boolean;
}

const RoleTransition: React.FC<RoleTransitionProps> = ({ role, isVisible }) => {
  if (!isVisible) {
    return null;
  }
  
  return (
    <div 
      className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col items-center justify-center"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="text-center">
        <div className="inline-block">
          <svg 
            className={`animate-spin h-12 w-12 ${roleTextColors[role]} mb-4`} 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
        <h2 className={`text-xl font-semibold ${roleTextColors[role]} mb-2`}>
          Switching Role
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Preparing your dashboard...
        </p>
      </div>
    </div>
  );
};

export default RoleTransition;