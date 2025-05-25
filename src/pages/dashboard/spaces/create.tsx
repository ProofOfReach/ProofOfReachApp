import { UserRole } from "@/types/role";
import React, { useContext, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import { NostrAuthContext } from '../../_app';
import Link from 'next/link';
import { AlertCircle } from 'react-feather';
import SpaceForm from '../../../components/SpaceForm';

const CreateSpacePage: React.FC = () => {
  const { auth } = useContext(NostrAuthContext);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (spaceData: any) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/spaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify(spaceData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.log || 'Failed to create ad space');
      }

      // Redirect to spaces list
      router.push('/dashboard/publisher');
    } catch (err: any) {
      console.log('Space creation error:', err);
      setError(err.message || 'Failed to create the ad space. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!auth.pubkey) {
    return (
      <Layout title="Create Ad Space - Nostr Ad Marketplace">
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-300">Please login to create ad spaces.</p>
          <Link href="/login" className="btn-primary mt-4 inline-block">
            Go to Login
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Create Ad Space - Nostr Ad Marketplace">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Create New Ad Space</h1>

        {/* Info Card */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-800 dark:text-blue-300">Publisher Information</h3>
              <p className="text-blue-700 dark:text-blue-400 text-sm mt-1">
                Create an ad space on your website by filling out the form below. You can set your minimum
                bid requirements, dimensions, and content categories to attract relevant advertisers.
              </p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Ad Space Creation Form */}
        <div className="card">
          <div className="p-6">
            <SpaceForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateSpacePage;
