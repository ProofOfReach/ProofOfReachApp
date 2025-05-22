import React from 'react';
import Image from 'next/image';

interface SatoshiIconProps {
  className?: string;
  size?: number;
}

/**
 * SatoshiIcon component for displaying the Satoshi symbol
 * Used for representing Bitcoin's smallest unit (Satoshi) throughout the app
 */
const SatoshiIcon: React.FC<SatoshiIconProps> = ({ 
  className = '', 
  size = 16 
}) => {
  return (
    <Image
      src="/images/satoshi-symbol.png"
      alt="Satoshi symbol"
      width={size}
      height={size}
      style={{ width: 'auto', height: 'auto' }}
      className={`inline ${className}`}
      data-testid="satoshi-icon"
    />
  );
};

export default SatoshiIcon;