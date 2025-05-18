import React from 'react';
import ViewerDashboard from '@/components/dashboards/ViewerDashboard';

/**
 * @deprecated Use ViewerDashboard component from '@/components/dashboards/ViewerDashboard' instead.
 * This is a compatibility wrapper during the user->viewer terminology migration.
 */
const UserDashboard: React.FC = () => {
  // Forward to the new ViewerDashboard component
  return <ViewerDashboard />;
};

export default UserDashboard;