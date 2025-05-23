import React, { useState } from 'react';
import { Copy, Check } from 'react-feather';

interface CopyToClipboardProps {
  value: string;
  displayValue?: string;
  className?: string;
  logText?: string;
  iconClassName?: string;
}

/**
 * A component that displays a value and provides a copy-to-clipboard button
 */
const CopyToClipboard: React.FC<CopyToClipboardProps> = ({
  value,
  displayValue,
  className = "relative flex items-center",
  logText = "Copied!",
  iconClassName = "w-4 h-4"
}) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      
      // Reset after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.log('Failed to copy text:', error);
    }
  };
  
  return (
    <div className={className}>
      <div className="flex-grow cursor-pointer" onClick={handleCopy}>
        {displayValue || value}
      </div>
      
      <button 
        type="button"
        onClick={handleCopy}
        className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        title="Copy to clipboard"
      >
        {copied ? (
          <Check className={iconClassName + " text-green-500"} />
        ) : (
          <Copy className={iconClassName} />
        )}
      </button>
      
      {copied && (
        <span className="absolute right-0 top-full mt-1 text-xs text-green-500 bg-white dark:bg-gray-800 px-1 py-0.5 rounded-sm shadow-sm border border-green-200 dark:border-green-900">
          {logText}
        </span>
      )}
    </div>
  );
};

export default CopyToClipboard;