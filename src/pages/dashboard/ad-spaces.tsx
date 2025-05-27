import React from 'react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

/**
 * Redirect page from /dashboard/ad-spaces to /dashboard/spaces
 * This maintains compatibility with existing navigation links
 */
const AdSpacesRedirectPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/spaces');
  }, [router]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to Ad Spaces...</p>
      </div>
    </div>
  );
};

export default AdSpacesRedirectPage;