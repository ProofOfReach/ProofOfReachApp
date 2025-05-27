import { ReactElement } from 'react';
import { NextPageWithLayout } from './_app';
import Layout from '../components/Layout';
import { Accordion, AccordionItem } from '../components/ui/Accordion';

const FAQPage: NextPageWithLayout = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h1>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Find answers to common questions about the Nostr Ad Marketplace, how it works, and how to get started.
          </p>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-blue-400">General Questions</h2>
          <Accordion>
            <AccordionItem title="What is the Nostr Ad Marketplace?">
              <p className="mb-3 text-gray-300">
                The Nostr Ad Marketplace is a decentralized advertising platform built on the Nostr protocol with Lightning Network payment integration. It connects advertisers directly with publishers without intermediaries.
              </p>
              <p className="text-gray-300">
                The platform allows for micropayments using Bitcoin over the Lightning Network, enabling pay-per-impression and pay-per-click models with minimal fees.
              </p>
            </AccordionItem>
            
            <AccordionItem title="How is this different from traditional ad platforms?">
              <p className="mb-3 text-gray-300">
                Unlike traditional advertising platforms that act as centralized intermediaries:
              </p>
              <ul className="list-disc pl-5 mb-3 text-gray-300">
                <li>We&apos;re built on the decentralized Nostr protocol</li>
                <li>Payments are processed through the Lightning Network</li>
                <li>Publishers maintain direct control over which ads appear on their platforms</li>
                <li>Lower fees due to disintermediation</li>
                <li>Enhanced privacy for both advertisers and publishers</li>
              </ul>
              <p className="text-gray-300">
                This creates a more transparent, efficient, and privacy-focused advertising ecosystem.
              </p>
            </AccordionItem>
            
            <AccordionItem title="Do I need a Nostr account to use the marketplace?">
              <p className="mb-3 text-gray-300">
                Yes, both advertisers and publishers need a Nostr public key (npub) to use the marketplace. This serves as your decentralized identity on the platform.
              </p>
              <p className="text-gray-300">
                You can create a Nostr account using various clients like Damus, Amethyst, or Iris. Any Nostr client that supports NIP-07 (the browser extension standard) can be used to sign in to our platform.
              </p>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-blue-400">For Viewers</h2>
          <Accordion>
            <AccordionItem title="What benefits do I get as a viewer?">
              <p className="mb-3 text-gray-300">
                As a viewer on the Nostr Ad Marketplace, you benefit in several ways:
              </p>
              <ul className="list-disc pl-5 mb-3 text-gray-300">
                <li>Relevant ads that match your interests</li>
                <li>Control over your ad viewing experience</li>
                <li>Support for creators you follow without paying subscription fees</li>
                <li>Enhanced privacy compared to traditional ad platforms</li>
                <li>No tracking across websites or persistent user profiles</li>
              </ul>
              <p className="text-gray-300">
                The platform is designed to create a balanced ecosystem where viewers see quality content without intrusive advertising.
              </p>
            </AccordionItem>
            
            <AccordionItem title="How is my privacy protected?">
              <p className="mb-3 text-gray-300">
                We prioritize viewer privacy in several important ways:
              </p>
              <ul className="list-disc pl-5 mb-3 text-gray-300">
                <li>No cross-site tracking or persistent cookies</li>
                <li>Minimal data collection (only what&apos;s needed to serve relevant ads)</li>
                <li>No selling of personal data to third parties</li>
                <li>Decentralized architecture limits data collection capabilities</li>
                <li>Optional viewing of ads without account creation</li>
              </ul>
              <p className="text-gray-300">
                Our approach is fundamentally different from traditional advertising platforms that build extensive profiles about users.
              </p>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-blue-400">For Advertisers</h2>
          <Accordion>
            <AccordionItem title="How do I create an ad campaign?">
              <p className="mb-3 text-gray-300">
                After signing up and selecting the advertiser role:
              </p>
              <ol className="list-decimal pl-5 mb-3 text-gray-300">
                <li>Fund your wallet with Bitcoin via Lightning Network</li>
                <li>Navigate to the Campaigns section and click &quot;Create Campaign&quot;</li>
                <li>Set your campaign details, targeting options, and budget</li>
                <li>Create ad creatives within your campaign</li>
                <li>Set bid amounts for impressions and clicks</li>
                <li>Launch your campaign</li>
              </ol>
              <p className="text-gray-300">
                Your ads will be served to publishers based on your targeting criteria and bid amounts.
              </p>
            </AccordionItem>
            
            <AccordionItem title="How does the billing system work?">
              <p className="mb-3 text-gray-300">
                The Nostr Ad Marketplace uses a shared wallet balance system rather than campaign-specific budgets:
              </p>
              <ul className="list-disc pl-5 mb-3 text-gray-300">
                <li>You fund your advertiser wallet using Bitcoin over Lightning Network</li>
                <li>Your wallet balance is used across all your campaigns</li>
                <li>Payments are deducted in real-time based on impressions and clicks</li>
                <li>Campaigns automatically pause if your wallet balance is insufficient</li>
                <li>You can set daily spending limits at the campaign level</li>
              </ul>
              <p className="text-gray-300">
                This system gives you flexibility to allocate your budget across multiple campaigns without needing to manage separate budgets.
              </p>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-blue-400">For Publishers</h2>
          <Accordion>
            <AccordionItem title="How do I monetize my content?">
              <p className="mb-3 text-gray-300">
                To monetize your content as a publisher:
              </p>
              <ol className="list-decimal pl-5 mb-3 text-gray-300">
                <li>Sign up and select the publisher role</li>
                <li>Create ad spaces on your platform</li>
                <li>Configure placement types and rules for each space</li>
                <li>Implement our SDK to display ads on your platform</li>
                <li>Review and approve incoming ad requests</li>
                <li>Monitor performance and earnings</li>
              </ol>
              <p className="text-gray-300">
                You can withdraw your earnings anytime via the Lightning Network.
              </p>
            </AccordionItem>
            
            <AccordionItem title="How do I control which ads appear on my platform?">
              <p className="mb-3 text-gray-300">
                Publishers maintain full control over which ads appear on their platforms through:
              </p>
              <ul className="list-disc pl-5 mb-3 text-gray-300">
                <li>Manual approval processes for all ads</li>
                <li>Blacklist/whitelist system for advertisers</li>
                <li>Content category filters</li>
                <li>Minimum bid requirements</li>
                <li>Custom rules configuration</li>
              </ul>
              <p className="text-gray-300">
                This ensures that only ads aligned with your content and values are displayed to your audience.
              </p>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-blue-400">Technical Questions</h2>
          <Accordion>
            <AccordionItem title="How does the Nostr integration work?">
              <p className="mb-3 text-gray-300">
                Our platform integrates with Nostr in several ways:
              </p>
              <ul className="list-disc pl-5 mb-3 text-gray-300">
                <li>Authentication via Nostr public keys (NIP-07)</li>
                <li>Ad delivery via Nostr events for native client integration</li>
                <li>Publisher verification through Nostr profiles</li>
                <li>Optional ad content signing for verification</li>
              </ul>
              <p className="text-gray-300">
                This deep integration with Nostr ensures a decentralized approach to digital advertising.
              </p>
            </AccordionItem>
            
            <AccordionItem title="How are payments processed?">
              <p className="mb-3 text-gray-300">
                All payments on the platform are processed using the Bitcoin Lightning Network:
              </p>
              <ul className="list-disc pl-5 mb-3 text-gray-300">
                <li>Advertisers fund their wallets via Lightning invoices</li>
                <li>Micropayments occur automatically for impressions and clicks</li>
                <li>Publishers can withdraw earnings via Lightning Network</li>
                <li>The system uses LNURL for simplified payment flows</li>
              </ul>
              <p className="text-gray-300">
                This enables instant, low-fee payments suitable for the micropayment model of digital advertising.
              </p>
            </AccordionItem>
            
            <AccordionItem title="Is there an API or SDK available?">
              <p className="mb-3 text-gray-300">
                Yes, we provide comprehensive tools for developers:
              </p>
              <ul className="list-disc pl-5 mb-3 text-gray-300">
                <li>JavaScript SDK for easy website integration</li>
                <li>RESTful API with OpenAPI/Swagger documentation</li>
                <li>Webhook support for event notifications</li>
                <li>Example integrations for common platforms</li>
              </ul>
              <p className="text-gray-300">
                Check out our <a href="/api-docs" className="text-orange-400 hover:text-orange-300 underline">API documentation</a> for detailed information.
              </p>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-blue-400">Support</h2>
          <Accordion>
            <AccordionItem title="How can I get support?">
              <p className="mb-3 text-gray-300">
                We offer several support channels:
              </p>
              <ul className="list-disc pl-5 mb-3 text-gray-300">
                <li>Email support at support@nostradmarketplace.com</li>
                <li>Community Discord server</li>
                <li>Documentation and knowledge base</li>
                <li>Tutorial videos and guides</li>
              </ul>
              <p className="text-gray-300">
                For business inquiries, please contact business@nostradmarketplace.com.
              </p>
            </AccordionItem>
            
            <AccordionItem title="Is there a waitlist to join?">
              <p className="mb-3 text-gray-300">
                Yes, we&apos;re currently onboarding users in phases to ensure platform stability and quality:
              </p>
              <ul className="list-disc pl-5 mb-3 text-gray-300">
                <li>Sign up for the waitlist on our homepage</li>
                <li>You&apos;ll receive an email when you&apos;re granted access</li>
                <li>Priority is given to active Nostr community members</li>
              </ul>
              <p className="text-gray-300">
                If you have a specific use case or large platform, contact us directly to discuss priority access.
              </p>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
};

FAQPage.getLayout = (page: ReactElement) => {
  return (
    <Layout
      title="FAQ - Nostr Ad Marketplace"
      description="Frequently Asked Questions about the Nostr Ad Marketplace"
    >
      {page}
    </Layout>
  );
};

export default FAQPage;