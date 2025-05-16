import React from 'react';
import { Check, AlertCircle, Info, AlertTriangle, X } from 'react-feather';

type MessageType = 'success' | 'error' | 'info' | 'warning';

interface MessageBarProps {
  type: MessageType;
  title: string;
  message?: string;
  onClose?: () => void;
  className?: string;
  showIcon?: boolean;
}

const MessageBar: React.FC<MessageBarProps> = ({
  type,
  title,
  message,
  onClose,
  className = '',
  showIcon = true
}) => {
  // Define colors based on type
  const colors = {
    success: 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
    error: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
    info: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800'
  };

  const icons = {
    success: <Check className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />
  };

  return (
    <div className={`flex p-4 mb-4 border rounded-lg ${colors[type]} ${className}`} role="alert">
      {showIcon && (
        <div className="flex-shrink-0 mr-3">
          {icons[type]}
        </div>
      )}
      <div className="flex-1">
        <h3 className="text-sm font-medium">{title}</h3>
        {message && <div className="mt-1 text-sm opacity-90">{message}</div>}
      </div>
      {onClose && (
        <button 
          type="button" 
          className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 focus:outline-none focus:ring-2 focus:ring-gray-300"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default MessageBar;