import React, { useState, useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'react-feather';

interface ResizableTableHeaderProps {
  column: string;
  label: React.ReactNode;
  currentSort: string;
  currentDirection: 'asc' | 'desc';
  onSort: (column: string) => void;
  className?: string;
}

const ResizableTableHeader: React.FC<ResizableTableHeaderProps> = ({
  column,
  label,
  currentSort,
  currentDirection,
  onSort,
  className = ''
}) => {
  const [width, setWidth] = useState<number | null>(null);
  const [resizing, setResizing] = useState(false);
  const startPosRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);
  const headerRef = useRef<HTMLDivElement>(null);

  // Initialize width from element when mounted
  useEffect(() => {
    if (headerRef.current && !width) {
      setWidth(headerRef.current.offsetWidth);
    }
  }, [width]);

  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setResizing(true);
    startPosRef.current = e.clientX;
    if (headerRef.current) {
      startWidthRef.current = headerRef.current.offsetWidth;
    }

    // Add event listeners for mouse move and up
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };

  // Handle resize move
  const handleResizeMove = (e: MouseEvent) => {
    if (!resizing) return;
    
    const diff = e.clientX - startPosRef.current;
    const newWidth = Math.max(50, startWidthRef.current + diff); // Minimum width of 50px
    setWidth(newWidth);
    
    // Custom event to notify other components about column width changes
    const event = new CustomEvent('column-resize', { 
      detail: { column, width: newWidth } 
    });
    document.dispatchEvent(event);
  };

  // Handle resize end
  const handleResizeEnd = () => {
    setResizing(false);
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  };

  const isActive = currentSort === column;

  return (
    <div 
      ref={headerRef}
      className={`relative ${className}`}
      style={{ width: width ? `${width}px` : 'auto' }}
      data-column={column}
    >
      <div 
        className="flex items-center justify-center p-4 text-sm font-medium text-gray-900 dark:text-white cursor-pointer"
        onClick={() => onSort(column)}
      >
        {label}
        {isActive && (
          currentDirection === 'asc' 
            ? <ChevronUp className="h-4 w-4 ml-1" /> 
            : <ChevronDown className="h-4 w-4 ml-1" />
        )}
      </div>
      <div 
        className={`absolute top-0 right-0 h-full w-2 cursor-col-resize z-10 ${resizing ? 'bg-blue-500' : 'hover:bg-gray-300 dark:hover:bg-gray-600'}`}
        onMouseDown={handleResizeStart}
      />
    </div>
  );
};

export default ResizableTableHeader;