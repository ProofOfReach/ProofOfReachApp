import React, { useState, useRef, useEffect } from 'react';
import { 
  User, Shield, Edit3, DollarSign, LogOut, Lock, ChevronDown
} from 'react-feather';
import type { UserRole } from '../context/NewRoleContext';
import MegaphoneIcon from './icons/MegaphoneIcon';

/**
 * Direct Role Switcher Component
 * 
 * A simplified drop-in replacement for the role switcher that bypasses
 * complex role availability checks and directly navigates to role dashboards.
 * Primarily for use in test/development environments.
 */
const DirectRoleSwitcher: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole>('viewer');
  const [isChangingRole, setIsChangingRole] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Determine current role from URL on mount and set up event listeners
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.includes('/dashboard/advertiser')) {
        setCurrentRole('advertiser');
      } else if (path.includes('/dashboard/publisher')) {
        setCurrentRole('publisher');
      } else if (path.includes('/dashboard/admin')) {
        setCurrentRole('admin');
      } else if (path.includes('/dashboard/stakeholder')) {
        setCurrentRole('stakeholder');
      } else {
        setCurrentRole('viewer');
      }
      
      // Mark test mode
      const pubkey = localStorage.getItem('nostr_pubkey') || '';
      if (pubkey.startsWith('pk_test_')) {
        localStorage.setItem('isTestMode', 'true');
      }
      
      // Function to handle localStorage changes from other components/tabs
      const handleStorageChange = (event: StorageEvent) => {
        if (event.key === 'cachedAvailableRoles' || event.key === 'roleCacheTimestamp' || event.key === 'isTestMode') {
          console.log('Storage changed in DirectRoleSwitcher, reloading roles:', event.key);
          // This will trigger a re-render with updated roles
          setCurrentRole(curr => curr);
        }
      };
      
      // Add event listener
      window.addEventListener('storage', handleStorageChange);
      
      // Handler for test-role-update custom event
      const handleTestRoleUpdate = () => {
        console.log('Test role update event detected in DirectRoleSwitcher');
        // This will trigger a re-render with updated roles
        setCurrentRole(curr => curr);
      };
      
      // Add event listener for custom events
      window.addEventListener('test-role-update', handleTestRoleUpdate);
      
      // Cleanup
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('test-role-update', handleTestRoleUpdate);
      };
    }
  }, []);
  
  // Role icons with appropriate colors
  const roleIcons = {
    user: <User className="w-5 h-5 text-blue-500" />,
    advertiser: <MegaphoneIcon className="w-5 h-5 text-orange-500" />,
    publisher: <Edit3 className="w-5 h-5 text-green-500" />,
    admin: <Shield className="w-5 h-5 text-purple-500" />,
    stakeholder: <DollarSign className="w-5 h-5 text-green-500" />
  };

  // Role labels
  const roleLabels = {
    user: 'User',
    advertiser: 'Advertiser',
    publisher: 'Publisher',
    admin: 'Admin',
    stakeholder: 'Stakeholder'
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Direct navigation handler with database update
  const handleDirectNavigation = async (role: string) => {
    // Close dropdown
    setDropdownOpen(false);
    
    // Set changing indicator  
    setIsChangingRole(true);
    
    // Mark test mode in localStorage
    localStorage.setItem('isTestMode', 'true');
    localStorage.setItem('userRole', role);
    
    // Store role data in localStorage for consistency
    localStorage.setItem(`test_${role}_role`, 'true');
    
    console.log(`Direct navigation to ${role} dashboard`, { isTestMode: true });
    
    try {
      // Try to enable roles in the database if we have a test pubkey
      const pubkey = localStorage.getItem('nostr_pubkey') || '';
      
      if (pubkey.startsWith('pk_test_')) {
        // First call enable-all-roles to ensure database is ready
        const response = await fetch('/api/test-mode/enable-all-roles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ pubkey }),
        });
        
        if (response.ok) {
          console.log('Successfully enabled all roles in database');
        }
      }
    } catch (error) {
      console.log('Error enabling roles:', error);
      // Continue with navigation even if DB update fails
    }
    
    // Navigate to role dashboard
    const path = `/dashboard/${role}`;
    window.location.href = path;
  };
  
  // Get background color based on current role
  const getRoleBackgroundColor = (checkRole: string) => {
    if (currentRole === checkRole) {
      switch(checkRole) {
        case 'viewer': return 'bg-blue-100 dark:bg-blue-900/20';
        case 'advertiser': return 'bg-orange-100 dark:bg-orange-900/20';
        case 'publisher': return 'bg-green-100 dark:bg-green-900/20';
        case 'admin': return 'bg-purple-100 dark:bg-purple-900/20';
        case 'stakeholder': return 'bg-emerald-100 dark:bg-emerald-900/20';
      }
    }
    return 'hover:bg-gray-100 dark:hover:bg-gray-800';
  };

  // Get text color based on current role
  const getRoleTextColor = (checkRole: string) => {
    if (currentRole === checkRole) {
      switch(checkRole) {
        case 'viewer': return 'text-blue-700 dark:text-blue-300';
        case 'advertiser': return 'text-orange-700 dark:text-orange-300';
        case 'publisher': return 'text-green-700 dark:text-green-300';
        case 'admin': return 'text-purple-700 dark:text-purple-300';
        case 'stakeholder': return 'text-emerald-700 dark:text-emerald-300';
      }
    }
    return 'text-gray-700 dark:text-gray-300';
  };
  
  // Get all roles except current
  const getFilteredRoleOptions = () => {
    // Check for cached available roles first
    if (typeof window !== 'undefined') {
      const cachedRoles = localStorage.getItem('cachedAvailableRoles');
      if (cachedRoles) {
        try {
          const parsedRoles = JSON.parse(cachedRoles) as UserRole[];
          return parsedRoles.filter(roleOption => roleOption !== currentRole);
        } catch (error) {
          console.log('Error parsing cached roles in DirectRoleSwitcher:', error);
        }
      }
    }
    
    // Fallback to all roles if no cache is available
    return (['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'] as UserRole[])
      .filter(roleOption => roleOption !== currentRole);
  };
  
  // Check if we're in test mode
  const isTestMode = typeof window !== 'undefined' &&
    (localStorage.getItem('isTestMode') === 'true' || 
     localStorage.getItem('nostr_pubkey')?.startsWith('pk_test_'));
  
  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
      <div className="relative" ref={dropdownRef}>
        <button 
          className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors border border-gray-300 dark:border-gray-600 ${
            getRoleBackgroundColor(currentRole)
          } ${
            getRoleTextColor(currentRole)
          }`}
          onClick={() => setDropdownOpen(!dropdownOpen)}
          disabled={isChangingRole}
        >
          <div className="flex items-center">
            <span className="mr-3">
              {isChangingRole ? (
                <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                roleIcons[currentRole]
              )}
            </span>
            <span>{isChangingRole ? 'Changing role...' : roleLabels[currentRole]}</span>
          </div>
          <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {/* Dropdown menu */}
        <div 
          className={`absolute z-10 mt-1 w-full rounded-md bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 transition-opacity duration-100 ${
            dropdownOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {getFilteredRoleOptions().map((roleOption) => (
            <button
              key={roleOption}
              onClick={() => handleDirectNavigation(roleOption)}
              className="w-full flex items-center px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              disabled={isChangingRole}
            >
              <span className="mr-3">
                {roleIcons[roleOption]}
              </span>
              <span>
                {roleLabels[roleOption]}
              </span>
            </button>
          ))}
          
          {/* Test Mode Indicator */}
          {isTestMode && (
            <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
              Test mode: Direct role navigation
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DirectRoleSwitcher;