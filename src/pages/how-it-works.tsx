import { UserRole } from "@/types/role";
import React from 'react';
import { ArrowRight, Globe, Shield, Zap, DollarSign, Users, Award } from 'react-feather';
import Head from 'next/head';
import Link from 'next/link';

import Layout from '../components/Layout';
import HowItWorksSection from '../components/marketing/HowItWorksSection';
import FAQSection from '../components/marketing/FAQSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
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
        <section className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white py-24 lg:py-32">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
          <div className="relative container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <Badge variant="secondary" className="mb-6 text-sm px-4 py-2">
                <DollarSign className="h-4 w-4 mr-2" />
                Bitcoin-Powered Advertising
              </Badge>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 tracking-tight">
                How <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">ProofofReach</span> Works
              </h1>
              <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-12 leading-relaxed">
                A revolutionary decentralized advertising platform built on the Nostr protocol, 
                where transparency meets innovation and Bitcoin powers every transaction.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>Decentralized</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  <span>Bitcoin Payments</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Privacy-First</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="py-24 bg-gradient-to-br from-slate-50 to-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">Our Mission</h2>
              <p className="text-xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
                We're building an advertising platform that respects users, rewards content creators, 
                and delivers value to advertisers - all without centralized control or surveillance.
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-8 mb-20">
              <Card className="h-full border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-100 rounded-full">
                      <Shield className="h-6 w-6 text-red-600" />
                    </div>
                    <CardTitle className="text-2xl text-slate-900">What We Believe</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-600 leading-relaxed">
                    The current advertising ecosystem is broken. Users are tracked across the web, 
                    content creators receive pennies on the dollar, and advertisers struggle with fraud 
                    and middlemen taking most of the value.
                  </p>
                  <p className="text-slate-600 leading-relaxed">
                    By building on the Nostr protocol and using Bitcoin for payments, we can create 
                    a more direct, transparent, and fair system for all participants.
                  </p>
                </CardContent>
              </Card>

              <Card className="h-full border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Zap className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl text-slate-900">Our Approach</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-600 leading-relaxed">
                    Instead of building walls and silos, we're creating an open platform where 
                    anyone can participate without gatekeepers or massive fees.
                  </p>
                  <p className="text-slate-600 leading-relaxed">
                    The Lightning Network enables instant micropayments, allowing for new business 
                    models where users can earn for their attention and publishers can be paid directly by their audience.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">Platform Overview</h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
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