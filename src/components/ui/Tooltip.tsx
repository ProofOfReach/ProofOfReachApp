import React, { useState, useRef, useEffect } from 'react';
import { Info } from 'react-feather';

interface TooltipProps {
  text: React.ReactNode;
  children?: React.ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
  iconClassName?: string;
  width?: 'narrow' | 'medium' | 'wide';
}

const Tooltip: React.FC<TooltipProps> = ({
  text,
  children,
  position = 'top',
  className = '',
  iconClassName = '',
  width = 'medium'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  const widthClass = {
    narrow: 'w-48',
    medium: 'w-64',
    wide: 'w-80'
  }[width];
  
  const positionClass = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2'
  }[position];
  
  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsVisible(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <span className={`relative inline-block ${className}`} ref={tooltipRef}>
      {children ? (
        <span 
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
          onClick={() => setIsVisible(!isVisible)}
          className="inline-block cursor-help"
        >
          {children}
        </span>
      ) : (
        <Info 
          className={`h-4 w-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 inline cursor-help ${iconClassName}`}
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
          onClick={() => setIsVisible(!isVisible)}
        />
      )}
      
      {isVisible && (
        <div 
          className={`absolute z-50 ${positionClass} ${widthClass} bg-white dark:bg-gray-800 shadow-lg rounded-md p-3 text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 pointer-events-none`}
        >
          {typeof text === 'string' ? <p>{text}</p> : text}
          
          {/* Arrow based on position */}
          <div 
            className={`absolute ${
              position === 'top' ? 'top-full left-1/2 transform -translate-x-1/2 -mt-1 border-t-white dark:border-t-gray-800 border-l-transparent border-r-transparent border-b-transparent' : 
              position === 'right' ? 'right-full top-1/2 transform -translate-y-1/2 -mr-1 border-r-white dark:border-r-gray-800 border-t-transparent border-b-transparent border-l-transparent' :
              position === 'bottom' ? 'bottom-full left-1/2 transform -translate-x-1/2 -mb-1 border-b-white dark:border-b-gray-800 border-l-transparent border-r-transparent border-t-transparent' :
              'left-full top-1/2 transform -translate-y-1/2 -ml-1 border-l-white dark:border-l-gray-800 border-t-transparent border-b-transparent border-r-transparent'
            } border-solid border-8`}
          />
        </div>
      )}
    </span>
  );
};

export default Tooltip;