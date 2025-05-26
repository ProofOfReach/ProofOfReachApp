import { useRouter } from 'next/router';
import { useEffect } from 'react';

/**
 * Redirect page to maintain backward compatibility
 * Maps /dashboard/ad-spaces/create to /dashboard/spaces/create
 */
export default function CreateAdSpaceRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/spaces/create');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Redirecting to Create Ad Space...</p>
      </div>
    </div>
  );
}