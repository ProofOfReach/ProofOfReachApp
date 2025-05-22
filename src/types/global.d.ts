/**
 * Global type definitions for the application
 */

// Add the __DEV__ property to the Window interface
interface Window {
  /**
   * Flag to indicate if the application is running in development mode
   * Used for testing and development features
   */
  __DEV__?: boolean;
}

// Add any other global type definitions below