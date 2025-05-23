import React from 'react';

interface SimpleCardProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Simple card component to replace missing DashboardCard
 */
export const SimpleCard: React.FC<SimpleCardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      {children}
    </div>
  );
};

export default SimpleCard;