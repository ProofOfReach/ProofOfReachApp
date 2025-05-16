import React from 'react';

type TitleLevel = 1 | 2 | 3 | 4 | 5 | 6;

interface TitleProps {
  level: TitleLevel;
  children: React.ReactNode;
  className?: string;
}

interface ParagraphProps {
  children: React.ReactNode;
  className?: string;
}

interface TextProps {
  children: React.ReactNode;
  className?: string;
}

const titleClasses = {
  1: 'text-3xl font-extrabold tracking-tight',
  2: 'text-2xl font-bold tracking-tight',
  3: 'text-xl font-semibold',
  4: 'text-lg font-medium',
  5: 'text-base font-medium',
  6: 'text-sm font-medium'
};

/**
 * Title component for headings
 */
export const Title: React.FC<TitleProps> = ({ level, children, className = '' }) => {
  const baseClasses = titleClasses[level];
  
  // Using conditional rendering instead of dynamic elements
  switch(level) {
    case 1:
      return <h1 className={`${baseClasses} text-gray-900 dark:text-white ${className}`}>{children}</h1>;
    case 2:
      return <h2 className={`${baseClasses} text-gray-900 dark:text-white ${className}`}>{children}</h2>;
    case 3:
      return <h3 className={`${baseClasses} text-gray-900 dark:text-white ${className}`}>{children}</h3>;
    case 4:
      return <h4 className={`${baseClasses} text-gray-900 dark:text-white ${className}`}>{children}</h4>;
    case 5:
      return <h5 className={`${baseClasses} text-gray-900 dark:text-white ${className}`}>{children}</h5>;
    case 6:
      return <h6 className={`${baseClasses} text-gray-900 dark:text-white ${className}`}>{children}</h6>;
    default:
      return <h2 className={`${baseClasses} text-gray-900 dark:text-white ${className}`}>{children}</h2>;
  }
};

/**
 * Paragraph component for text blocks
 */
export const Paragraph: React.FC<ParagraphProps> = ({ children, className = '' }) => {
  return (
    <p className={`text-base text-gray-700 dark:text-gray-300 ${className}`}>
      {children}
    </p>
  );
};

/**
 * Text component for regular text content
 */
export const Text: React.FC<TextProps> = ({ children, className = '' }) => {
  return (
    <span className={`text-base text-gray-700 dark:text-gray-300 ${className}`}>
      {children}
    </span>
  );
};

export default {
  Title,
  Paragraph,
  Text
};