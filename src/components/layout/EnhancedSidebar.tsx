import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  User, FileText, Settings, Home, PieChart, 
  Plus, List, CheckSquare, Shield, Edit3,
  DollarSign, LogOut, Code, ChevronDown, Lock,
  X, Menu
} from 'react-feather';
import { useRole } from '../../context/NewRoleContext';
import { useRoleRefactored } from '../../context/NewRoleContextRefactored';
import { UserRole } from '../../types/auth';
import { useAuth } from '../../hooks/useAuth';
import MegaphoneIcon from '../icons/MegaphoneIcon';
import SatsIcon from '../icons/SatsIcon';
import CurrencyToggle from '../CurrencyToggle';
import ExchangeRateDisplay from '../ExchangeRateDisplay';

// Import shadcn/ui components
import { cn } from '../../lib/utils';
import { Sheet, SheetContent, SheetClose } from '../ui/sheet';
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuNextLink } from '../ui/navigation-menu';

import { Button } from '../ui/button';

/**
 * Enhanced Sidebar component built with shadcn/ui styled components
 */
const EnhancedSidebar: React.FC = () => {
  const { role: originalRole, setRole: originalSetRole, availableRoles: originalAvailableRoles, isRoleAvailable: originalIsRoleAvailable } = useRole();
  const { role: refactoredRole, setRole: refactoredSetRole, availableRoles: refactoredAvailableRoles, isRoleAvailable: refactoredIsRoleAvailable } = useRoleRefactored();
  const { auth, logout } = useAuth();
  
  // For backward compatibility, try to use both role context systems
  // with priority to the refactored version
  // Check for both currentRole and legacy userRole in localStorage
  const localStorageRole = typeof window !== 'undefined' && 
    (localStorage.getItem('currentRole') || localStorage.getItem('userRole')) as UserRole;
  const role = localStorageRole || refactoredRole || originalRole;
  
  // Convert any legacy 'viewer' role to 'viewer'
  const normalizedRole = role === 'viewer' as any ? 'viewer' : role;
  const setRole = refactoredSetRole || originalSetRole;
  const availableRoles = refactoredAvailableRoles.length > 0 ? refactoredAvailableRoles : originalAvailableRoles;
  const isRoleAvailable = refactoredIsRoleAvailable || originalIsRoleAvailable;
  const router = useRouter();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setRoleDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
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
      { icon: <Shield className="w-5 h-5" />, label: 'System', href: '/dashboard/admin/system' },
      { icon: <Lock className="w-5 h-5" />, label: 'Role Management', href: '/dashboard/admin/role-management' }
    ],
    stakeholder: [
      { icon: <Home className="w-5 h-5" />, label: 'Dashboard', href: '/dashboard/stakeholder' },
      { icon: <PieChart className="w-5 h-5" />, label: 'Analytics', href: '/dashboard/stakeholder/analytics' },
      { icon: <DollarSign className="w-5 h-5" />, label: 'Financials', href: '/dashboard/stakeholder/financials' }
    ]
  };

  // Change role handler
  const handleRoleChange = async (newRole: UserRole) => {
    // First check if the role is available
    if (!isRoleAvailable(newRole)) {
      console.warn(`Role ${newRole} is not available for this user. Skipping role change.`);
      return;
    }
    
    // Close dropdown
    setRoleDropdownOpen(false);
    
    // Store new role in localStorage before changing context
    localStorage.setItem('currentRole', newRole);
    
    // Critical for test mode: Set force_role_refresh to true
    localStorage.setItem('force_role_refresh', 'true');
    
    // Each role has a dedicated dashboard path
    let targetPath = '/dashboard/viewer';
    
    if (newRole === 'publisher') {
      targetPath = '/dashboard/publisher';
    } else if (newRole === 'advertiser') {
      targetPath = '/dashboard/advertiser';
    } else if (newRole === 'admin') {
      targetPath = '/dashboard/admin';
    } else if (newRole === 'stakeholder') {
      targetPath = '/dashboard/stakeholder';
    }
    
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
  };
  
  // Get filtered role options (all roles except current one)
  const getFilteredRoleOptions = () => {
    return (['viewer', 'advertiser', 'publisher', 'admin', 'stakeholder'] as UserRole[])
      .filter(roleOption => roleOption !== normalizedRole);
  };

  // Get background color based on current role
  const getRoleBackgroundColor = (checkRole: UserRole) => {
    switch(checkRole) {
      case 'viewer': return 'bg-blue-100 dark:bg-blue-900/20';
      case 'advertiser': return 'bg-orange-100 dark:bg-orange-900/20';
      case 'publisher': return 'bg-green-100 dark:bg-green-900/20';
      case 'admin': return 'bg-purple-100 dark:bg-purple-900/20';
      case 'stakeholder': return 'bg-emerald-100 dark:bg-emerald-900/20';
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
    }
  };

  // Get active menu item styling
  const getActiveClass = (href: string) => {
    // For Dashboard items, we need a more exact match to avoid highlighting for all pages
    const isDashboardLink = href === '/dashboard/viewer' || 
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
                           router.pathname.includes('/dashboard/viewer') ? 'viewer' : 'viewer';
      
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

  // Mobile sidebar content - shared between mobile and desktop
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo area */}
      <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-purple-600 dark:text-purple-400">Nostr Ad Market</h1>
      </div>
      
      {/* Role selector */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative" ref={dropdownRef}>
          <Button 
            variant="outline"
            className={cn(
              "w-full flex items-center justify-between px-3 py-2 text-sm",
              getRoleBackgroundColor(role),
              getRoleTextColor(role)
            )}
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
          >
            <div className="flex items-center">
              <span className="mr-3">{roleIcons[normalizedRole as keyof typeof roleIcons]}</span>
              <span>{roleLabels[normalizedRole as keyof typeof roleLabels]}</span>
            </div>
            <ChevronDown 
              className={cn(
                "h-4 w-4 ml-2 transition-transform",
                roleDropdownOpen && "rotate-180"
              )}
            />
          </Button>
          
          {/* Dropdown menu */}
          <div 
            className={cn(
              "absolute z-10 mt-1 w-full rounded-md bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 transition-opacity duration-100",
              roleDropdownOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
          >
            {getFilteredRoleOptions().map((roleOption) => (
              <Button
                key={roleOption}
                variant="ghost"
                onClick={() => handleRoleChange(roleOption)}
                className={cn(
                  "w-full flex items-center justify-start px-3 py-2 text-sm",
                  isRoleAvailable(roleOption) 
                    ? "text-gray-700 dark:text-gray-300" 
                    : "text-gray-400 dark:text-gray-500 italic"
                )}
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
              </Button>
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
      
      {/* Menu navigation */}
      <NavigationMenu className="flex-grow overflow-y-auto py-4 px-3">
        <div className="w-full">
          <h2 className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-2 font-semibold px-2">Menu</h2>
          <NavigationMenuList className="flex-col space-y-1 space-x-0 w-full min-w-0">
            {menuItems[normalizedRole as keyof typeof menuItems]?.map((item) => (
              <NavigationMenuItem key={item.label} active={getActiveClass(item.href).includes('bg-')}>
                <NavigationMenuNextLink 
                  href={item.href}
                  className={cn(
                    "flex items-center w-full px-2 py-2 text-sm rounded-md",
                    getActiveClass(item.href)
                  )}
                >
                  <span className="mr-3 flex-shrink-0">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </NavigationMenuNextLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
          
          {/* Developer Section */}
          <div className="mt-6">
            <h2 className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-2 font-semibold px-2">Developer Tools</h2>
            <NavigationMenuList className="flex-col space-y-1 space-x-0">
              <NavigationMenuItem active={getActiveClass('/dashboard/admin/role-management').includes('bg-')}>
                <NavigationMenuNextLink
                  href="/dashboard/admin/role-management"
                  className={cn(
                    "flex items-center w-full px-2 py-2 text-sm rounded-md",
                    getActiveClass('/dashboard/admin/role-management')
                  )}
                >
                  <span className="mr-3 flex-shrink-0"><Lock className="w-5 h-5" /></span>
                  <span className="truncate">Role Management</span>
                </NavigationMenuNextLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </div>
          
          {/* Logout button */}
          <div className="mt-6">
            <Button
              variant="ghost"
              className="flex items-center w-full px-2 py-2 text-sm rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => logout()}
            >
              <span className="mr-3 flex-shrink-0">
                <LogOut className="w-5 h-5 text-gray-500" />
              </span>
              <span className="truncate">Logout</span>
            </Button>
          </div>
        </div>
      </NavigationMenu>
      
      {/* Currency toggle at bottom of sidebar */}
      <div className="pt-4 px-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-col">
          <CurrencyToggle className="w-full mb-2" />
          <ExchangeRateDisplay className="text-xs text-gray-500 dark:text-gray-400 mt-1" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button - visible only on small screens */}
      <Button 
        variant="default"
        size="icon"
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed z-50 bottom-4 right-4 rounded-full bg-purple-600 text-white shadow-lg hover:bg-purple-700"
      >
        <Menu className="w-5 h-5" />
      </Button>
      
      {/* Mobile sidebar using Sheet component */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64 max-w-[80vw]">
          <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </SheetClose>
          <SidebarContent />
        </SheetContent>
      </Sheet>
      
      {/* Desktop sidebar */}
      <aside className="hidden md:block sticky top-0 h-screen w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <SidebarContent />
      </aside>
    </>
  );
};

export default EnhancedSidebar;