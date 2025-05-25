import { logger } from "@/lib/logger";
import { NextApiRequest, NextApiResponse } from 'next';
import {
  ErrorType,
  authenticationError,
  authorizationError,
  createErrorResponse,
  databaseError,
  error,
  externalError,
  mapError,
  notFoundError,
  nostrError,
  paymentError,
  throwAuthenticationError,
  throwAuthorizationError,
  throwDatabaseError,
  throwNotFoundError,
  throwValidationError,
  validationError
} from '../../lib/errorHandling';
import { createMocks } from 'node-mocks-http';

// Spy on console.log to verify logging
const originalConsoleError = console.log;
const mockConsoleError = jest.fn();

beforeAll(() => {
  console.log = mockConsoleError;
});

afterAll(() => {
  console.log = originalConsoleError;
});

beforeEach(() => {
  mockConsoleError.mockClear();
});

describe('Error Handling', () => {
  describe('error', () => {
    it('should log errors to console', () => {
      const testErr = new Error('Test error');
      logger.log('test location', testErr);
      expect(mockConsoleError).toHaveBeenCalled();
      expect(mockConsoleError.mock.calls[0][0]).toContain('Error in test location');
    });

    it('should handle errors without details', () => {
      logger.log('test location');
      expect(mockConsoleError).toHaveBeenCalled();
      expect(mockConsoleError.mock.calls[0][0]).toContain('Error in test location');
    });
  });

  describe('createErrorResponse', () => {
    it('should create a standardized error object', () => {
      const err = createErrorResponse(ErrorType.Validation, 'Invalid input', 400, { field: 'name' });
      expect(err).toEqual({
        type: ErrorType.Validation,
        message: 'Invalid input',
        status: 400,
        details: { field: 'name' }
      });
    });

    it('should use default status code', () => {
      const err = createErrorResponse(ErrorType.Internal, 'Something went wrong');
      expect(err.status).toBe(500);
    });
  });

  describe('mapError', () => {
    it('should map standard Error objects', () => {
      const err = new Error('Test error');
      const mappedErr = mapError(err);
      expect(mappedErr.message).toBe('Test error');
      expect(mappedErr.status).toBe(500);
    });

    it('should map Prisma errors', () => {
      const err = new Error('Prisma error');
      err.code = 'P2002';
      const mappedErr = mapError(err);
      expect(mappedErr.type).toBe(ErrorType.Database);
    });

    it('should map typed errors', () => {
      const err = new Error('Not found');
      err.name = ErrorType.NotFound;
      const mappedErr = mapError(err);
      expect(mappedErr.type).toBe(ErrorType.NotFound);
      expect(mappedErr.status).toBe(404);
    });

    it('should handle non-Error objects', () => {
      const err = { message: 'String error' };
      const mappedErr = mapError(err);
      expect(mappedErr.message).toBe('String error');
      expect(mappedErr.type).toBe(ErrorType.Internal);
    });
  });

  describe('error', () => {
    it('should send appropriate response for API errors', () => {
      const { req, res } = createMocks({
        method: 'GET',
        url: '/api/test'
      });
      
      const jsonSpy = jest.spyOn(res, 'json');
      const statusSpy = jest.spyOn(res, 'status');
      
      error(new Error('Test error'), req as unknown as NextApiRequest, res as unknown as NextApiResponse);
      
      expect(statusSpy).toHaveBeenCalledWith(500);
      expect(jsonSpy).toHaveBeenCalled();
      expect(jsonSpy.mock.calls[0][0]).toHaveProperty('error');
      expect(jsonSpy.mock.calls[0][0]).toHaveProperty('message', 'Test error');
    });
  });

  describe('Error creation functions', () => {
    it('should create validation error', () => {
      const err = validationError('Invalid input', { field: 'email' });
      expect(err.type).toBe(ErrorType.Validation);
      expect(err.status).toBe(400);
      expect(err.details).toEqual({ field: 'email' });
    });

    it('should create authentication error', () => {
      const err = authenticationError();
      expect(err.type).toBe(ErrorType.Authentication);
      expect(err.status).toBe(401);
      expect(err.message).toBe('Not authenticated');
    });

    it('should create authorization error', () => {
      const err = authorizationError('Insufficient permissions');
      expect(err.type).toBe(ErrorType.Authorization);
      expect(err.status).toBe(403);
      expect(err.message).toBe('Insufficient permissions');
    });

    it('should create not found error', () => {
      const err = notFoundError();
      expect(err.type).toBe(ErrorType.NotFound);
      expect(err.status).toBe(404);
    });

    it('should create database error', () => {
      const err = databaseError('DB connection failed');
      expect(err.type).toBe(ErrorType.Database);
      expect(err.status).toBe(500);
    });

    it('should create external API error', () => {
      const err = externalError();
      expect(err.type).toBe(ErrorType.External);
      expect(err.status).toBe(502);
    });

    it('should create payment error', () => {
      const err = paymentError('Payment declined');
      expect(err.type).toBe(ErrorType.Payment);
      expect(err.status).toBe(402);
      expect(err.message).toBe('Payment declined');
    });

    it('should create Nostr error', () => {
      const err = nostrError('Failed to publish event');
      expect(err.type).toBe(ErrorType.Nostr);
      expect(err.status).toBe(500);
    });
  });

  describe('Error throwing functions', () => {
    it('should throw validation error', () => {
      expect(() => throwValidationError('Invalid input')).toThrow();
      try {
        throwValidationError('Invalid input');
      } catch (e: any) {
        expect(e.name).toBe(ErrorType.Validation);
        expect(e.message).toBe('Invalid input');
      }
    });

    it('should throw authentication error', () => {
      expect(() => throwAuthenticationError()).toThrow();
      try {
        throwAuthenticationError();
      } catch (e: any) {
        expect(e.name).toBe(ErrorType.Authentication);
        expect(e.message).toBe('Not authenticated');
      }
    });

    it('should throw authorization error', () => {
      expect(() => throwAuthorizationError('Access denied')).toThrow();
      try {
        throwAuthorizationError('Access denied');
      } catch (e: any) {
        expect(e.name).toBe(ErrorType.Authorization);
        expect(e.message).toBe('Access denied');
      }
    });

    it('should throw not found error', () => {
      expect(() => throwNotFoundError('User not found')).toThrow();
      try {
        throwNotFoundError('User not found');
      } catch (e: any) {
        expect(e.name).toBe(ErrorType.NotFound);
        expect(e.message).toBe('User not found');
      }
    });

    it('should throw database error', () => {
      expect(() => throwDatabaseError('Query failed')).toThrow();
      try {
        throwDatabaseError('Query failed');
      } catch (e: any) {
        expect(e.name).toBe(ErrorType.Database);
        expect(e.message).toBe('Query failed');
      }
    });
  });
});