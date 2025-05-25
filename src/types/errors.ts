export type ErrorType = 'business' | 'technical' | 'network' | 'validation' | 'unexpected';

export type ErrorSeverity = 'info' | 'warn' | 'error' | 'critical';

export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMITED = 'RATE_LIMITED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  CONFLICT = 'CONFLICT',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  TIMEOUT = 'TIMEOUT'
}

export interface ErrorState {
  hasError: boolean;
  message: string;
  type: ErrorType;
  severity: ErrorSeverity;
  timestamp?: number;
  code?: string;
  details?: string;
  source?: string;
}

export interface FieldError {
  message: string;
  type?: string;
}