import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { User, Shield, Edit3, DollarSign, Speaker } from 'react-feather';

interface RoleDropdownProps {
  skipNavigation?: boolean;
  className?: string;
  onRoleChange?: (role: string) => void;
}

type UserRole = 'viewer' | 'advertiser' | 'publisher' | 'admin' | 'stakeholder';

/**
 * Simplified role dropdown that works reliably in test mode
 */
const SimpleRoleDropdown: React.FC<RoleDropdownProps> = ({
  skipNavigation = false,
  className = '',
  onRoleChange
}) => {
  const router = useRouter();
  const [currentRole, setCurrentRole] = useState<UserRole>('viewer');
  const [isChanging, setIsChanging] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>(['viewer']);
  const [isLoading, setIsLoading] = useState(true);

  // Role icons
  const roleIcons = {
    viewer: <User className="w-5 h-5 text-blue-500" />,
    advertiser: <Speaker className="w-5 h-5 text-orange-500" />,
    publisher: <Edit3 className="w-5 h-5 text-green-500" />,
    admin: <Shield className="w-5 h-5 text-purple-500" />,
    stakeholder: <DollarSign className="w-5 h-5 text-green-500" />
  };

  // Role display names
  const getRoleDisplayName = (role: string): string => {
    switch (role) {
      case 'viewer': return 'Viewer';
      case 'advertiser': return 'Advertiser';
      case 'publisher': return 'Publisher';
      case 'admin': return 'Admin';
      case 'stakeholder': return 'Stakeholder';
      default: return role.charAt(0).toUpperCase() + role.slice(1);
    }
  };

  // Initialize roles on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Simple test mode detection
    const isTestModeActive = localStorage.getItem('isTestMode') === 'true' || 
                            localStorage.getItem('bypass_api_calls') === 'true' ||
                            localStorage.getItem('testMode') === 'true';
    
    console.log('🎯 SimpleRoleDropdown test mode check:', {
      isTestModeActive,
      localStorage_isTestMode: localStorage.getItem('isTestMode'),
      localStorage_bypass: localStorage.getItem('bypass_api_calls'),
      localStorage_testMode: localStorage.getItem('testMode')
    });
    
    if (isTestModeActive) {
      console.log('✅ Test mode active - showing all roles');
      const allRoles: UserRole[] = ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'];
      setAvailableRoles(allRoles);
      
      // Get current role from localStorage
      const storedRole = localStorage.getItem('currentRole') || 'viewer';
      setCurrentRole(storedRole as UserRole);
    } else {
      console.log('❌ Test mode not active - showing viewer only');
      setAvailableRoles(['viewer']);
    }
    
    setIsLoading(false);
  }, []);

  // Handle role change
  const handleRoleChange = async (newRole: UserRole) => {
    if (isChanging || newRole === currentRole) return;
    
    console.log('🔄 Changing role from', currentRole, 'to', newRole);
    setIsChanging(true);
    
    try {
      // Update localStorage
      localStorage.setItem('currentRole', newRole);
      setCurrentRole(newRole);
      
      // Call callback
      if (onRoleChange) {
        onRoleChange(newRole);
      }
      
      // Navigate if not skipped
      if (!skipNavigation) {
        await router.push('/dashboard');
      }
      
      console.log('✅ Role change successful');
    } catch (error) {
      console.error('❌ Role change failed:', error);
    } finally {
      setIsChanging(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`relative ${className}`}>
        <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded">
          <div className="w-5 h-5 bg-gray-300 rounded animate-pulse"></div>
          <span className="text-gray-500">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <select 
        value={currentRole} 
        onChange={(e) => handleRoleChange(e.target.value as UserRole)}
        disabled={isChanging}
        className="appearance-none bg-white border border-gray-300 rounded px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
      >
        {availableRoles.map((role) => (
          <option key={role} value={role}>
            {getRoleDisplayName(role)}
          </option>
        ))}
      </select>
      
      {/* Custom dropdown arrow */}
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      {/* Current role icon */}
      <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
        {roleIcons[currentRole]}
      </div>
    </div>
  );
};

export default SimpleRoleDropdown;