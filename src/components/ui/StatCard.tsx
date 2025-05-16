import React, { ReactNode } from 'react';
import { Text } from './Typography';
import { ArrowUp, ArrowDown, Minus } from 'react-feather';

export interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  icon?: ReactNode;
  className?: string;
  helperText?: string;
  isNegativeGood?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  change, 
  icon,
  className = '',
  helperText,
  isNegativeGood = false
}) => {
  // Determine if change is positive, negative, or neutral
  const isPositive = change?.startsWith('+');
  const isNegative = change?.startsWith('-');
  const isNeutral = !isPositive && !isNegative;

  // Get change color based on direction and whether negative is good
  const getChangeColor = () => {
    if (isPositive) return isNegativeGood ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400';
    if (isNegative) return isNegativeGood ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400';
    return 'text-gray-500 dark:text-gray-400';
  };

  // Get change icon based on direction
  const getChangeIcon = () => {
    if (isPositive) return <ArrowUp className="h-3 w-3 mr-1" />;
    if (isNegative) return <ArrowDown className="h-3 w-3 mr-1" />;
    return <Minus className="h-3 w-3 mr-1" />;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex justify-between items-start">
        <div>
          <Text className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</Text>
          <div className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</div>
          
          {change && (
            <div className={`flex items-center text-xs mt-2 ${getChangeColor()}`}>
              {getChangeIcon()}
              <span>{change}</span>
            </div>
          )}
          
          {helperText && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {helperText}
            </div>
          )}
        </div>
        
        {icon && (
          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;