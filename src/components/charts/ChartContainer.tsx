import React, { ReactNode } from 'react';

interface ChartContainerProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  loading: boolean;
  error?: string | null;
  height?: number;
  className?: string;
}

const ChartContainer: React.FC<ChartContainerProps> = ({
  children,
  title,
  subtitle,
  loading,
  error,
  height = 300,
  className = ''
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h2>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
        )}
      </div>
      <div 
        className="p-4" 
        style={{ height: `${height}px` }}
      >
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-pulse text-gray-400 dark:text-gray-600">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        ) : error ? (
          <div className="h-full flex flex-col items-center justify-center text-red-500 dark:text-red-400">
            <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default ChartContainer;