import { useEffect } from 'react';
import { useRouter } from 'next/router';

/**
 * Redirects to the new Tailwind version of the API Keys page
 */
const ApiKeysPage: React.FC = () => {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/dashboard/developer/api-keys-tailwind');
  }, [router]);
  
  // Simple loading state while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-600">Redirecting to API Keys...</p>
    </div>
  );
};

export default ApiKeysPage;