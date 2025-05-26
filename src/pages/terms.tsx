import React from 'react';
import Layout from '../components/Layout';

const TermsOfService: React.FC = () => {
  return (
    <Layout title="Terms of Service | Nostr Ad Marketplace">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        <p className="text-gray-500 mb-8">Last updated: May 7, 2025</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p className="mb-4">
            Welcome to Nostr Ad Marketplace. These Terms of Service govern your use of the Nostr Ad Marketplace platform, 
            including all related services, features, content, and functionality offered on or through nostr-ad-marketplace.com 
            (collectively, the "Service").
          </p>
          <p className="mb-4">
            By accessing or using the Service, you agree to be bound by these Terms. If you do not agree to these Terms, 
            you may not access or use the Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Definitions</h2>
          <p className="mb-4">
            <strong>"Advertiser"</strong> refers to any user who creates, manages, or pays for advertisements on the platform.
          </p>
          <p className="mb-4">
            <strong>"Publisher"</strong> refers to any user who displays advertisements on their website, application, or other digital property.
          </p>
          <p className="mb-4">
            <strong>"User"</strong> refers to any individual or entity that accesses or uses the Service, including Advertisers and Publishers.
          </p>
          <p className="mb-4">
            <strong>"Content"</strong> refers to any text, images, videos, audio, or other material that is uploaded, posted, or otherwise made available through the Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Account Registration and Requirements</h2>
          <p className="mb-4">
            To use certain features of the Service, you must register for an account. When you register, you agree to provide accurate and complete information. You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
          </p>
          <p className="mb-4">
            You must be at least 18 years of age to use the Service. By using the Service, you represent and warrant that you meet this requirement.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. User Responsibilities</h2>
          <p className="mb-4">
            As a user of the Service, you agree to use the platform responsibly and in compliance with all applicable laws and regulations. You are prohibited from using the Service for any illegal, harmful, or fraudulent activities.
          </p>
          <p className="mb-4">
            You agree not to upload, post, or transmit any content that is defamatory, obscene, offensive, or violates the rights of others.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Advertiser Terms</h2>
          <p className="mb-4">
            Advertisers are responsible for the content of their advertisements and must ensure compliance with all applicable advertising laws and regulations.
          </p>
          <p className="mb-4">
            All advertisement content must be truthful, not misleading, and comply with our content guidelines.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Publisher Terms</h2>
          <p className="mb-4">
            Publishers must have the right to display advertisements on their platforms and must comply with our publisher guidelines.
          </p>
          <p className="mb-4">
            Publishers are responsible for ensuring that advertisement placement complies with applicable laws in their jurisdiction.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Payment Terms</h2>
          <p className="mb-4">
            All payments on the platform are processed using Bitcoin Lightning Network. Users are responsible for understanding and complying with cryptocurrency regulations in their jurisdiction.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Privacy and Data Protection</h2>
          <p className="mb-4">
            Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
          <p className="mb-4">
            To the maximum extent permitted by law, Nostr Ad Marketplace shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Changes to Terms</h2>
          <p className="mb-4">
            We may update these Terms from time to time. We will notify users of any material changes and the updated Terms will be effective upon posting.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. Contact Information</h2>
          <p className="mb-4">
            If you have any questions about these Terms of Service, please contact us through our support channels.
          </p>
        </section>
      </div>
    </Layout>
  );
};

export default TermsOfService;