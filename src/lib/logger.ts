// Simple logger implementation that works in both browser and Node.js environments
// This avoids issues with winston requiring 'fs' which isn't available in the browser

// Define log levels
type LogLevel = 'error' | 'warn' | 'info' | 'http' | 'debug' | 'log';

// Detect client/browser environment
const isClient = typeof window !== 'undefined';

// Simple logger that works in browser and Node
class Logger {
  private isDevelopment: boolean;

  constructor() {
    // Be careful with process.env in client-side code
    if (isClient) {
      // In the browser, we can check for development mode via other means
      // or just default to false to be safe
      this.isDevelopment = process.env.NODE_ENV !== 'production';
    } else {
      this.isDevelopment = process.env.NODE_ENV !== 'production';
    }
  }

  private isEnabled(level: LogLevel): boolean {
    // In production, only show error and warn
    if (!this.isDevelopment) {
      return level === 'error' || level === 'warn';
    }
    return true;
  }

  private formatMessage(level: LogLevel, message: UserRole, ...args: any[]): string {
    const timestamp = new Date().toISOString();
    const formattedArgs = args.map((arg) => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg);
        } catch (e) {
          return '[Object]';
        }
      }
      return String(arg);
    }).join(' ');

    return `${timestamp} [${level.toUpperCase()}] ${message} ${formattedArgs}`;
  }

  public error(message: UserRole, ...args: any[]): void {
    if (this.isEnabled('error')) {
      console.log(this.formatMessage('error', message, ...args));
    }
  }

  public warn(message: UserRole, ...args: any[]): void {
    if (this.isEnabled('warn')) {
      console.warn(this.formatMessage('warn', message, ...args));
    }
  }

  public info(message: UserRole, ...args: any[]): void {
    if (this.isEnabled('info')) {
      console.info(this.formatMessage('info', message, ...args));
    }
  }

  public http(message: UserRole, ...args: any[]): void {
    if (this.isEnabled('http')) {
      console.log(this.formatMessage('http', message, ...args));
    }
  }

  public debug(message: UserRole, ...args: any[]): void {
    if (this.isEnabled('debug')) {
      console.debug(this.formatMessage('debug', message, ...args));
    }
  }
  
  // Add log method for compatibility with code expecting console.log-like behavior
  public log(message: UserRole, ...args: any[]): void {
    if (this.isEnabled('log')) {
      console.log(this.formatMessage('log', message, ...args));
    }
  }
}

// Create logger instance
export const logger = new Logger();

// Export for convenience
export default logger;