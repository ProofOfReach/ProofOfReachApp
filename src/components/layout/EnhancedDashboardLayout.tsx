import { ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useLocalRole } from '../../hooks/useLocalRole';
import { EnhancedRoleProvider } from '../../context/EnhancedRoleProvider';
import RoleDropdown from '../role/RoleDropdown';
import RoleTransitionOverlay from '../loading/RoleTransitionOverlay';

// Import icons
import { Menu, X, User, Home, BarChart2, Settings, BookOpen, ShoppingBag, DollarSign, PieChart, Users, Coffee, Bell, Search, Sun, Moon } from 'react-feather';

interface EnhancedDashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

/**
 * Enhanced Dashboard Layout component with improved role management
 */
const EnhancedDashboardLayout: React.FC<EnhancedDashboardLayoutProps> = ({ 
  children, 
  title = 'Dashboard'
}) => {
  const router = useRouter();
  const { localRole } = useLocalRole();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [transitionData, setTransitionData] = useState<{
    from: string;
    to: string;
    active: boolean;
  }>({
    from: '',
    to: '',
    active: false
  });
  
  // Handle dark mode toggle
  useEffect(() => {
    // Check local storage preference
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode') === 'true';
      setDarkMode(savedMode);
      
      if (savedMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);
  
  // Listen for role transition events
  useEffect(() => {
    const handleRoleSwitched = (event: Event) => {
      const customEvent = event as CustomEvent<{
        from: string;
        to: string;
        timestamp: string;
      }>;
      
      console.log('Role switched event received in overlay:', customEvent.detail);
      
      // Begin transition animation
      setTransitionData({
        from: customEvent.detail.from,
        to: customEvent.detail.to,
        active: true
      });
      
      console.log('Role transition started');
      
      // Hide transition overlay after animation completes
      setTimeout(() => {
        setTransitionData(prev => ({ ...prev, active: false }));
        console.log('Role transition completed');
      }, 1000);
    };
    
    document.addEventListener('roleSwitched', handleRoleSwitched);
    
    return () => {
      document.removeEventListener('roleSwitched', handleRoleSwitched);
    };
  }, []);
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    localStorage.setItem('darkMode', String(newMode));
  };
  
  // Dynamic navigation links based on role
  const navigationLinks = [
    // Common links for all roles
    { href: '/dashboard', label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
    
    // Advertiser-specific links
    ...(localRole === 'advertiser' ? [
      { href: '/dashboard/advertiser/campaigns', label: 'Campaigns', icon: <BarChart2 className="w-5 h-5" /> },
      { href: '/dashboard/advertiser/ads', label: 'Ad Manager', icon: <ShoppingBag className="w-5 h-5" /> },
      { href: '/dashboard/billing', label: 'Billing', icon: <DollarSign className="w-5 h-5" /> },
    ] : []),
    
    // Publisher-specific links
    ...(localRole === 'publisher' ? [
      { href: '/dashboard/publisher/spaces', label: 'Ad Spaces', icon: <BookOpen className="w-5 h-5" /> },
      { href: '/dashboard/publisher/earnings', label: 'Earnings', icon: <DollarSign className="w-5 h-5" /> },
      { href: '/dashboard/publisher/content', label: 'Content', icon: <Coffee className="w-5 h-5" /> },
    ] : []),
    
    // Admin-specific links
    ...(localRole === 'admin' ? [
      { href: '/dashboard/admin/users', label: 'User Management', icon: <Users className="w-5 h-5" /> },
      { href: '/dashboard/admin/approvals', label: 'Ad Approvals', icon: <Bell className="w-5 h-5" /> },
      { href: '/dashboard/admin/reports', label: 'Reports', icon: <PieChart className="w-5 h-5" /> },
    ] : []),
    
    // Stakeholder-specific links
    ...(localRole === 'stakeholder' ? [
      { href: '/dashboard/stats/overview', label: 'Platform Overview', icon: <PieChart className="w-5 h-5" /> },
      { href: '/dashboard/stats/revenue', label: 'Revenue Analysis', icon: <DollarSign className="w-5 h-5" /> },
      { href: '/dashboard/stats/growth', label: 'Growth Metrics', icon: <BarChart2 className="w-5 h-5" /> },
    ] : []),
    
    // Settings for all users
    { href: '/dashboard/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> }
  ];
  
  return (
    <EnhancedRoleProvider initialRole={localRole as any} testMode={true}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-150">
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
              <RoleDropdown className="w-full" showLabel={true} />
            </div>
            
            {/* Navigation links */}
            <nav className="flex-grow px-4 py-4 overflow-y-auto">
              <ul className="space-y-1">
                {navigationLinks.map((link, index) => (
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
            
            {/* Sidebar footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button 
                className="flex items-center justify-center w-full px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                onClick={toggleDarkMode}
              >
                {darkMode ? (
                  <Sun className="w-4 h-4 mr-2" />
                ) : (
                  <Moon className="w-4 h-4 mr-2" />
                )}
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>
          </div>
        </aside>
        
        {/* Main content */}
        <div className={`lg:pl-64 min-h-screen flex flex-col transition-all duration-150`}>
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
              
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    className="py-1 pl-8 pr-3 w-36 sm:w-48 rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500" 
                  />
                  <Search className="absolute left-2 top-1.5 w-4 h-4 text-gray-400" />
                </div>
                
                <div className="p-1 rounded-full bg-gray-200 dark:bg-gray-700">
                  <User className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </div>
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
          isActive={transitionData.active}
          fromRole={transitionData.from as any}
          toRole={transitionData.to as any}
        />
      </div>
    </EnhancedRoleProvider>
  );
};

/**
 * Helper function to wrap a page with the EnhancedDashboardLayout
 */
export const getEnhancedDashboardLayout = (page: ReactNode, title?: string) => (
  <EnhancedDashboardLayout title={title}>
    {page}
  </EnhancedDashboardLayout>
);

export default EnhancedDashboardLayout;