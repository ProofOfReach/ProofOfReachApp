import React from 'react';
import { Users, Crosshair, Zap, BarChart2 } from 'react-feather';
import Head from 'next/head';

import RolePageLayout from '../components/marketing/RolePageLayout';
import HeroSection from '../components/marketing/HeroSection';
import BenefitsSection from '../components/marketing/BenefitsSection';
import HowItWorksSection from '../components/marketing/HowItWorksSection';
import FAQSection from '../components/marketing/FAQSection';
import Divider from '@/components/ui/Divider';

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
        <title>Advertisers - ProofofReach</title>
        <meta name="description" content="Reach your target audience with precision through the Nostr Ad Marketplace." />
      </Head>

      <RolePageLayout 
        title="Advertise Your Products"
        roleName="Advertisers"
        roleColor="bg-purple-600"
      >
        {/* Hero Section */}
        <HeroSection
          title="Reach Your Ideal Audience"
          subtitle="ADVERTISE WITH PRECISION"
          description="Connect with engaged users who are interested in what you offer. Our decentralized platform helps you reach the right people without intermediaries."
          ctaText="Start Advertising"
          ctaLink="/login"
          backgroundColor="bg-gradient-to-r from-purple-600 to-purple-800"
          imageUrl="/images/advertiser-hero.svg"
        />

        <Divider />

        {/* Benefits Section */}
        <BenefitsSection
          title="Benefits for Advertisers"
          subtitle="Why advertise on Nostr Ad Marketplace?"
          benefits={benefits}
        />

        <Divider />

        {/* How It Works */}
        <HowItWorksSection
          title="How It Works"
          subtitle="Getting your campaign live is easy"
          steps={steps}
        />

        <Divider />

        {/* FAQ Section */}
        <FAQSection
          title="Frequently Asked Questions"
          subtitle="Common questions about advertising"
          faqs={faqItems}
        />
      </RolePageLayout>
    </>
  );
};

export default AdvertiserPage;