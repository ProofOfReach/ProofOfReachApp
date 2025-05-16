import React from 'react';

interface TabProps {
  children?: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
}

const Tab: React.FC<TabProps> = ({ children, isActive, onClick }) => {
  const className = isActive 
    ? 'py-2 px-4 border-b-2 border-blue-500 text-blue-600' 
    : 'py-2 px-4 text-gray-500 hover:text-gray-700';
    
  return (
    <button
      className={className}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Tab;