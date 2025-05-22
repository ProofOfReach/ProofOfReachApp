import React from 'react';
import { ChevronUp, ChevronDown } from 'react-feather';

interface SortableTableHeaderProps {
  column: string;
  label: string;
  currentSort: string;
  currentDirection: 'asc' | 'desc';
  onSort: (column: string) => void;
  className?: string;
}

const SortableTableHeader: React.FC<SortableTableHeaderProps> = ({
  column,
  label,
  currentSort,
  currentDirection,
  onSort,
  className = ''
}) => {
  const isActive = currentSort === column;

  return (
    <div 
      className={`flex items-center space-x-1 cursor-pointer ${className}`}
      onClick={() => onSort(column)}
    >
      <span className="text-xs font-medium">{label}</span>
      <div className="flex flex-col">
        <ChevronUp 
          className={`h-3 w-3 -mb-1 ${isActive && currentDirection === 'asc' 
            ? 'text-purple-500' 
            : 'text-gray-400'}`} 
        />
        <ChevronDown 
          className={`h-3 w-3 ${isActive && currentDirection === 'desc' 
            ? 'text-purple-500' 
            : 'text-gray-400'}`} 
        />
      </div>
    </div>
  );
};

export default SortableTableHeader;