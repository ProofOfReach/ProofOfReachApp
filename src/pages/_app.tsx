/**
 * Next.js App Component for Nostr Ad Marketplace
 * 
 * This is the main application wrapper that includes global providers, 
 * layouts, and initializers for the entire app.
 */

import type { AppProps } from 'next/app';
import { NextPage } from 'next';
import { ReactElement, ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ErrorProvider } from '@/context/ErrorContext';
import ErrorInitializer from '@/components/errors/ErrorInitializer';
import ErrorBoundary from '@/components/ErrorBoundary';
import { TestModeProvider } from '@/context/TestModeContext';
import { AuthProviderRefactored } from '@/providers/AuthProviderRefactored';
import { AuthContext as NostrAuthContext } from '@/hooks/useAuthRefactored';
import { queryClient } from '@/lib/queryClient';
import '@/styles/globals.css';

// Define types for pages with layouts
export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

/**
 * Custom App component with global providers and error handling
 */
export default function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  // Use the layout defined at the page level, or fall back to a default layout
  const getLayout = Component.getLayout || ((page) => page);

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <ErrorProvider>
          {/* Initialize error handling system */}
          <ErrorInitializer />
          
          {/* Wrap with Auth provider for access to authentication */}
          <AuthProviderRefactored>
            {/* Wrap with TestModeProvider for app-wide availability */}
            <TestModeProvider>
              {/* Apply page-specific layout */}
              {getLayout(<Component {...pageProps} />)}
            </TestModeProvider>
          </AuthProviderRefactored>
        </ErrorProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

// Export NostrAuthContext for pages that need it
export { NostrAuthContext };