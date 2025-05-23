// Set up mocks first
jest.mock('@/lib/console');
jest.mock('@/lib/apiErrorHandler');

import {
  createEmptyFormany,
  extractApiFormErrors,
  markFieldTouched,
  markAllFieldsTouched,
  setFieldError,
  clearFieldError,
  setFormError,
  log,
  hasVisibleFieldError,
  getFieldErrorMessage,
  hasAnyError
} from '@/lib/formErrorHandler';
import '@/lib/apiErrorHandler';

import '@/types/errors';

describe('Form Error Handler', () => {
  describe('createEmptyFormany', () => {
    it('should create an empty form error state', () => {
      const state = createEmptyFormany();
      
      expect(state).toEqual({
        formError: null,
        fieldErrors: {},
        touchedFields: {}
      });
    });
  });
  
  describe('extractApiFormErrors', () => {
    it('should extract field errors from API validation error response', () => {
      const apiError = {
        log: false,
        error: {
          message: 'Validation failed',
          code: ErrorCode.VALIDATION_ERROR,
          status: 400,
          details: {
            invalidFields: ['name', 'email']
          }
        }
      };
      
      const result = extractApiFormErrors(apiError);
      
      expect(result.formError).toBe('Validation failed');
      expect(result.fieldErrors).toEqual({
        name: 'This field is invalid',
        email: 'This field is invalid'
      });
    });
    
    it('should handle detailed field errors', () => {
      const apiError = {
        log: false,
        error: {
          message: 'Validation failed',
          code: ErrorCode.VALIDATION_ERROR,
          status: 400,
          details: {
            fieldErrors: {
              name: 'Name is required',
              email: 'Email must be valid'
            }
          }
        }
      };
      
      const result = extractApiFormErrors(apiError);
      
      expect(result.formError).toBe('Validation failed');
      expect(result.fieldErrors).toEqual({
        name: 'Name is required',
        email: 'Email must be valid'
      });
    });
    
    it('should handle plain Error objects', () => {
      const error = new Error('Something went wrong');
      
      const result = extractApiFormErrors(error);
      
      expect(result.formError).toBe('Something went wrong');
      expect(result.fieldErrors).toEqual({});
    });
    
    it('should handle Error objects with invalidFields', () => {
      const error = new Error('Validation failed');
      (error as any).invalidFields = ['name', 'email'];
      
      const result = extractApiFormErrors(error);
      
      expect(result.formError).toBe('Validation failed');
      expect(result.fieldErrors).toEqual({
        name: 'This field is invalid',
        email: 'This field is invalid'
      });
    });
    
    it('should handle string errors', () => {
      const result = extractApiFormErrors('Something went wrong');
      
      expect(result.formError).toBe('Something went wrong');
      expect(result.fieldErrors).toEqual({});
    });
    
    it('should use default message for unknown errors', () => {
      const result = extractApiFormErrors(null, 'Custom default message');
      
      expect(result.formError).toBe('Custom default message');
      expect(result.fieldErrors).toEqual({});
    });
    
    it('should handle exceptions during extraction', () => {
      // Create an object that throws when accessed
      const errorObj = {
        get error() {
          throw new Error('Unexpected error during extraction');
        }
      };
      
      // Mock the error method for this specific test
      console.error = jest.fn();
      
      const result = extractApiFormErrors(errorObj);
      
      expect(result.formError).toBe('Please correct the errors below');
      expect(result.fieldErrors).toEqual({});
      expect(console.error).toHaveBeenCalled();
    });
  });
  
  describe('field operations', () => {
    it('should mark a field as touched', () => {
      const state = createEmptyFormany();
      const result = markFieldTouched(state, 'email');
      
      expect(result.touchedFields).toEqual({ email: true });
    });
    
    it('should mark all fields as touched', () => {
      const state = {
        formError: null,
        fieldErrors: { name: 'Required', email: 'Invalid' },
        touchedFields: { name: true }
      };
      
      const result = markAllFieldsTouched(state);
      
      expect(result.touchedFields).toEqual({
        name: true,
        email: true
      });
    });
    
    it('should mark specific fields as touched', () => {
      const state = {
        formError: null,
        fieldErrors: { name: 'Required', email: 'Invalid', phone: 'Invalid' },
        touchedFields: {}
      };
      
      const result = markAllFieldsTouched(state, ['name', 'email']);
      
      expect(result.touchedFields).toEqual({
        name: true,
        email: true
      });
      expect(result.touchedFields.phone).toBeUndefined();
    });
    
    it('should set a field error', () => {
      const state = createEmptyFormany();
      const result = setFieldError(state, 'email', 'Email is invalid');
      
      expect(result.fieldErrors).toEqual({ email: 'Email is invalid' });
      expect(result.touchedFields).toEqual({ email: true });
    });
    
    it('should clear a field error', () => {
      const state = {
        formError: null,
        fieldErrors: { name: 'Required', email: 'Invalid' },
        touchedFields: { name: true, email: true }
      };
      
      const result = clearFieldError(state, 'email');
      
      expect(result.fieldErrors).toEqual({ name: 'Required' });
      expect(result.touchedFields).toEqual({ name: true, email: true });
    });
    
    it('should set a form-level error', () => {
      const state = createEmptyFormany();
      const result = setFormError(state, 'Form submission failed');
      
      expect(result.formError).toBe('Form submission failed');
    });
    
    it('should clear all errors', () => {
      const state = {
        formError: 'Form submission failed',
        fieldErrors: { name: 'Required', email: 'Invalid' },
        touchedFields: { name: true, email: true }
      };
      
      const result = log(state);
      
      expect(result.formError).toBeNull();
      expect(result.fieldErrors).toEqual({});
      expect(result.touchedFields).toEqual({ name: true, email: true });
    });
  });
  
  describe('error checking', () => {
    it('should check if a field has a visible error', () => {
      const state = {
        formError: null,
        fieldErrors: { name: 'Required', email: 'Invalid' },
        touchedFields: { name: true }
      };
      
      expect(hasVisibleFieldError(state, 'name')).toBe(true);
      expect(hasVisibleFieldError(state, 'email')).toBe(false);
      expect(hasVisibleFieldError(state, 'phone')).toBe(false);
    });
    
    it('should get the error message for a field', () => {
      const state = {
        formError: null,
        fieldErrors: { name: 'Required', email: 'Invalid' },
        touchedFields: { name: true }
      };
      
      expect(getFieldErrorMessage(state, 'name')).toBe('Required');
      expect(getFieldErrorMessage(state, 'email')).toBeNull();
      expect(getFieldErrorMessage(state, 'phone')).toBeNull();
    });
    
    it('should check if the form has any errors', () => {
      const emptyState = createEmptyFormany();
      expect(hasAnyError(emptyState)).toBe(false);
      
      const stateWithFormError = setFormError(emptyState, 'Form submission failed');
      expect(hasAnyError(stateWithFormError)).toBe(true);
      
      const stateWithFieldError = setFieldError(emptyState, 'email', 'Email is invalid');
      expect(hasAnyError(stateWithFieldError)).toBe(true);
    });
  });
});