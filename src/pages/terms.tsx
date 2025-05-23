import React from 'react';
import Layout from '../components/Layout';
import.*./components/ui/Typography';

const TermsOfService: React.FC = () => {
  return (
    <Layout title="Terms of Service | Nostr Ad Marketplace">
      <div className="max-w-4xl mx-auto">
        <Typography.Title level={1}>Terms of Service</Typography.Title>
        <p className="text-gray-500 mb-8">Last updated: May 7, 2025</p>

        <section className="mb-8">
          <Typography.Title level={2}>1. Introduction</Typography.Title>
          <Typography.Paragraph>
            Welcome to Nostr Ad Marketplace. These Terms of Service govern your use of the Nostr Ad Marketplace platform, 
            including all related services, features, content, and functionality offered on or through nostr-ad-marketplace.com 
            (collectively, the "Service").
          </Typography.Paragraph>
          <Typography.Paragraph>
            By accessing or using the Service, you agree to be bound by these Terms. If you do not agree to these Terms, 
            you may not access or use the Service.
          </Typography.Paragraph>
        </section>

        <section className="mb-8">
          <Typography.Title level={2}>2. Definitions</Typography.Title>
          <Typography.Paragraph>
            <strong>"Advertiser"</strong> refers to any user who creates, manages, or pays for advertisements on the platform.
          </Typography.Paragraph>
          <Typography.Paragraph>
            <strong>"Publisher"</strong> refers to any user who displays advertisements on their website, application, or other digital property.
          </Typography.Paragraph>
          <Typography.Paragraph>
            <strong>"User"</strong> refers to any individual or entity that accesses or uses the Service, including Advertisers and Publishers.
          </Typography.Paragraph>
          <Typography.Paragraph>
            <strong>"Content"</strong> refers to any text, images, videos, audio, or other material that is uploaded, posted, or otherwise made available through the Service.
          </Typography.Paragraph>
        </section>

        <section className="mb-8">
          <Typography.Title level={2}>3. Account Registration and Requirements</Typography.Title>
          <Typography.Paragraph>
            To use certain features of the Service, you must register for an account. When you register, you agree to provide accurate and complete information. You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
          </Typography.Paragraph>
          <Typography.Paragraph>
            You must be at least 18 years of age to use the Service. By using the Service, you represent and warrant that you meet this requirement.
          </Typography.Paragraph>
        </section>

        <section className="mb-8">
          <Typography.Title level={2}>4. Payment Terms</Typography.Title>
          <Typography.Paragraph>
            4.1. <strong>Advertiser Payments:</strong> Advertisers agree to pay for all advertisements placed through the Service in accordance with the pricing terms specified at the time of ad creation. All payments are processed using the Lightning Network and are non-refundable unless otherwise specified.
          </Typography.Paragraph>
          <Typography.Paragraph>
            4.2. <strong>Publisher Earnings:</strong> Publishers will receive payments for displaying advertisements based on the terms agreed upon at the time of ad placement. Payments will be made via the Lightning Network.
          </Typography.Paragraph>
          <Typography.Paragraph>
            4.3. <strong>Fee Structure:</strong> Nostr Ad Marketplace may charge fees for the use of the Service. The fee structure will be clearly communicated to users and may be updated from time to time.
          </Typography.Paragraph>
        </section>

        <section className="mb-8">
          <Typography.Title level={2}>5. Content Guidelines</Typography.Title>
          <Typography.Paragraph>
            5.1. <strong>Prohibited Content:</strong> You agree not to use the Service to upload, post, or otherwise make available any Content that:
          </Typography.Paragraph>
          <ul className="list-disc pl-8 mb-4">
            <li>Is illegal, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable</li>
            <li>Infringes upon the intellectual property rights of others</li>
            <li>Contains software viruses or other harmful code</li>
            <li>Constitutes unauthorized advertising or spam</li>
            <li>Violates any applicable law, regulation, or obligation</li>
          </ul>
          <Typography.Paragraph>
            5.2. <strong>Content Moderation:</strong> Nostr Ad Marketplace reserves the right, but not the obligation, to monitor and review all Content. We may remove any Content that violates these Terms or is otherwise objectionable.
          </Typography.Paragraph>
        </section>

        <section className="mb-8">
          <Typography.Title level={2}>6. Intellectual Property</Typography.Title>
          <Typography.Paragraph>
            6.1. <strong>Ownership:</strong> The Service and its original content (excluding Content provided by users) are and will remain the exclusive property of Nostr Ad Marketplace and its licensors.
          </Typography.Paragraph>
          <Typography.Paragraph>
            6.2. <strong>License to User Content:</strong> By uploading, posting, or otherwise making Content available through the Service, you grant Nostr Ad Marketplace a non-exclusive, worldwide, royalty-free license to use, reproduce, modify, adapt, publish, translate, and distribute such Content in connection with providing the Service.
          </Typography.Paragraph>
        </section>

        <section className="mb-8">
          <Typography.Title level={2}>7. Disclaimer of Warranties</Typography.Title>
          <Typography.Paragraph>
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
          </Typography.Paragraph>
          <Typography.Paragraph>
            NOSTR AD MARKETPLACE DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED OR ERROR-FREE, THAT DEFECTS WILL BE CORRECTED, OR THAT THE SERVICE OR THE SERVERS THAT MAKE IT AVAILABLE ARE FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
          </Typography.Paragraph>
        </section>

        <section className="mb-8">
          <Typography.Title level={2}>8. Limitation of Liability</Typography.Title>
          <Typography.Paragraph>
            IN NO EVENT SHALL NOSTR AD MARKETPLACE, ITS OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS, BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICE.
          </Typography.Paragraph>
        </section>

        <section className="mb-8">
          <Typography.Title level={2}>9. Indemnification</Typography.Title>
          <Typography.Paragraph>
            You agree to defend, indemnify, and hold harmless Nostr Ad Marketplace and its officers, directors, employees, and agents, from and against any and all claims, damages, obligations, losses, liabilities, costs, or debt, and expenses (including but not limited to attorney's fees) arising from your use of the Service, your violation of these Terms, or your violation of any rights of a third party.
          </Typography.Paragraph>
        </section>

        <section className="mb-8">
          <Typography.Title level={2}>10. Modification of Terms</Typography.Title>
          <Typography.Paragraph>
            Nostr Ad Marketplace reserves the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
          </Typography.Paragraph>
        </section>

        <section className="mb-8">
          <Typography.Title level={2}>11. Governing Law</Typography.Title>
          <Typography.Paragraph>
            These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Nostr Ad Marketplace is established, without regard to its conflict of law provisions.
          </Typography.Paragraph>
        </section>

        <section className="mb-8">
          <Typography.Title level={2}>12. Contact Information</Typography.Title>
          <Typography.Paragraph>
            If you have any questions about these Terms, please contact us at support@nostr-ad-marketplace.com.
          </Typography.Paragraph>
        </section>
      </div>
    </Layout>
  );
};

export default TermsOfService;