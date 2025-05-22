import React from 'react';

interface DividerProps {
  className?: string;
}

const Divider: React.FC<DividerProps> = ({ className = '' }) => {
  return (
    <div className={`w-full my-10 flex justify-center ${className}`}>
      <hr className="w-4/5 border-gray-300 dark:border-gray-600" />
    </div>
  );
};

export default Divider;