/**
 * Simple logger service for the application
 */

import { UserRole } from '../types/role';

export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: number;
  context?: Record<string, any>;
  userRole?: UserRole;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000;

  private createEntry(level: LogEntry['level'], message: string, context?: Record<string, any>, userRole?: UserRole): LogEntry {
    return {
      level,
      message,
      timestamp: Date.now(),
      context,
      userRole,
    };
  }

  debug(message: string, context?: Record<string, any>, userRole?: UserRole): void {
    const entry = this.createEntry('debug', message, context, userRole);
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
    console.debug(`[DEBUG] ${message}`, context);
  }

  info(message: string, context?: Record<string, any>, userRole?: UserRole): void {
    const entry = this.createEntry('info', message, context, userRole);
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
    console.info(`[INFO] ${message}`, context);
  }

  warn(message: string, context?: Record<string, any>, userRole?: UserRole): void {
    const entry = this.createEntry('warn', message, context, userRole);
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
    console.warn(`[WARN] ${message}`, context);
  }

  error(message: string, context?: Record<string, any>, userRole?: UserRole): void {
    const entry = this.createEntry('error', message, context, userRole);
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
    console.error(`[ERROR] ${message}`, context);
  }

  log(message: string, context?: Record<string, any>, userRole?: UserRole): void {
    this.info(message, context, userRole);
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }
}

export const logger = new Logger();