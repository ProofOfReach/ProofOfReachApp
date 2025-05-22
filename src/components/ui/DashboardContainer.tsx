import React, { ReactNode } from 'react';

interface DashboardContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * DashboardContainer component provides consistent spacing and layout for dashboard pages
 */
const DashboardContainer: React.FC<DashboardContainerProps> = ({
  children,
  className = ''
}) => {
  return (
    <div 
      className={`container mx-auto px-4 py-4 md:py-6 space-y-6 ${className}`}
      data-testid="dashboard-container"
    >
      {children}
    </div>
  );
};

export default DashboardContainer;