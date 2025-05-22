import React from 'react';
import { useCurrency } from '../../context/CurrencyContext';

interface SatsIconProps {
  className?: string;
}

// Using SVG directly to avoid any flickering issues with Image component
const SatsIcon: React.FC<SatsIconProps> = ({ className = 'w-5 h-5' }) => {
  const { currency } = useCurrency();
  
  // Return a simple styled SVG representation of the sats symbol
  // This eliminates flickering issues caused by the Next/Image component
  // and properly inherits colors from the parent component
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Satoshi (sats) symbol */}
      <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm.5 11c0 .7-.6 1.1-1.5 1.2v.8h-1v-.8c-.9-.1-1.8-.5-2.3-1l.6-1.2c.5.5 1.2.8 1.9.8.7 0 1-.3 1-.6 0-.4-.3-.6-1.1-.8-1.2-.3-2.2-.8-2.2-2 0-.7.5-1.2 1.5-1.4V5h1v.9c.7.1 1.4.4 1.8.8l-.6 1.1c-.3-.2-.8-.5-1.4-.5-.6 0-.8.2-.8.6 0 .3.3.5 1.2.8 1.2.3 2.1.8 2.1 2z" />
    </svg>
  );
};

export default SatsIcon;