import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  User, FileText, Settings, Home, PieChart, 
  Plus, List, CheckSquare, Shield, Edit3,
  DollarSign, LogOut, Code, ChevronDown, Lock
} from 'react-feather';
import { useRole, UserRole } from '../../context/RoleContext';
// Debug helper - will remove before final integration
import { useAuth } from '../../hooks/useAuth';
import MegaphoneIcon from '../icons/MegaphoneIcon';
import SatsIcon from '../icons/SatsIcon';
import CurrencyToggle from '../CurrencyToggle';
import ExchangeRateDisplay from '../ExchangeRateDisplay';

const DropdownSidebar: React.FC = () => {
  // Use useState to track local role state in addition to context for more reliable updates
  const [localRole, setLocalRole] = useState<UserRole>('viewer');
  const { role, setRole, availableRoles, isRoleAvailable, setAvailableRoles } = useRole();
  const { auth, refreshRoles } = useAuth();
  const router = useRouter();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Force test mode to ensure all roles are available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('Setting up test mode and forcing all roles available');
      
      // Set up test mode
      localStorage.setItem('isTestMode', 'true');
      
      // Generate a test pubkey if not already present
      let pubkey = localStorage.getItem('nostr_pubkey');
      if (!pubkey || !pubkey.startsWith('pk_test_')) {
        pubkey = `pk_test_${Date.now()}`;
        localStorage.setItem('nostr_pubkey', pubkey);
        document.cookie = `nostr_pubkey=${pubkey}; path=/; max-age=86400`;
        document.cookie = `auth_token=test_token_${pubkey}; path=/; max-age=86400`;
      }
      
      // Set all roles as enabled
      localStorage.setItem('test_user_role', 'true');
      localStorage.setItem('test_advertiser_role', 'true');
      localStorage.setItem('test_publisher_role', 'true');
      localStorage.setItem('test_admin_role', 'true');
      localStorage.setItem('test_stakeholder_role', 'true');
      
      // Critical: Set force_role_refresh to true to trigger a full role refresh
      localStorage.setItem('force_role_refresh', 'true');
      
      // Backward compatibility
      localStorage.setItem('isAdvertiser', 'true');
      localStorage.setItem('isPublisher', 'true');
      localStorage.setItem('true', 'true');
      localStorage.setItem('isStakeholder', 'true');
      
      // Force availability of all roles in the context immediately
      if (setAvailableRoles) {
        const allRoles: string[] = ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'];
        console.log('Forcing available roles in dropdown to:', allRoles);
        setAvailableRoles(allRoles);
      }
      
      // Refresh roles if auth is available
      if (refreshRoles) {
        refreshRoles().catch(err => console.error('Error refreshing roles:', err));
      }
      
      // Try to enable roles in the database - this is important
      const enableRolesInDatabase = async () => {
        try {
          const response = await fetch('/api/test-mode/enable-all-roles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pubkey: localStorage.getItem('nostr_pubkey') }),
          });
          
          if (response.ok) {
            console.log('All roles enabled in database');
            // Force availability of all roles in the context again after API call
            if (setAvailableRoles) {
              const allRoles: string[] = ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'];
              setAvailableRoles(allRoles);
            }
          } else {
            console.warn('Failed to enable roles in database:', await response.text());
          }
        } catch (error) {
          console.error('Error enabling roles in database:', error);
        }
      };
      
      enableRolesInDatabase();
    }
  }, [refreshRoles, setAvailableRoles]);
  
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
  
  // Sync local role with context role
  useEffect(() => {
    setLocalRole(role);
  }, [role]);

  // Listen for role switched events to update the dropdown UI
  useEffect(() => {
    const handleRoleSwitched = (event: Event) => {
      // TypeScript type assertion for custom event
      const customEvent = event as CustomEvent<{
        from: string;
        to: string;
        timestamp: string;
      }>;
      
      console.log('DropdownSidebar received role switched event:', customEvent.detail);
      
      // Reset loading state
      setIsLoading(false);
      
      // Make sure the role in this component reflects the new role
      // This is important because the RoleContext might update first but we need
      // to ensure the Sidebar component also receives the update
      const newRole = customEvent.detail.to as UserRole;
      
      // Update our local role state - this is critical for forcing re-renders
      setLocalRole(newRole);
      
      // Force role refresh in localStorage
      localStorage.setItem('userRole', newRole);
      
      // Force this component to re-render with the correct role
      if (setRole) {
        // Special update just for this component, without navigation
        setRole(newRole, router.pathname);
      }
    };
    
    // Register event listener
    document.addEventListener('roleSwitched', handleRoleSwitched);
    
    // Cleanup
    return () => {
      document.removeEventListener('roleSwitched', handleRoleSwitched);
    };
  }, [router.pathname, setRole]);
  
  // Role icons with appropriate colors
  const roleIcons = {
    viewer: <User className="w-5 h-5 text-blue-500" />,
    advertiser: <MegaphoneIcon className="w-5 h-5 text-orange-500" />,
    publisher: <Edit3 className="w-5 h-5 text-green-500" />,
    admin: <Shield className="w-5 h-5 text-purple-500" />,
    stakeholder: <DollarSign className="w-5 h-5 text-emerald-500" />
  };

  // Role labels
  const roleLabels = {
    viewer: 'Viewer',
    advertiser: 'Advertiser',
    publisher: 'Publisher',
    admin: 'Admin',
    stakeholder: 'Stakeholder'
  };

  // Menu items for each role
  const menuItems = {
    viewer: [
      { icon: <Home className="w-5 h-5" />, label: 'Dashboard', href: '/dashboard/viewer' },
      { icon: <PieChart className="w-5 h-5" />, label: 'Nostr Feed', href: '/nostr-feed' },
      { icon: <SatsIcon className="w-5 h-5" />, label: 'Wallet', href: '/dashboard/wallet' },
      { icon: <Code className="w-5 h-5" />, label: 'Developer', href: '/dashboard/developer' },
      { icon: <Settings className="w-5 h-5" />, label: 'Settings', href: '/dashboard/settings' }
    ],
    advertiser: [
      { icon: <Home className="w-5 h-5" />, label: 'Dashboard', href: '/dashboard/advertiser' },
      { icon: <PieChart className="w-5 h-5" />, label: 'Analytics', href: '/dashboard/advertiser/analytics' },
      { icon: <SatsIcon className="w-5 h-5" />, label: 'Billing', href: '/dashboard/billing' },
      { icon: <Code className="w-5 h-5" />, label: 'Developer', href: '/dashboard/developer' }
    ],
    publisher: [
      { icon: <Home className="w-5 h-5" />, label: 'Dashboard', href: '/dashboard/publisher' },
      { icon: <FileText className="w-5 h-5" />, label: 'Ad Spaces', href: '/dashboard/publisher/spaces' },
      { icon: <CheckSquare className="w-5 h-5" />, label: 'Approvals', href: '/dashboard/publisher/approvals' },
      { icon: <Shield className="w-5 h-5" />, label: 'Rules', href: '/dashboard/publisher/rules' },
      { icon: <SatsIcon className="w-5 h-5" />, label: 'Earnings', href: '/dashboard/publisher/earnings' },
      { icon: <Code className="w-5 h-5" />, label: 'Developer', href: '/dashboard/developer' }
    ],
    admin: [
      { icon: <Home className="w-5 h-5" />, label: 'Dashboard', href: '/dashboard/admin' },
      { icon: <User className="w-5 h-5" />, label: 'Users', href: '/dashboard/admin/users' },
      { icon: <MegaphoneIcon className="w-5 h-5" />, label: 'Campaigns', href: '/dashboard/admin/campaigns' },
      { icon: <SatsIcon className="w-5 h-5" />, label: 'Transactions', href: '/dashboard/admin/transactions' },
      { icon: <Shield className="w-5 h-5" />, label: 'System', href: '/dashboard/admin/system' }
    ],
    stakeholder: [
      { icon: <Home className="w-5 h-5" />, label: 'Dashboard', href: '/dashboard/stakeholder' },
      { icon: <PieChart className="w-5 h-5" />, label: 'Analytics', href: '/dashboard/stakeholder/analytics' },
      { icon: <DollarSign className="w-5 h-5" />, label: 'Financials', href: '/dashboard/stakeholder/financials' }
    ]
  };

  // Toggle sidebar expansion (for mobile)
  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  // Change role handler
  const handleRoleChange = async (newRole: string) => {
    // Check if the role is available using our override function
    if (!isRoleAvailableOverride(newRole)) {
      console.warn(`Role ${newRole} is not available for this user. Skipping role change.`);
      return;
    }
    
    // Close dropdown and set loading state
    setDropdownOpen(false);
    setIsLoading(true);
    
    // Update local role state for immediate UI feedback
    setLocalRole(newRole);
    
    // Store new role in localStorage
    localStorage.setItem('userRole', newRole);
    
    // Critical for test mode: Set force_role_refresh to true
    localStorage.setItem('force_role_refresh', 'true');
    
    console.log(`Changing role to: ${newRole}`);
    
    // Set the role in context immediately for a responsive UI feel
    // But only if we're not on the test page, as it has special handling
    if (setRole && router.pathname !== '/test-dropdown') {
      setRole(newRole);
    }
    
    try {
      // Update role in database via API
      const response = await fetch('/api/roles/set-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      
      if (response.ok) {
        console.log('Role updated logfully in database');
        
        // For the test-dropdown page, stay on the same page
        if (router.pathname === '/test-dropdown') {
          console.log('Staying on test-dropdown page to demonstrate role switching');
          // Update the role in the context without navigation by calling setRole with the current route
          if (setRole) {
            await setRole(newRole, '/test-dropdown');
          }
          
          // Manually trigger a custom event for the test page to handle
          const event = new CustomEvent('roleSwitched', { 
            detail: { 
              from: localRole, // Use localRole which is more accurate than context role
              to: newRole, 
              timestamp: new Date().toISOString() 
            }
          });
          document.dispatchEvent(event);
        } 
        // Use Next.js router for client-side navigation (no full page reload)
        else if (router.pathname.includes('/dashboard/')) {
          // For dashboard pages, do client-side navigation
          await router.push(`/dashboard/${newRole}`);
        } else {
          // For non-dashboard pages, direct to main dashboard
          await router.push(`/dashboard/${newRole}`);
        }
      } else {
        console.error('Failed to update role:', await response.text());
        // Handle API error - still try to navigate but log the error
        if (router.pathname !== '/test-dropdown') {
          await router.push(`/dashboard/${newRole}`);
        }
      }
    } catch (error) {
      console.error('Error changing role:', error);
      // As a fallback, use direct navigation, but not for test-dropdown
      if (router.pathname !== '/test-dropdown') {
        window.location.href = `/dashboard/${newRole}`;
      }
    } finally {
      // Always reset loading state
      setIsLoading(false);
    }
  };
  
  // Get filtered role options (all roles except current one)
  const getFilteredRoleOptions = () => {
    console.log('Current role (context):', role);
    console.log('Current role (local):', localRole);
    console.log('Auth test mode:', auth?.isTestMode);
    console.log('Available roles:', availableRoles);
    console.log('Current path:', router.pathname);
    
    // Force all roles to be available in this test component
    const allRoles = ['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'] as UserRole[];
    
    // Return all roles except the current one - use localRole for more reliable filtering
    return allRoles.filter(roleOption => roleOption !== localRole);
  };
  
  // Override isRoleAvailable for the test-dropdown page
  const originalIsRoleAvailable = isRoleAvailable;
  const isRoleAvailableOverride = (roleToCheck: string): boolean => {
    // On test-dropdown page, force all roles to be available
    if (router.pathname === '/test-dropdown') {
      return true;
    }
    
    // Otherwise use the original function
    return originalIsRoleAvailable(roleToCheck);
  };

  // Get background color based on current role
  const getRoleBackgroundColor = (checkRole: string) => {
    switch(checkRole) {
      case 'viewer': return 'bg-blue-100 dark:bg-blue-900/20';
      case 'advertiser': return 'bg-orange-100 dark:bg-orange-900/20';
      case 'publisher': return 'bg-green-100 dark:bg-green-900/20';
      case 'admin': return 'bg-purple-100 dark:bg-purple-900/20';
      case 'stakeholder': return 'bg-emerald-100 dark:bg-emerald-900/20';
    }
  };

  // Get text color based on current role
  const getRoleTextColor = (checkRole: string) => {
    switch(checkRole) {
      case 'viewer': return 'text-blue-700 dark:text-blue-300';
      case 'advertiser': return 'text-orange-700 dark:text-orange-300';
      case 'publisher': return 'text-green-700 dark:text-green-300';
      case 'admin': return 'text-purple-700 dark:text-purple-300';
      case 'stakeholder': return 'text-emerald-700 dark:text-emerald-300';
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
                           router.pathname.includes('/dashboard/user') ? 'viewer' : 'viewer';
      
      // For styling purposes, use the path-based role for consistent styling
      switch(pathBasedRole) {
        case 'viewer':
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
          <div className="mt-1 text-xs text-purple-400 dark:text-purple-300 font-medium">
            With Role Dropdown
          </div>
        </div>
        
        {/* Role selector - dropdown */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative" ref={dropdownRef}>
            <button 
              className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors border border-gray-300 dark:border-gray-600 ${
                getRoleBackgroundColor(localRole)
              } ${
                getRoleTextColor(localRole)
              }`}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-label="Toggle role selector dropdown"
              aria-expanded={dropdownOpen}
            >
              <div className="flex items-center">
                <span className="mr-3">
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-t-transparent border-current rounded-full animate-spin" />
                  ) : (
                    roleIcons[localRole]
                  )}
                </span>
                <span>{roleLabels[localRole]}</span>
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
              role="menu"
              aria-orientation="vertical"
            >
              {getFilteredRoleOptions().map((roleOption) => (
                <button
                  key={roleOption}
                  onClick={() => handleRoleChange(roleOption)}
                  className={`w-full flex items-center px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 
                    ${isRoleAvailableOverride(roleOption) 
                      ? 'text-gray-700 dark:text-gray-300' 
                      : 'text-gray-400 dark:text-gray-500 italic'}`}
                  disabled={!isRoleAvailableOverride(roleOption)}
                  role="menuitem"
                >
                  <span className="mr-3">
                    {isRoleAvailableOverride(roleOption) 
                      ? roleIcons[roleOption]
                      : <Lock className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    }
                  </span>
                  <span>
                    {roleLabels[roleOption]}
                    {!isRoleAvailableOverride(roleOption) && " (Locked)"}
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
            {menuItems[localRole].map((item) => (
              <li key={item.label}>
                <Link 
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors transition-all duration-200 ${getActiveClass(item.href)}`}
                  onClick={(e) => {
                    // If we're already on a dashboard page, handle navigation client-side
                    if (router.pathname.includes('/dashboard/') && item.href.includes('/dashboard/')) {
                      e.preventDefault();
                      router.push(item.href);
                    }
                    // For non-dashboard navigation, let the Link handle it normally
                  }}
                >
                  <span className="mr-3 flex-shrink-0">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
          
          {/* Logout button */}
          <div className="mt-auto">
            <button
              onClick={() => {
                // Show confirmation dialog
                if (window.confirm('Are you sure you want to log out?')) {
                  // Use direct navigation to system logout page
                  window.location.href = '/system/logout';
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

export default DropdownSidebar;