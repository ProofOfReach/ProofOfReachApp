import { UserRole } from "@/types/role";
import React from 'react';
import { Eye, Shield, Clock, DollarSign } from 'react-feather';
import Head from 'next/head';

import RolePageLayout from '../components/marketing/RolePageLayout';
import HeroSection from '../components/marketing/HeroSection';
import BenefitsSection from '../components/marketing/BenefitsSection';
import HowItWorksSection from '../components/marketing/HowItWorksSection';
import FAQSection from '../components/marketing/FAQSection';
import Divider from '@/components/ui/Divider';

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
        <title>Viewers - ProofofReach</title>
        <meta name="description" content="Earn Bitcoin rewards while browsing content you love on the Nostr Ad Marketplace." />
      </Head>

      <RolePageLayout 
        title="Earn While You Browse"
        roleName="Viewers"
        roleColor="bg-blue-600"
      >
        {/* Hero Section */}
        <HeroSection
          title="Get Paid For Your Attention"
          subtitle="EARN BITCOIN REWARDS"
          description="Access content you love while earning Bitcoin rewards. With Nostr Ad Marketplace, your attention has value, and you control your data."
          ctaText="Start Earning Now"
          ctaLink="/login"
          backgroundColor="bg-gradient-to-r from-blue-600 to-blue-800"
          imageUrl="/images/viewer-hero.svg"
        />

        <Divider />

        {/* Benefits Section */}
        <BenefitsSection
          title="Benefits for Viewers"
          subtitle="Why join Nostr Ad Marketplace as a viewer?"
          benefits={benefits}
        />

        <Divider />

        {/* How It Works */}
        <HowItWorksSection
          title="How It Works"
          subtitle="Getting started is easy"
          steps={steps}
        />

        <Divider />

        {/* FAQ Section */}
        <FAQSection
          title="Frequently Asked Questions"
          subtitle="Common questions about being a viewer"
          faqs={faqItems}
        />
      </RolePageLayout>
    </>
  );
};

export default ViewerPage;