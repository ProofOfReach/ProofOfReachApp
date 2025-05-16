import React, { useState, useEffect } from 'react';
import { AlertCircle, X } from 'react-feather';

interface ClosableInfoBoxProps {
  id: string;
  title: string;
  children: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red';
}

const ClosableInfoBox: React.FC<ClosableInfoBoxProps> = ({ 
  id,
  title, 
  children, 
  color = 'blue'
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const localStorageKey = `nostrAdMarketplace_infoBox_${id}`;

  // Check if the box should be hidden based on localStorage
  useEffect(() => {
    const isHidden = localStorage.getItem(localStorageKey) === 'hidden';
    if (isHidden) {
      setIsVisible(false);
    }
  }, [localStorageKey]);

  // Close the box and save the state to localStorage
  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem(localStorageKey, 'hidden');
  };

  if (!isVisible) {
    return null;
  }

  const colorClasses = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      title: 'text-blue-800 dark:text-blue-300',
      text: 'text-blue-700 dark:text-blue-400',
      icon: 'text-blue-500'
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      title: 'text-green-800 dark:text-green-300',
      text: 'text-green-700 dark:text-green-400',
      icon: 'text-green-500'
    },
    yellow: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      title: 'text-yellow-800 dark:text-yellow-300',
      text: 'text-yellow-700 dark:text-yellow-400',
      icon: 'text-yellow-500'
    },
    red: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      title: 'text-red-800 dark:text-red-300',
      text: 'text-red-700 dark:text-red-400',
      icon: 'text-red-500'
    }
  };

  const classes = colorClasses[color];

  return (
    <div className={`${classes.bg} border ${classes.border} rounded-lg p-4 relative`}>
      <button 
        onClick={handleClose}
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start pr-6">
        <AlertCircle className={`h-5 w-5 ${classes.icon} mr-3 mt-0.5`} />
        <div>
          <h3 className={`font-medium ${classes.title}`}>{title}</h3>
          <div className={`${classes.text} text-sm mt-1`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClosableInfoBox;