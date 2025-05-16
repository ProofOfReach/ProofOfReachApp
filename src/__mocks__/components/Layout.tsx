import React, { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  hideTestBanner?: boolean;
}

// Mock Layout component that doesn't use TestModeBanner
const Layout = ({
  children,
  title = 'Nostr Ad Marketplace',
  description = 'A decentralized advertising marketplace built on Nostr protocol',
  hideTestBanner = false,
}: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header>
        <h1 data-testid="mock-title">{title}</h1>
        <meta data-testid="mock-description" content={description} />
      </header>
      
      {/* Skip TestModeBanner in tests */}
      
      <main className="flex-grow container mx-auto px-4 py-6" data-testid="layout-main">
        {children}
      </main>
      
      <footer data-testid="mock-footer">
        <div>© {new Date().getFullYear()} Nostr Ad Marketplace - Phase 1 MVP</div>
      </footer>
    </div>
  );
};

export default Layout;