import React from 'react';
import { Users, Crosshair, Zap, BarChart2 } from 'react-feather';
import Head from 'next/head';
import Layout from '../components/Layout';
import BenefitsSection from '../components/marketing/BenefitsSection';
import HowItWorksSection from '../components/marketing/HowItWorksSection';
import FAQSection from '../components/marketing/FAQSection';

const AdvertiserPage: React.FC = () => {
  // Benefits for advertisers
  const benefits = [
    {
      title: 'Targeted Audience',
      description: 'Reach your ideal customers with precision through interest-based targeting.',
      icon: <Crosshair className="w-8 h-8" />,
    },
    {
      title: 'Direct Connection',
      description: 'Connect directly with publishers and their audiences without intermediaries.',
      icon: <Users className="w-8 h-8" />,
    },
    {
      title: 'Pay with Bitcoin',
      description: 'Seamless payments through Bitcoin and Lightning Network with minimal fees.',
      icon: <Zap className="w-8 h-8" />,
    },
    {
      title: 'Real-time Analytics',
      description: 'Monitor campaign performance with comprehensive, real-time analytics.',
      icon: <BarChart2 className="w-8 h-8" />,
    },
  ];

  // How it works steps
  const steps = [
    {
      number: 1,
      title: 'Create an Advertiser Account',
      description: 'Sign up with your Nostr key and complete your advertiser profile.',
    },
    {
      number: 2,
      title: 'Connect Your Bitcoin Wallet',
      description: 'Link your Lightning wallet to make payments for your campaigns.',
    },
    {
      number: 3,
      title: 'Create Your Campaign',
      description: 'Design your ad, set your targeting parameters, and define your budget.',
    },
    {
      number: 4,
      title: 'Launch and Monitor',
      description: 'Start your campaign and track performance metrics in real-time.',
    },
  ];

  // FAQ items specific to advertisers
  const faqItems = [
    {
      question: 'How much does it cost to advertise?',
      answer: 'You set your own budget and bid amount. Campaigns can start from as little as 1000 sats, with most effective campaigns running at 100,000+ sats.',
    },
    {
      question: 'What targeting options are available?',
      answer: 'You can target by content type, user interests, location (where available), and engagement metrics. Our platform provides granular targeting without compromising user privacy.',
    },
    {
      question: 'How are ad placements determined?',
      answer: 'Ad placements are determined through a combination of relevance scoring, bid amount, and publisher preferences to ensure optimal matching between ads and content.',
    },
    {
      question: 'Can I edit my campaign after launch?',
      answer: 'Yes, you can pause, edit, or adjust your campaign at any time. Changes to targeting or creative content will be reviewed before going live.',
    },
    {
      question: 'What metrics will I be able to track?',
      answer: 'You can track impressions, clicks, engagement rate, conversion events, and ROI. All data is provided in real-time through your dashboard.',
    },
  ];

  return (
    <>
      <Head>
        <title>Advertisers - Proof Of Reach</title>
        <meta name="description" content="Reach your target audience with precision through the Nostr Ad Marketplace." />
      </Head>

      <Layout>
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 py-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="inline-flex items-center bg-purple-600/20 text-purple-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Crosshair className="w-4 h-4 mr-2" />
              ADVERTISE WITH PRECISION
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Reach Your Ideal 
              <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent"> Audience</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
              Connect with engaged users who are interested in what you offer. Our decentralized platform helps you reach the right people without intermediaries.
            </p>
            <a 
              href="/login" 
              className="inline-flex items-center bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Start Advertising
            </a>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="py-20 bg-gray-900">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mb-4">
                Benefits for Advertisers
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Why advertise on Proof Of Reach?
              </p>
            </div>
            <BenefitsSection
              title=""
              subtitle=""
              benefits={benefits}
            />
          </div>
        </div>

        {/* How It Works */}
        <div className="py-20 bg-gray-800">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mb-4">
                How It Works
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Getting your campaign live is easy
              </p>
            </div>
            <HowItWorksSection
              title=""
              subtitle=""
              steps={steps}
            />
          </div>
        </div>

        {/* FAQ Section */}
        <div className="py-20 bg-gray-900">
          <div className="max-w-7xl mx-auto px-4">
            <FAQSection
              title="Frequently Asked Questions"
              subtitle="Common questions about advertising"
              faqs={faqItems}
              maxItems={8}
            />
          </div>
        </div>
      </Layout>
    </>
  );
};

export default AdvertiserPage;