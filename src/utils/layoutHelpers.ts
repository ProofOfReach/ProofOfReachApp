import React, { ReactElement } from 'react';
import '@/components/layout/ImprovedDashboardLayout';

/**
 * Helper function for creating consistent dashboard layouts
 * This function should be used in the getLayout property of dashboard pages
 * @param page The page component to wrap with the layout
 * @param title Optional title for the page
 * @returns The wrapped page with layout applied
 */
export function getDashboardLayout(page: ReactElement, title?: string): ReactElement {
  // Create the layout using React.createElement instead of JSX
  return React.createElement(
    ImprovedDashboardLayout,
    { 
      children: page,
      title: title 
    }
  );
}