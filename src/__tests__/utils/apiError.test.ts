import { ApiError } from '../../utils/apiError';

describe('ApiError Utility', () => {
  it('should create an error with the provided status code and message', () => {
    const error = new ApiError(404, 'Resource not found');
    
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Resource not found');
    expect(error.statusCode).toBe(404);
    expect(error.name).toBe('ApiError');
  });
  
  it('should use default message when none provided', () => {
    const error = new ApiError(500);
    
    expect(error.message).toBe('Internal server error');
    expect(error.statusCode).toBe(500);
  });
  
  it('should handle 400 error code with default message', () => {
    const error = new ApiError(400);
    
    expect(error.message).toBe('Bad request');
    expect(error.statusCode).toBe(400);
  });
  
  it('should handle 401 error code with default message', () => {
    const error = new ApiError(401);
    
    expect(error.message).toBe('Unauthorized');
    expect(error.statusCode).toBe(401);
  });
  
  it('should handle 403 error code with default message', () => {
    const error = new ApiError(403);
    
    expect(error.message).toBe('Forbidden');
    expect(error.statusCode).toBe(403);
  });
  
  it('should handle 404 error code with default message', () => {
    const error = new ApiError(404);
    
    expect(error.message).toBe('Resource not found');
    expect(error.statusCode).toBe(404);
  });
  
  it('should handle 409 error code with default message', () => {
    const error = new ApiError(409);
    
    expect(error.message).toBe('Conflict');
    expect(error.statusCode).toBe(409);
  });
  
  it('should handle 422 error code with default message', () => {
    const error = new ApiError(422);
    
    expect(error.message).toBe('Unprocessable entity');
    expect(error.statusCode).toBe(422);
  });
  
  it('should handle 429 error code with default message', () => {
    const error = new ApiError(429);
    
    expect(error.message).toBe('Too many requests');
    expect(error.statusCode).toBe(429);
  });
  
  it('should handle 502 error code with default message', () => {
    const error = new ApiError(502);
    
    expect(error.message).toBe('Bad gateway');
    expect(error.statusCode).toBe(502);
  });
  
  it('should handle 503 error code with default message', () => {
    const error = new ApiError(503);
    
    expect(error.message).toBe('Service unavailable');
    expect(error.statusCode).toBe(503);
  });
  
  it('should provide generic message for unknown status codes', () => {
    const unknownCode = 599;
    const error = new ApiError(unknownCode);
    
    expect(error.message).toBe(`Error with status code ${unknownCode}`);
    expect(error.statusCode).toBe(unknownCode);
  });
  
  it('should allow custom message to override default', () => {
    const error = new ApiError(404, 'User profile not found');
    
    expect(error.message).toBe('User profile not found');
    expect(error.statusCode).toBe(404);
  });
});