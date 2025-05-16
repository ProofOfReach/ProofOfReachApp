import React from 'react';
import { ArrowRight, Globe, Shield, Zap } from 'react-feather';
import Head from 'next/head';
import Link from 'next/link';

import Layout from '../components/Layout';
import HowItWorksSection from '../components/marketing/HowItWorksSection';
import FAQSection from '../components/marketing/FAQSection';
import Divider from '@/components/ui/Divider';

const HowItWorksPage: React.FC = () => {
  // Platform overview steps
  const platformSteps = [
    {
      number: 1,
      title: 'Decentralized Architecture',
      description: 'Built on the Nostr protocol, our marketplace operates without central control or intermediaries.',
    },
    {
      number: 2,
      title: 'Bitcoin Payments',
      description: 'All transactions are handled via Bitcoin and Lightning Network for fast, low-fee payments.',
    },
    {
      number: 3,
      title: 'Privacy-Focused',
      description: 'Users control their data, with no tracking or profiling across the internet.',
    },
    {
      number: 4,
      title: 'Direct Connections',
      description: 'Advertisers and publishers connect directly, eliminating middlemen and reducing costs.',
    },
  ];

  // General FAQ items
  const faqItems = [
    {
      question: 'What is Nostr?',
      answer: 'Nostr (Notes and Other Stuff Transmitted by Relays) is a decentralized protocol that enables censorship-resistant and permissionless social media and content sharing.',
    },
    {
      question: 'Do I need Bitcoin to use this platform?',
      answer: 'Yes, Bitcoin is used for all transactions on the platform via the Lightning Network. You will need a Lightning-compatible wallet to receive or make payments.',
    },
    {
      question: 'Is my personal information safe?',
      answer: 'Your personal data remains under your control. We use public key cryptography for authentication, and you choose what information to share with the platform.',
    },
    {
      question: 'How does content moderation work?',
      answer: 'Content moderation is primarily handled through publisher preferences and community standards. There is no central authority imposing restrictions.',
    },
    {
      question: 'Can I use this platform on mobile devices?',
      answer: 'Yes, our platform is fully responsive and works on desktop and mobile devices with modern web browsers.',
    },
    {
      question: 'What happens if I lose my private key?',
      answer: 'If you lose your private key, you will lose access to your account and funds. We recommend using a secure key management solution and keeping backups.',
    },
  ];

  return (
    <>
      <Head>
        <title>How It Works | Nostr Ad Marketplace</title>
        <meta name="description" content="Learn how the Nostr Ad Marketplace creates a decentralized advertising ecosystem powered by Bitcoin." />
      </Head>

      <Layout>
        {/* Hero */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About Nostr Ad Marketplace</h1>
            <p className="text-xl max-w-3xl mx-auto mb-8">
              A decentralized advertising platform built on Nostr protocol and powered by Bitcoin
            </p>
          </div>
        </div>

        <Divider />

        {/* About Section */}
        <div className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
                We're building an advertising platform that respects users, rewards content creators, and delivers value to advertisers - all without centralized control or surveillance.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12 mb-16">
              <div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">What We Believe</h3>
                <p className="text-gray-600 mb-4">
                  The current advertising ecosystem is broken. Users are tracked across the web, content creators receive pennies on the dollar, and advertisers struggle with fraud and middlemen taking most of the value.
                </p>
                <p className="text-gray-600">
                  By building on the Nostr protocol and using Bitcoin for payments, we can create a more direct, transparent, and fair system for all participants.
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Our Approach</h3>
                <p className="text-gray-600 mb-4">
                  Instead of building walls and silos, we're creating an open platform where anyone can participate without gatekeepers or massive fees.
                </p>
                <p className="text-gray-600">
                  The Lightning Network enables instant micropayments, allowing for new business models where users can earn for their attention and publishers can be paid directly by their audience.
                </p>
              </div>
            </div>

            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Platform Overview</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Nostr Ad Marketplace connects advertisers, publishers, and viewers in a trustless ecosystem
              </p>
            </div>

            <HowItWorksSection
              title=""
              steps={platformSteps}
            />
          </div>
        </div>

        <Divider />

        {/* Role-specific sections */}
        <div className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Choose Your Role</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Explore how the platform works for different participants
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Viewers */}
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <div className="bg-blue-100 text-blue-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-6">
                  <Globe className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">For Viewers</h3>
                <p className="text-gray-600 mb-6">
                  Earn Bitcoin rewards while browsing content you love. Control your data and privacy.
                </p>
                <Link href="/viewer" className="text-blue-600 hover:text-blue-800 inline-flex items-center font-medium">
                  Learn More <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>

              {/* Publishers */}
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <div className="bg-green-100 text-green-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-6">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">For Publishers</h3>
                <p className="text-gray-600 mb-6">
                  Monetize your content directly with Bitcoin payments. Control what ads appear with your content.
                </p>
                <Link href="/publisher" className="text-green-600 hover:text-green-800 inline-flex items-center font-medium">
                  Learn More <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>

              {/* Advertisers */}
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <div className="bg-purple-100 text-purple-600 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-6">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">For Advertisers</h3>
                <p className="text-gray-600 mb-6">
                  Reach your ideal audience with precision targeting. Pay only for actual engagement.
                </p>
                <Link href="/advertiser" className="text-purple-600 hover:text-purple-800 inline-flex items-center font-medium">
                  Learn More <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <Divider />

        {/* FAQ Section */}
        <FAQSection
          title="Frequently Asked Questions"
          subtitle="Common questions about the Nostr Ad Marketplace"
          faqs={faqItems}
          maxItems={4}
        />
      </Layout>
    </>
  );
};

export default HowItWorksPage;