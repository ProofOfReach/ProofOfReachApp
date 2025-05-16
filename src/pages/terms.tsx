import React from 'react';
import Layout from '../components/Layout';
import { Typography } from '../components/ui';

const { Title, Paragraph } = Typography;

const TermsOfService: React.FC = () => {
  return (
    <Layout title="Terms of Service | Nostr Ad Marketplace">
      <div className="max-w-4xl mx-auto">
        <Title level={1}>Terms of Service</Title>
        <p className="text-gray-500 mb-8">Last updated: May 7, 2025</p>

        <section className="mb-8">
          <Title level={2}>1. Introduction</Title>
          <Paragraph>
            Welcome to Nostr Ad Marketplace. These Terms of Service govern your use of the Nostr Ad Marketplace platform, 
            including all related services, features, content, and functionality offered on or through nostr-ad-marketplace.com 
            (collectively, the "Service").
          </Paragraph>
          <Paragraph>
            By accessing or using the Service, you agree to be bound by these Terms. If you do not agree to these Terms, 
            you may not access or use the Service.
          </Paragraph>
        </section>

        <section className="mb-8">
          <Title level={2}>2. Definitions</Title>
          <Paragraph>
            <strong>"Advertiser"</strong> refers to any user who creates, manages, or pays for advertisements on the platform.
          </Paragraph>
          <Paragraph>
            <strong>"Publisher"</strong> refers to any user who displays advertisements on their website, application, or other digital property.
          </Paragraph>
          <Paragraph>
            <strong>"User"</strong> refers to any individual or entity that accesses or uses the Service, including Advertisers and Publishers.
          </Paragraph>
          <Paragraph>
            <strong>"Content"</strong> refers to any text, images, videos, audio, or other material that is uploaded, posted, or otherwise made available through the Service.
          </Paragraph>
        </section>

        <section className="mb-8">
          <Title level={2}>3. Account Registration and Requirements</Title>
          <Paragraph>
            To use certain features of the Service, you must register for an account. When you register, you agree to provide accurate and complete information. You are solely responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
          </Paragraph>
          <Paragraph>
            You must be at least 18 years of age to use the Service. By using the Service, you represent and warrant that you meet this requirement.
          </Paragraph>
        </section>

        <section className="mb-8">
          <Title level={2}>4. Payment Terms</Title>
          <Paragraph>
            4.1. <strong>Advertiser Payments:</strong> Advertisers agree to pay for all advertisements placed through the Service in accordance with the pricing terms specified at the time of ad creation. All payments are processed using the Lightning Network and are non-refundable unless otherwise specified.
          </Paragraph>
          <Paragraph>
            4.2. <strong>Publisher Earnings:</strong> Publishers will receive payments for displaying advertisements based on the terms agreed upon at the time of ad placement. Payments will be made via the Lightning Network.
          </Paragraph>
          <Paragraph>
            4.3. <strong>Fee Structure:</strong> Nostr Ad Marketplace may charge fees for the use of the Service. The fee structure will be clearly communicated to users and may be updated from time to time.
          </Paragraph>
        </section>

        <section className="mb-8">
          <Title level={2}>5. Content Guidelines</Title>
          <Paragraph>
            5.1. <strong>Prohibited Content:</strong> You agree not to use the Service to upload, post, or otherwise make available any Content that:
          </Paragraph>
          <ul className="list-disc pl-8 mb-4">
            <li>Is illegal, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable</li>
            <li>Infringes upon the intellectual property rights of others</li>
            <li>Contains software viruses or other harmful code</li>
            <li>Constitutes unauthorized advertising or spam</li>
            <li>Violates any applicable law, regulation, or obligation</li>
          </ul>
          <Paragraph>
            5.2. <strong>Content Moderation:</strong> Nostr Ad Marketplace reserves the right, but not the obligation, to monitor and review all Content. We may remove any Content that violates these Terms or is otherwise objectionable.
          </Paragraph>
        </section>

        <section className="mb-8">
          <Title level={2}>6. Intellectual Property</Title>
          <Paragraph>
            6.1. <strong>Ownership:</strong> The Service and its original content (excluding Content provided by users) are and will remain the exclusive property of Nostr Ad Marketplace and its licensors.
          </Paragraph>
          <Paragraph>
            6.2. <strong>License to User Content:</strong> By uploading, posting, or otherwise making Content available through the Service, you grant Nostr Ad Marketplace a non-exclusive, worldwide, royalty-free license to use, reproduce, modify, adapt, publish, translate, and distribute such Content in connection with providing the Service.
          </Paragraph>
        </section>

        <section className="mb-8">
          <Title level={2}>7. Disclaimer of Warranties</Title>
          <Paragraph>
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
          </Paragraph>
          <Paragraph>
            NOSTR AD MARKETPLACE DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED OR ERROR-FREE, THAT DEFECTS WILL BE CORRECTED, OR THAT THE SERVICE OR THE SERVERS THAT MAKE IT AVAILABLE ARE FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
          </Paragraph>
        </section>

        <section className="mb-8">
          <Title level={2}>8. Limitation of Liability</Title>
          <Paragraph>
            IN NO EVENT SHALL NOSTR AD MARKETPLACE, ITS OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS, BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICE.
          </Paragraph>
        </section>

        <section className="mb-8">
          <Title level={2}>9. Indemnification</Title>
          <Paragraph>
            You agree to defend, indemnify, and hold harmless Nostr Ad Marketplace and its officers, directors, employees, and agents, from and against any and all claims, damages, obligations, losses, liabilities, costs, or debt, and expenses (including but not limited to attorney's fees) arising from your use of the Service, your violation of these Terms, or your violation of any rights of a third party.
          </Paragraph>
        </section>

        <section className="mb-8">
          <Title level={2}>10. Modification of Terms</Title>
          <Paragraph>
            Nostr Ad Marketplace reserves the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
          </Paragraph>
        </section>

        <section className="mb-8">
          <Title level={2}>11. Governing Law</Title>
          <Paragraph>
            These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Nostr Ad Marketplace is established, without regard to its conflict of law provisions.
          </Paragraph>
        </section>

        <section className="mb-8">
          <Title level={2}>12. Contact Information</Title>
          <Paragraph>
            If you have any questions about these Terms, please contact us at support@nostr-ad-marketplace.com.
          </Paragraph>
        </section>
      </div>
    </Layout>
  );
};

export default TermsOfService;