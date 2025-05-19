import React, { ReactNode, useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useRole, UserRole } from '../../context/RoleContext';
import Sidebar from './Sidebar';
import RoleTransition from '../loading/RoleTransition';

// Lazy-loaded dashboard content components
const ViewerDashboard = React.lazy(() => import('../dashboards/UserDashboard'));
const AdvertiserDashboard = React.lazy(() => import('../dashboards/AdvertiserDashboard'));
const PublisherDashboard = React.lazy(() => import('../dashboards/PublisherDashboard'));
const AdminDashboard = React.lazy(() => import('../dashboards/AdminDashboard'));
const StakeholderDashboard = React.lazy(() => import('../dashboards/StakeholderDashboard'));

// Fallback loading component
const DashboardLoading: React.FC = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-pulse text-gray-500 dark:text-gray-400">
      Loading dashboard...
    </div>
  </div>
);

interface UnifiedDashboardProps {
  initialRole?: UserRole;
}

const UnifiedDashboard: React.FC<UnifiedDashboardProps> = ({ initialRole }) => {
  const { role, isChangingRole } = useRole();
  const router = useRouter();
  const [currentView, setCurrentView] = useState<string>(router.pathname);
  
  // Role titles for the page title
  const roleTitles = {
    viewer: 'Viewer Dashboard',
    advertiser: 'Advertiser Dashboard',
    publisher: 'Publisher Dashboard',
    admin: 'Admin Dashboard',
    stakeholder: 'Stakeholder Dashboard'
  };
  
  // When role changes, update the URL to match (without a full navigation)
  useEffect(() => {
    // Only update URL if we're on a dashboard page
    if (router.pathname.startsWith('/dashboard/')) {
      // Get current path segments
      const pathSegments = router.pathname.split('/');
      
      // Create new path with updated role
      if (pathSegments.length >= 3) {
        pathSegments[2] = role;
        const newPath = pathSegments.join('/');
        
        // Only update if different
        if (newPath !== router.pathname) {
          router.replace(newPath, undefined, { shallow: true });
          setCurrentView(newPath);
        }
      }
    }
  }, [role, router]);
  
  // Handle specific page content based on the URL
  const renderDashboardContent = () => {
    // Extract the page path after the role segment
    const pathParts = router.pathname.split('/');
    const pagePath = pathParts.slice(3).join('/');
    
    // Render different content based on role and page path
    // We use React.Suspense to handle the lazy-loaded components
    return (
      <React.Suspense fallback={<DashboardLoading />}>
        {role === 'viewer' && <ViewerDashboard page={pagePath} />}
        {role === 'advertiser' && <AdvertiserDashboard page={pagePath} />}
        {role === 'publisher' && <PublisherDashboard page={pagePath} />}
        {role === 'admin' && <AdminDashboard page={pagePath} />}
        {role === 'stakeholder' && <StakeholderDashboard page={pagePath} />}
      </React.Suspense>
    );
  };
  
  return (
    <>
      <Head>
        <title>{roleTitles[role]} - Nostr Ad Marketplace</title>
      </Head>
      
      <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main content area */}
        <main className="flex-1 p-6 overflow-auto">
          {/* This will conditionally render the appropriate dashboard content */}
          {renderDashboardContent()}
        </main>
        
        {/* Role transition overlay - will only show during role changes */}
        <RoleTransition role={role} isVisible={isChangingRole} />
      </div>
    </>
  );
};

export default UnifiedDashboard;