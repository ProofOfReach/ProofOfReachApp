import React, { ReactNode } from 'react';
import Head from 'next/head';
import SimplifiedEnhancedSidebar from './SimplifiedEnhancedSidebar';

/**
 * Interface for ShadcnNavLayout props
 */
interface ShadcnNavLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  showSidebar?: boolean;
}

/**
 * Enhanced layout component using shadcn/ui styled navigation
 * This component provides a consistent layout structure for pages that need the enhanced navigation
 */
const ShadcnNavLayout: React.FC<ShadcnNavLayoutProps> = ({
  children,
  title = 'Nostr Ad Marketplace',
  description = 'A decentralized advertising platform built on Nostr',
  showSidebar = true,
}) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="flex h-screen overflow-hidden">
        {/* Navigation sidebar - only shown if showSidebar is true */}
        {showSidebar && <SimplifiedEnhancedSidebar />}

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto">
          <div className="container p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

/**
 * Helper function to create a page layout with the shadcn/ui navigation
 * This function is used in the getLayout property of pages
 */
export const getLayoutWithShadcnNav = (page: React.ReactElement, pageProps: any = {}) => {
  const { title, description, showSidebar } = pageProps;
  
  return (
    <ShadcnNavLayout 
      title={title} 
      description={description} 
      showSidebar={showSidebar !== false}
    >
      {page}
    </ShadcnNavLayout>
  );
};

export default ShadcnNavLayout;