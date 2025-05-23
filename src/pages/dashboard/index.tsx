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
import CurrencyWrapper from '@/components/CurrencyWrapper';
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
    
    // For test mode, prioritize localStorage role first to ensure consistency with the role selector
    const testMode = localStorage.getItem('isTestMode') === 'true';
    setIsTestMode(testMode);
    
    if (testMode) {
      // In test mode, always prioritize localStorage for initial role to fix mismatch
      const storedRole = localStorage.getItem('currentRole');
      if (storedRole) {
        logger.debug(`Test mode active: Using localStorage role: ${storedRole}`);
        // Fix issue with role detection - normalize role value
        const normalizedRole = storedRole.replace(/['"]/g, '');
        logger.debug(`Normalized role in test mode: ${normalizedRole}`);
        setCurrentRole(normalizedRole as UserRole);
        
        // Also set in localStorage to ensure consistency 
        localStorage.setItem('currentRole', normalizedRole);
        
        return; // Exit early to avoid overriding with other sources
      }
    }
    
    // Get all possible sources for the role 
    const initialRole = getCurrentRoleFromAllSources();
    
    // Log for debugging
    logger.debug('Dashboard initializing with role:', initialRole);
    
    // Normalize the role value to avoid string formatting issues
    const normalizedRole = initialRole.replace(/['"]/g, '');
    
    // Update state with the determined role
    setCurrentRole(normalizedRole as UserRole);
    
    // Also set in localStorage to ensure consistency
    localStorage.setItem('currentRole', normalizedRole);
    
    // Event handlers for all role change events
    const handleRoleChange = (event: Event) => {
      const customEvent = event as CustomEvent<{
        from?: string;
        to?: string;
        role?: string;
        detail?: { to?: string; role?: string; }
      }>;
      
      logger.debug('Role switched event received:', customEvent.detail);
      
      // Extract the new role from the event in any format
      let newRole: string | null = null;
      
      if (customEvent.detail) {
        // Handle standard format
        if (customEvent.detail.to) {
          newRole = customEvent.detail.to;
        } 
        // Handle legacy format
        else if (customEvent.detail.role) {
          newRole = customEvent.detail.role;
        }
        // Handle nested detail format (system events)
        else if (customEvent.detail.detail && customEvent.detail.detail.to) {
          newRole = customEvent.detail.detail.to;
        }
        else if (customEvent.detail.detail && customEvent.detail.detail.role) {
          newRole = customEvent.detail.detail.role;
        }
      }
      
      // If we found a role change, update the current role
      if (newRole) {
        // Clean up the role value to prevent string formatting issues
        const normalizedRole = newRole.replace(/['"]/g, '');
        
        logger.debug(`Setting role from event to: ${normalizedRole} (original: ${newRole})`);
        
        // Determine if we're in test mode - client-side only check
        const isTestMode = typeof window !== 'undefined' && localStorage.getItem('isTestMode') === 'true';
        
        // Set the normalized role in state
        setCurrentRole(normalizedRole as UserRole);
        
        // Also ensure localStorage is consistent
        if (typeof window !== 'undefined') {
          localStorage.setItem('currentRole', normalizedRole);
          
          // If we're in test mode, directly set test-specific flags to ensure client-side role change
          if (isTestMode) {
            localStorage.setItem('testModeRole', normalizedRole);
            
            // Also set a timestamp to force updates when role changes
            localStorage.setItem('lastRoleChange', JSON.stringify({
              role: normalizedRole,
              timestamp: Date.now()
            }));
          }
          
          // Log current state after update
          logger.debug(`Updated localStorage role to: ${normalizedRole}`);
          logger.debug(`Current role state is now: ${normalizedRole}`);
          logger.debug(`Test mode: ${isTestMode ? 'active' : 'inactive'}`);
          
          // Force a dashboard re-render by dispatching another event
          // This ensures the dashboard responds to the role change immediately
          const dashboardRoleChangeEvent = new CustomEvent('dashboard-role-changed', { 
            detail: { role: normalizedRole }
          });
          window.dispatchEvent(dashboardRoleChangeEvent);
        }
      }
    };
    
    // Specific handler for the dashboard-specific event
    const handleDashboardRoleChange = (event: Event) => {
      logger.debug('Dashboard role change event received');
      
      // Determine if we're in test mode for client-side only role changes
      const isTestMode = typeof window !== 'undefined' && localStorage.getItem('isTestMode') === 'true';
      
      // Try to extract role from the event first
      const customEvent = event as CustomEvent<{
        role?: string;
        detail?: { role?: string; }
      }>;
      
      // Check if the event contains a role
      if (customEvent.detail?.role) {
        const eventRole = customEvent.detail.role.replace(/['"]/g, '');
        logger.debug(`Dashboard role change event has role: ${eventRole}`);
        
        // Update the role in state
        setCurrentRole(eventRole as UserRole);
        
        // Update localStorage for role persistence
        localStorage.setItem('currentRole', eventRole);
        
        // For test mode, ensure test-specific storage is also updated
        if (isTestMode) {
          logger.debug(`Setting test mode specific role: ${eventRole}`);
          localStorage.setItem('testModeRole', eventRole);
          
          // Set timestamps to force re-renders
          localStorage.setItem('lastRoleChange', JSON.stringify({
            role: eventRole,
            timestamp: Date.now()
          }));
          
          // Set test mode dashboard key to force re-renders
          localStorage.setItem('dashboardRenderKey', `dashboard-${eventRole}-${Date.now()}`);
        }
      } 
      // Otherwise get from all possible sources
      else {
        const latestRole = getCurrentRoleFromAllSources();
        const normalizedRole = latestRole.replace(/['"]/g, '');
        logger.debug(`Dashboard role change using latest role: ${normalizedRole}`);
        
        // Update the role in state
        setCurrentRole(normalizedRole as UserRole);
        
        // Update localStorage for role persistence
        localStorage.setItem('currentRole', normalizedRole);
        
        // For test mode, ensure test-specific storage is also updated
        if (isTestMode) {
          logger.debug(`Setting test mode specific role: ${normalizedRole}`);
          localStorage.setItem('testModeRole', normalizedRole);
          
          // Set timestamps to force re-renders
          localStorage.setItem('lastRoleChange', JSON.stringify({
            role: normalizedRole,
            timestamp: Date.now()
          }));
          
          // Set test mode dashboard key to force re-renders
          localStorage.setItem('dashboardRenderKey', `dashboard-${normalizedRole}-${Date.now()}`);
        }
      }
      
      // Force the component to re-render completely
      setTimeout(() => {
        logger.debug('Forcing complete dashboard re-render after role change');
        // Use a force update technique by changing state
        setCurrentRole(prev => {
          // Return the same value but as a new reference to trigger re-render
          const currentVal = prev.toString();
          logger.debug(`Re-render with role: ${currentVal}`);
          return currentVal as UserRole;
        });
      }, 50);
    };
    
    // Storage event handler for direct localStorage changes
    const handleStorageChange = (event: StorageEvent) => {
      // Handle all possible role-related keys
      if (event.key === 'userRole' || event.key === 'currentRole' || 
          event.key === 'nostr-ads:currentRole' || event.key === 'roleData') {
        if (event.newValue) {
          // Parse the role from the value (handle both string and JSON formats)
          let newRole = event.newValue;
          
          // Handle the case where the role is stored in JSON format
          try {
            const parsedValue = JSON.parse(event.newValue);
            if (parsedValue && typeof parsedValue === 'object') {
              if (parsedValue.role) {
                newRole = parsedValue.role;
              } else if (parsedValue.currentRole) {
                newRole = parsedValue.currentRole;
              }
            }
          } catch (e) {
            // If it's not valid JSON, use the raw value (which could be a simple role string)
            newRole = event.newValue;
          }
          
          logger.debug(`Storage change detected, updating role to: ${newRole}`);
          setCurrentRole(newRole as UserRole);
        }
      }
      
      // Handle test mode changes
      if (event.key === 'isTestMode') {
        setIsTestMode(event.newValue === 'true');
      }
    };
    
    // Monitor all possible role change events
    document.addEventListener('roleSwitched', handleRoleChange);
    document.addEventListener('role-changed', handleRoleChange);
    document.addEventListener('system:role-changed', handleRoleChange); // Add system event listener
    document.addEventListener('test-role-update', handleDashboardRoleChange); // Add test mode event
    window.addEventListener('dashboard-role-changed', handleDashboardRoleChange);
    window.addEventListener('storage', handleStorageChange);
    
    // Force an immediate check of the current role from context
    if (roleContext && roleContext.role) {
      setCurrentRole(roleContext.role as UserRole);
    }
    
    return () => {
      document.removeEventListener('roleSwitched', handleRoleChange);
      document.removeEventListener('role-changed', handleRoleChange);
      document.removeEventListener('system:role-changed', handleRoleChange);
      document.removeEventListener('test-role-update', handleDashboardRoleChange);
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
            <CurrencyWrapper>
              <CurrencyAmount sats={42500} />
            </CurrencyWrapper>
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
    // In test mode, prioritize localStorage role for consistency
    let effectiveRole = currentRole;
    
    if (isTestMode && typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('currentRole');
      if (storedRole) {
        // Clean up the stored role to handle any quotes
        effectiveRole = storedRole.replace(/['"]/g, '') as UserRole;
        logger.debug(`Test mode active: Using localStorage role: ${effectiveRole}`);
      }
    }
    
    // Clean up any string quotes that might be around the role
    const normalizedRole = effectiveRole?.toString().replace(/['"]/g, '') || 'viewer';
    
    // Add comprehensive logging to help debug role issues
    logger.debug(`Rendering dashboard for role: '${normalizedRole}' (raw: '${currentRole}')`);
    logger.debug(`Role context value: ${roleContext?.role}`);
    logger.debug(`Local storage role: ${typeof window !== 'undefined' ? localStorage.getItem('currentRole') : 'N/A'}`);
    
    // Force dashboard re-render with a unique key that changes with EVERY render
    // Remove random() to prevent excessive re-renders while still ensuring unique key per render
    const dashboardKey = `dashboard-${normalizedRole}-${Date.now()}`;

    // Enhanced switch statement with more explicit case handling
    switch(normalizedRole) {
      case 'advertiser':
        logger.debug('Rendering ADVERTISER dashboard');
        return <div key={dashboardKey} data-testid="advertiser-dashboard">{renderAdvertiserDashboard()}</div>;
      case 'publisher':
        logger.debug('Rendering PUBLISHER dashboard');
        return <div key={dashboardKey} data-testid="publisher-dashboard">{renderPublisherDashboard()}</div>;
      case 'admin':
        logger.debug('Rendering ADMIN dashboard');
        return <div key={dashboardKey} data-testid="admin-dashboard">{renderAdminDashboard()}</div>;
      case 'stakeholder':
        logger.debug('Rendering STAKEHOLDER dashboard');
        return <div key={dashboardKey} data-testid="stakeholder-dashboard">{renderStakeholderDashboard()}</div>;
      case 'viewer':
        logger.debug('Rendering VIEWER dashboard');
        return <div key={dashboardKey} data-testid="viewer-dashboard">{renderViewerDashboard()}</div>;
      case 'user': // Handle the legacy 'user' role as 'viewer'
        logger.debug('Rendering legacy USER (as viewer) dashboard');
        return <div key={dashboardKey} data-testid="viewer-dashboard">{renderViewerDashboard()}</div>;
      default:
        logger.debug(`Unknown role '${normalizedRole}', defaulting to viewer dashboard`);
        return <div key={dashboardKey} data-testid="default-viewer-dashboard">{renderViewerDashboard()}</div>; // Default to viewer dashboard
    }
  };
  
  // Create a container key that changes with role to force complete re-render
  const containerKey = `dashboard-container-${currentRole}-${Date.now()}`;
  
  return (
    <DashboardContainer key={containerKey}>
      {currentRole !== 'admin' && currentRole !== 'stakeholder' && (
        <div className="flex items-center space-x-2">
          {getRoleIcon()}
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{getRoleTitle()}</h1>
        </div>
      )}
      
      {/* Render role-specific dashboard content with forced re-render */}
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