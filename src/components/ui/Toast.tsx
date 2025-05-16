import React, { useState, useEffect } from 'react';
import { Check, AlertTriangle, Info, X, AlertCircle } from 'react-feather';

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
  
  const typeStyles = {
    success: 'bg-green-50 text-green-800 border-green-200 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300',
    error: 'bg-red-50 text-red-800 border-red-200 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300',
    info: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-300'
  };
  
  const IconComponent = {
    success: Check,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle
  }[message.type];
  
  return (
    <div 
      className={`
        fixed right-4 transition-all duration-300 ease-in-out border rounded-md shadow-md 
        py-2 px-3 flex items-center gap-2 max-w-xs w-full
        ${typeStyles[message.type]}
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}
      `}
      style={{ top: '1rem' }}
      role="alert"
    >
      <IconComponent className="w-4 h-4 flex-shrink-0" />
      <p className="text-sm flex-1">{message.content}</p>
      <button 
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onClose(message.id), 300);
        }}
        className="text-current opacity-70 hover:opacity-100 focus:outline-none"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC<{ messages: ToastMessage[] }> = ({ messages }) => {
  return (
    <div className="fixed top-0 right-0 z-50 p-4 flex flex-col gap-2 pointer-events-none">
      {messages.map((message, index) => (
        <div 
          key={message.id} 
          className="pointer-events-auto"
          style={{ marginTop: `${index * 10}px` }}
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