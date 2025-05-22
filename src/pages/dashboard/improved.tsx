import { NextPage } from 'next';
import ImprovedDashboardLayout from '@/components/layout/ImprovedDashboardLayout';
import ViewerDashboard from '@/components/dashboards/ViewerDashboard';

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