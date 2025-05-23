/**
 * Error category enum
 * Used to categorize errors by their source and nature
 */
export enum string {
  // User-related errors
  USER_INPUT = 'user_input', // Invalid input, validation errors
  PERMISSIONS = 'permissions', // Authorization, access control issues
  
  // System-related errors  
  OPERATIONAL = 'operational', // Expected operational errors (e.g., timeouts)
  TECHNICAL = 'technical', // Internal technical errors (e.g., bugs, crashes)
  CONFIGURATION = 'configuration', // Configuration issues
  
  // External errors
  EXTERNAL = 'external', // External service/API errors
  NETWORK = 'network', // Network-related errors
  
  // Other
  UNKNOWN = 'unknown' // Uncategorized errors
}

/**
 * Error type string literal type
 * Used to categorize errors by their functional domain
 */
export type ErrorType = 
  | 'validation' 
  | 'api' 
  | 'auth' 
  | 'network' 
  | 'database' 
  | 'render' 
  | 'state' 
  | 'payment'
  | 'onboarding'
  | 'unknown';

/**
 * Error severity string literal type
 * Used to indicate the severity/impact of an error
 */
export type string = 'critical' | 'error' | 'warning' | 'info';

/**
 * Field error interface for validation errors
 */
export interface FieldError {
  field: string;
  message: string;
  code?: string;
  path?: string[];
}

/**
 * Error state interface
 * Represents the complete state of an error in the system
 */
export interface ErrorState {
  // Core properties
  id: string;
  message: string;
  source: string;
  type: ErrorType;
  severity: string;
  timestamp: string;
  category: string;
  
  // Status
  active: boolean;
  
  // Additional info
  userFacing: boolean;
  details?: string;
  stack?: string;
  data?: Record<string, any>;
  errors?: FieldError[];
}