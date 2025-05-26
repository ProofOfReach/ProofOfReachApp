import React, { ReactNode, useEffect, useState } from 'react';
import Head from 'next/head';
import { defaultUseRole, UserRole } from '../../context/RoleContext';
import ClientOnly from '../../utils/clientOnly';
import DebugRoleEnabler from '../DebugRoleEnabler';
import Sidebar from './Sidebar'; // Import the original sidebar (temporarily)

export interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  role?: string;
}

const DashboardInner: React.FC<DashboardLayoutProps> = ({ children, title, role }) => {
  const { setRole } = defaultUseRole();
  const [isTestMode, setIsTestMode] = useState(false);
  
  // Apply the role from props if provided
  useEffect(() => {
    if (role) {
      console.log(`DashboardInner setting role to: ${role}`);
      setRole(role as UserRole);
    }
  }, [role, setRole]);
  
  // Check if we're in test mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const testMode = localStorage.getItem('isTestMode') === 'true';
      const pubkey = localStorage.getItem('nostr_pubkey') || '';
      const isTestPubkey = pubkey.startsWith('pk_test_');
      
      setIsTestMode(testMode || isTestPubkey);
    }
  }, []);

  return (
    <>
      <Head>
        <title>{title ? `${title} - Proof Of Reach` : 'Proof Of Reach'}</title>
      </Head>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Use the regular sidebar for now */}
        <Sidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-2 px-6">
            <div className="flex justify-between items-center">
              <h1 className="text-lg font-medium text-gray-900 dark:text-white">
                {title || 'Dashboard'}
              </h1>
            </div>
          </header>
          
          {/* Debug Role Enabler */}
          <DebugRoleEnabler />
          
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {children}
          </main>
          
          <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 px-6">
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} Proof Of Reach - Phase 1 MVP
            </div>
          </footer>
        </div>
      </div>
    </>
  );
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title, role }) => {
  return (
    // Use ClientOnly to prevent hydration mismatches between server and client
    <ClientOnly fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center">
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-10 w-64 rounded mb-4"></div>
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-40 w-80 rounded"></div>
      </div>
    }>
      {/* No need to add another provider since it's already set in _app.tsx */}
      <DashboardInner title={title} role={role}>
        {children}
      </DashboardInner>
    </ClientOnly>
  );
};

export default DashboardLayout;