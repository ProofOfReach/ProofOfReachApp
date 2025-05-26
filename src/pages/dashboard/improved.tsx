import { UserRole } from "@/types/role";
import { NextPage } from 'next';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ViewerDashboard from '@/components/dashboards/ViewerDashboard';

/**
 * Dashboard page using the improved layout component
 */
const ImprovedDashboardPage: NextPage = () => {
  return (
    <DashboardLayout title="Improved Dashboard">
      <ViewerDashboard />
    </DashboardLayout>
  );
};

export default ImprovedDashboardPage;