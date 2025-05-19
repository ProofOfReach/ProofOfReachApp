import { ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useLocalRole } from '../../hooks/useLocalRole';
import { UserRole } from '../../context/RoleContext';
import RoleDropdown from '../role/RoleDropdown';
import RoleTransitionOverlay from '../loading/RoleTransitionOverlay';

// Import icons
import { Menu, X, User, Home, BarChart2, Settings } from 'react-feather';

interface SimplifiedDashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

/**
 * Simplified Dashboard Layout component with best practices for role management
 */
const SimplifiedDashboardLayout: React.FC<SimplifiedDashboardLayoutProps> = ({ 
  children, 
  title = 'Dashboard'
}) => {
  const router = useRouter();
  const { currentRole } = useLocalRole();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Role transition state
  const [transitionState, setTransitionState] = useState({
    active: false,
    fromRole: 'viewer' as UserRole,
    toRole: 'viewer' as UserRole
  });
  
  // Listen for role transition events
  useEffect(() => {
    const handleRoleTransition = (event: Event) => {
      const customEvent = event as CustomEvent<{
        from: string;
        to: string;
        timestamp: string;
      }>;
      
      console.log('Role transition detected:', customEvent.detail);
      
      // Show transition overlay
      setTransitionState({
        active: true,
        fromRole: customEvent.detail.from as UserRole,
        toRole: customEvent.detail.to as UserRole
      });
      
      // Hide overlay after 1 second
      setTimeout(() => {
        setTransitionState({
          ...transitionState,
          active: false
        });
      }, 1000);
    };
    
    // Add and remove event listeners
    document.addEventListener('roleSwitched', handleRoleTransition);
    return () => {
      document.removeEventListener('roleSwitched', handleRoleTransition);
    };
  }, [transitionState]);
  
  // Basic navigation links that adapt to the current role
  const getNavigationLinks = () => {
    // Common links for all roles
    const commonLinks = [
      { href: '/dashboard', label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
      { href: '/dashboard/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> }
    ];
    
    // Role-specific links
    const roleLinks = {
      viewer: [
        { href: '/dashboard/user/profile', label: 'My Profile', icon: <User className="w-5 h-5" /> }
      ],
      advertiser: [
        { href: '/dashboard/advertiser/campaigns', label: 'Campaigns', icon: <BarChart2 className="w-5 h-5" /> }
      ],
      publisher: [
        { href: '/dashboard/publisher/spaces', label: 'Ad Spaces', icon: <BarChart2 className="w-5 h-5" /> }
      ],
      admin: [
        { href: '/dashboard/admin/users', label: 'Users', icon: <User className="w-5 h-5" /> }
      ],
      stakeholder: [
        { href: '/dashboard/stats/overview', label: 'Statistics', icon: <BarChart2 className="w-5 h-5" /> }
      ]
    };
    
    // Combine common links with role-specific links
    return [...commonLinks, ...(roleLinks[currentRole as UserRole] || [])];
  };
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Head>
        <title>{title} | Nostr Ad Marketplace</title>
      </Head>
      
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-150 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="text-xl font-bold text-gray-800 dark:text-white">
              Nostr Ad Marketplace
            </div>
            <button 
              className="p-1 rounded-md lg:hidden hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
          
          {/* Role selector */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mb-2">
              Active Role
            </h3>
            <RoleDropdown className="w-full" />
          </div>
          
          {/* Navigation links */}
          <nav className="flex-grow px-4 py-4 overflow-y-auto">
            <ul className="space-y-1">
              {getNavigationLinks().map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href}
                    className={`flex items-center px-3 py-2 rounded-md ${
                      router.pathname === link.href
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="mr-3">{link.icon}</span>
                    <span>{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
      
      {/* Main content */}
      <div className={`lg:pl-64 min-h-screen flex flex-col`}>
        {/* Top navbar */}
        <header className="bg-white dark:bg-gray-800 shadow-sm z-10">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center">
              <button 
                className="p-1 mr-3 rounded-md lg:hidden hover:bg-gray-200 dark:hover:bg-gray-700"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </button>
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                {title}
              </h1>
            </div>
            
            <div className="p-1 rounded-full bg-gray-200 dark:bg-gray-700">
              <User className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </div>
          </div>
        </header>
        
        {/* Page content */}
        <main className="flex-grow p-4">
          {children}
        </main>
        
        {/* Footer */}
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 px-6">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Nostr Ad Marketplace. All rights reserved.
          </p>
        </footer>
      </div>
      
      {/* Role transition overlay */}
      <RoleTransitionOverlay
        isChangingRole={transitionState.active}
      />
    </div>
  );
};

/**
 * Helper function to wrap a page with the SimplifiedDashboardLayout
 */
export const getSimplifiedDashboardLayout = (page: ReactNode, title?: string) => (
  <SimplifiedDashboardLayout title={title}>
    {page}
  </SimplifiedDashboardLayout>
);

export default SimplifiedDashboardLayout;