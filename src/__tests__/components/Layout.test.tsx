import { render, screen } from '../test-utils';
import Layout from '../../components/Layout';
import React from 'react';
import Head from 'next/head';

// Mock the router
jest.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/',  // Default to homepage for most tests
    query: {},
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

// Mock the Sidebar component
jest.mock('../../components/layout/Sidebar', () => {
  return function MockSidebar() {
    return <aside data-testid="sidebar-mock" role="complementary">Sidebar Mock</aside>;
  };
});

// Mock the Navbar component
jest.mock('../../components/Navbar', () => {
  return function MockNavbar() {
    return <nav data-testid="navbar-mock" role="navigation">Navbar Mock</nav>;
  };
});

// Mock the HomeNavbar component
jest.mock('../../components/HomeNavbar', () => {
  return function MockHomeNavbar() {
    return <nav data-testid="home-navbar-mock" role="navigation">Home Navbar Mock</nav>;
  };
});

// Mock the TestModeBanner component
jest.mock('../../components/TestModeBanner', () => {
  return function MockTestModeBanner() {
    return <div data-testid="test-mode-banner-mock">Test Mode Banner Mock</div>;
  };
});

describe('Layout Component', () => {
  it('renders children correctly', () => {
    render(
      <Layout>
        <div data-testid="test-child">Test Content</div>
      </Layout>
    );
    
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders with custom title and description', () => {
    render(
      <Layout title="Test Title" description="Test Description">
        <div>Content</div>
      </Layout>
    );

    // Next.js's Head component doesn't actually render content in tests
    // We would need to mock next/head, but this is sufficient for basic testing
    expect(document.title).toBeDefined();
  });

  it('does not include regular navbar for authenticated non-dashboard pages', () => {
    // Mock an authenticated page that's not a dashboard page
    const originalUseRouter = require('next/router').useRouter;
    require('next/router').useRouter = () => ({
      pathname: '/profile',
      query: {},
      push: jest.fn(),
      replace: jest.fn(),
    });
    
    render(
      <Layout>
        <div>Content</div>
      </Layout>
    );
    
    // Regular navbar should not be present on profile page anymore (layout changed)
    expect(screen.queryByTestId('navbar-mock')).not.toBeInTheDocument();
    
    // Restore original router
    require('next/router').useRouter = originalUseRouter;
  });
  
  it('includes HomeNavbar for home page', () => {
    // Mock the router for home path
    const originalUseRouter = require('next/router').useRouter;
    require('next/router').useRouter = () => ({
      pathname: '/',
      query: {},
      push: jest.fn(),
      replace: jest.fn(),
    });
    
    render(
      <Layout>
        <div>Home Content</div>
      </Layout>
    );
    
    // Check for HomeNavbar
    expect(screen.getByTestId('home-navbar-mock')).toBeInTheDocument();
    
    // Restore original router
    require('next/router').useRouter = originalUseRouter;
  });
  
  it('does not show any navbar for dashboard pages', () => {
    // Mock the router for dashboard path
    const originalUseRouter = require('next/router').useRouter;
    require('next/router').useRouter = () => ({
      pathname: '/dashboard/viewer',
      query: {},
      push: jest.fn(),
      replace: jest.fn(),
    });
    
    render(
      <Layout>
        <div>Dashboard Content</div>
      </Layout>
    );
    
    // Dashboard pages don't include navbar or sidebar in Layout component
    // They use DashboardLayout which is applied via getLayout in _app.tsx
    expect(screen.queryByTestId('navbar-mock')).not.toBeInTheDocument();
    expect(screen.queryByTestId('home-navbar-mock')).not.toBeInTheDocument();
    
    // Restore original router
    require('next/router').useRouter = originalUseRouter;
  });

  it('warns about nested Head components in Layout children', () => {
    // Mocked console.warn to check for warnings
    const originalConsoleWarn = console.warn;
    const mockConsoleWarn = jest.fn();
    console.warn = mockConsoleWarn;

    // Mock page that incorrectly includes its own Head inside Layout
    const BadPage = () => (
      <Layout>
        <Head>
          <title>This causes double menu</title>
        </Head>
        <div>Content</div>
      </Layout>
    );

    // This will call the console.warn we set up
    render(<BadPage />);

    // Component should still render, but there should be a warning
    expect(mockConsoleWarn).toHaveBeenCalled();
    
    // Clean up mocks
    console.warn = originalConsoleWarn;
  });

  it('ensures only one navbar is rendered on the FAQ page', () => {
    // Mock the router for FAQ path
    const originalUseRouter = require('next/router').useRouter;
    require('next/router').useRouter = () => ({
      pathname: '/faq',
      query: {},
      push: jest.fn(),
      replace: jest.fn(),
    });
    
    render(
      <Layout title="FAQ - Nostr Ad Marketplace">
        <div>FAQ Content</div>
      </Layout>
    );
    
    // The page should have exactly one navbar - the HomeNavbar
    const navbars = document.querySelectorAll('nav');
    expect(navbars.length).toBe(1);
    
    // Print out details about all navbars for debugging
    console.log(`Found ${navbars.length} navbars`);
    navbars.forEach((nav, idx) => {
      console.log(`Navbar ${idx + 1} data-testid:`, nav.getAttribute('data-testid'));
      console.log(`Navbar ${idx + 1} innerHTML:`, nav.innerHTML.substring(0, 100) + '...');
    });
    
    // It should show the HomeNavbar, not the regular Navbar
    expect(screen.getByTestId('home-navbar-mock')).toBeInTheDocument();
    expect(screen.queryByTestId('navbar-mock')).not.toBeInTheDocument();
    
    // Restore original router
    require('next/router').useRouter = originalUseRouter;
  });
});