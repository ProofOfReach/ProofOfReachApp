export type ErrorType = 'business' | 'technical' | 'network' | 'validation' | 'unexpected';

export type ErrorSeverity = 'info' | 'warn' | 'error' | 'critical';

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