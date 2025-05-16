import { NextPage } from 'next';
import ImprovedDashboardLayout from '@/components/layout/ImprovedDashboardLayout';
import UserDashboard from '@/components/dashboard/user/UserDashboard';

/**
 * Dashboard page using the improved layout component
 */
const ImprovedDashboardPage: NextPage = () => {
  return (
    <ImprovedDashboardLayout title="Improved Dashboard">
      <UserDashboard />
    </ImprovedDashboardLayout>
  );
};

export default ImprovedDashboardPage;