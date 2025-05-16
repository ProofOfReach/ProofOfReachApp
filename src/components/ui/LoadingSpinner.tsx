import React from 'react';

type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl';

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  className?: string;
  // If true, spinner will be white (for dark backgrounds)
  light?: boolean;
}

/**
 * Animated loading spinner component
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '',
  light = false
}) => {
  // Size mappings
  const sizeClasses: Record<SpinnerSize, string> = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4'
  };
  
  // Color classes
  const colorClass = light 
    ? 'border-t-white border-white/30' 
    : 'border-t-purple-600 border-gray-200 dark:border-t-purple-500 dark:border-gray-700';
  
  return (
    <div 
      className={`
        inline-block rounded-full animate-spin 
        ${sizeClasses[size]} 
        ${colorClass} 
        ${className}
      `} 
      role="status" 
      aria-label="Loading"
    />
  );
};

export default LoadingSpinner;