import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChevronRight, 
  ShoppingBag, 
  Upload, 
  Shield, 
  Briefcase, 
  User, 
  PieChart, 
  DollarSign, 
  Users, 
  AlertCircle
} from 'react-feather';
import Link from 'next/link';
import { useRole } from '@/context/RoleContext';
import ImprovedDashboardLayout from '@/components/layout/ImprovedDashboardLayout';
import StatCard from '@/components/ui/StatCard';
import CurrencyAmount from '@/components/CurrencyAmount';
import { RoleService } from '@/lib/roleService';
import type { UserRole } from '@/context/RoleContext';
import type { ReactElement } from 'react';
import type { NextPageWithLayout } from '../_app';
import { DashboardContainer, DashboardCard } from '@/components/ui';
import { getDashboardLayout } from '@/utils/layoutHelpers';
import { logger } from '@/lib/logger';

/**
 * Main dashboard page - serves content based on the current role
 * This replaces all the separate role-specific dashboards in favor of a unified experience
 */
const Dashboard = () => {
  const roleContext = useRole();
  // Get the role from context if available, otherwise use the user role
  const [currentRole, setCurrentRole] = useState<UserRole>(roleContext?.role || 'viewer');
  const [isTestMode, setIsTestMode] = useState<boolean>(false);
  
  // Function to get the current role from all possible sources
  const getCurrentRoleFromAllSources = useCallback((): UserRole => {
    // Try to get role from context first (most reliable and up-to-date)
    if (roleContext && roleContext.role) {
      logger.debug('Getting role from context:', roleContext.role);
      return roleContext.role as UserRole;
    }
    
    // If we're in a browser, try localStorage next
    if (typeof window !== 'undefined') {
      // Try all known storage locations for role
      const storedRole = 
        localStorage.getItem('userRole') ||
        localStorage.getItem('currentRole') ||
        sessionStorage.getItem('userRole') ||
        sessionStorage.getItem('currentRole');
        
      if (storedRole) {
        logger.debug('Getting role from storage:', storedRole);
        return storedRole as UserRole;
      }
    }
    
    // Fall back to RoleService
    const serviceRole = RoleService.getCurrentRole();
    if (serviceRole) {
      logger.debug('Getting role from service:', serviceRole);
      return serviceRole as UserRole;
    }
    
    // Absolute fallback
    logger.debug('No role found, defaulting to viewer');
    return 'viewer';
  }, [roleContext]);

  // Initialize and listen for role changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Get all possible sources for the role 
    const initialRole = getCurrentRoleFromAllSources();
    
    // Log for debugging
    logger.debug('Dashboard initializing with role:', initialRole);
    
    // Update state with the determined role
    setCurrentRole(initialRole);
    
    // Check if test mode is active
    const testMode = localStorage.getItem('isTestMode') === 'true';
    setIsTestMode(testMode);
    
    // Event handlers for all role change events
    const handleRoleChange = (event: Event) => {
      const customEvent = event as CustomEvent<{
        from?: string;
        to?: string;
        role?: string;
      }>;
      
      logger.debug('Role switched event received:', customEvent.detail);
      
      // Extract the new role from the event in any format
      let newRole: string | null = null;
      
      if (customEvent.detail) {
        if (customEvent.detail.to) {
          newRole = customEvent.detail.to;
        } else if (customEvent.detail.role) {
          newRole = customEvent.detail.role;
        }
      }
      
      if (newRole) {
        logger.debug(`Setting role from event to: ${newRole}`);
        setCurrentRole(newRole as UserRole);
      }
    };
    
    // Specific handler for the dashboard-specific event
    const handleDashboardRoleChange = () => {
      logger.debug('Dashboard role change event received');
      const latestRole = getCurrentRoleFromAllSources();
      setCurrentRole(latestRole);
    };
    
    // Storage event handler for direct localStorage changes
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'userRole' || event.key === 'currentRole') {
        if (event.newValue) {
          logger.debug(`Storage change detected, updating role to: ${event.newValue}`);
          setCurrentRole(event.newValue as UserRole);
        }
      }
      
      if (event.key === 'isTestMode') {
        setIsTestMode(event.newValue === 'true');
      }
    };
    
    // Monitor all possible role change events
    document.addEventListener('roleSwitched', handleRoleChange);
    document.addEventListener('role-changed', handleRoleChange);
    window.addEventListener('dashboard-role-changed', handleDashboardRoleChange);
    window.addEventListener('storage', handleStorageChange);
    
    // Force an immediate check of the current role from context
    if (roleContext && roleContext.role) {
      setCurrentRole(roleContext.role as UserRole);
    }
    
    return () => {
      document.removeEventListener('roleSwitched', handleRoleChange);
      document.removeEventListener('role-changed', handleRoleChange);
      window.removeEventListener('dashboard-role-changed', handleDashboardRoleChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [roleContext, getCurrentRoleFromAllSources]);
  
  // Determine what icon to show based on role
  const getRoleIcon = () => {
    switch(currentRole) {
      case 'advertiser':
        return <ShoppingBag className="h-8 w-8 text-blue-500" />;
      case 'publisher':
        return <Upload className="h-8 w-8 text-green-500" />;
      case 'admin':
        return <Shield className="h-8 w-8 text-purple-500" />;
      case 'stakeholder':
        return <DollarSign className="h-8 w-8 text-green-500" />;
      default:
        return <User className="h-8 w-8 text-blue-500" />;
    }
  };
  
  // Get the role-specific title
  const getRoleTitle = () => {
    if (!currentRole) return 'Dashboard';
    // Remove quotes if they exist in the role string
    const cleanRole = currentRole.replace(/^["'](.*)["']$/, '$1');
    // Convert 'user' to 'viewer' for consistency with updated role naming
    const normalizedRole = cleanRole === 'user' ? 'viewer' : cleanRole;
    return `${normalizedRole.charAt(0).toUpperCase() + normalizedRole.slice(1)} Dashboard`;
  };
  
  // Render the appropriate dashboard based on the current role
  const renderAdvertiserDashboard = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Wallet Balance</h2>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            <CurrencyAmount sats={42500} />
          </p>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Available for campaigns</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Campaigns</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">View and manage your advertising campaigns.</p>
            <Link 
              href="/dashboard/advertiser/campaigns"
              className="text-blue-600 dark:text-blue-400 hover:underline flex items-center text-sm"
            >
              View Campaigns <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Create Campaign</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Set up a new advertising campaign.</p>
            <Link 
              href="/dashboard/advertiser/campaigns/create"
              className="text-blue-600 dark:text-blue-400 hover:underline flex items-center text-sm"
            >
              Create New Campaign <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  };
  
  const renderPublisherDashboard = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Total Earnings</h2>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              <CurrencyAmount sats={32550} />
            </div>
            <p className="text-gray-500 dark:text-gray-400 mt-2">All-time earnings</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Active Spaces</h2>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">2</div>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Ad spaces you manage</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Pending Approvals</h2>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">5</div>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Ads awaiting your review</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Earnings</h2>
              <Link 
                href="/dashboard/publisher/earnings" 
                className="text-green-600 dark:text-green-400 text-sm hover:underline"
              >
                View Analytics
              </Link>
            </div>
            
            <div className="h-48 flex items-center justify-center bg-green-50 dark:bg-green-900/20 rounded-md">
              {/* Line chart placeholder with more visual interest */}
              <svg className="w-full h-full text-green-200 dark:text-green-800/30" viewBox="0 0 400 150" preserveAspectRatio="none">
                <path
                  d="M0,150 L20,145 L40,135 L60,138 L80,125 L100,130 L120,120 L140,110 L160,100 L180,95 L200,80 L220,70 L240,80 L260,65 L280,55 L300,40 L320,30 L340,25 L360,15 L380,10 L400,0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Your Ad Spaces</h2>
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">Nostr Feed Banner</h3>
                  <span className="text-sm text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded-full">Active</span>
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <Link 
                  href="/dashboard/publisher/spaces/create" 
                  className="text-green-600 dark:text-green-400 text-sm hover:underline"
                >
                  Create New Ad Space +
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderAdminDashboard = () => {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-purple-500" />
            <h1 className="text-2xl font-bold mb-0 text-gray-900 dark:text-white">Admin Dashboard</h1>
          </div>
        </div>

        <p className="text-gray-500 dark:text-gray-400">
          Welcome to the Admin Dashboard. Here you can manage users, monitor system health, and configure platform settings.
        </p>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Users"
            value="1,245" 
            change="8.2" 
            icon={<Users className="text-blue-500" />}
            helperText="Registered users"
          />
          
          <StatCard 
            title="Active Now"
            value="87" 
            change="12.4" 
            icon={<Users className="text-green-500" />}
            helperText="Currently online"
          />
          
          <StatCard 
            title="System Alerts"
            value="2" 
            change="-50.0" 
            isNegativeGood={true}
            icon={<AlertCircle className="text-orange-500" />}
            helperText="Requires attention"
          />
          
          <StatCard 
            title="API Health"
            value="99.8%" 
            change="0.2" 
            icon={<Shield className="text-purple-500" />}
            helperText="7-day uptime"
          />
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Administration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">User Management</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                View and manage user accounts, permissions, and roles.
              </p>
              <a
                href="/dashboard/admin/users"
                className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center text-sm"
              >
                Manage Users
                <ChevronRight className="ml-1 h-4 w-4" />
              </a>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">System Settings</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Configure platform settings and parameters.
              </p>
              <a
                href="/dashboard/admin/settings" 
                className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center text-sm"
              >
                View Settings
                <ChevronRight className="ml-1 h-4 w-4" />
              </a>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Activity Logs</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Review system and user activity logs.
              </p>
              <a
                href="/dashboard/admin/logs" 
                className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center text-sm"
              >
                View Logs
                <ChevronRight className="ml-1 h-4 w-4" />
              </a>
            </div>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-yellow-800 dark:text-yellow-200">Admin Access Note</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  This is a Phase 1 MVP implementation of the admin dashboard. Additional functionality will be added in future releases.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderStakeholderDashboard = () => {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <DollarSign className="h-8 w-8 text-green-500" />
            <h1 className="text-2xl font-bold mb-0 text-gray-900 dark:text-white">Stakeholder Dashboard</h1>
          </div>
        </div>

        <p className="text-gray-500 dark:text-gray-400">
          Welcome to the Stakeholder Dashboard. Here you can view financial metrics and analytics on platform performance.
        </p>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Platform Revenue"
            value="$142,857" 
            change="12.5" 
            icon={<DollarSign className="text-green-500" />}
            helperText="Total revenue (USD)"
          />
          
          <StatCard 
            title="Active Campaigns"
            value="32" 
            change="8.3" 
            icon={<PieChart className="text-blue-500" />}
            helperText="Running ad campaigns"
          />
          
          <StatCard 
            title="Publishers"
            value="205" 
            change="15.2" 
            icon={<Users className="text-purple-500" />}
            helperText="Total active publishers"
          />
          
          <StatCard 
            title="Avg. Daily Volume"
            value="$4,125" 
            change="7.8" 
            icon={<DollarSign className="text-orange-500" />}
            helperText="Previous 7 days"
          />
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Financial Metrics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Revenue Breakdown</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                View detailed platform revenue streams and forecasts.
              </p>
              <a
                href="/dashboard/stakeholder/financials"
                className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center text-sm"
              >
                View Breakdown 
                <ChevronRight className="ml-1 h-4 w-4" />
              </a>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Growth Analytics</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Explore user growth and engagement metrics.
              </p>
              <a
                href="/dashboard/stakeholder/analytics" 
                className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center text-sm"
              >
                View Analytics
                <ChevronRight className="ml-1 h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderDefaultDashboard = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Welcome to Nostr Ad Marketplace</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Select a role to get started with the platform:
          </p>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              className="p-4 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center space-x-3 hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  const { RoleService } = require('@/lib/roleService');
                  RoleService.changeRole('advertiser');
                }
              }}
            >
              <ShoppingBag className="h-6 w-6 text-blue-500" />
              <div className="text-left">
                <h3 className="font-medium text-gray-900 dark:text-white">Advertiser</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Create and manage ad campaigns</p>
              </div>
            </button>
            
            <button 
              className="p-4 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center space-x-3 hover:bg-green-100 dark:hover:bg-green-800/30 transition-colors"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  const { RoleService } = require('@/lib/roleService');
                  RoleService.changeRole('publisher');
                }
              }}
            >
              <Upload className="h-6 w-6 text-green-500" />
              <div className="text-left">
                <h3 className="font-medium text-gray-900 dark:text-white">Publisher</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Monetize your content with ads</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Create viewer dashboard content
  const renderViewerDashboard = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Welcome to Proof of Reach</h2>
          <p className="text-gray-600 dark:text-gray-300">
            As a Viewer, you can browse ads, interact with content, and earn rewards through the Lightning Network.
          </p>
          
          <div className="mt-4">
            <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
              <User className="h-5 w-5 text-blue-500" />
              <p>You're currently using the Viewer role</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Your Wallet</h2>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              <CurrencyAmount sats={10500} />
            </p>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Earned from content engagement</p>
            <Link 
              href="/dashboard/wallet" 
              className="text-blue-600 dark:text-blue-400 hover:underline flex items-center text-sm mt-4"
            >
              Manage Wallet <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Privacy Settings</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Manage your privacy and content preferences.</p>
            <Link 
              href="/dashboard/settings" 
              className="text-blue-600 dark:text-blue-400 hover:underline flex items-center text-sm"
            >
              View Settings <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  };

  // Render the appropriate dashboard based on the current role
  const renderDashboard = () => {
    // Clean up any string quotes that might be around the role
    const normalizedRole = currentRole?.toString().replace(/['"]/g, '') || 'viewer';
    
    console.log(`Rendering dashboard for role: '${normalizedRole}'`);
    
    switch(normalizedRole) {
      case 'advertiser':
        return renderAdvertiserDashboard();
      case 'publisher':
        return renderPublisherDashboard();
      case 'admin':
        return renderAdminDashboard();
      case 'stakeholder':
        return renderStakeholderDashboard();
      case 'viewer':
        return renderViewerDashboard();
      case 'user': // Handle the legacy 'user' role as 'viewer'
        return renderViewerDashboard();
      default:
        console.log(`Unknown role '${normalizedRole}', defaulting to viewer dashboard`);
        return renderViewerDashboard(); // Default to viewer dashboard instead of welcome screen
    }
  };
  
  return (
    <DashboardContainer>
      {currentRole !== 'admin' && currentRole !== 'stakeholder' && (
        <div className="flex items-center space-x-2">
          {getRoleIcon()}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{getRoleTitle()}</h1>
        </div>
      )}
      
      {/* Render role-specific dashboard content */}
      {renderDashboard()}
      
      {/* Common dashboard components that show up for all roles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DashboardCard title="Quick Actions">
          <div className="space-y-2">
            <Link 
              href="/profile" 
              className="block px-4 py-2 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors"
            >
              Edit Profile
            </Link>
            <Link 
              href="/settings" 
              className="block px-4 py-2 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors"
            >
              Account Settings
            </Link>
          </div>
        </DashboardCard>
        
        <DashboardCard title="System Status">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Current Role:</span>
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded text-xs font-medium capitalize">
                {typeof currentRole === 'string' ? currentRole.replace(/^["'](.*)["']$/, '$1') : currentRole}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Test Mode:</span>
              <span className={`px-2 py-1 ${isTestMode ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'} rounded text-xs font-medium`}>
                {isTestMode ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">API Status:</span>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded text-xs font-medium">Operational</span>
            </div>
          </div>
        </DashboardCard>
      </div>
    </DashboardContainer>
  );
};

// Use the dashboard layout helper
Dashboard.getLayout = (page: React.ReactElement) => {
  return getDashboardLayout(page, "Dashboard");
};

export default Dashboard;