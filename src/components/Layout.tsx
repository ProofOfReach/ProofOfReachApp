import React, { ReactNode, useEffect, Children } from 'react';
import Head from 'next/head';
import Navbar from './Navbar';
import HomeNavbar from './HomeNavbar';
import AuthStatusBar from './auth/AuthStatusBar';
import DebugRoleEnabler from './DebugRoleEnabler';
import { TestModeBanner } from './TestModeBanner';
import HackathonBanner from './HackathonBanner';
import DomainToggleButton from './DomainToggleButton';
import { useRouter } from 'next/router';

/**
 * Conditionally check authentication only when needed
 * This prevents auth hook errors on public pages where auth context isn't available
 */
const useConditionalAuth = (isPublicPage: boolean) => {
  // Don't even attempt to use auth hooks on public pages
  if (isPublicPage) {
    return false;
  }
  
  // Only use auth hooks on protected pages and in non-test environments
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
    try {
      const { useIsAuthenticated } = require('../hooks/useHasRole');
      return useIsAuthenticated();
    } catch (error) {
      // Log as debug instead of error since this isn't critical on public pages
      console.debug('Auth hooks not available:', error);
      return false;
    }
  }
  
  // In test environment, return false
  return false;
};

type LayoutProps = {
  children: ReactNode;
  title?: string;
  description?: string;
  hideTestBanner?: boolean;
};

const Layout: React.FC<LayoutProps> = ({
  children,
  title = 'Proof Of Reach',
  description = 'A decentralized advertising marketplace built on Nostr protocol',
  hideTestBanner = false,
}) => {
  const router = useRouter();
  const isLoginPage = router.pathname === '/login';
  const isHomePage = router.pathname === '/';
  const isApiDocsPage = router.pathname === '/api-docs';
  const isFaqPage = router.pathname === '/faq';
  const isViewerPage = router.pathname === '/viewer';
  const isAdvertiserPage = router.pathname === '/advertiser';
  const isPublisherPage = router.pathname === '/publisher';
  const isHowItWorksPage = router.pathname === '/how-it-works';
  const isRolePage = isViewerPage || isAdvertiserPage || isPublisherPage || isHowItWorksPage;
  const isAuthPage = router.pathname.startsWith('/dashboard');
  const isPublicPage = isHomePage || isLoginPage || isApiDocsPage || isFaqPage || isRolePage;
  
  // Only attempt to check authentication on non-public pages to prevent console errors
  const isAuthenticated = useConditionalAuth(isPublicPage);
  
  // Check for nested Head components in development mode
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      const checkForNestedHead = (children: ReactNode) => {
        Children.forEach(children, (child: any) => {
          if (!child || typeof child !== 'object') return;
          
          // Check if this is a Head component
          if ('type' in child && child.type === Head) {
            console.warn(
              'Warning: Found a nested <Head> component inside Layout. ' +
              'This will cause duplicate elements and potentially UI issues. ' +
              'Instead, pass title and description props to the Layout component.'
            );
          }
          
          // Recursively check children
          if ('props' in child && 
              child.props && 
              child.props.children) {
            checkForNestedHead(child.props.children);
          }
        });
      };
      
      checkForNestedHead(children);
    }
  }, [children]);

  // Check if this is one of the test pages where we should skip layout elements
  const isTestPage = router.pathname === '/auth-test-simple' || 
                    router.pathname === '/auth-refactored-test';
  
  // Detect if we're on dev domain
  const [isDev, setIsDev] = React.useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const isDevDomain = hostname.startsWith('dev.') || 
                          hostname.includes('replit.dev') || 
                          process.env.NEXT_PUBLIC_ENABLE_DEV_BANNER === 'true';
      setIsDev(isDevDomain);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      {/* Hackathon Banner should show on all pages when on dev domain */}
      {isDev && <HackathonBanner isDev={true} />}

      {/* TestModeBanner should only show on authenticated/protected pages, NOT on login page */}
      {!hideTestBanner && !isPublicPage && !isLoginPage && <TestModeBanner />}
      
      {/* Domain toggle button for testing in Replit */}
      {process.env.NODE_ENV !== 'production' && <DomainToggleButton />}

      {/* Skip layout elements for test pages */}
      {!isTestPage && (
        <>
          {/* Auth status bar - shown only in auth pages or dashboard */}
          {isAuthPage && <AuthStatusBar />}

          {/* NAVBAR SECTION: Show navbar for specific pages */}
          {/* Show HomeNavbar for home page, role pages, API docs, and FAQ pages */}
          {(isHomePage || isApiDocsPage || isFaqPage || isRolePage) && <HomeNavbar />}
          
          {/* No regular Navbar needed since we use sidebar navigation in dashboard */}
        </>
      )}

      {/* Emergency Logout Button removed - regular logout is sufficient */}
      
      <main className="flex-grow container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Skip footer for test pages only */}
      {!isTestPage && (
        <footer className="bg-gray-100 dark:bg-gray-800 py-6">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <div className="flex items-center">
                  <img 
                    src="/logo_big_light.png" 
                    alt="Proof Of Reach Logo" 
                    className="h-auto w-[112px] mr-2 dark:invert" 
                  />
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    © {new Date().getFullYear()} - Phase 1 MVP
                  </p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                <div className="flex space-x-4">
                  <a
                    href="/terms"
                    className="text-sm text-gray-600 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400"
                  >
                    Terms of Service
                  </a>
                  <a
                    href="/privacy"
                    className="text-sm text-gray-600 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400"
                  >
                    Privacy Policy
                  </a>
                  <a
                    href="/faq"
                    className="text-sm text-gray-600 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400"
                  >
                    FAQ
                  </a>
                </div>
                <div className="flex space-x-4">
                  <a
                    href="https://github.com/nostr-protocol/nostr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-600 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400"
                  >
                    Nostr Protocol
                  </a>
                  <a
                    href="https://lightning.network/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-600 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400"
                  >
                    Lightning Network
                  </a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;
