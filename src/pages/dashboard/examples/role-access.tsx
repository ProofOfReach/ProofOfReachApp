import { UserRole } from "@/types/role";
/**
 * Role Access Example Page
 * 
 * This page demonstrates the use of the unified role access system with
 * the centralized permission model.
 */

import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import type { ReactElement } from 'react';
import type { NextPageWithLayout } from '../../_app';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import RoleBasedControls from '../../../components/examples/RoleBasedButton';
import RoleAwareComponent from '../../../components/examples/RoleAwareComponent';
import ErrorBoundary from '../../../components/ErrorBoundary';

/**
 * Role Information Component
 */
const RoleInfo: React.FC = () => {
  const currentRole = 'viewer'; // Simplified for build
  const availableRoles = ['viewer', 'advertiser', 'publisher'];
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Current Role Information</h2>
      <div className="mb-4">
        <strong className="block text-gray-700 dark:text-gray-300">Active Role:</strong>
        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-100 rounded-full inline-block mt-1">
          {currentRole}
        </span>
      </div>
      <div>
        <strong className="block text-gray-700 dark:text-gray-300">Available Roles:</strong>
        <div className="mt-1 flex flex-wrap gap-2">
          {availableRoles.map(role => (
            <span 
              key={role}
              className={`px-3 py-1 rounded-full inline-block ${
                role === currentRole
                  ? 'bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-100'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
              }`}
            >
              {role}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Role Access Example Page
 */
const RoleAccessExamplePage: NextPageWithLayout = () => {
  const { currentRole, canAccess } = defaultUseRoleAccess();
  
  return (
    <>
      <Head>
        <title>Role Access Examples | Nostr Ad Marketplace</title>
      </Head>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">
          Role Access System Examples
        </h1>
        
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <p className="text-blue-800 dark:text-blue-200">
            This page demonstrates the unified role management system with our new centralized access control.
            For a more comprehensive example with role switching, see the 
            {' '}
            <Link href="/dashboard/examples/role-management" className="text-blue-600 dark:text-blue-300 underline">
              Role Management Demo
            </Link>.
          </p>
        </div>
        
        <ErrorBoundary>
          <RoleInfo />
        </ErrorBoundary>
        
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Role-Based Component</h2>
          <ErrorBoundary>
            <RoleAwareComponent title={`${currentRole.charAt(0).toUpperCase() + currentRole.slice(1)} Interface`} />
          </ErrorBoundary>
        </div>
        
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">UI Component Examples</h2>
          <ErrorBoundary>
            <RoleBasedControls />
          </ErrorBoundary>
        </div>
        
        <div className="mt-8 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-100">Route Access Control</h2>
          <p className="mb-4 text-gray-700 dark:text-gray-300">
            The system automatically checks if your current role can access the following routes:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              '/dashboard/admin',
              '/dashboard/advertiser',
              '/dashboard/publisher',
              '/dashboard/stakeholder',
              '/dashboard/reports',
              '/dashboard/system',
              '/dashboard/users'
            ].map(route => (
              <div 
                key={route}
                className={`p-3 rounded-lg border ${
                  canAccess(route)
                    ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
                    : 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20'
                }`}
              >
                <div className="flex items-center">
                  <span 
                    className={`inline-block w-6 h-6 rounded-full mr-2 flex items-center justify-center ${
                      canAccess(route)
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    {canAccess(route) ? '✓' : '✗'}
                  </span>
                  <span className="font-medium dark:text-white">{route}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

/**
 * Define the layout for this page
 */
RoleAccessExamplePage.getLayout = function getLayout(page: ReactElement) {
  return page;
};

export default RoleAccessExamplePage;