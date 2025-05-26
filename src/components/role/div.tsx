/**
 * Role Div Component
 * Basic div wrapper with role-based rendering
 */

import React from 'react';

interface RoleDivProps {
  children?: React.ReactNode;
  className?: string;
  role?: string;
}

export const div: React.FC<RoleDivProps> = ({ children, className, ...props }) => {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
};

export default div;