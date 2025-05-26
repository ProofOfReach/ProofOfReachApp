/**
 * DashboardContainer - Safe wrapper for dashboard content
 */
import React from 'react';

interface DashboardContainerProps {
  children: React.ReactNode;
  className?: string;
}

const DashboardContainer: React.FC<DashboardContainerProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
      {children}
    </div>
  );
};

export default DashboardContainer;