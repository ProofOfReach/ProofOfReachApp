import React, { useState, useEffect } from 'react';
import { Check, AlertTriangle, Info, X, AlertCircle, Zap } from 'react-feather';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: number;
  type: ToastType;
  content: string;
  duration?: number;
}

interface ToastProps {
  message: ToastMessage;
  onClose: (id: number) => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Animate in
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, 10);
    
    // Auto dismiss after duration
    const duration = message.duration || 3000;
    const dismissTimeout = setTimeout(() => {
      setIsVisible(false);
      
      // Wait for animation to complete before removing
      setTimeout(() => {
        onClose(message.id);
      }, 300);
    }, duration);
    
    return () => {
      clearTimeout(timeout);
      clearTimeout(dismissTimeout);
    };
  }, [message, onClose]);
  
  // Enhanced styles with better shadcn-like appearance
  const typeStyles = {
    success: 'bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300',
    error: 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300',
    info: 'bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300',
    warning: 'bg-yellow-50 text-yellow-800 border border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-300'
  };
  
  // Use Zap icon for success messages about earned sats
  const IconComponent = message.type === 'success' && message.content.includes('sats') 
    ? Zap
    : {
        success: Check,
        error: AlertCircle,
        info: Info,
        warning: AlertTriangle
      }[message.type];
  
  return (
    <div 
      className={`
        fixed right-4 bottom-4 transition-all duration-300 ease-in-out rounded-lg shadow-lg 
        py-3 px-4 flex items-center gap-3 max-w-sm w-full backdrop-blur-sm
        ${typeStyles[message.type]}
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}
      `}
      role="alert"
    >
      <div className={`p-1 rounded-full ${
        message.type === 'success' ? 'bg-green-100 dark:bg-green-800/50' : 
        message.type === 'error' ? 'bg-red-100 dark:bg-red-800/50' :
        message.type === 'info' ? 'bg-blue-100 dark:bg-blue-800/50' :
        'bg-yellow-100 dark:bg-yellow-800/50'
      }`}>
        <IconComponent className="w-5 h-5 flex-shrink-0" />
      </div>
      <p className="text-sm font-medium flex-1">{message.content}</p>
      <button 
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onClose(message.id), 300);
        }}
        className="text-current opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 rounded"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC<{ messages: ToastMessage[] }> = ({ messages }) => {
  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 flex flex-col gap-2 pointer-events-none">
      {messages.map((message, index) => (
        <div 
          key={message.id} 
          className="pointer-events-auto"
          style={{ marginBottom: `${index * 10}px` }}
        >
          <Toast 
            message={message} 
            onClose={() => {}} // This will be handled by the toast manager
          />
        </div>
      ))}
    </div>
  );
};

export default Toast;