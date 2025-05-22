import React from 'react';

type LoadingProps = {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
};

const Loading: React.FC<LoadingProps> = ({ 
  size = 'md', 
  color = 'text-purple-600',
  className = ''
}) => {
  let sizeClass = 'w-8 h-8';
  
  switch (size) {
    case 'sm':
      sizeClass = 'w-5 h-5';
      break;
    case 'lg':
      sizeClass = 'w-12 h-12';
      break;
    default:
      sizeClass = 'w-8 h-8';
  }
  
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg
        className={`animate-spin ${sizeClass} ${color}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        data-testid="loading-indicator"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
  );
};

export default Loading;