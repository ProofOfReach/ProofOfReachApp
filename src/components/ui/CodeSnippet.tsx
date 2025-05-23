import React, { useState } from 'react';
import { Copy, Check } from 'react-feather';
import "./lib/utils';

interface CodeSnippetProps {
  code: string;
  language?: string;
  title?: string;
  className?: string;
  showLineNumbers?: boolean;
}

/**
 * A component that displays code in a formatted block with copy-to-clipboard functionality
 * The entire code block is clickable to copy the code
 */
const CodeSnippet: React.FC<CodeSnippetProps> = ({
  code,
  language = 'javascript',
  title,
  className,
  showLineNumbers = false,
}) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      
      // Reset after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.logger.error('Failed to copy code:', error);
    }
  };

  // Format code with line numbers if requested
  const formattedCode = !showLineNumbers 
    ? code 
    : code.split('\n').map((line, i) => (
        <div key={i} className="table-row">
          <span className="table-cell pr-4 text-gray-500 select-none text-right">{i + 1}</span>
          <span className="table-cell">{line}</span>
        </div>
      ));
  
  return (
    <div className={cn(
      "relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900", 
      className
    )}>
      {title && (
        <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</span>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">{language}</span>
          </div>
        </div>
      )}
      
      <div 
        className="relative cursor-pointer group"
        onClick={handleCopy}
      >
        {/* Copy icon overlay */}
        <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
          {copied ? (
            <div className="flex items-center bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
              <Check size={14} className="mr-1" />
              <span className="text-xs">Copied!</span>
            </div>
          ) : (
            <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded">
              <Copy size={16} className="text-gray-500 dark:text-gray-400" />
            </div>
          )}
        </div>
        
        {/* Code content */}
        <pre className={cn(
          "p-4 overflow-x-auto font-mono text-sm",
          showLineNumbers && "table w-full"
        )}>
          {formattedCode}
        </pre>
      </div>
    </div>
  );
};

export default CodeSnippet;