/**
 * Form Error Display Component
 * 
 * This component displays form validation errors in a user-friendly format.
 * It organizes errors by field and provides guidance on fixing them.
 */

import React from 'react';
import { ErrorState } from '@/types/errors';

export interface FieldError {
  field: string;
  message: string;
}

export interface FormErrorDisplayProps {
  errors: FieldError[] | Record<string, string> | string[] | string;
  title?: string;
  showSummary?: boolean;
  className?: string;
}

const FormErrorDisplay: React.FC<FormErrorDisplayProps> = ({
  errors,
  title = 'Form Validation Error',
  showSummary = true,
  className = '',
}) => {
  // Convert different error formats to a standardized array of FieldError objects
  let errorArray: FieldError[] = [];
  
  if (typeof errors === 'string') {
    // Single string error
    errorArray = [{ field: 'form', message: errors }];
  } else if (Array.isArray(errors)) {
    if (errors.length === 0) {
      return null;
    }
    
    // Array of strings or FieldError objects
    errorArray = errors.map(error => {
      if (typeof error === 'string') {
        return { field: 'form', message: error };
      }
      // Already a FieldError
      return error as FieldError;
    });
  } else if (typeof errors === 'object') {
    // Record<string, string> format (field -> message)
    errorArray = Object.entries(errors).map(([field, message]) => ({
      field,
      message: message as string,
    }));
  }
  
  if (errorArray.length === 0) {
    return null;
  }
  
  // Group errors by field
  const errorsByField: Record<string, string[]> = {};
  errorArray.forEach(error => {
    if (!errorsByField[error.field]) {
      errorsByField[error.field] = [];
    }
    errorsByField[error.field].push(error.message);
  });
  
  // Format field names for display
  const formatFieldName = (field: string): string => {
    if (field === 'form') return 'General';
    
    // Convert camelCase or snake_case to Title Case with spaces
    return field
      .replace(/([A-Z])/g, ' $1') // Insert space before capitals
      .replace(/_/g, ' ') // Replace underscores with spaces
      .replace(/^\w/, c => c.toUpperCase()); // Capitalize first letter
  };
  
  return (
    <div className={`bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M12 4h.01M19 12a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <div className="ml-3 w-full">
          <h3 className="text-sm font-medium text-yellow-800">{title}</h3>
          
          {showSummary && errorArray.length > 1 && (
            <p className="text-xs text-yellow-700 mt-1">
              Please fix the following {errorArray.length} errors:
            </p>
          )}
          
          <div className="mt-2">
            {Object.entries(errorsByField).map(([field, messages]) => (
              <div key={field} className="mb-2">
                <h4 className="text-xs font-semibold text-yellow-800">
                  {formatFieldName(field)}:
                </h4>
                <ul className="list-disc pl-5 space-y-1 mt-1">
                  {messages.map((message, index) => (
                    <li key={index} className="text-xs text-yellow-700">
                      {message}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormErrorDisplay;