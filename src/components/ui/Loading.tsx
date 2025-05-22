import React from 'react';

interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  text?: string;
}

const Loading: React.FC<LoadingProps> = ({ 
  size = 'medium', 
  color = 'text-orange-600', 
  text 
}) => {
  // Set the spinner size based on the prop
  let sizeClass = '';
  switch (size) {
    case 'small':
      sizeClass = 'h-4 w-4';
      break;
    case 'medium':
      sizeClass = 'h-8 w-8';
      break;
    case 'large':
      sizeClass = 'h-12 w-12';
      break;
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <svg
        className={`animate-spin ${sizeClass} ${color}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        data-testid="loading-spinner"
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
      
      {text && (
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {text}
        </p>
      )}
    </div>
  );
};

export default Loading;