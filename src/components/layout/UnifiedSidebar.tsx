import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  User, FileText, Settings, Home, PieChart, 
  Plus, List, CheckSquare, Shield, Edit3,
  DollarSign, LogOut, Code, Lock, ChevronDown
} from 'react-feather';
import { useAuth } from '../../hooks/useAuth';
import MegaphoneIcon from '../icons/MegaphoneIcon';
import SatsIcon from '../icons/SatsIcon';
import CurrencyToggle from '../CurrencyToggle';
import ExchangeRateDisplay from '../ExchangeRateDisplay';

// Define a UserRole type to ensure consistency
export type UserRole = 'viewer' | 'advertiser' | 'publisher' | 'admin' | 'stakeholder';
// The 'user' role is now deprecated in favor of 'viewer'
// This type definition is the source of truth for all valid roles

interface UnifiedSidebarProps {
  isTestMode?: boolean;
}

/**
 * UnifiedSidebar Component
 * 
 * !!! DESIGNATED PRIMARY NAVIGATION COMPONENT !!!
 * This is the official, primary sidebar component for the application.
 * All other sidebar implementations are deprecated and should not be used.
 * 
 * A combined sidebar that works in both test mode and regular mode
 * with direct role manipulation for better reliability
 */
const UnifiedSidebar: React.FC<UnifiedSidebarProps> = ({ isTestMode = false }) => {
  const router = useRouter();
  const { auth, logout } = useAuth();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLocalChangingRole, setIsLocalChangingRole] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole>('viewer');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Determine current role based on URL (more reliable than context)
  useEffect(() => {
    const pathBasedRole = determineCurrentRoleFromURL();
    setCurrentRole(pathBasedRole);
    
    // If we're in test mode, ensure the localStorage is kept in sync
    if (isTestMode) {
      localStorage.setItem('userRole', pathBasedRole);
    }
  }, [router.pathname, isTestMode]);
  
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
  
  // Determine the current role from URL path
  const determineCurrentRoleFromURL = (): UserRole => {
    const path = router.pathname;
    
    if (path.includes('/dashboard/advertiser')) return 'advertiser';
    if (path.includes('/dashboard/publisher')) return 'publisher';
    if (path.includes('/dashboard/admin')) return 'admin';
    if (path.includes('/dashboard/stakeholder')) return 'stakeholder';
    if (path.includes('/dashboard/viewer')) return 'viewer';
    
    // Get from localStorage as fallback 
    const storedRole = typeof window !== 'undefined' 
      ? localStorage.getItem('userRole') as UserRole || 'viewer'
      : 'viewer';
      
    return storedRole;
  };
  
  // Role icons with appropriate colors
  const roleIcons = {
    viewer: <User className="w-5 h-5 text-blue-500" />,
    advertiser: <MegaphoneIcon className="w-5 h-5 text-orange-500" />,
    publisher: <Edit3 className="w-5 h-5 text-green-500" />,
    admin: <Shield className="w-5 h-5 text-purple-500" />,
    stakeholder: <DollarSign className="w-5 h-5 text-green-500" />
  };

  // Role labels
  const roleLabels = {
    viewer: 'Viewer',
    advertiser: 'Advertiser',
    publisher: 'Publisher',
    admin: 'Admin',
    stakeholder: 'Stakeholder'
  };

  // Core menu items for each role
  const coreMenuItems = {
    viewer: [
      { icon: <Home className="w-5 h-5" />, label: 'Dashboard', href: '/dashboard/viewer' },
      { icon: <PieChart className="w-5 h-5" />, label: 'Nostr Feed', href: '/nostr-feed' },
      { icon: <SatsIcon className="w-5 h-5" />, label: 'Wallet', href: '/dashboard/wallet' },
    ],
    advertiser: [
      { icon: <Home className="w-5 h-5" />, label: 'Dashboard', href: '/dashboard/advertiser' },
      { icon: <MegaphoneIcon className="w-5 h-5" />, label: 'Campaigns', href: '/dashboard/advertiser/campaigns' },
      { icon: <PieChart className="w-5 h-5" />, label: 'Analytics', href: '/dashboard/advertiser/analytics' },
      { icon: <Shield className="w-5 h-5" />, label: 'Proof of Reach', href: '/dashboard/reports/proof-of-reach' },
      { icon: <SatsIcon className="w-5 h-5" />, label: 'Billing', href: '/dashboard/billing' },
    ],
    publisher: [
      { icon: <Home className="w-5 h-5" />, label: 'Dashboard', href: '/dashboard/publisher' },
      { icon: <FileText className="w-5 h-5" />, label: 'Ad Spaces', href: '/dashboard/publisher/spaces' },
      { icon: <CheckSquare className="w-5 h-5" />, label: 'Approvals', href: '/dashboard/publisher/approvals' },
      { icon: <Shield className="w-5 h-5" />, label: 'Rules', href: '/dashboard/publisher/rules' },
      { icon: <SatsIcon className="w-5 h-5" />, label: 'Earnings', href: '/dashboard/publisher/earnings' },
    ],
    admin: [
      { icon: <Home className="w-5 h-5" />, label: 'Dashboard', href: '/dashboard/admin' },
      { icon: <User className="w-5 h-5" />, label: 'Users', href: '/dashboard/admin/users' },
      { icon: <MegaphoneIcon className="w-5 h-5" />, label: 'Campaigns', href: '/dashboard/admin/campaigns' },
      { icon: <SatsIcon className="w-5 h-5" />, label: 'Transactions', href: '/dashboard/admin/transactions' },
      { icon: <Shield className="w-5 h-5" />, label: 'System', href: '/dashboard/admin/system' },
      { icon: <Lock className="w-5 h-5" />, label: 'Role Management', href: '/dashboard/admin/role-management' },
    ],
    stakeholder: [
      { icon: <Home className="w-5 h-5" />, label: 'Dashboard', href: '/dashboard/stakeholder' },
      { icon: <PieChart className="w-5 h-5" />, label: 'Analytics', href: '/dashboard/stakeholder/analytics' },
      { icon: <DollarSign className="w-5 h-5" />, label: 'Financials', href: '/dashboard/stakeholder/financials' },
    ]
  };
  
  // Common bottom items for all roles
  const bottomMenuItems = [
    { icon: <Code className="w-5 h-5" />, label: 'Developer', href: '/dashboard/developer' },
    { icon: <Settings className="w-5 h-5" />, label: 'Settings', href: '/dashboard/settings' }
  ];
  
  // Combine core and bottom items
  const menuItems = {
    viewer: [...coreMenuItems.viewer, ...bottomMenuItems],
    advertiser: [...coreMenuItems.advertiser, ...bottomMenuItems],
    publisher: [...coreMenuItems.publisher, ...bottomMenuItems],
    admin: [...coreMenuItems.admin, ...bottomMenuItems],
    stakeholder: [...coreMenuItems.stakeholder, ...bottomMenuItems]
  };

  // Simplified role change handler that works in both modes
  const handleRoleChange = async (newRole: UserRole) => {
    setIsLocalChangingRole(true);
    setDropdownOpen(false);
    
    // Store new role in localStorage
    localStorage.setItem('userRole', newRole);
    
    // Critical for test mode: Set force_role_refresh to true
    localStorage.setItem('force_role_refresh', 'true');
    
    // Each role has a dedicated dashboard path
    let targetPath = '/dashboard/user';
    
    if (isTestMode) {
      // In test mode, we use a more direct approach
      targetPath = `/dashboard/${newRole}`;
    } else {
      // Normal mode uses regular user URLs
      if (newRole === 'publisher') {
        targetPath = '/dashboard/publisher';
      } else if (newRole === 'advertiser') {
        targetPath = '/dashboard/advertiser';
      } else if (newRole === 'admin') {
        targetPath = '/dashboard/admin';
      } else if (newRole === 'stakeholder') {
        targetPath = '/dashboard/stakeholder';
      }
    }
    
    // Use the direct navigation approach for more reliability
    if (typeof window !== 'undefined') {
      if (typeof window.location.assign === 'function') {
        window.location.assign(targetPath);
      } else {
        window.location.href = targetPath;
      }
    }
    
    return true;
  };
  
  // Toggle sidebar expansion (for mobile)
  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };
  
  // Get filtered role options (all roles except current one)
  const getFilteredRoleOptions = () => {
    return (['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'] as UserRole[])
      .filter(roleOption => roleOption !== currentRole);
  };
  
  // Check if a role is available or not (in test mode all are available)
  const isRoleAvailable = (roleToCheck: UserRole): boolean => {
    if (isTestMode) return true;
    
    const path = router.pathname;
    
    // Simple check to determine available roles based on current path
    // For testing, we unlock all roles
    if (path.includes('/dashboard/advertiser')) {
      return ['advertiser', 'viewer'].includes(roleToCheck);
    } else if (path.includes('/dashboard/publisher')) {
      return ['publisher', 'viewer'].includes(roleToCheck);
    } else if (path.includes('/dashboard/admin')) {
      return ['admin', 'viewer'].includes(roleToCheck);
    } else if (path.includes('/dashboard/stakeholder')) {
      return ['stakeholder', 'viewer'].includes(roleToCheck);
    } else {
      return roleToCheck === 'viewer';
    }
  };

  // Get background color based on current role
  const getRoleBackgroundColor = (checkRole: UserRole) => {
    switch(checkRole) {
      case 'viewer': return 'bg-blue-100 dark:bg-blue-900/20';
      case 'advertiser': return 'bg-orange-100 dark:bg-orange-900/20';
      case 'publisher': return 'bg-green-100 dark:bg-green-900/20';
      case 'admin': return 'bg-purple-100 dark:bg-purple-900/20';
      case 'stakeholder': return 'bg-emerald-100 dark:bg-emerald-900/20';
      default: return 'bg-gray-100 dark:bg-gray-900/20';
    }
  };

  // Get text color based on current role
  const getRoleTextColor = (checkRole: UserRole) => {
    switch(checkRole) {
      case 'viewer': return 'text-blue-700 dark:text-blue-300';
      case 'advertiser': return 'text-orange-700 dark:text-orange-300';
      case 'publisher': return 'text-green-700 dark:text-green-300';
      case 'admin': return 'text-purple-700 dark:text-purple-300';
      case 'stakeholder': return 'text-emerald-700 dark:text-emerald-300';
      default: return 'text-gray-700 dark:text-gray-300';
    }
  };
  
  // Get active menu item styling
  const getActiveClass = (href: string) => {
    // For Dashboard items, we need a more exact match to avoid highlighting for all pages
    const isDashboardLink = href === '/dashboard/user' || 
                           href === '/dashboard/advertiser' ||
                           href === '/dashboard/publisher' ||
                           href === '/dashboard/admin' ||
                           href === '/dashboard/stakeholder';
    
    // For dashboard links, only match exact paths
    // For other links, match the path or its sub-paths
    const isActive = isDashboardLink 
      ? router.pathname === href
      : (router.pathname === href || router.pathname.startsWith(`${href}/`));
    
    let activeClass = '';
    
    if (isActive) {
      // Determine the role for styling based on the URL path (more reliable)
      const pathBasedRole = router.pathname.includes('/dashboard/advertiser') ? 'advertiser' :
                           router.pathname.includes('/dashboard/publisher') ? 'publisher' : 
                           router.pathname.includes('/dashboard/admin') ? 'admin' :
                           router.pathname.includes('/dashboard/stakeholder') ? 'stakeholder' :
                           router.pathname.includes('/dashboard/user') ? 'user' : 'user';
      
      // For styling purposes, use the path-based role for consistent styling
      switch(pathBasedRole) {
        case 'user':
          activeClass = 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300';
          break;
        case 'advertiser':
          activeClass = 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300';
          break;
        case 'publisher':
          activeClass = 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300';
          break;
        case 'admin':
          activeClass = 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300';
          break;
        case 'stakeholder':
          activeClass = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300';
          break;
        default:
          activeClass = 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
      }
    } else {
      activeClass = 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
    
    return activeClass;
  };

  /**
   * Check if a role should be available (unlocked) for the user
   * This is a critical function that determines the lock icons in the UI
   */
  const isRoleAlwaysAvailable = (roleToCheck: UserRole): boolean => {
    // In test mode, all roles are available
    if (isTestMode) return true;
    
    // Otherwise, we display a simplified version of role availability
    // In a real app, this would check against auth context, but this is more reliable for testing
    return auth ? Boolean(auth.availableRoles?.includes(roleToCheck)) : false;
  };

  return (
    <>
      {/* Mobile toggle button - visible only on small screens */}
      <button 
        onClick={toggleSidebar}
        className="md:hidden fixed z-50 bottom-4 right-4 p-2 rounded-full bg-purple-600 text-white shadow-lg"
      >
        <List className="w-6 h-6" />
      </button>
      
      {/* Sidebar backdrop for mobile - only visible when sidebar is expanded on mobile */}
      {sidebarExpanded && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setSidebarExpanded(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`fixed md:sticky top-0 z-30 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 w-56 ${
          sidebarExpanded ? 'left-0' : '-left-56 md:left-0'
        }`}
      >
        {/* Logo area */}
        <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-purple-600 dark:text-purple-400">Nostr Ad Market</h1>
        </div>
        
        {/* Role selector - dropdown */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative" ref={dropdownRef}>
            <button 
              className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors border border-gray-300 dark:border-gray-600 ${
                getRoleBackgroundColor(currentRole)
              } ${
                getRoleTextColor(currentRole)
              }`}
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="flex items-center">
                <span className="mr-3">{roleIcons[currentRole]}</span>
                <span>{roleLabels[currentRole]}</span>
              </div>
              <ChevronDown 
                className={`h-4 w-4 ml-2 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
              />
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
                  onClick={() => handleRoleChange(roleOption)}
                  className={`w-full flex items-center px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 
                    ${isRoleAvailable(roleOption) 
                      ? 'text-gray-700 dark:text-gray-300' 
                      : 'text-gray-400 dark:text-gray-500 italic'}`}
                  disabled={!isRoleAvailable(roleOption)}
                >
                  <span className="mr-3">
                    {isRoleAvailable(roleOption) 
                      ? roleIcons[roleOption]
                      : <Lock className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    }
                  </span>
                  <span>
                    {roleLabels[roleOption]}
                    {!isRoleAvailable(roleOption) && " (Locked)"}
                  </span>
                </button>
              ))}
              
              {/* Test Mode Indicator (if applicable) */}
              {isTestMode && (
                <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
                  Test mode: All roles enabled
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Menu items */}
        <nav className="p-4 flex flex-col h-[calc(100vh-200px)]">
          <div className="flex-grow">
            <h2 className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-2 font-semibold">Menu</h2>
            <ul className="space-y-1 w-full min-w-0">
              {menuItems[currentRole].map((item) => (
                <li key={item.label}>
                  <Link 
                    href={item.href}
                    className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors transition-all duration-200 ${getActiveClass(item.href)}`}
                  >
                    <span className="mr-3 flex-shrink-0">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Test Mode specific items */}
          {isTestMode && (
            <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
              <h2 className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-2 font-semibold">Test Mode</h2>
              <div className="space-y-1">
                <Link
                  href="/test-mode/switch-role"
                  className="flex items-center px-3 py-2 text-sm rounded-md bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:hover:bg-yellow-800/20 text-yellow-700 dark:text-yellow-300 transition-colors"
                >
                  <span className="mr-3 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </span>
                  <span>Test Role Page</span>
                </Link>
              </div>
            </div>
          )}
          
          {/* Logout button - with direct logout functionality */}
          <div className="mt-auto">
            <div className="flex items-center px-3 py-2 text-sm">
              <span className="mr-3 flex-shrink-0">
                <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
              </span>
              <button 
                onClick={() => {
                  if (window.confirm('Are you sure you want to log out?')) {
                    window.location.href = '/system/logout';
                  }
                }}
                className="truncate text-left font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 focus:outline-none"
                data-testid="direct-logout-button"
              >
                Logout
              </button>
            </div>
          </div>
          
          {/* Currency toggle at bottom of sidebar */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col">
              <CurrencyToggle className="w-full mb-2" />
              <ExchangeRateDisplay className="text-xs text-gray-500 dark:text-gray-400 mt-1" />
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default UnifiedSidebar;