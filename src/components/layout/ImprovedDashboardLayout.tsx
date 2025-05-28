import React, { ReactNode, useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import type { UserRole } from '../../context/RoleContext';
import { unifiedRoleService } from '../../lib/unifiedRoleService';
import { triggerRoleRefresh } from '../../utils/roleEvents';
import ClientOnly from '../../utils/clientOnly';
import DebugRoleEnabler from '../DebugRoleEnabler';
import SimpleRoleDropdown from '../role/SimpleRoleDropdown';
import Link from 'next/link';
import { 
  User, FileText, Settings, Shield,
  DollarSign, Menu, X, Home, LogOut, BarChart2
} from 'react-feather';
import { Code } from 'react-feather';
import MegaphoneIcon from '../icons/MegaphoneIcon';
import SatsIcon from '../icons/SatsIcon';
import BitcoinIcon from '../icons/BitcoinIcon';
import CurrencyToggle from '../CurrencyToggle';
import ExchangeRateDisplay from '../ExchangeRateDisplay';
import { TestModeBanner } from '../TestModeBanner';
import TestModeDisabler from '../admin/TestModeDisabler';

export interface ImprovedDashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

/**
 * Improved dashboard layout with direct role management
 */
const ImprovedDashboardLayout: React.FC<ImprovedDashboardLayoutProps> = ({ 
  children, 
  title 
}) => {
  // Initialize router for navigation and path matching
  const router = useRouter();
  // State for mobile sidebar toggle
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // State for current role
  const [currentRole, setCurrentRole] = useState<UserRole>('viewer');
  
  // Role icons with appropriate colors
  const roleIcons: Record<UserRole, React.ReactNode> = {
    viewer: <User className="w-5 h-5 text-blue-500" />,
    advertiser: <MegaphoneIcon className="w-5 h-5 text-orange-500" />,
    publisher: <FileText className="w-5 h-5 text-green-500" />,
    admin: <Shield className="w-5 h-5 text-purple-500" />,
    stakeholder: <DollarSign className="w-5 h-5 text-emerald-500" />
  };

  // Set initial role and setup event listeners on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Use the same role detection logic as the dashboard (single source of truth)
      const storedRole = localStorage.getItem('currentRole');
      
      console.log('🔍 Layout checking localStorage currentRole:', storedRole);
      
      // If we have a valid role from onboarding/auth, use it
      if (storedRole && ['advertiser', 'publisher', 'admin', 'stakeholder', 'viewer'].includes(storedRole)) {
        console.log('✅ Layout using role from localStorage:', storedRole);
        setCurrentRole(storedRole as UserRole);
      }
      
      // Listen for role changes via custom events (legacy)
      const handleRoleSwitchedEvent = (event: Event) => {
        const customEvent = event as CustomEvent<{
          from: string;
          to: string;
        }>;
        setCurrentRole(customEvent.detail.to as UserRole);
      };
      
      // Listen for storage events for role changes
      const handleStorageEvent = (event: StorageEvent) => {
        if (event.key === 'currentRole') {
          const role = localStorage.getItem('currentRole');
          if (role) {
            setCurrentRole(role as UserRole);
          }
        }
      };
      
      // Listen for standardized role refresh event
      const handleRoleRefresh = () => {
        const role = unifiedRoleService.getCurrentRole();
        if (role) {
          setCurrentRole(role as UserRole);
        }
      };
      
      // Add event listeners for all event types
      document.addEventListener('roleSwitched', handleRoleSwitchedEvent);
      window.addEventListener('storage', handleStorageEvent);
      window.addEventListener('test-role-update', handleRoleRefresh);
      
      // Cleanup all event listeners
      return () => {
        document.removeEventListener('roleSwitched', handleRoleSwitchedEvent);
        window.removeEventListener('storage', handleStorageEvent);
        window.removeEventListener('test-role-update', handleRoleRefresh);
      };
    }
  }, []);
  
  // Manually handle role changes without reloading the page
  const handleRoleChange = async (newRole: string) => {
    if (currentRole === newRole) return;
    
    console.log(`Switching to role: ${newRole}`);
    
    try {
      // Set direct localStorage values to ensure the change is registered
      localStorage.setItem('userRole', newRole);
      localStorage.setItem('currentRole', newRole);
      localStorage.setItem('force_role_refresh', 'true');
      
      // Also use unifiedRoleService for proper event handling
      const success = await unifiedRoleService.setCurrentRole(newRole as any);
      
      if (success) {
        // Update local state
        setCurrentRole(newRole as UserRole);
        
        // Trigger role refresh events
        triggerRoleRefresh();
        
        // Dispatch custom events to notify other components
        // First the standard role switched event
        const roleSwitchedEvent = new CustomEvent('roleSwitched', {
          detail: { from: currentRole, to: newRole }
        });
        document.dispatchEvent(roleSwitchedEvent);
        
        // Then the role-changed event
        const roleChangedEvent = new CustomEvent('role-changed', {
          detail: { role: newRole }
        });
        window.dispatchEvent(roleChangedEvent);
        
        // Use router to navigate to the dashboard for that role
        // This avoids a full page reload while still updating the UI
        if (typeof window !== 'undefined') {
          // Update navigation without full reload
          // Wait briefly to let state updates propagate
          setTimeout(() => {
            // Navigate to the dashboard with the new role context
            const dashboardUrl = '/dashboard';
            if (window.location.pathname === dashboardUrl) {
              // If already on dashboard, just refresh the dashboard content
              const event = new Event('dashboard-role-changed');
              window.dispatchEvent(event);
            } else {
              // Otherwise, navigate to dashboard
              window.location.href = dashboardUrl;
            }
          }, 100);
        }
      } else {
        console.log(`Failed to switch to role: ${newRole}`);
      }
    } catch (error) {
      console.log(`Error switching to role: ${newRole}`, error);
    }
  };
  
  // Define the type for navigation items
  type NavigationItem = {
    role: string;
    label: string;
    icon: React.ReactNode;
    href: string;
  };

  // Role-specific navigation items
  const getNavigationItems = (): NavigationItem[] => {
    let navItems: NavigationItem[] = [];
    
    // Common items for all roles
    const dashboardItem = [
      { role: currentRole, label: 'Dashboard', icon: <Home className="w-5 h-5 mr-3" />, href: '/dashboard' },
    ];
    
    const bottomNavItems = [
      { role: currentRole, label: 'Developer', icon: <Code className="w-5 h-5 mr-3" />, href: '/dashboard/developer' },
      { role: currentRole, label: 'Settings', icon: <Settings className="w-5 h-5 mr-3" />, href: '/dashboard/settings' }
    ];
    
    // Role-specific items - using only verified existing pages
    const roleSpecificItems: Record<UserRole, NavigationItem[]> = {
      viewer: [
        { role: 'viewer', label: 'Nostr Feed', icon: <FileText className="w-5 h-5 mr-3" />, href: '/dashboard/nostr-feed' },
        { role: 'viewer', label: 'My Wallet', icon: <BitcoinIcon className="w-5 h-5 mr-3" />, href: '/dashboard/wallet' }
      ],
      advertiser: [
        { role: 'advertiser', label: 'Campaigns', icon: <MegaphoneIcon className="w-5 h-5 mr-3" />, href: '/dashboard/campaigns' },
        { role: 'advertiser', label: 'Analytics', icon: <BarChart2 className="w-5 h-5 mr-3" />, href: '/dashboard/analytics' },
        { role: 'advertiser', label: 'Billing', icon: <BitcoinIcon className="w-5 h-5 mr-3" />, href: '/dashboard/billing' }
      ],
      publisher: [
        { role: 'publisher', label: 'Ad Spaces', icon: <FileText className="w-5 h-5 mr-3" />, href: '/dashboard/spaces' },
        { role: 'publisher', label: 'Rules', icon: <Shield className="w-5 h-5 mr-3" />, href: '/dashboard/rules' },
        { role: 'publisher', label: 'Analytics', icon: <BarChart2 className="w-5 h-5 mr-3" />, href: '/dashboard/analytics' }
      ],
      admin: [
        { role: 'admin', label: 'Users', icon: <User className="w-5 h-5 mr-3" />, href: '/dashboard/users' },
        { role: 'admin', label: 'Admin Panel', icon: <Shield className="w-5 h-5 mr-3" />, href: '/dashboard/admin' },
        { role: 'admin', label: 'Campaigns', icon: <MegaphoneIcon className="w-5 h-5 mr-3" />, href: '/dashboard/campaigns' }
      ],
      stakeholder: [
        { role: 'stakeholder', label: 'Analytics', icon: <BarChart2 className="w-5 h-5 mr-3" />, href: '/dashboard/analytics' },
        { role: 'stakeholder', label: 'Stakeholder', icon: <User className="w-5 h-5 mr-3" />, href: '/dashboard/stakeholder' }
      ]
    };
    
    // Combine items with dashboard first, role-specific items in the middle, and settings/developer at the bottom
    navItems = [
      ...dashboardItem,
      ...(roleSpecificItems[currentRole] || []), // Use empty array as fallback if currentRole isn't found
      ...bottomNavItems
    ];
    
    return navItems;
  };
  
  return (
    <ClientOnly fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center">
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-10 w-64 rounded mb-4"></div>
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-40 w-80 rounded"></div>
      </div>
    }>
      <>
        <Head>
          <title>{title ? `${title} - Nostr Ad Marketplace` : 'Nostr Ad Marketplace'}</title>
        </Head>
        
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
          {/* Sidebar for desktop */}
          <aside className={`
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            md:translate-x-0 fixed md:relative inset-y-0 left-0 z-10 w-64 bg-white dark:bg-gray-800 
            shadow-md md:shadow-none transition-transform duration-300
          `}>
            {/* Close button (mobile only) */}
            <button 
              onClick={() => setSidebarOpen(false)}
              className="md:hidden absolute top-5 right-5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
            
            {/* Logo */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <Link href="/dashboard" className="flex items-center">
                <img 
                  src="/logo_big_light.png" 
                  alt="Proof Of Reach" 
                  className="h-auto w-[145px]" 
                />
              </Link>
            </div>
            

            
            {/* Navigation items */}
            <nav className="p-4" key={`nav-${currentRole}`}>
              <ul className="space-y-2">
                {getNavigationItems().map((item, index) => {
                  // Determine if this menu item is active based on the current route
                  // For dashboard index page, we need an exact match
                  const isDashboardIndex = item.href === '/dashboard';
                  
                  // Check if the current path matches this menu item
                  const isActive = isDashboardIndex 
                    ? router.pathname === '/dashboard'
                    : router.pathname === item.href || router.pathname.startsWith(item.href + '/');
                  
                  return (
                    <li key={index}>
                      <Link href={item.href}>
                        <div className={`
                          flex items-center px-4 py-2 rounded-md cursor-pointer
                          ${isActive ? 
                            'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 font-medium' : 
                            'text-gray-700 dark:text-gray-300'}
                        `}>
                          {item.icon}
                          {item.label}
                        </div>
                      </Link>
                    </li>
                  );
                })}
                
                {/* Spacer to push logout and currency to bottom */}
                <div className="flex-grow min-h-[40px] mt-8"></div>
                
                {/* Logout link */}
                <li>
                  <Link href="/system/logout">
                    <div className="flex items-center px-4 py-2 text-red-600 rounded-md dark:text-red-400">
                      <LogOut className="w-5 h-5 mr-3" />
                      <span className="font-medium">Logout</span>
                    </div>
                  </Link>
                </li>
                
                {/* Divider */}
                <li className="my-2">
                  <div className="border-t border-gray-200 dark:border-gray-700 mx-4"></div>
                </li>
                
                {/* Currency section */}
                <li>
                  <div className="px-4">
                    <CurrencyToggle className="w-full mb-2" />
                    <ExchangeRateDisplay className="text-xs text-gray-500 dark:text-gray-400 mt-1" />
                  </div>
                </li>
              </ul>
            </nav>
          </aside>
          
          {/* Main content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-4 px-6 flex items-center justify-between">
              <div className="flex items-center">
                {/* Mobile menu button */}
                <button 
                  onClick={() => setSidebarOpen(true)} 
                  className="md:hidden mr-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  aria-label="Open sidebar"
                >
                  <Menu className="h-6 w-6" />
                </button>
                
                <h1 className="text-xl font-medium text-gray-900 dark:text-white">
                  {title || 'Dashboard'}
                </h1>
              </div>
              
              {/* Role selector in header */}
              <div className="flex items-center space-x-4">
                <SimpleRoleDropdown 
                  skipNavigation={true}
                  onRoleChange={(newRole) => {
                    setCurrentRole(newRole as UserRole);
                  }}
                  className="min-w-[120px]"
                />
              </div>
            </header>
            
            {/* Debug tools (only in development for admins) */}
            {process.env.NODE_ENV !== 'production' && currentRole === 'admin' && <DebugRoleEnabler />}
            
            {/* Global test mode disabler (only visible to admins) */}
            {currentRole === 'admin' && <TestModeDisabler />}
            
            {/* Page content */}
            <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
              {/* Enhanced Test Mode Banner - only visible to admins */}
              <TestModeBanner />
              
              {children}
            </main>
            
            {/* Footer */}
            <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 px-6">
              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                © {new Date().getFullYear()} Nostr Ad Marketplace - Phase 1 MVP
              </div>
            </footer>
          </div>
        </div>
        
        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div 
            className="md:hidden fixed inset-0 z-0 bg-gray-900/50"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          ></div>
        )}
      </>
    </ClientOnly>
  );
};

export default ImprovedDashboardLayout;