import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  User, FileText, Settings, Home, PieChart, 
  Plus, List, CheckSquare, Shield, Edit3,
  DollarSign, LogOut, Code, ChevronDown, Lock
} from 'react-feather';
import { useRole } from '../../context/NewRoleContext';
import { useRoleRefactored } from '../../context/NewRoleContextRefactored';
import { UserRole } from '../../types/auth';
import { useAuth } from '../../hooks/useAuth';
import MegaphoneIcon from '../icons/MegaphoneIcon';
import SatsIcon from '../icons/SatsIcon';
import CurrencyToggle from '../CurrencyToggle';
import ExchangeRateDisplay from '../ExchangeRateDisplay';

const Sidebar: React.FC = () => {
  const { role: originalRole, setRole: originalSetRole, availableRoles: originalAvailableRoles, isRoleAvailable: originalIsRoleAvailable } = useRole();
  const { role: refactoredRole, setRole: refactoredSetRole, availableRoles: refactoredAvailableRoles, isRoleAvailable: refactoredIsRoleAvailable } = useRoleRefactored();
  const { auth, logout } = useAuth();
  
  // For backward compatibility, try to use both role context systems
  // with priority to the refactored version
  const role = typeof window !== 'undefined' && localStorage.getItem('userRole') as UserRole || refactoredRole || originalRole;
  const setRole = refactoredSetRole || originalSetRole;
  const availableRoles = refactoredAvailableRoles.length > 0 ? refactoredAvailableRoles : originalAvailableRoles;
  const isRoleAvailable = refactoredIsRoleAvailable || originalIsRoleAvailable;
  const router = useRouter();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
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
  
  // Role icons with appropriate colors
  const roleIcons = {
    user: <User className="w-5 h-5 text-blue-500" />,
    advertiser: <MegaphoneIcon className="w-5 h-5 text-orange-500" />,
    publisher: <Edit3 className="w-5 h-5 text-green-500" />,
    admin: <Shield className="w-5 h-5 text-purple-500" />,
    stakeholder: <DollarSign className="w-5 h-5 text-emerald-500" />
  };

  // Role labels
  const roleLabels = {
    user: 'User',
    advertiser: 'Advertiser',
    publisher: 'Publisher',
    admin: 'Admin',
    stakeholder: 'Stakeholder'
  };

  // Core menu items for each role
  const coreMenuItems = {
    user: [
      { icon: <Home className="w-5 h-5" />, label: 'Dashboard', href: '/dashboard' },
      { icon: <PieChart className="w-5 h-5" />, label: 'Nostr Feed', href: '/nostr-feed' },
      { icon: <SatsIcon className="w-5 h-5" />, label: 'Wallet', href: '/dashboard/wallet' },
    ],
    advertiser: [
      { icon: <Home className="w-5 h-5" />, label: 'Dashboard', href: '/dashboard' },
      { icon: <MegaphoneIcon className="w-5 h-5" />, label: 'Campaigns', href: '/dashboard/campaigns' },
      { icon: <PieChart className="w-5 h-5" />, label: 'Analytics', href: '/dashboard/analytics' },
      { icon: <SatsIcon className="w-5 h-5" />, label: 'Billing', href: '/dashboard/billing' },
    ],
    publisher: [
      { icon: <Home className="w-5 h-5" />, label: 'Dashboard', href: '/dashboard' },
      { icon: <FileText className="w-5 h-5" />, label: 'Ad Spaces', href: '/dashboard/spaces' },
      { icon: <CheckSquare className="w-5 h-5" />, label: 'Approvals', href: '/dashboard/approvals' },
      { icon: <Shield className="w-5 h-5" />, label: 'Rules', href: '/dashboard/rules' },
      { icon: <SatsIcon className="w-5 h-5" />, label: 'Earnings', href: '/dashboard/earnings' },
    ],
    admin: [
      { icon: <Home className="w-5 h-5" />, label: 'Dashboard', href: '/dashboard' },
      { icon: <User className="w-5 h-5" />, label: 'Users', href: '/dashboard/users' },
      { icon: <MegaphoneIcon className="w-5 h-5" />, label: 'Campaigns', href: '/dashboard/campaigns' },
      { icon: <SatsIcon className="w-5 h-5" />, label: 'Transactions', href: '/dashboard/transactions' },
      { icon: <Shield className="w-5 h-5" />, label: 'System', href: '/dashboard/system' },
      { icon: <Lock className="w-5 h-5" />, label: 'Role Management', href: '/dashboard/role-management' }
    ],
    stakeholder: [
      { icon: <Home className="w-5 h-5" />, label: 'Dashboard', href: '/dashboard' },
      { icon: <PieChart className="w-5 h-5" />, label: 'Analytics', href: '/dashboard/analytics' },
      { icon: <DollarSign className="w-5 h-5" />, label: 'Financials', href: '/dashboard/financials' }
    ]
  };
  
  // Common bottom items for all roles
  const bottomMenuItems = [
    { icon: <Code className="w-5 h-5" />, label: 'Developer', href: '/dashboard/developer' },
    { icon: <Settings className="w-5 h-5" />, label: 'Settings', href: '/dashboard/settings' }
  ];
  
  // Combine core and bottom items
  const menuItems = {
    user: [...coreMenuItems.user, ...bottomMenuItems],
    advertiser: [...coreMenuItems.advertiser, ...bottomMenuItems],
    publisher: [...coreMenuItems.publisher, ...bottomMenuItems],
    admin: [...coreMenuItems.admin, ...bottomMenuItems],
    stakeholder: [...coreMenuItems.stakeholder, ...bottomMenuItems]
  };

  // Toggle sidebar expansion (for mobile)
  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  // Change role handler
  const handleRoleChange = async (newRole: UserRole) => {
    // First check if the role is available
    if (!isRoleAvailable(newRole)) {
      console.warn(`Role ${newRole} is not available for this user. Skipping role change.`);
      return;
    }
    
    // Close dropdown
    setDropdownOpen(false);
    
    // Store new role in localStorage before changing context
    localStorage.setItem('userRole', newRole);
    
    // Critical for test mode: Set force_role_refresh to true
    localStorage.setItem('force_role_refresh', 'true');
    
    // In the new navigation structure, all roles use the same dashboard path
    const targetPath = '/dashboard';
    
    console.log(`Changing role to: ${newRole}`);
    
    // Use the direct navigation approach like test-mode page does
    // This is more reliable than the context-based approach
    if (typeof window !== 'undefined') {
      if (typeof window.location.assign === 'function') {
        window.location.assign(targetPath);
      } else {
        window.location.href = targetPath;
      }
    }
    return true;
    
    // The below code is commented out because we're using direct navigation instead
    /*
    // Set the new role in context without navigation
    const success = await setRole(newRole);
    
    if (success) {
      // Navigate programmatically but only after role change is successful
      router.push(targetPath);
    }
    */
  };
  
  // Get filtered role options (all roles except current one)
  const getFilteredRoleOptions = () => {
    return (['user', 'advertiser', 'publisher', 'admin', 'stakeholder'] as UserRole[])
      .filter(roleOption => roleOption !== role);
  };

  // Get background color based on current role
  const getRoleBackgroundColor = (checkRole: UserRole) => {
    switch(checkRole) {
      case 'user': return 'bg-blue-100 dark:bg-blue-900/20';
      case 'advertiser': return 'bg-orange-100 dark:bg-orange-900/20';
      case 'publisher': return 'bg-green-100 dark:bg-green-900/20';
      case 'admin': return 'bg-purple-100 dark:bg-purple-900/20';
      case 'stakeholder': return 'bg-emerald-100 dark:bg-emerald-900/20';
    }
  };

  // Get text color based on current role
  const getRoleTextColor = (checkRole: UserRole) => {
    switch(checkRole) {
      case 'user': return 'text-blue-700 dark:text-blue-300';
      case 'advertiser': return 'text-orange-700 dark:text-orange-300';
      case 'publisher': return 'text-green-700 dark:text-green-300';
      case 'admin': return 'text-purple-700 dark:text-purple-300';
      case 'stakeholder': return 'text-emerald-700 dark:text-emerald-300';
    }
  };

  // Get active menu item styling
  const getActiveClass = (href: string) => {
    // For main Dashboard item, we need an exact match to avoid highlighting for all dashboard pages
    const isDashboardRootLink = href === '/dashboard';
    
    // For dashboard root link, only match exact path
    // For other links, match the path or its sub-paths
    const isActive = isDashboardRootLink 
      ? router.pathname === href
      : (router.pathname === href || router.pathname.startsWith(`${href}/`));
    
    let activeClass = '';
    
    if (isActive) {
      // Use the current role from context for styling
      // This is more reliable in the feature-based URL structure
      
      // For styling purposes, use the current role for consistent styling
      switch(role) {
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
      }
    } else {
      activeClass = 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
    
    return activeClass;
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
                getRoleBackgroundColor(role)
              } ${
                getRoleTextColor(role)
              }`}
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="flex items-center">
                <span className="mr-3">{roleIcons[role]}</span>
                <span>{roleLabels[role]}</span>
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
              {auth && auth.isTestMode && (
                <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
                  Test mode: All roles enabled
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Menu items */}
        <nav className="p-4 flex flex-col h-[calc(100vh-120px)]">
          <h2 className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-2 font-semibold">Menu</h2>
          <ul className="space-y-1 w-full min-w-0">
            {menuItems[role].map((item) => (
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
            
            {/* Developer Tools Section - Only visible for admin role */}
            {role === 'admin' && (
              <li className="mt-6">
                <h2 className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-2 font-semibold pl-3">Developer Tools</h2>
                <ul className="space-y-1">
                  {/* Role Management Link */}
                  <li>
                    <Link 
                      href="/dashboard/role-management"
                      className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors transition-all duration-200 ${getActiveClass('/dashboard/role-management')}`}
                    >
                      <span className="mr-3 flex-shrink-0"><Shield className="w-5 h-5 text-purple-500" /></span>
                      <span className="truncate">Role Management</span>
                    </Link>
                  </li>
                  
                  {/* Enable Admin Mode Link */}
                  <li>
                    <Link 
                      href="/test-mode/enable-admin-mode"
                      className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors transition-all duration-200 ${getActiveClass('/test-mode/enable-admin-mode')}`}
                    >
                      <span className="mr-3 flex-shrink-0"><Code className="w-5 h-5 text-amber-500" /></span>
                      <span className="truncate">Enable Admin Mode</span>
                    </Link>
                  </li>
                </ul>
              </li>
            )}
          </ul>
          
          {/* Logout button */}
          <div className="mt-auto">
            <button
              onClick={() => {
                // Show confirmation dialog
                if (window.confirm('Are you sure you want to log out?')) {
                  // Use the logout function from auth context if available
                  // This is helpful for testing and makes the logout behavior more consistent
                  if (logout && typeof logout === 'function') {
                    logout().then(() => {
                      // After logout completes, redirect to login page
                      router.push('/login');
                    });
                    return; // Exit early if we successfully called logout
                  }
                  
                  // Fallback to direct navigation if context not available
                  if (typeof window !== 'undefined') {
                    if (typeof window.location.assign === 'function') {
                      window.location.assign('/system/logout');
                    } else {
                      window.location.href = '/system/logout';
                    }
                  }
                }
              }}
              className="w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors transition-all duration-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:text-red-400"
            >
              <span className="mr-3 flex-shrink-0">
                <LogOut className="w-5 h-5" />
              </span>
              <span className="truncate">Logout</span>
            </button>
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

export default Sidebar;