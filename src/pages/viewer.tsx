import React from 'react';
import { Eye, Shield, Clock, DollarSign } from 'react-feather';
import Head from 'next/head';
import Layout from '../components/Layout';
import BenefitsSection from '../components/marketing/BenefitsSection';
import HowItWorksSection from '../components/marketing/HowItWorksSection';
import FAQSection from '../components/marketing/FAQSection';

const ViewerPage: React.FC = () => {
  // Benefits for viewers
  const benefits = [
    {
      title: 'Earn Rewards',
      description: 'Get paid in Bitcoin for viewing and engaging with relevant ads that interest you.',
      icon: <DollarSign className="w-8 h-8" />,
    },
    {
      title: 'Privacy Focused',
      description: 'Your data stays with you. View ads without being tracked across the internet.',
      icon: <Shield className="w-8 h-8" />,
    },
    {
      title: 'Control Your Experience',
      description: 'Choose what types of ads you see and how often you engage with them.',
      icon: <Eye className="w-8 h-8" />,
    },
    {
      title: 'Flexible Engagement',
      description: 'Engage with ads on your own schedule, whenever it is convenient for you.',
      icon: <Clock className="w-8 h-8" />,
    },
  ];

  // How it works steps
  const steps = [
    {
      number: 1,
      title: 'Create a Nostr Account',
      description: 'Sign up for a free Nostr account to start earning rewards.',
    },
    {
      number: 2,
      title: 'Connect Your Bitcoin Wallet',
      description: 'Link your Lightning wallet to receive payments directly.',
    },
    {
      number: 3,
      title: 'Set Your Preferences',
      description: 'Tell us what types of ads you are interested in seeing.',
    },
    {
      number: 4,
      title: 'Earn Rewards',
      description: 'View and engage with ads to earn Bitcoin rewards.',
    },
  ];

  // FAQ items specific to viewers
  const faqItems = [
    {
      question: 'How much can I earn as a viewer?',
      answer: 'Earnings vary based on engagement levels and ad rates. Most viewers earn between 10-100 sats per ad view, with additional rewards for deeper engagement.',
    },
    {
      question: 'Do I need technical knowledge to get started?',
      answer: 'No technical expertise is required. Our platform guides you through setup, making it accessible to everyone.',
    },
    {
      question: 'How do I receive my Bitcoin rewards?',
      answer: 'Rewards are sent directly to your connected Lightning wallet on a periodic basis or when you reach a minimum withdrawal threshold.',
    },
    {
      question: 'Can I choose what types of ads I see?',
      answer: 'Yes, you can set preferences for ad categories and the frequency of ads you wish to see.',
    },
    {
      question: 'Is my personal data being sold?',
      answer: 'Absolutely not. Your data stays with you, and advertisers only see anonymized engagement metrics.',
    },
  ];

  return (
    <>
      <Head>
        <title>Viewers - Proof Of Reach</title>
        <meta name="description" content="Earn Bitcoin rewards while browsing content you love on the Nostr Ad Marketplace." />
      </Head>

      <Layout>
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 py-20">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="inline-flex items-center bg-blue-600/20 text-blue-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Eye className="w-4 h-4 mr-2" />
              EARN BITCOIN REWARDS
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Get Paid For Your 
              <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent"> Attention</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
              Access content you love while earning Bitcoin rewards. With Proof Of Reach, your attention has value, and you control your data.
            </p>
            <a 
              href="/login" 
              className="inline-flex items-center bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Start Earning Now
            </a>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="py-20 bg-gray-900">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent mb-4">
                Benefits for Viewers
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Why join Proof Of Reach as a viewer?
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
                Getting started is easy
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
              subtitle="Common questions about being a viewer"
              faqs={faqItems}
              maxItems={8}
            />
          </div>
        </div>
      </Layout>
    </>
  );
};

export default ViewerPage;