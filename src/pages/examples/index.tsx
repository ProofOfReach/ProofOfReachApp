import { UserRole } from "@/types/role";
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowRight, Cpu, Layers, Layout, Box, FileText } from 'react-feather';
import '@/components/ui/Button';

/**
 * Examples index page showcasing the different shadcn/ui examples available
 */
const ExamplesIndex = () => {
  // List of available examples
  const examples = [
    {
      title: 'Form Components',
      description: 'Example of form components built with shadcn/ui design patterns',
      icon: <FileText className="w-6 h-6 text-purple-500" />,
      href: '/examples/shadcn-components'
    },
    {
      title: 'Enhanced Navigation',
      description: 'Responsive sidebar navigation with role-based menu items',
      icon: <Layout className="w-6 h-6 text-purple-500" />,
      href: '/examples/navigation-example'
    },
    {
      title: 'UI Components',
      description: 'Collection of common UI components with shadcn/ui styling',
      icon: <Box className="w-6 h-6 text-purple-500" />,
      href: '/examples/shadcn-components?tab=buttons'
    },
    {
      title: 'Data Table',
      description: 'Interactive data table with search, sorting, and filtering capabilities',
      icon: <Box className="w-6 h-6 text-purple-500" />,
      href: '/examples/data-table-example'
    }
  ];

  return (
    <>
      <Head>
        <title>shadcn/ui Examples - Nostr Ad Marketplace</title>
      </Head>
      
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-2 text-center">
          shadcn/ui Examples
        </h1>
        <p className="text-center mb-10 max-w-2xl mx-auto text-gray-600 dark:text-gray-400">
          This section contains examples of components built using shadcn/ui design patterns.
          Use these examples as reference when building new features for the Nostr Ad Marketplace.
        </p>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {examples.map((example, index) => (
            <div 
              key={index}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="mb-4">
                  {example.icon}
                </div>
                <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
                  {example.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {example.description}
                </p>
                <Link href={example.href} passHref>
                  <Button variant="default" className="w-full">
                    View Example
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
            Implementation Resources
          </h2>
          <div className="max-w-xl mx-auto grid md:grid-cols-2 gap-4">
            <a 
              href="https://ui.shadcn.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
            >
              <Layers className="w-6 h-6 text-purple-500 mb-2 mx-auto" />
              <h3 className="text-lg font-medium mb-1">shadcn/ui Documentation</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Reference documentation for shadcn/ui components
              </p>
            </a>
            <a 
              href="https://tailwindcss.com/docs" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
            >
              <Cpu className="w-6 h-6 text-purple-500 mb-2 mx-auto" />
              <h3 className="text-lg font-medium mb-1">Tailwind CSS</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Utility-first CSS framework used by shadcn/ui
              </p>
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default ExamplesIndex;