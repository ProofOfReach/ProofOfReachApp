import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Menu, X, Activity } from 'react-feather';
import { useAuth } from '../hooks/useAuth';
import ProfileAvatar from './ProfileAvatar';
import ForceLogoutButton from './ForceLogoutButton';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { auth, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Clear test mode storage if applicable
      if (auth?.isTestMode && typeof window !== 'undefined') {
        localStorage.removeItem('nostr_test_npub');
        localStorage.removeItem('nostr_test_nsec');
      }
      
      // Use the logout function from the auth context
      await logout();
      
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const renderProfileAvatar = () => {
    if (!auth?.pubkey) return null;
    
    return (
      <Link 
        href="/dashboard/user" 
        className="px-2 py-1 flex items-center"
        title="User Settings"
        data-testid="user-profile-link"
      >
        <ProfileAvatar pubkey={auth.pubkey} size="sm" />
        {auth.isTestMode && (
          <span className="ml-1 text-xs text-yellow-600 dark:text-yellow-400">
            Test Mode
          </span>
        )}
      </Link>
    );
  };

  return (
    <nav className="bg-white shadow-md dark:bg-gray-800" data-testid="regular-navbar">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="hidden sm:flex items-center">
              <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                Nostr Ad Marketplace
              </span>
            </Link>
            <Link href="/" className="sm:hidden flex items-center">
              <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                NostrAds
              </span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            <Link href="/dashboard" className="px-2 lg:px-3 py-2 text-sm lg:text-base text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400">
              Dashboard
            </Link>
            <Link href="/dashboard/advertiser" className="px-2 lg:px-3 py-2 text-sm lg:text-base text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400">
              Advertiser
            </Link>
            <Link href="/dashboard/publisher" className="px-2 lg:px-3 py-2 text-sm lg:text-base text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400">
              Publisher
            </Link>
            <Link href="/dashboard/wallet" className="px-2 lg:px-3 py-2 text-sm lg:text-base text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400">
              Wallet
            </Link>
            <Link href="/nostr-feed" className="px-2 lg:px-3 py-2 text-sm lg:text-base text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400 flex items-center">
              <Activity size={16} className="mr-1" />
              Nostr Feed
            </Link>
            {renderProfileAvatar()}
            <ForceLogoutButton 
              className="px-2 lg:px-3 py-1 bg-red-500 text-white text-sm lg:text-base rounded-md hover:bg-red-600 transition-colors"
              buttonText="Logout"
            />
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
        <div className="md:hidden bg-white dark:bg-gray-800 shadow-md" data-testid="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link href="/dashboard" onClick={closeMenu} className="block px-3 py-2 text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400">
              Dashboard
            </Link>
            <Link href="/dashboard/advertiser" onClick={closeMenu} className="block px-3 py-2 text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400">
              Advertiser
            </Link>
            <Link href="/dashboard/publisher" onClick={closeMenu} className="block px-3 py-2 text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400">
              Publisher
            </Link>
            <Link href="/dashboard/wallet" onClick={closeMenu} className="block px-3 py-2 text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400">
              Wallet
            </Link>
            <Link href="/nostr-feed" onClick={closeMenu} className="block px-3 py-2 text-gray-700 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400 flex items-center">
              <Activity size={16} className="mr-1" />
              Nostr Feed
            </Link>
            {renderProfileAvatar()}
            <ForceLogoutButton
              className="w-full text-left px-3 py-2 text-red-500 hover:text-red-600 transition-colors"
              buttonText="Logout"
            />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;