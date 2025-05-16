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

// Mock the TestModeBanner component
jest.mock('../../components/TestModeBanner', () => {
  return function MockTestModeBanner() {
    return <div data-testid="test-mode-banner-mock">Test Mode Banner Mock</div>;
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

describe('Layout Component Navbar Tests', () => {
  // Reset mocks between tests
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  it('includes HomeNavbar for home page and not regular navbar', () => {
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
    
    // Check for HomeNavbar and ensure no regular navbar
    expect(screen.getByTestId('home-navbar-mock')).toBeInTheDocument();
    expect(screen.queryByTestId('navbar-mock')).not.toBeInTheDocument();
    
    // Restore original router
    require('next/router').useRouter = originalUseRouter;
  });
  
  it('includes HomeNavbar for FAQ page and not regular navbar', () => {
    // Mock the router for FAQ path
    const originalUseRouter = require('next/router').useRouter;
    require('next/router').useRouter = () => ({
      pathname: '/faq',
      query: {},
      push: jest.fn(),
      replace: jest.fn(),
    });
    
    render(
      <Layout>
        <div>FAQ Content</div>
      </Layout>
    );
    
    // Check for HomeNavbar and ensure no regular navbar
    expect(screen.getByTestId('home-navbar-mock')).toBeInTheDocument();
    expect(screen.queryByTestId('navbar-mock')).not.toBeInTheDocument();
    
    // Restore original router
    require('next/router').useRouter = originalUseRouter;
  });
  
  it('includes HomeNavbar for API docs page and not regular navbar', () => {
    // Mock the router for API docs path
    const originalUseRouter = require('next/router').useRouter;
    require('next/router').useRouter = () => ({
      pathname: '/api-docs',
      query: {},
      push: jest.fn(),
      replace: jest.fn(),
    });
    
    render(
      <Layout>
        <div>API Docs Content</div>
      </Layout>
    );
    
    // Check for HomeNavbar and ensure no regular navbar
    expect(screen.getByTestId('home-navbar-mock')).toBeInTheDocument();
    expect(screen.queryByTestId('navbar-mock')).not.toBeInTheDocument();
    
    // Restore original router
    require('next/router').useRouter = originalUseRouter;
  });
  
  it('renders no duplicate navbars for any page', () => {
    // Test various routes
    const routes = ['/', '/faq', '/api-docs', '/dashboard', '/login', '/profile'];
    
    routes.forEach((pathname) => {
      // Mock the router for this path
      const originalUseRouter = require('next/router').useRouter;
      require('next/router').useRouter = () => ({
        pathname,
        query: {},
        push: jest.fn(),
        replace: jest.fn(),
      });
      
      const { container } = render(
        <Layout>
          <div>Content for {pathname}</div>
        </Layout>
      );
      
      // Check if we have at most one navigation element
      const navElements = container.querySelectorAll('nav');
      expect(navElements.length).toBeLessThanOrEqual(1);
      
      // Log navigation elements for debugging
      navElements.forEach((nav, idx) => {
        console.log(`Navbar ${idx + 1} data-testid:`, nav.getAttribute('data-testid'));
        console.log(`Navbar ${idx + 1} innerHTML:`, nav.innerHTML.substring(0, 100) + '...');
      });
      
      // Cleanup
      require('next/router').useRouter = originalUseRouter;
    });
  });
});