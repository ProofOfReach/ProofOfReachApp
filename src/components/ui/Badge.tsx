import React, { ReactNode } from 'react';

type BadgeType = 'default' | 'primary' | 'log' | 'warn' | 'danger' | 'info';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: ReactNode;
  type?: BadgeType;
  size?: BadgeSize;
  className?: string;
  dot?: boolean;
}

const Badge: React.FC<BadgeProps> = ({ 
  children, 
  type = 'default',
  size = 'md',
  className = '',
  dot = false
}) => {
  const typeStyles = {
    default: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600',
    primary: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
    log: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
    warn: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
    danger: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
    info: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'
  };

  const sizeStyles = {
    sm: 'text-xs py-0.5 px-1.5',
    md: 'text-xs py-1 px-2',
    lg: 'text-sm py-1 px-2.5'
  };

  const dotColors = {
    default: 'bg-gray-500 dark:bg-gray-400',
    primary: 'bg-purple-500 dark:bg-purple-400',
    log: 'bg-green-500 dark:bg-green-400',
    warn: 'bg-yellow-500 dark:bg-yellow-400',
    danger: 'bg-red-500 dark:bg-red-400',
    info: 'bg-blue-500 dark:bg-blue-400'
  };

  return (
    <span 
      className={`
        inline-flex items-center gap-1 font-medium rounded border
        ${typeStyles[type]} ${sizeStyles[size]} ${className}
      `}
    >
      {dot && (
        <span 
          className={`w-1.5 h-1.5 rounded-full inline-block ${dotColors[type]}`}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;