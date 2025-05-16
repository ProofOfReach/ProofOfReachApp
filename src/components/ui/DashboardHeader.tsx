import React from 'react';

interface DashboardHeaderProps {
  title: string | React.ReactNode;
  description?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  actions?: React.ReactNode;
}

/**
 * Standard header component for dashboard pages
 * Provides consistent styling for page titles and descriptions
 */
export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  title, 
  description, 
  icon,
  children,
  actions
}) => {
  return (
    <div className="flex justify-between items-start mb-4" data-testid="dashboard-header">
      <div className="flex items-center space-x-2">
        {icon && <div className="flex-shrink-0">{icon}</div>}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
          {description && (
            <p className="text-gray-600 dark:text-gray-400">{description}</p>
          )}
        </div>
      </div>
      {(children || actions) && (
        <div className="flex-shrink-0">
          {actions || children}
        </div>
      )}
    </div>
  );
};

export default DashboardHeader;