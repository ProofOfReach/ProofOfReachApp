import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { NextPageWithLayout } from '@/pages/_app';
import { getDashboardLayout } from '@/utils/layoutHelpers';

/**
 * Redirect page from /dashboard/create to /dashboard/ads/create
 * This exists to maintain compatibility with links in ImprovedDashboardLayout
 */
const CreateRedirectPage: NextPageWithLayout = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/ads/create');
  }, [router]);

  return <div className="flex justify-center items-center h-full">Redirecting...</div>;
};

// Set the layout for the page
CreateRedirectPage.getLayout = function getLayout(page: React.ReactElement) {
  return getDashboardLayout(page, 'Create Ad');
};

export default CreateRedirectPage;