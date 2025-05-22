import React, { useState } from 'react';
import { RoleType } from '@/lib/enhancedRoleService';

interface RoleSwitcherProps {
  currentRole: RoleType | 'user';
  availableRoles: RoleType[];
  isLoading: boolean;
  onRoleChange: (role: RoleType | 'user') => void;
}

/**
 * Component to allow users to switch between different roles
 */
const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  currentRole,
  availableRoles,
  isLoading,
  onRoleChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Get the display name for a role
  const getRoleDisplayName = (role: RoleType | 'user'): string => {
    const displayNames: Record<string, string> = {
      admin: 'Administrator',
      advertiser: 'Advertiser',
      publisher: 'Publisher',
      developer: 'Developer',
      stakeholder: 'Stakeholder',
      user: 'Regular User',
    };
    return displayNames[role] || role;
  };

  // Get the color for a role
  const getRoleColor = (role: RoleType | 'user'): string => {
    const colors: Record<string, string> = {
      admin: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      advertiser: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      publisher: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      developer: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      stakeholder: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
      user: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    };
    return colors[role] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  // Handle role change
  const handleRoleChange = (role: RoleType | 'user') => {
    setIsOpen(false);
    onRoleChange(role);
  };

  return (
    <div className="relative">
      <div className="flex flex-col space-y-2">
        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Role</div>
        <button
          type="button"
          className={`flex items-center justify-between px-4 py-2 rounded-md shadow-sm text-sm font-medium ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
        >
          <div className="flex items-center">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(currentRole)} mr-2`}>
              {getRoleDisplayName(currentRole)}
            </span>
          </div>
          <svg
            className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-md bg-white dark:bg-gray-800 shadow-lg">
          <div className="py-1 max-h-60 overflow-auto" role="menu" aria-orientation="vertical">
            {/* Always include regular user option */}
            <button
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center ${currentRole === 'user' ? 'bg-gray-50 dark:bg-gray-700' : ''}`}
              role="menuitem"
              onClick={() => handleRoleChange('user')}
            >
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor('user')} mr-2`}>
                {getRoleDisplayName('user')}
              </span>
            </button>

            {/* Available roles from the user's profile */}
            {availableRoles.map((role) => (
              <button
                key={role}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center ${currentRole === role ? 'bg-gray-50 dark:bg-gray-700' : ''}`}
                role="menuitem"
                onClick={() => handleRoleChange(role)}
              >
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(role)} mr-2`}>
                  {getRoleDisplayName(role)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleSwitcher;