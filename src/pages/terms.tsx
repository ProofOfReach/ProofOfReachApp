import React from 'react';
import Head from 'next/head';

const Terms: React.FC = () => {
  return (
    <>
      <Head>
        <title>Terms of Service - ProofOfReach</title>
        <meta name="description" content="Terms of Service for ProofOfReach" />
      </Head>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-700 mb-4">
              Welcome to ProofOfReach. By using our service, you agree to these terms.
            </p>
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold mb-2">1. Service Description</h2>
                <p className="text-gray-600">ProofOfReach is a decentralized ad marketplace platform.</p>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">2. User Responsibilities</h2>
                <p className="text-gray-600">Users are responsible for their content and compliance with applicable laws.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Terms;