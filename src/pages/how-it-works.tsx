import React from 'react';
import Head from 'next/head';

const HowItWorks: React.FC = () => {
  return (
    <>
      <Head>
        <title>How It Works - ProofOfReach</title>
        <meta name="description" content="Learn how ProofOfReach decentralized ad marketplace works" />
      </Head>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">How It Works</h1>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-700 mb-4">
              ProofOfReach is a decentralized ad marketplace that connects advertisers with publishers 
              using Bitcoin Lightning Network for payments and Nostr protocol for identity.
            </p>
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold mb-2">For Advertisers</h2>
                <p className="text-gray-600">Create campaigns, set your budget, and reach your target audience through verified publishers.</p>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">For Publishers</h2>
                <p className="text-gray-600">Monetize your content by displaying relevant ads to your audience and earn Bitcoin instantly.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HowItWorks;