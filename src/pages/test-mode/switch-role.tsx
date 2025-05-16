import React, { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { User, Edit3, DollarSign, Shield } from 'react-feather';
import MegaphoneIcon from '../../components/icons/MegaphoneIcon';

/**
 * Direct Role Selector Page
 * 
 * A completely standalone page for switching roles that bypasses
 * all the complex role context machinery.
 */
const SwitchRolePage: React.FC = () => {
  // Force test mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
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
      
      // Backward compatibility
      localStorage.setItem('isAdvertiser', 'true');
      localStorage.setItem('isPublisher', 'true');
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('isStakeholder', 'true');
      
      // Try to enable roles in the database
      const enableRolesInDatabase = async () => {
        try {
          const response = await fetch('/api/test-mode/enable-all-roles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pubkey }),
          });
          
          if (response.ok) {
            console.log('All roles enabled in database');
          }
        } catch (error) {
          console.error('Error enabling roles in database:', error);
        }
      };
      
      enableRolesInDatabase();
    }
  }, []);
  
  // Role definitions
  const roles = [
    {
      id: 'user',
      name: 'User Dashboard',
      description: 'Basic user account management and settings',
      path: '/dashboard/user',
      icon: <User className="w-8 h-8 text-blue-500" />,
      color: 'bg-blue-100 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700',
      textColor: 'text-blue-700 dark:text-blue-300',
    },
    {
      id: 'advertiser',
      name: 'Advertiser Dashboard',
      description: 'Create and manage ad campaigns',
      path: '/dashboard/advertiser',
      icon: <MegaphoneIcon className="w-8 h-8 text-orange-500" />,
      color: 'bg-orange-100 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700',
      textColor: 'text-orange-700 dark:text-orange-300',
    },
    {
      id: 'publisher',
      name: 'Publisher Dashboard',
      description: 'Manage ad spaces and earnings',
      path: '/dashboard/publisher',
      icon: <Edit3 className="w-8 h-8 text-green-500" />,
      color: 'bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-700',
      textColor: 'text-green-700 dark:text-green-300',
    },
    {
      id: 'admin',
      name: 'Admin Dashboard',
      description: 'Platform administration and monitoring',
      path: '/dashboard/admin',
      icon: <Shield className="w-8 h-8 text-purple-500" />,
      color: 'bg-purple-100 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700',
      textColor: 'text-purple-700 dark:text-purple-300',
    },
    {
      id: 'stakeholder',
      name: 'Stakeholder Dashboard',
      description: 'Financial reporting and analytics',
      path: '/dashboard/stakeholder',
      icon: <DollarSign className="w-8 h-8 text-emerald-500" />,
      color: 'bg-emerald-100 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700',
      textColor: 'text-emerald-700 dark:text-emerald-300',
    },
  ];
  
  // Function to set current role before navigation
  const handleRoleSelect = (roleId: string) => {
    localStorage.setItem('userRole', roleId);
    localStorage.setItem('force_role_refresh', 'true');
    // No need to wait, the navigation will happen via the Link
  };
  
  return (
    <>
      <Head>
        <title>Test Mode - Role Selector</title>
      </Head>
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
        <div className="max-w-3xl w-full">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Test Mode Role Selector
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This page bypasses the complex role management system and lets you directly access each role's dashboard.
              Simply click on a role card below to switch to that role.
            </p>
            
            <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-md p-3 mb-6">
              <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                <strong>Note:</strong> Using this page will set test mode and create a test pubkey if you don't already have one.
                All roles will be enabled in both localStorage and the database.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roles.map((role) => (
              <Link
                key={role.id}
                href={role.path}
                onClick={() => handleRoleSelect(role.id)}
                className={`block p-6 rounded-lg shadow border ${role.color} transition-transform hover:scale-105`}
              >
                <div className="flex items-start">
                  <div className="mr-4">{role.icon}</div>
                  <div>
                    <h2 className={`text-xl font-bold ${role.textColor}`}>
                      {role.name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {role.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Having issues with the role system? <a href="/dashboard" className="text-blue-500 hover:underline">Return to main dashboard</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SwitchRolePage;