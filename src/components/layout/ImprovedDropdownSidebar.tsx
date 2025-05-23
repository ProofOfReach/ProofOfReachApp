import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  User, FileText, Settings, Home, PieChart, 
  List, CheckSquare, Shield, Edit3,
  DollarSign, LogOut
} from 'react-feather';
import { defaultUseRole, UserRole } from '../../context/RoleContext';
import { useAuth } from '../../hooks/useAuth';
import MegaphoneIcon from '../icons/MegaphoneIcon';
import CurrencyToggle from '../CurrencyToggle';
import ExchangeRateDisplay from '../ExchangeRateDisplay';
import RoleDropdown from '../role/RoleDropdown';
import { useLocalRole } from '../../hooks/useLocalRole';

const ImprovedDropdownSidebar: React.FC = () => {
  const { currentRole } = useLocalRole();
  const router = useRouter();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  
  // Toggle sidebar visibility (mobile)
  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  // Define menu items for each role
  const menuItems: Record<string, {
    href: string;
    label: string;
    icon: React.ReactNode;
  }[]> = {
    viewer: [
      { href: '/dashboard', label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
      { href: '/nostr-feed', label: 'Nostr Feed', icon: <PieChart className="w-5 h-5" /> },
      { href: '/dashboard/viewer/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
    ],
    advertiser: [
      { href: '/dashboard', label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
      { href: '/dashboard/advertiser/campaigns', label: 'Campaigns', icon: <PieChart className="w-5 h-5" /> },
      { href: '/dashboard/advertiser/wallet', label: 'Wallet', icon: <DollarSign className="w-5 h-5" /> },
      { href: '/dashboard/advertiser/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
    ],
    publisher: [
      { href: '/dashboard', label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
      { href: '/dashboard/publisher/ad-spaces', label: 'Ad Spaces', icon: <FileText className="w-5 h-5" /> },
      { href: '/dashboard/publisher/approval', label: 'Approval', icon: <CheckSquare className="w-5 h-5" /> },
      { href: '/dashboard/publisher/wallet', label: 'Wallet', icon: <DollarSign className="w-5 h-5" /> },
      { href: '/dashboard/publisher/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
    ],
    admin: [
      { href: '/dashboard', label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
      { href: '/dashboard/admin/users', label: 'Users', icon: <User className="w-5 h-5" /> },
      { href: '/dashboard/admin/content', label: 'Content', icon: <Edit3 className="w-5 h-5" /> },
      { href: '/dashboard/admin/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
    ],
    stakeholder: [
      { href: '/dashboard', label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
      { href: '/dashboard/stakeholder/analytics', label: 'Analytics', icon: <PieChart className="w-5 h-5" /> },
      { href: '/dashboard/stakeholder/users', label: 'Users', icon: <User className="w-5 h-5" /> },
      { href: '/dashboard/stakeholder/security', label: 'Security', icon: <Shield className="w-5 h-5" /> },
      { href: '/dashboard/stakeholder/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
    ],
  };

  // Get active menu item styling
  const getActiveClass = (href: string) => {
    // For Dashboard items, we need a more exact match to avoid highlighting for all pages
    const isDashboardLink = href === '/dashboard' ||
                           href === '/dashboard/viewer' || 
                           href === '/dashboard/advertiser' ||
                           href === '/dashboard/publisher' ||
                           href === '/dashboard/admin' ||
                           href === '/dashboard/stakeholder';
    
    // For dashboard links, only match exact paths
    // For other links, match the path or its sub-paths
    const isActive = isDashboardLink 
      ? router.pathname === href || router.pathname === '/dashboard'
      : (router.pathname === href || router.pathname.startsWith(`${href}/`));
    
    let activeClass = '';
    
    if (isActive) {
      // Determine the role for styling based on the URL path (more reliable) or current role
      const pathBasedRole = router.pathname.includes('/dashboard/advertiser') ? 'advertiser' :
                           router.pathname.includes('/dashboard/publisher') ? 'publisher' : 
                           router.pathname.includes('/dashboard/admin') ? 'admin' :
                           router.pathname.includes('/dashboard/stakeholder') ? 'stakeholder' :
                           router.pathname.includes('/dashboard/viewer') ? 'viewer' : currentRole;
      
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
            Role Switching Dashboard
          </div>
        </div>
        
        {/* Role selector - dropdown */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <RoleDropdown />
        </div>
        
        {/* Menu items */}
        <nav className="p-4 flex flex-col h-[calc(100vh-120px)]">
          <h2 className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-2 font-semibold">Menu</h2>
          <ul className="space-y-1 w-full min-w-0">
            {menuItems[currentRole].map((item) => (
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

export default ImprovedDropdownSidebar;