import { UserRole } from "@/types/role";
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import '@/pages/_app';
import '@/utils/layoutHelpers';

/**
 * Redirect page from /dashboard/create to /dashboard/ads/create
 * This exists to maintain compatibility with links in DashboardLayout
 */
const CreateRedirectPage: NextPageWithLayout = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/ads/create');
  }, [router]);

  return <div className="flex justify-center items-center h-full">Redirecting...</div>;
};

// Layout handled by redirect

export default CreateRedirectPage;