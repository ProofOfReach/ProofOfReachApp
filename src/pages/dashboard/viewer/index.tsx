import React from 'react';
import ViewerDashboard from '@/components/dashboards/ViewerDashboard';
import { DashboardContainer } from '@/components/ui';
import { getDashboardLayout } from '@/utils/layoutHelpers';
import type { NextPageWithLayout } from '../../_app';

/**
 * Viewer Dashboard Page
 * 
 * This page renders the ViewerDashboard component which has been migrated from
 * the original UserDashboard component to align with our updated terminology
 */
const ViewerDashboardPage: NextPageWithLayout = () => {
  return (
    <DashboardContainer>
      <ViewerDashboard />
    </DashboardContainer>
  );
};

// Apply dashboard layout
ViewerDashboardPage.getLayout = getDashboardLayout;

export default ViewerDashboardPage;