import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  User, FileText, Settings, Home, PieChart, 
  Plus, List, CheckSquare, Shield, Edit3,
  DollarSign, LogOut, Code, Key
} from 'react-feather';
import MegaphoneIcon from '../icons/MegaphoneIcon';
import SatsIcon from '../icons/SatsIcon';
import CurrencyToggle from '../CurrencyToggle';
import ExchangeRateDisplay from '../ExchangeRateDisplay';
import { useAuth } from '../../hooks/useAuth';

/**
 * This is a completely client-side rendered sidebar that doesn't rely on server rendering
 * or complex context providers. It determines the role directly from localStorage and
 * works completely independently of server state.
 */
export type UserRole = 'viewer' | 'advertiser' | 'publisher' | 'admin' | 'stakeholder';

const StaticClientSidebar: React.FC = () => {
  const router = useRouter();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isChangingRole, setIsChangingRole] = useState(false);
  const [currentRole, setCurrentRole] = useState<UserRole>('user');
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>(['user']);
  const [hasMounted, setHasMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { logout } = useAuth();
  
  // Only run this effect after the component mounts in the browser
  useEffect(() => {
    setHasMounted(true);
    
    // Get our test pubkey
    const pubkey = localStorage.getItem('nostr_pubkey') || '';
    const isTestMode = localStorage.getItem('isTestMode') === 'true' || pubkey.startsWith('pk_test_');
    
    // If in test mode, all roles are available
    if (isTestMode) {
      setAvailableRoles(['user', 'advertiser', 'publisher', 'admin', 'stakeholder']);
    }
    
    // Get current role from localStorage
    const storedRole = localStorage.getItem('userRole');
    if (storedRole && ['user', 'advertiser', 'publisher', 'admin', 'stakeholder'].includes(storedRole)) {
      setCurrentRole(storedRole as UserRole);
    } else {
      // Try to determine role from URL
      if (router.pathname.includes('/dashboard/advertiser')) setCurrentRole('advertiser');
      else if (router.pathname.includes('/dashboard/publisher')) setCurrentRole('publisher');
      else if (router.pathname.includes('/dashboard/admin')) setCurrentRole('admin');
      else if (router.pathname.includes('/dashboard/stakeholder')) setCurrentRole('stakeholder');
      else setCurrentRole('user');
    }
  }, [router.pathname]);
  
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

  // Define menu items for each role
  const menuItems = {
    user: [
      { icon: <Home className="w-5 h-5" />, label: 'Dashboard', href: '/dashboard/user' },
      { icon: <Settings className="w-5 h-5" />, label: 'Settings', href: '/dashboard/user/settings' }
    ],
    advertiser: [
      { icon: <Home className="w-5 h-5" />, label: 'Dashboard', href: '/dashboard/advertiser' },
      { icon: <MegaphoneIcon className="w-5 h-5" />, label: 'Campaigns', href: '/dashboard/advertiser/campaigns' },
      { icon: <FileText className="w-5 h-5" />, label: 'Analytics', href: '/dashboard/advertiser/analytics' },
      { icon: <SatsIcon className="w-5 h-5" />, label: 'Wallet', href: '/dashboard/advertiser/wallet' },
      { icon: <Key className="w-5 h-5" />, label: 'API Keys', href: '/dashboard/advertiser/api-keys' },
      { icon: <Code className="w-5 h-5" />, label: 'Developer', href: '/dashboard/developer' }
    ],
    publisher: [
      { icon: <Home className="w-5 h-5" />, label: 'Dashboard', href: '/dashboard/publisher' },
      { icon: <CheckSquare className="w-5 h-5" />, label: 'Ad Spaces', href: '/dashboard/publisher/spaces' },
      { icon: <FileText className="w-5 h-5" />, label: 'Rules', href: '/dashboard/publisher/rules' },
      { icon: <SatsIcon className="w-5 h-5" />, label: 'Wallet', href: '/dashboard/publisher/wallet' },
      { icon: <PieChart className="w-5 h-5" />, label: 'Earnings', href: '/dashboard/publisher/earnings' },
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
  
  // Direct role change handler - the key method for switching roles
  const handleDirectRoleChange = (newRole: UserRole) => {
    // Close dropdown
    setDropdownOpen(false);
    
    // Set changing indicator
    setIsChangingRole(true);
    
    console.log(`Switching to role: ${newRole}`);
    
    // Store the role in localStorage
    localStorage.setItem('userRole', newRole);
    localStorage.setItem('isTestMode', 'true');
    
    // Set additional role flags for backward compatibility
    localStorage.setItem(`test_${newRole}_role`, 'true');
    localStorage.setItem(`is${newRole.charAt(0).toUpperCase() + newRole.slice(1)}`, 'true');
    
    // Enable role in database (non-blocking)
    try {
      const pubkey = localStorage.getItem('nostr_pubkey') || `pk_test_${Date.now()}`;
      // Store pubkey if not already there
      if (!localStorage.getItem('nostr_pubkey')) {
        localStorage.setItem('nostr_pubkey', pubkey);
      }
      
      fetch('/api/test-mode/enable-all-roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pubkey })
      }).catch(e => console.error('Error enabling roles in database:', e));
    } catch (e) {
      console.error('Error in role setup:', e);
    }
    
    // Direct navigation with hard reload
    window.location.href = `/dashboard/${newRole}`;
  };
  
  // Toggle sidebar expansion (for mobile)
  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };
  
  // Get active menu item styling
  const getActiveClass = (href: string) => {
    const isActive = router.pathname === href || router.pathname.startsWith(`${href}/`);
    
    if (isActive) {
      switch(currentRole) {
        case 'user': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300';
        case 'advertiser': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300';
        case 'publisher': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300';
        case 'admin': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300'; 
        case 'stakeholder': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300';
      }
    }
    
    return 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300';
  };
  
  // Get background color based on current role
  const getRoleBackgroundColor = (role: UserRole) => {
    if (role === currentRole) {
      switch(role) {
        case 'user': return 'bg-blue-100 dark:bg-blue-900/20';
        case 'advertiser': return 'bg-orange-100 dark:bg-orange-900/20';
        case 'publisher': return 'bg-green-100 dark:bg-green-900/20';
        case 'admin': return 'bg-purple-100 dark:bg-purple-900/20';
        case 'stakeholder': return 'bg-emerald-100 dark:bg-emerald-900/20';
      }
    }
    return 'hover:bg-gray-100 dark:hover:bg-gray-800';
  };
  
  // Get text color based on role
  const getRoleTextColor = (role: UserRole) => {
    if (role === currentRole) {
      switch(role) {
        case 'user': return 'text-blue-700 dark:text-blue-300';
        case 'advertiser': return 'text-orange-700 dark:text-orange-300';
        case 'publisher': return 'text-green-700 dark:text-green-300';
        case 'admin': return 'text-purple-700 dark:text-purple-300';
        case 'stakeholder': return 'text-emerald-700 dark:text-emerald-300';
      }
    }
    return 'text-gray-700 dark:text-gray-300';
  };
  
  // Get all roles except current for dropdown
  const getFilteredRoleOptions = () => {
    return (['user', 'advertiser', 'publisher', 'admin', 'stakeholder'] as UserRole[])
      .filter(role => role !== currentRole);
  };
  
  // If component hasn't mounted yet, return nothing
  if (!hasMounted) {
    return null;
  }
  
  return (
    <>
      {/* Mobile toggle button */}
      <button 
        onClick={toggleSidebar}
        className="md:hidden fixed z-50 bottom-4 right-4 p-2 rounded-full bg-purple-600 text-white shadow-lg"
      >
        <List className="w-6 h-6" />
      </button>
      
      {/* Mobile backdrop */}
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
        {/* Logo */}
        <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-purple-600 dark:text-purple-400 flex items-center">
            <span>Nostr Ads</span>
            <span className="ml-1 px-2 py-0.5 text-xs font-mono bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded">STATIC</span>
          </h1>
        </div>
        
        {/* Role selector */}
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
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-4 w-4 ml-2 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {/* Dropdown menu */}
            <div 
              className={`absolute z-10 mt-1 w-full rounded-md bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 transition-opacity duration-100 ${
                dropdownOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              {getFilteredRoleOptions().map((role) => (
                <button
                  key={role}
                  onClick={() => handleDirectRoleChange(role)}
                  className={`w-full flex items-center px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300`}
                  disabled={isChangingRole}
                >
                  <span className="mr-3">
                    {roleIcons[role]}
                  </span>
                  <span>
                    {roleLabels[role]}
                  </span>
                </button>
              ))}
            </div>
          </div>
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
                >
                  <span className="mr-3 flex-shrink-0">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
          
          {/* Navigation shortcuts */}
          <div className="mt-6">
            <h2 className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-2 font-semibold">Other Options</h2>
            <div className="space-y-1">
              <Link
                href="/test-roles"
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
          
          {/* Logout button */}
          <div className="mt-auto">
            <button
              onClick={() => {
                // Clear localStorage
                localStorage.removeItem('userRole');
                localStorage.removeItem('nostr_pubkey');
                localStorage.removeItem('isTestMode');
                
                // Call logout
                logout();
                
                // Navigate to login
                window.location.href = '/login';
              }}
              className="w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors transition-all duration-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:text-red-400"
            >
              <span className="mr-3 flex-shrink-0">
                <LogOut className="w-5 h-5" />
              </span>
              <span className="truncate">Logout</span>
            </button>
          </div>
          
          {/* Currency toggle */}
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

export default StaticClientSidebar;