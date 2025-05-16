import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'react-feather';

type AccordionItemProps = {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

export const AccordionItem: React.FC<AccordionItemProps> = ({ 
  title, 
  children, 
  defaultOpen = false 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <button
        className="flex justify-between items-center w-full py-4 px-4 text-left focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-medium text-gray-800 dark:text-gray-200">{title}</span>
        <span className="ml-6 flex-shrink-0">
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-purple-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          )}
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-96 pb-4' : 'max-h-0'
        }`}
      >
        <div className="px-4 text-gray-600 dark:text-gray-300">{children}</div>
      </div>
    </div>
  );
};

type AccordionProps = {
  children: React.ReactNode;
  className?: string;
};

export const Accordion: React.FC<AccordionProps> = ({ children, className = '' }) => {
  return (
    <div className={`border border-gray-200 dark:border-gray-700 rounded-lg divide-y ${className}`}>
      {children}
    </div>
  );
};