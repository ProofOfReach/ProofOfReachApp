import React, { ReactNode } from 'react';

interface DashboardCardProps {
  children: ReactNode;
  title?: string | ReactNode;
  value?: string | ReactNode;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
  footer?: ReactNode;
}

/**
 * DashboardCard component for displaying key metrics and information in dashboard layouts
 */
const DashboardCard: React.FC<DashboardCardProps> = ({
  children,
  title,
  value,
  trend,
  trendDirection = 'up',
  icon,
  action,
  className = '',
  footer
}) => {
  // Determine trend color
  const trendColorClass = 
    trendDirection === 'up' 
      ? 'text-green-600 dark:text-green-400' 
      : trendDirection === 'down' 
        ? 'text-red-600 dark:text-red-400' 
        : 'text-gray-600 dark:text-gray-400';

  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow p-5 ${className}`}
      data-testid="dashboard-card"
    >
      {/* Card header with title and optional action */}
      {(title || action) && (
        <div className="flex justify-between items-center mb-4">
          {title && (
            <div className="flex items-center">
              {icon && <span className="mr-2">{icon}</span>}
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {title}
              </h3>
            </div>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      
      {/* Primary value with trend indicator */}
      {value && (
        <div className="mb-4">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {value}
          </div>
          
          {trend && (
            <div className={`text-sm font-medium ${trendColorClass} mt-1 flex items-center`}>
              {trendDirection === 'up' && (
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              )}
              {trendDirection === 'down' && (
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
              {trend}
            </div>
          )}
        </div>
      )}
      
      {/* Card content */}
      <div>{children}</div>
      
      {/* Optional footer */}
      {footer && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {footer}
        </div>
      )}
    </div>
  );
};

export default DashboardCard;