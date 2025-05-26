/**
 * Simple div component for role components
 */

import React from 'react';

interface DivProps {
  children?: React.ReactNode;
  className?: string;
}

export const div: React.FC<DivProps> = ({ children, className }) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};