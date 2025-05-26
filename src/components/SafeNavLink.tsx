/**
 * SafeNavLink - Error-safe navigation component
 * Prevents runtime errors from broken menu items
 */

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface SafeNavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const SafeNavLink: React.FC<SafeNavLinkProps> = ({ 
  href, 
  children, 
  className = '',
  onClick 
}) => {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    // Prevent navigation to broken routes
    if (href === '#' || href === '') {
      e.preventDefault();
      return;
    }

    // Handle external links
    if (href.startsWith('http')) {
      window.open(href, '_blank');
      e.preventDefault();
      return;
    }

    // Execute custom onClick if provided
    if (onClick) {
      onClick();
    }
  };

  // For hash links or empty hrefs, render as button
  if (href === '#' || href === '') {
    return (
      <button 
        className={className}
        onClick={onClick}
      >
        {children}
      </button>
    );
  }

  return (
    <Link href={href}>
      <span className={className} onClick={handleClick}>
        {children}
      </span>
    </Link>
  );
};