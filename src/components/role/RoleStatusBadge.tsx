import React from 'react';
import.*./context/EnhancedRoleContext';

/**
 * Badge to show the current user role
 * Changes colors based on the role
 */
export function RoleStatusBadge() {
  const { roleData, isLoading } = useEnhancedRole();

  if (isLoading) {
    return (
      <span className="px-2 py-1 text-xs rounded bg-gray-200 text-gray-700">
        Loading...
      </span>
    );
  }

  if (!roleData) {
    return (
      <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-700">
        No role
      </span>
    );
  }

  // Map roles to colors
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700';
      case 'advertiser':
        return 'bg-blue-100 text-blue-700';
      case 'publisher':
        return 'bg-green-100 text-green-700';
      case 'developer':
        return 'bg-orange-100 text-orange-700';
      case 'stakeholder':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatRoleName = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const badgeColor = getRoleBadgeColor(roleData.currentRole);

  return (
    <div className="flex items-center space-x-2">
      <span className={`px-2 py-1 text-xs rounded ${badgeColor}`}>
        {formatRoleName(roleData.currentRole)}
      </span>
      
      {roleData.isTestUser && (
        <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-700">
          Test Mode
        </span>
      )}
    </div>
  );
}

export default RoleStatusBadge;