import { UserRole } from "@/types/role";
import React from 'react';
import Layout from '../components/Layout';
import '@/components/ui/Typography';

const PrivacyPolicy: React.FC = () => {
  return (
    <Layout title="Privacy Policy | Nostr Ad Marketplace">
      <div className="max-w-4xl mx-auto">
        <Title level={1}>Privacy Policy</Title>
        <p className="text-gray-500 mb-8">Last updated: May 7, 2025</p>

        <section className="mb-8">
          <Title level={2}>1. Introduction</Title>
          <Paragraph>
            Nostr Ad Marketplace ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
          </Paragraph>
          <Paragraph>
            We respect the decentralized and privacy-focused nature of the Nostr protocol and have designed our platform with privacy in mind. Please read this Privacy Policy carefully. By accessing or using the Service, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy.
          </Paragraph>
        </section>

        <section className="mb-8">
          <Title level={2}>2. Information We Collect</Title>
          <Paragraph>
            2.1. <strong>Information You Provide:</strong>
          </Paragraph>
          <ul className="list-disc pl-8 mb-4">
            <li>Nostr public key when you authenticate with our service</li>
            <li>Profile information you choose to share</li>
            <li>Content you create or upload, such as advertisements</li>
            <li>Communication and correspondence with us</li>
            <li>Payment information processed through the Lightning Network</li>
          </ul>
          
          <Paragraph>
            2.2. <strong>Information Automatically Collected:</strong>
          </Paragraph>
          <ul className="list-disc pl-8 mb-4">
            <li>Usage data, such as how you interact with our platform</li>
            <li>Device information, including browser type and operating system</li>
            <li>IP address and approximate location (country/region level only)</li>
            <li>Performance data and error reports</li>
          </ul>
          
          <Paragraph>
            2.3. <strong>Information from Third Parties:</strong>
          </Paragraph>
          <ul className="list-disc pl-8 mb-4">
            <li>Information from the Nostr network related to your public key</li>
            <li>Information from other users who interact with you through our platform</li>
          </ul>
        </section>

        <section className="mb-8">
          <Title level={2}>3. How We Use Your Information</Title>
          <Paragraph>
            We use the information we collect for the following purposes:
          </Paragraph>
          <ul className="list-disc pl-8 mb-4">
            <li>To provide, maintain, and improve our Service</li>
            <li>To process transactions and manage your account</li>
            <li>To match advertisers with publishers</li>
            <li>To track ad performance and calculate payments</li>
            <li>To communicate with you about your account or our Service</li>
            <li>To enforce our Terms of Service and other policies</li>
            <li>To detect, prevent, and address technical issues and security threats</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section className="mb-8">
          <Title level={2}>4. Data Security</Title>
          <Paragraph>
            We implement appropriate technical and organizational measures to protect your personal information from unauthorized access, loss, misuse, or alteration. However, no method of transmission over the Internet or electronic storage is 100% secure, so we cannot guarantee absolute security.
          </Paragraph>
          <Paragraph>
            We take advantage of the cryptographic security built into the Nostr protocol to enhance privacy and security of communications on our platform.
          </Paragraph>
        </section>

        <section className="mb-8">
          <Title level={2}>5. Data Sharing and Disclosure</Title>
          <Paragraph>
            We may share your information in the following circumstances:
          </Paragraph>
          <ul className="list-disc pl-8 mb-4">
            <li><strong>With Publishers and Advertisers:</strong> To facilitate ad placement and reporting</li>
            <li><strong>Service Providers:</strong> With third parties who perform services on our behalf</li>
            <li><strong>Legal Requirements:</strong> To comply with applicable laws, regulations, or legal processes</li>
            <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            <li><strong>With Your Consent:</strong> In other cases with your explicit consent</li>
          </ul>
          <Paragraph>
            Due to the nature of the Nostr protocol, information you share through the protocol may be publicly accessible on the Nostr network.
          </Paragraph>
        </section>

        <section className="mb-8">
          <Title level={2}>6. Your Rights and Choices</Title>
          <Paragraph>
            Depending on your location, you may have certain rights regarding your personal information, including:
          </Paragraph>
          <ul className="list-disc pl-8 mb-4">
            <li>Accessing and obtaining a copy of your data</li>
            <li>Rectifying inaccurate or incomplete information</li>
            <li>Deleting your personal information</li>
            <li>Restricting or objecting to processing of your information</li>
            <li>Data portability</li>
            <li>Withdrawing consent</li>
          </ul>
          <Paragraph>
            Please note that due to the decentralized nature of the Nostr protocol, we may not be able to delete information that has already been shared on the Nostr network.
          </Paragraph>
        </section>

        <section className="mb-8">
          <Title level={2}>7. Children's Privacy</Title>
          <Paragraph>
            Our Service is not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
          </Paragraph>
        </section>

        <section className="mb-8">
          <Title level={2}>8. International Data Transfers</Title>
          <Paragraph>
            Your information may be transferred to, stored, and processed in countries other than the one in which you reside. By using our Service, you consent to the transfer of information to countries that may have different data protection rules than your country.
          </Paragraph>
        </section>

        <section className="mb-8">
          <Title level={2}>9. Cookies and Tracking Technologies</Title>
          <Paragraph>
            We use cookies and similar tracking technologies to collect information about your browsing activity, remember your preferences, and improve your experience on our platform. You can control cookies through your browser settings and other tools.
          </Paragraph>
        </section>

        <section className="mb-8">
          <Title level={2}>10. Changes to This Privacy Policy</Title>
          <Paragraph>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
          </Paragraph>
        </section>

        <section className="mb-8">
          <Title level={2}>11. Contact Us</Title>
          <Paragraph>
            If you have any questions about this Privacy Policy, please contact us at:
          </Paragraph>
          <Paragraph>
            Email: privacy@nostr-ad-marketplace.com
          </Paragraph>
        </section>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;