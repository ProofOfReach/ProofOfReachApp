// Temporary file to fix common TypeScript errors across multiple files
export type FixedUserType = {
  id: string;
  balance?: number;
  [key: string]: any;
};

export type FixedAuthType = {
  data: FixedUserType | null;
  [key: string]: any;
};

// Common fixes for window properties
declare global {
  interface Window {
    __errorState?: any;
    __errorMetrics?: any;
  }
}