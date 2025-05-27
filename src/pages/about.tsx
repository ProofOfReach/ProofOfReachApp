import { UserRole } from "@/types/role";
import React from 'react';
import { ArrowRight, Globe, Shield, Zap, DollarSign, Users, Award } from 'react-feather';
import Head from 'next/head';
import Link from 'next/link';

import Layout from '../components/Layout';
import HowItWorksSection from '../components/marketing/HowItWorksSection';
import FAQSection from '../components/marketing/FAQSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/Badge';

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
        <title>How It Works - ProofofReach</title>
        <meta name="description" content="Learn how ProofofReach creates a decentralized advertising ecosystem powered by Bitcoin." />
      </Head>

      <Layout>
        {/* Hero Section */}
        <section className="bg-gray-900 py-20 lg:py-24">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <Badge className="mb-6 text-sm px-4 py-2 bg-blue-600/20 text-blue-400 border-blue-500">
                <DollarSign className="h-4 w-4 mr-2" />
                Bitcoin-Powered Advertising
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight text-white">
                How <span className="text-blue-500">ProofofReach</span> Works
              </h1>
              <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
                Aligning advertisers, publishers, and viewers using Bitcoin Lightning payments 
                and the NOSTR protocol.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm font-medium">
                <div className="flex items-center gap-2 bg-blue-600/20 px-4 py-2 rounded-full text-blue-400 border border-blue-500/30">
                  <Shield className="h-4 w-4" />
                  <span>Decentralized</span>
                </div>
                <div className="flex items-center gap-2 bg-orange-500/20 px-4 py-2 rounded-full text-orange-400 border border-orange-500/30">
                  <DollarSign className="h-4 w-4" />
                  <span>Bitcoin Payments</span>
                </div>
                <div className="flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-full text-green-400 border border-green-500/30">
                  <Users className="h-4 w-4" />
                  <span>Privacy-First</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="py-20 bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Our Mission</h2>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Building an advertising platform that respects users, rewards content creators, 
                and delivers value to advertisers - all without centralized control.
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8 mb-16">
              <Card className="bg-gray-900/50 border border-gray-700 shadow-xl backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-600/20 rounded-lg">
                      <Shield className="h-5 w-5 text-blue-500" />
                    </div>
                    <CardTitle className="text-xl text-white">What We Believe</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-gray-300 leading-relaxed">
                    The current advertising ecosystem is broken. Users are tracked across the web, 
                    content creators receive pennies on the dollar, and advertisers struggle with fraud.
                  </p>
                  <p className="text-gray-300 leading-relaxed">
                    By building on Nostr protocol and using Bitcoin for payments, we create 
                    a more direct, transparent, and fair system for everyone.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border border-gray-700 shadow-xl backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-orange-500/20 rounded-lg">
                      <Zap className="h-5 w-5 text-orange-500" />
                    </div>
                    <CardTitle className="text-xl text-white">Our Approach</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-gray-300 leading-relaxed">
                    Instead of building walls and silos, we're creating an open platform where 
                    anyone can participate without gatekeepers or massive fees.
                  </p>
                  <p className="text-gray-300 leading-relaxed">
                    Lightning Network enables instant micropayments, allowing users to earn for their attention 
                    and publishers to be paid directly by their audience.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Platform Overview</h2>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                ProofofReach connects advertisers, publishers, and viewers in a trustless ecosystem
              </p>
            </div>

            <HowItWorksSection
              title=""
              steps={platformSteps}
            />
          </div>
        </section>

        {/* Role-specific sections */}
        <div className="py-16 bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-white">Choose Your Role</h2>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                Explore how the platform works for different participants
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Viewers */}
              <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 backdrop-blur-sm">
                <div className="bg-blue-500/20 text-blue-400 p-2 rounded-lg w-10 h-10 flex items-center justify-center mb-4">
                  <Globe className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold mb-3 text-white">For Viewers</h3>
                <p className="text-gray-300 mb-4 text-sm leading-relaxed">
                  Earn Bitcoin rewards while browsing content you love. Control your data and privacy.
                </p>
                <Link href="/viewer" className="text-blue-400 hover:text-blue-300 inline-flex items-center text-sm font-medium">
                  Learn More <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>

              {/* Publishers */}
              <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 backdrop-blur-sm">
                <div className="bg-green-500/20 text-green-400 p-2 rounded-lg w-10 h-10 flex items-center justify-center mb-4">
                  <Shield className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold mb-3 text-white">For Publishers</h3>
                <p className="text-gray-300 mb-4 text-sm leading-relaxed">
                  Monetize your content directly with Bitcoin payments. Control what ads appear with your content.
                </p>
                <Link href="/publisher" className="text-green-400 hover:text-green-300 inline-flex items-center text-sm font-medium">
                  Learn More <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>

              {/* Advertisers */}
              <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 backdrop-blur-sm">
                <div className="bg-orange-500/20 text-orange-400 p-2 rounded-lg w-10 h-10 flex items-center justify-center mb-4">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold mb-3 text-white">For Advertisers</h3>
                <p className="text-gray-300 mb-4 text-sm leading-relaxed">
                  Reach your ideal audience with precision targeting. Pay only for actual engagement.
                </p>
                <Link href="/advertiser" className="text-orange-400 hover:text-orange-300 inline-flex items-center text-sm font-medium">
                  Learn More <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Section Divider */}
        <div className="relative bg-gray-800">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600" />
          </div>
          <div className="relative flex justify-center">
            <div className="bg-gray-800 px-6">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <FAQSection
          title="Frequently Asked Questions"
          subtitle="Common questions about Proof Of Reach"
          faqs={faqItems}
          maxItems={4}
        />
      </Layout>
    </>
  );
};

export default HowItWorksPage;