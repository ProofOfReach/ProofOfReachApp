import { UserRole } from "@/types/role";
import React from 'react';
import Layout from '../components/Layout';
// import '@/components/ui/Typography';

const PrivacyPolicy: React.FC = () => {
  return (
    <Layout title="Privacy Policy | Nostr Ad Marketplace">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-gray-500 mb-8">Last updated: May 7, 2025</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
          <p className="mb-4 text-gray-700">
            Nostr Ad Marketplace ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
          </p>
          <p className="mb-4 text-gray-700">
            We respect the decentralized and privacy-focused nature of the Nostr protocol and have designed our platform with privacy in mind. Please read this Privacy Policy carefully. By accessing or using the Service, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
          <p className="mb-4 text-gray-700">
            2.1. <strong>Information You Provide:</strong>
          </p>
          <ul className="list-disc pl-8 mb-4">
            <li>Nostr public key when you authenticate with our service</li>
            <li>Profile information you choose to share</li>
            <li>Content you create or upload, such as advertisements</li>
            <li>Communication and correspondence with us</li>
            <li>Payment information processed through the Lightning Network</li>
          </ul>
          
          <p className="mb-4 text-gray-700">
            2.2. <strong>Information Automatically Collected:</strong>
          </p>
          <ul className="list-disc pl-8 mb-4">
            <li>Usage data, such as how you interact with our platform</li>
            <li>Device information, including browser type and operating system</li>
            <li>IP address and approximate location (country/region level only)</li>
            <li>Performance data and error reports</li>
          </ul>
          
          <p className="mb-4 text-gray-700">
            2.3. <strong>Information from Third Parties:</strong>
          </p>
          <ul className="list-disc pl-8 mb-4">
            <li>Information from the Nostr network related to your public key</li>
            <li>Information from other users who interact with you through our platform</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
          <p className="mb-4 text-gray-700">
            We use the information we collect for the following purposes:
          </p>
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
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
          <p className="mb-4 text-gray-700">
            We implement appropriate technical and organizational measures to protect your personal information from unauthorized access, loss, misuse, or alteration. However, no method of transmission over the Internet or electronic storage is 100% secure, so we cannot guarantee absolute security.
          </p>
          <p className="mb-4 text-gray-700">
            We take advantage of the cryptographic security built into the Nostr protocol to enhance privacy and security of communications on our platform.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Sharing and Disclosure</h2>
          <p className="mb-4 text-gray-700">
            We may share your information in the following circumstances:
          </p>
          <ul className="list-disc pl-8 mb-4">
            <li><strong>With Publishers and Advertisers:</strong> To facilitate ad placement and reporting</li>
            <li><strong>Service Providers:</strong> With third parties who perform services on our behalf</li>
            <li><strong>Legal Requirements:</strong> To comply with applicable laws, regulations, or legal processes</li>
            <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            <li><strong>With Your Consent:</strong> In other cases with your explicit consent</li>
          </ul>
          <p className="mb-4 text-gray-700">
            Due to the nature of the Nostr protocol, information you share through the protocol may be publicly accessible on the Nostr network.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights and Choices</h2>
          <p className="mb-4 text-gray-700">
            Depending on your location, you may have certain rights regarding your personal information, including:
          </p>
          <ul className="list-disc pl-8 mb-4">
            <li>Accessing and obtaining a copy of your data</li>
            <li>Rectifying inaccurate or incomplete information</li>
            <li>Deleting your personal information</li>
            <li>Restricting or objecting to processing of your information</li>
            <li>Data portability</li>
            <li>Withdrawing consent</li>
          </ul>
          <p className="mb-4 text-gray-700">
            Please note that due to the decentralized nature of the Nostr protocol, we may not be able to delete information that has already been shared on the Nostr network.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Children's Privacy</h2>
          <p className="mb-4 text-gray-700">
            Our Service is not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. International Data Transfers</h2>
          <p className="mb-4 text-gray-700">
            Your information may be transferred to, stored, and processed in countries other than the one in which you reside. By using our Service, you consent to the transfer of information to countries that may have different data protection rules than your country.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Cookies and Tracking Technologies</h2>
          <p className="mb-4 text-gray-700">
            We use cookies and similar tracking technologies to collect information about your browsing activity, remember your preferences, and improve your experience on our platform. You can control cookies through your browser settings and other tools.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to This Privacy Policy</h2>
          <p className="mb-4 text-gray-700">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Us</h2>
          <p className="mb-4 text-gray-700">
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <p className="mb-4 text-gray-700">
            Email: privacy@nostr-ad-marketplace.com
          </p>
        </section>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;