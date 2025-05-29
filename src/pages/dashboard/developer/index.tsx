import React from 'react';
import EnhancedDashboardLayout from '@/components/layout/EnhancedDashboardLayout';
import { Title, Paragraph } from '@/components/ui/Typography';
import { Card } from '@/components/ui/card';
import { Book, Code, FileText, Key } from 'react-feather';
import Link from 'next/link';

const DeveloperDashboardPage = () => {
  const developerTools = [
    {
      title: 'API Keys',
      icon: <Key className="w-6 h-6 text-blue-600 dark:text-blue-400" />,
      description: 'Create and manage API keys to authenticate your applications with the Nostr Ad Marketplace API.',
      link: '/dashboard/developer/api-keys',
      buttonText: 'Manage API Keys',
    },
    {
      title: 'API Documentation',
      icon: <Book className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />,
      description: 'Explore our API documentation to learn how to integrate with the Nostr Ad Marketplace platform.',
      link: '/api-docs',
      buttonText: 'View API Docs',
    },
    {
      title: 'Usage Statistics',
      icon: <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />,
      description: 'View your API usage statistics and monitor your application\'s performance.',
      link: '/dashboard/developer/usage',
      buttonText: 'View Usage Stats',
      disabled: true, // Coming soon feature
    },
    {
      title: 'SDK & Code Examples',
      icon: <Code className="w-6 h-6 text-purple-600 dark:text-purple-400" />,
      description: 'Get started quickly with our JavaScript SDK and code examples for integrating with the platform.',
      link: '/dashboard/developer/sdk-examples',
      buttonText: 'View Examples',
      disabled: false, 
    },
  ];

  const integrationSteps = [
    {
      title: 'Create an API Key',
      description: 'Generate a secure API key with the appropriate permissions for your integration.',
    },
    {
      title: 'Install the SDK',
      description: 'Use npm or yarn to install our JavaScript SDK in your project.',
      code: 'npm install @nostr-ad-marketplace/sdk',
    },
    {
      title: 'Initialize the SDK',
      description: 'Configure the SDK with your API key and start making requests.',
      code: `import { NostrAdMarketplaceSDK } from '@nostr-ad-marketplace/sdk';

const sdk = new NostrAdMarketplaceSDK({ 
  apiKey: 'your-api-key',
  debug: true 
});`,
    },
    {
      title: 'Serve Ads in Your Application',
      description: 'Use the SDK to request and display relevant ads in your application.',
      code: `// Request an ad
const ad = await sdk.serveAd({
  placement: 'sidebar',
  pubkey: 'your-nostr-pubkey',
  interests: ['bitcoin', 'lightning']
});

// Track ad clicks
sdk.trackClick({ adId: ad.id });`,
    },
  ];

  return (
    <EnhancedDashboardLayout title="Developer Dashboard">
      <div className="space-y-6">
        <div>
          <Title level={1}>Developer Tools</Title>
          <Paragraph className="text-gray-500 dark:text-gray-400">
            Build integrations with the Nostr Ad Marketplace platform using our developer tools and APIs.
            Create API keys, explore documentation, and monitor your usage all in one place.
          </Paragraph>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {developerTools.map((tool, index) => (
            <Card key={index}>
              <div className="p-6">
                <div className="flex items-start">
                  <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mr-4">
                    {tool.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{tool.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{tool.description}</p>
                    <div className="mt-4">
                      {tool.disabled ? (
                        <button 
                          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-md cursor-not-allowed"
                          disabled
                        >
                          Coming Soon
                        </button>
                      ) : (
                        <Link href={tool.link}>
                          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors">
                            {tool.buttonText}
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Start Integration Guide</h2>
            <div className="space-y-6">
              {integrationSteps.map((step, index) => (
                <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-0 last:pb-0">
                  <div className="flex mb-2">
                    <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 font-medium h-6 w-6 rounded-full flex items-center justify-center text-sm mr-2">
                      {index + 1}
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{step.title}</h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">{step.description}</p>
                  {step.code && (
                    <div className="bg-gray-800 text-gray-200 p-4 rounded-md overflow-x-auto text-sm font-mono">
                      <pre>{step.code}</pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Recent API Activity</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Timestamp</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Endpoint</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">API Key</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">May 8, 2023 09:45 AM</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">GET /api/serve-ad</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded text-xs font-medium">200 OK</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">API_KEY_XXXX</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">May 8, 2023 09:30 AM</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">POST /api/track-click</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded text-xs font-medium">200 OK</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">API_KEY_XXXX</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">May 8, 2023 09:15 AM</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">GET /api/publisher-stats</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded text-xs font-medium">401 Unauthorized</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">API_KEY_YYYY</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-right">
              <button className="px-4 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                View All API Activity
              </button>
            </div>
          </div>
        </Card>
      </div>
    </EnhancedDashboardLayout>
  );
};

export default DeveloperDashboardPage;