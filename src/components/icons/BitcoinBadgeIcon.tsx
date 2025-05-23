import React from 'react';
import "./lib/utils';

interface BitcoinBadgeIconProps {
  className?: string;
}

/**
 * Bitcoin (₿) badge icon component - simplified B in a circle
 */
const BitcoinBadgeIcon: React.FC<BitcoinBadgeIconProps> = ({ className }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 16 16" 
      fill="currentColor"
      className={cn('w-5 h-5', className)}
    >
      <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm-.5 11.2c-1.4 0-2.5-.5-3-1.4l.8-1c.4.6 1.2 1 2.2 1 1.1 0 1.7-.5 1.7-1.2 0-.6-.5-1-1.6-1h-1v-1.4h1c.9 0 1.4-.4 1.4-1 0-.6-.5-1-1.4-1-.9 0-1.5.4-1.9.9l-.8-1c.6-.8 1.6-1.2 2.7-1.2 1.6 0 2.8.8 2.8 2.1 0 .8-.5 1.4-1.3 1.7.9.2 1.5.9 1.5 1.8.1 1.3-1 2.3-3.1 2.3z"></path>
    </svg>
  );
};

export default BitcoinBadgeIcon;