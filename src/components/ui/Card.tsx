import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Card component for displaying content in a boxed container
 */
export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  );
};

export default Card;