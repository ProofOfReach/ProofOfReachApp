import { NextPage } from 'next';
import "./components/layout/ImprovedDashboardLayout';
import "./components/dashboards/ViewerDashboard';

/**
 * Dashboard page using the improved layout component
 */
const ImprovedDashboardPage: NextPage = () => {
  return (
    <ImprovedDashboardLayout title="Improved Dashboard">
      <ViewerDashboard />
    </ImprovedDashboardLayout>
  );
};

export default ImprovedDashboardPage;