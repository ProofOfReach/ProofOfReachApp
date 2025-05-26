import React from 'react';
import Head from 'next/head';

const TestAuth: React.FC = () => {
  return (
    <>
      <Head>
        <title>Test Authentication - ProofOfReach</title>
        <meta name="description" content="Test authentication for ProofOfReach" />
      </Head>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Test Authentication</h1>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-700 mb-4">
              Authentication testing page for ProofOfReach.
            </p>
            <p className="text-gray-600">
              This page is used for testing authentication functionality.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default TestAuth;