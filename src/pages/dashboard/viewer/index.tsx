import React from 'react';
import "./components/dashboards/ViewerDashboard';
import "./components/ui';
import "./utils/layoutHelpers';
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