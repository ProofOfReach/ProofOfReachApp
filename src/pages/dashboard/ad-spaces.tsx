import { useRouter } from 'next/router';
import { useEffect } from 'react';

/**
 * Redirect page to maintain backward compatibility
 * Maps /dashboard/ad-spaces to /dashboard/spaces
 */
export default function AdSpacesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/spaces');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Redirecting to Ad Spaces...</p>
      </div>
    </div>
  );
}