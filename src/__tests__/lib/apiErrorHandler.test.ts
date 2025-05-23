// Set up mocks first
jest.mock('@/lib/errorService');

import { createMocks } from 'node-mocks-http';
import {
  handleApiRouteError,
  createApiValidationError,
  createNotFoundError,
  createUnauthorizedError,
  createForbiddenError,
  ErrorCode
} from '@/lib/apiErrorHandler';
import.*./lib/errorService';

describe('API Error Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleApiRouteError', () => {
    it('should handle general errors with 500 status code', () => {
      const { req, res } = createMocks({
        method: 'GET',
        url: '/api/test'
      });
      
      const error = new Error('Test error');
      
      handleApiRouteError(error, req, res, 'test-component');
      
      expect(res._getStatusCode()).toBe(500);
      expect(res._getJSONData()).toMatchObject({
        success: false,
        error: {
          message: expect.any(String),
          status: 500,
          code: ErrorCode.INTERNAL_ERROR
        }
      });
      expect(errorService.reportError).toHaveBeenCalled();
    });
    
    it('should handle validation errors with 400 status code', () => {
      const { req, res } = createMocks({
        method: 'POST',
        url: '/api/test'
      });
      
      const error = createApiValidationError('Invalid data', ['field1', 'field2']);
      
      handleApiRouteError(error, req, res, 'test-component');
      
      expect(res._getStatusCode()).toBe(400);
      expect(res._getJSONData()).toMatchObject({
        success: false,
        error: {
          message: 'Invalid data',
          status: 400,
          code: ErrorCode.VALIDATION_ERROR,
          details: {
            invalidFields: ['field1', 'field2']
          }
        }
      });
      expect(errorService.reportError).toHaveBeenCalled();
    });
    
    it('should handle not found errors with 404 status code', () => {
      const { req, res } = createMocks({
        method: 'GET',
        url: '/api/test/123'
      });
      
      const error = createNotFoundError('Resource not found', 'Item', 123);
      
      handleApiRouteError(error, req, res, 'test-component');
      
      expect(res._getStatusCode()).toBe(404);
      expect(res._getJSONData()).toMatchObject({
        success: false,
        error: {
          message: 'Resource not found',
          status: 404,
          code: ErrorCode.NOT_FOUND
        }
      });
      expect(errorService.reportError).toHaveBeenCalled();
    });
    
    it('should handle unauthorized errors with 401 status code', () => {
      const { req, res } = createMocks({
        method: 'GET',
        url: '/api/test/secure'
      });
      
      const error = createUnauthorizedError();
      
      handleApiRouteError(error, req, res, 'test-component');
      
      expect(res._getStatusCode()).toBe(401);
      expect(res._getJSONData()).toMatchObject({
        success: false,
        error: {
          message: 'Authentication required',
          status: 401,
          code: ErrorCode.UNAUTHORIZED
        }
      });
      expect(errorService.reportError).toHaveBeenCalled();
    });
    
    it('should handle forbidden errors with 403 status code', () => {
      const { req, res } = createMocks({
        method: 'POST',
        url: '/api/test/admin'
      });
      
      const error = createForbiddenError('You do not have permission to perform this action', ['admin']);
      
      handleApiRouteError(error, req, res, 'test-component');
      
      expect(res._getStatusCode()).toBe(403);
      expect(res._getJSONData()).toMatchObject({
        success: false,
        error: {
          message: 'You do not have permission to perform this action',
          status: 403,
          code: ErrorCode.FORBIDDEN
        }
      });
      expect(errorService.reportError).toHaveBeenCalled();
    });
    
    it('should sanitize headers to remove sensitive information', () => {
      const { req, res } = createMocks({
        method: 'GET',
        url: '/api/test',
        headers: {
          'authorization': 'Bearer token123',
          'cookie': 'session=abc123',
          'user-agent': 'Jest Test'
        }
      });
      
      const error = new Error('Test error');
      
      handleApiRouteError(error, req, res, 'test-component');
      
      expect(errorService.reportError).toHaveBeenCalled();
      
      // Extract the data passed to reportError
      const contextData = (errorService.reportError as jest.Mock).mock.calls[0][4];
      
      // Get the sanitized headers from the data property
      const headers = contextData.data.headers;
      
      // Check that sensitive headers were redacted
      expect(headers.authorization).toBe('[REDACTED]');
      expect(headers.cookie).toBe('[REDACTED]');
      // Non-sensitive headers should be preserved
      expect(headers['user-agent']).toBe('Jest Test');
    });
  });
  
  describe('error creation functions', () => {
    it('should create validation errors', () => {
      const error = createApiValidationError('Invalid data', ['field1', 'field2']);
      
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Invalid data');
      expect((error as any).invalidFields).toEqual(['field1', 'field2']);
      expect((error as any).code).toBe(ErrorCode.VALIDATION_ERROR);
    });
    
    it('should create not found errors', () => {
      const error = createNotFoundError('Item not found', 'Item', 123);
      
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('NotFoundError');
      expect(error.message).toBe('Item not found');
      expect((error as any).code).toBe(ErrorCode.NOT_FOUND);
      expect((error as any).details).toEqual({
        resourceType: 'Item',
        resourceId: 123
      });
    });
    
    it('should create unauthorized errors', () => {
      const error = createUnauthorizedError('Please log in');
      
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('UnauthorizedError');
      expect(error.message).toBe('Please log in');
      expect((error as any).code).toBe(ErrorCode.UNAUTHORIZED);
    });
    
    it('should create forbidden errors', () => {
      const error = createForbiddenError('Admin access required', ['admin']);
      
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('ForbiddenError');
      expect(error.message).toBe('Admin access required');
      expect((error as any).code).toBe(ErrorCode.FORBIDDEN);
      expect((error as any).details).toEqual({
        requiredRoles: ['admin']
      });
    });
  });
});