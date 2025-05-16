import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'react-feather';

interface CTAButtonProps {
  text: string;
  href: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

const CTAButton: React.FC<CTAButtonProps> = ({
  text,
  href,
  variant = 'primary',
  size = 'md',
  icon = <ArrowRight className="ml-2 h-5 w-5" />,
  className = '',
  fullWidth = false,
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm';
      case 'secondary':
        return 'bg-white hover:bg-gray-50 text-purple-600 border border-purple-600 shadow-sm';
      case 'outline':
        return 'bg-transparent hover:bg-purple-50 text-purple-600 border border-purple-600';
      default:
        return 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-sm px-4 py-2';
      case 'md':
        return 'text-base px-6 py-3';
      case 'lg':
        return 'text-lg px-8 py-4';
      default:
        return 'text-base px-6 py-3';
    }
  };

  const widthClass = fullWidth ? 'w-full justify-center' : '';

  return (
    <Link 
      href={href}
      className={`inline-flex items-center rounded-md font-medium transition-colors ${getVariantClasses()} ${getSizeClasses()} ${widthClass} ${className}`}
    >
      {text}
      {icon}
    </Link>
  );
};

export default CTAButton;