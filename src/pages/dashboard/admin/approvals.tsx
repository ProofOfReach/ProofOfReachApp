import React from 'react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const AdminApprovalsPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to main admin page as this feature is not implemented yet
    router.push('/dashboard/admin');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-xl font-semibold mb-2">Redirecting...</h1>
        <p className="text-gray-600">Taking you to the admin dashboard.</p>
      </div>
    </div>
  );
};

export default AdminApprovalsPage;