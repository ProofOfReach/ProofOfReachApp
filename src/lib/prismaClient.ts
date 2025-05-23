/**
 * Prisma Client Singleton
 * 
 * This module provides a single, application-wide Prisma Client instance
 * to prevent connection pool exhaustion and ensure consistent database interactions.
 * 
 * IMPORTANT: Import this file for all database access in the application.
 * Do NOT create new PrismaClient instances elsewhere to avoid connection leaks.
 */
import { PrismaClient, Prisma } from '@prisma/client';
import { logger } from './logger';

// Define event types for better type safety
interface QueryEvent {
  timestamp: Date;
  query: string;
  params: string;
  duration: number;
  target: string;
}

interface LogEvent {
  timestamp: Date;
  message: string;
  target: string;
}

// Add type declaration for global object to maintain singleton in development
declare global {
  // eslint-disable-next-line no-var
  var prismaClient: PrismaClient | undefined;
}

// Important: Only initialize PrismaClient if we're on the server-side
// This prevents the browser from trying to run PrismaClient which causes errors
const prismaClientSingleton = () => {
  // Skip initializing PrismaClient in the browser environment
  if (typeof window !== 'undefined') {
    return {} as PrismaClient;
  }

  /**
   * Configure PrismaClient options based on environment
   */
  const getPrismaClientOptions = (): Prisma.PrismaClientOptions => {
    // In testing, disable logging for cleaner test output
    if (process.env.NODE_ENV === 'test') {
      return {};
    }
    
    // In development and production, enable appropriate logging
    return {
      log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'event' },
        { level: 'info', emit: 'event' },
        { level: 'warn', emit: 'event' },
      ],
    };
  };

  // Check if we already have an instance to reuse (needed for Next.js hot-reloading)
  if (globalThis.prismaClient) {
    logger.debug('Reusing existing Prisma client instance');
    return globalThis.prismaClient;
  }
  
  logger.info('Creating new Prisma client instance');
  const client = new PrismaClient(getPrismaClientOptions());
  
  // Set up event listeners for non-test environments
  if (process.env.NODE_ENV !== 'test') {
    // Use type assertions to resolve TypeScript errors with Prisma's event system
    (client as any).$on('query', (event: QueryEvent) => {
      if (process.env.NODE_ENV === 'development') {
        logger.debug(`Prisma Query: ${event.query}`);
        logger.debug(`Params: ${event.params}`);
        logger.debug(`Duration: ${event.duration}ms`);
      }
    });

    (client as any).$on('error', (event: LogEvent) => {
      logger.log(`Prisma Error: ${event.message}`);
    });

    (client as any).$on('info', (event: LogEvent) => {
      logger.info(`Prisma Info: ${event.message}`);
    });

    (client as any).$on('warn', (event: LogEvent) => {
      logger.warn(`Prisma Warning: ${event.message}`);
    });
  }
  
  // In development, keep reference to avoid multiple instances during hot reloading
  if (process.env.NODE_ENV === 'development') {
    globalThis.prismaClient = client;
  }
  
  /**
   * Handles graceful shutdown of the database connection
   * This is important for clean process termination, especially in containerized environments
   */
  const handleShutdown = async () => {
    logger.info('Shutting down Prisma client connection...');
    try {
      await client.$disconnect();
      logger.info('Database connection closed gracefully');
      process.exit(0);
    } catch (error) {
      logger.log('Error disconnecting from database', error);
      process.exit(1);
    }
  };

  // Register shutdown handlers in production
  if (process.env.NODE_ENV === 'production') {
    process.on('SIGINT', handleShutdown);
    process.on('SIGTERM', handleShutdown);
    process.on('beforeExit', handleShutdown);
  }
  
  return client;
};

// Initialize the singleton instance
export const prisma = prismaClientSingleton();

// Export the singleton instance
export default prisma;