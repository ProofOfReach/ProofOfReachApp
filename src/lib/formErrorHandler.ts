/**
 * Form Validation Error Handling Utilities for Nostr Ad Marketplace
 * 
 * This module provides standardized handling for form validation errors
 * with consistent formatting, error messages, and field-level error handling.
 * Part of the Phase 1 error handling infrastructure implementation.
 */

import.*./lib/apiErrorHandler';
import.*./lib/errorService';

/**
 * Standard form error format for both field-level and form-level errors
 */
export interface FormErrorState {
  // General form error message
  formError: string | null;
  
  // Field-specific errors
  fieldErrors: Record<string, string>;
  
  // Map of which fields have been touched (for validation on blur)
  touchedFields: Record<string, boolean>;
}

/**
 * API error response with validation errors
 */
export interface ApiValidationErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    status: number;
    details?: {
      invalidFields?: string[];
      fieldErrors?: Record<string, string>;
    };
  };
}

/**
 * Create an initial empty form error state
 */
export function createEmptyFormErrorState(): FormErrorState {
  return {
    formError: null,
    fieldErrors: {},
    touchedFields: {}
  };
}

/**
 * Extract field errors from an API validation error response
 * @param error Error returned from an API call
 * @param defaultMessage Default error message to show if none available
 * @returns An updated form error state
 */
export function extractApiFormErrors(
  error: unknown,
  defaultMessage = 'Please correct the errors below'
): FormErrorState {
  const result: FormErrorState = createEmptyFormErrorState();
  
  try {
    // Handle standard API error responses
    if (typeof error === 'object' && error !== null) {
      // Handle our standard API error response format
      if ('error' in error && typeof error.error === 'object' && error.error !== null) {
        const apiError = error as ApiValidationErrorResponse;
        
        // Set the form-level error message
        result.formError = apiError.error.message || defaultMessage;
        
        // Handle detailed field errors if available
        if (apiError.error.details) {
          // Case 1: Detailed field errors with messages
          if (apiError.error.details.fieldErrors) {
            result.fieldErrors = apiError.error.details.fieldErrors;
          } 
          // Case 2: Just a list of invalid fields without specific messages
          else if (apiError.error.details.invalidFields) {
            apiError.error.details.invalidFields.forEach(field => {
              result.fieldErrors[field] = 'This field is invalid';
            });
          }
        }
        
        // If we got a validation error with no field errors, make sure we show the general error
        if (apiError.error.code === ErrorCode.VALIDATION_ERROR && 
            Object.keys(result.fieldErrors).length === 0) {
          result.formError = apiError.error.message || defaultMessage;
        }
        
        return result;
      }
      
      // Handle Error objects with validation details
      if (error instanceof Error) {
        result.formError = error.message;
        
        // Extract invalidFields if available
        if ((error as any).invalidFields && Array.isArray((error as any).invalidFields)) {
          (error as any).invalidFields.forEach((field: string) => {
            result.fieldErrors[field] = 'This field is invalid';
          });
        }
        
        // Check for detailed fieldErrors property
        if ((error as any).fieldErrors && typeof (error as any).fieldErrors === 'object') {
          result.fieldErrors = { ...(error as any).fieldErrors };
        }
        
        return result;
      }
    }
    
    // Last resort: Just use the error as a general form error
    result.formError = (error instanceof Error) ? 
      error.message : 
      (typeof error === 'string' ? error : defaultMessage);
    
    return result;
  } catch (err) {
    // Log any errors in our error extraction to avoid breaking the UI
    // Use the simpler form without the problematic property
    errorService.reportError(
      err instanceof Error ? err : new Error('Error while processing form validation errors'),
      'formErrorHandler',
      'unexpected',
      'error'
    );
    
    // Return a generic error state
    return {
      formError: defaultMessage,
      fieldErrors: {},
      touchedFields: {}
    };
  }
}

/**
 * Mark a field as touched (validation should now show for this field)
 * @param state Current form error state
 * @param fieldName Name of the field to mark as touched
 * @returns Updated form error state
 */
export function markFieldTouched(
  state: FormErrorState,
  fieldName: string
): FormErrorState {
  return {
    ...state,
    touchedFields: {
      ...state.touchedFields,
      [fieldName]: true
    }
  };
}

/**
 * Mark all fields as touched (shows all validation errors)
 * @param state Current form error state
 * @param fields Array of field names to mark as touched (or all fields with errors if not specified)
 * @returns Updated form error state
 */
export function markAllFieldsTouched(
  state: FormErrorState,
  fields?: string[]
): FormErrorState {
  const fieldsToMark = fields || Object.keys(state.fieldErrors);
  const touchedFields = { ...state.touchedFields };
  
  fieldsToMark.forEach(field => {
    touchedFields[field] = true;
  });
  
  return {
    ...state,
    touchedFields
  };
}

/**
 * Set a specific field error
 * @param state Current form error state
 * @param fieldName Name of the field with the error
 * @param errorMessage Error message for this field
 * @returns Updated form error state
 */
export function setFieldError(
  state: FormErrorState,
  fieldName: string,
  errorMessage: string
): FormErrorState {
  return {
    ...state,
    fieldErrors: {
      ...state.fieldErrors,
      [fieldName]: errorMessage
    },
    // Mark the field as touched when setting an error
    touchedFields: {
      ...state.touchedFields,
      [fieldName]: true
    }
  };
}

/**
 * Clear a specific field error
 * @param state Current form error state
 * @param fieldName Name of the field to clear
 * @returns Updated form error state
 */
export function clearFieldError(
  state: FormErrorState,
  fieldName: string
): FormErrorState {
  const fieldErrors = { ...state.fieldErrors };
  delete fieldErrors[fieldName];
  
  return {
    ...state,
    fieldErrors
  };
}

/**
 * Set a form-level error
 * @param state Current form error state
 * @param errorMessage Form-level error message
 * @returns Updated form error state
 */
export function setFormError(
  state: FormErrorState,
  errorMessage: string
): FormErrorState {
  return {
    ...state,
    formError: errorMessage
  };
}

/**
 * Clear all errors (both form-level and field-level)
 * @param state Current form error state
 * @returns Updated form error state with no errors
 */
export function clearAllErrors(state: FormErrorState): FormErrorState {
  return {
    ...state,
    formError: null,
    fieldErrors: {}
  };
}

/**
 * Check if a field has a visible error
 * (has an error and has been touched)
 * @param state Current form error state
 * @param fieldName Name of the field to check
 * @returns True if the field has a visible error
 */
export function hasVisibleFieldError(
  state: FormErrorState,
  fieldName: string
): boolean {
  return !!state.fieldErrors[fieldName] && !!state.touchedFields[fieldName];
}

/**
 * Get the error message for a field if it should be displayed
 * @param state Current form error state
 * @param fieldName Name of the field to get the error for
 * @returns The error message or null if no visible error
 */
export function getFieldErrorMessage(
  state: FormErrorState,
  fieldName: string
): string | null {
  return hasVisibleFieldError(state, fieldName) ? state.fieldErrors[fieldName] : null;
}

/**
 * Check if the form has any errors
 * @param state Current form error state
 * @returns True if the form has any errors (form-level or field-level)
 */
export function hasAnyError(state: FormErrorState): boolean {
  return !!state.formError || Object.keys(state.fieldErrors).length > 0;
}