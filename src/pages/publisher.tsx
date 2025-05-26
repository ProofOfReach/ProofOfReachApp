import React from 'react';
import Head from 'next/head';

const Publisher: React.FC = () => {
  return (
    <>
      <Head>
        <title>Publisher - ProofOfReach</title>
        <meta name="description" content="Publisher information for ProofOfReach" />
      </Head>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Publisher Information</h1>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-700 mb-4">
              Welcome to the publisher section of ProofOfReach.
            </p>
            <p className="text-gray-600">
              Monetize your content by displaying relevant ads and earn Bitcoin instantly.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Publisher;