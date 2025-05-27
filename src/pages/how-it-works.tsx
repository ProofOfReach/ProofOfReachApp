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
        <section className="bg-white py-20 lg:py-24">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <Badge className="mb-6 text-sm px-4 py-2 bg-blue-50 text-blue-700 border-blue-200">
                <DollarSign className="h-4 w-4 mr-2" />
                Bitcoin-Powered Advertising
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight text-gray-900">
                How <span className="text-blue-600">ProofofReach</span> Works
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                A decentralized advertising marketplace built on Nostr protocol with Bitcoin Lightning payments
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm font-medium">
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full text-gray-700">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>Decentralized</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full text-gray-700">
                  <DollarSign className="h-4 w-4 text-orange-600" />
                  <span>Bitcoin Payments</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full text-gray-700">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span>Privacy-First</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">Our Mission</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Building an advertising platform that respects users, rewards content creators, 
                and delivers value to advertisers - all without centralized control.
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8 mb-16">
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Shield className="h-5 w-5 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl text-gray-900">What We Believe</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-gray-600 leading-relaxed">
                    The current advertising ecosystem is broken. Users are tracked across the web, 
                    content creators receive pennies on the dollar, and advertisers struggle with fraud.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    By building on Nostr protocol and using Bitcoin for payments, we create 
                    a more direct, transparent, and fair system for everyone.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <Zap className="h-5 w-5 text-green-600" />
                    </div>
                    <CardTitle className="text-xl text-gray-900">Our Approach</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-gray-600 leading-relaxed">
                    Instead of building walls and silos, we're creating an open platform where 
                    anyone can participate without gatekeepers or massive fees.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    Lightning Network enables instant micropayments, allowing users to earn for their attention 
                    and publishers to be paid directly by their audience.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Platform Overview</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
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
        <div className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Choose Your Role</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Explore how the platform works for different participants
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Viewers */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="bg-blue-50 text-blue-600 p-2 rounded-lg w-10 h-10 flex items-center justify-center mb-4">
                  <Globe className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold mb-3 text-gray-900">For Viewers</h3>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  Earn Bitcoin rewards while browsing content you love. Control your data and privacy.
                </p>
                <Link href="/viewer" className="text-blue-600 hover:text-blue-700 inline-flex items-center text-sm font-medium">
                  Learn More <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>

              {/* Publishers */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="bg-green-50 text-green-600 p-2 rounded-lg w-10 h-10 flex items-center justify-center mb-4">
                  <Shield className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold mb-3 text-gray-900">For Publishers</h3>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  Monetize your content directly with Bitcoin payments. Control what ads appear with your content.
                </p>
                <Link href="/publisher" className="text-green-600 hover:text-green-700 inline-flex items-center text-sm font-medium">
                  Learn More <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>

              {/* Advertisers */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="bg-orange-50 text-orange-600 p-2 rounded-lg w-10 h-10 flex items-center justify-center mb-4">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold mb-3 text-gray-900">For Advertisers</h3>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  Reach your ideal audience with precision targeting. Pay only for actual engagement.
                </p>
                <Link href="/advertiser" className="text-orange-600 hover:text-orange-700 inline-flex items-center text-sm font-medium">
                  Learn More <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Section Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center">
            <div className="bg-white px-6">
              <div className="h-2 w-2 rounded-full bg-slate-300" />
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