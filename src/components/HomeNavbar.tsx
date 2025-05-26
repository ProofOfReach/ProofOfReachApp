import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'react-feather';

const HomeNavbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDev, setIsDev] = useState(false);
  
  // Check if we're in dev mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // First priority: Check for production environment variable
      if (process.env.NEXT_PUBLIC_IS_PRODUCTION === 'true') {
        setIsDev(false);
        return;
      }
      
      const hostname = window.location.hostname;
      const simulateDev = localStorage.getItem('SIMULATE_DEV_DOMAIN');
      
      // Default to development mode for Replit and local development
      const isDevDomain = hostname.includes('replit.dev') || 
                         hostname.includes('localhost') ||
                         hostname.startsWith('dev.') ||
                         simulateDev === 'true' ||
                         simulateDev === null || // Default to dev if not explicitly set
                         process.env.NEXT_PUBLIC_ENABLE_DEV_BANNER === 'true';
      
      setIsDev(isDevDomain);
    }
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-md dark:bg-gray-800" data-testid="home-navbar">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <Image 
                src="/logo_big_light.png" 
                alt="Proof Of Reach Logo" 
                width={112} 
                height={37} 
                className="h-auto w-auto"
                priority
              />
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {/* Role-specific pages */}
            <Link 
              href="/viewer" 
              className="px-2 lg:px-3 py-2 text-sm lg:text-base text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400"
            >
              Viewers
            </Link>
            <Link 
              href="/publisher" 
              className="px-2 lg:px-3 py-2 text-sm lg:text-base text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400"
            >
              Publishers
            </Link>
            <Link 
              href="/advertiser" 
              className="px-2 lg:px-3 py-2 text-sm lg:text-base text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400"
            >
              Advertisers
            </Link>
            
            {/* Information pages */}
            <Link 
              href="/how-it-works" 
              className="px-2 lg:px-3 py-2 text-sm lg:text-base text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400"
            >
              About
            </Link>
            <Link 
              href="/faq" 
              className="px-2 lg:px-3 py-2 text-sm lg:text-base text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400"
            >
              FAQ
            </Link>
            <Link 
              href="/contact" 
              className="px-2 lg:px-3 py-2 text-sm lg:text-base text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400"
            >
              Contact
            </Link>
            <Link 
              href="/login" 
              className="px-4 py-2 bg-purple-600 text-white text-sm lg:text-base rounded-md hover:bg-purple-700 transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-gray-600 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400 focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 shadow-md">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* Role-specific pages for mobile */}
            <Link 
              href="/viewer" 
              onClick={closeMenu} 
              className="block px-3 py-2 text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400"
            >
              Viewers
            </Link>
            <Link 
              href="/publisher" 
              onClick={closeMenu} 
              className="block px-3 py-2 text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400"
            >
              Publishers
            </Link>
            <Link 
              href="/advertiser" 
              onClick={closeMenu} 
              className="block px-3 py-2 text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400"
            >
              Advertisers
            </Link>
            
            {/* Information pages for mobile */}
            <Link 
              href="/how-it-works" 
              onClick={closeMenu} 
              className="block px-3 py-2 text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400"
            >
              About
            </Link>
            <Link 
              href="/faq" 
              onClick={closeMenu} 
              className="block px-3 py-2 text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400"
            >
              FAQ
            </Link>
            <Link 
              href="/api-docs" 
              onClick={closeMenu} 
              className="block px-3 py-2 text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400"
            >
              API
            </Link>
            <Link 
              href="/contact" 
              onClick={closeMenu} 
              className="block px-3 py-2 text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400"
            >
              Contact
            </Link>
            <Link 
              href="/login" 
              onClick={closeMenu} 
              className="block px-3 py-2 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-500 font-medium"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default HomeNavbar;