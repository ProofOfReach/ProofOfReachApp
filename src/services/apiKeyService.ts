import { prisma } from '@/lib/prismaClient';
import crypto from 'crypto';
import { logger } from '@/lib/logger';
import { Prisma } from '@prisma/client';

/**
 * API Key Service
 * Handles the creation, validation, and management of API keys
 */

export type ApiKeyType = 'publisher' | 'advertiser' | 'developer';

export interface ApiKeyCreateParams {
  name: string;
  description?: string;
  expiresAt?: Date | null;
  scopes?: string;
  userId: string;
  type?: ApiKeyType;
}

export interface ApiKeyResponse {
  id: string;
  key: string;
  name: string;
  description?: string | null;
  createdAt: Date;
  expiresAt?: Date | null;
  scopes: string;
  type: string;
  isSuccess: boolean;
  error?: string | null;
}

/**
 * Creates a new API key with consistent error handling and retries
 */
export async function createApiKey(params: ApiKeyCreateParams): Promise<ApiKeyResponse> {
  const { 
    name, 
    description = '', 
    expiresAt = null, 
    scopes = 'read', 
    userId,
    type = 'publisher'
  } = params;

  if (!userId) {
    return {
      id: '',
      key: '',
      name,
      createdAt: new Date(),
      scopes,
      type,
      isSuccess: false,
      error: 'User ID is required'
    };
  }
  
  // Generate a prefix based on the key type
  const prefix = type === 'publisher' ? 'pub_' : 
                 type === 'advertiser' ? 'adv_' : 
                 'dev_';
  
  // Generate a unique API key with a consistent format
  const keyValue = `${prefix}${crypto.randomBytes(16).toString('hex')}`;
  
  try {
    // Define the data object with proper TypeScript typing
    const data: Prisma.ApiKeyCreateInput = {
      key: keyValue,
      name,
      description,
      expiresAt,
      scopes,
      user: userId ? { connect: { id: userId } } : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      usageCount: 0,
    };
    
    // Explicitly set type field as a direct property (Prisma allows this for direct db fields)
    const fullData = {
      ...data,
      type,
    };
    
    // Create the API key using Prisma client
    const apiKey = await prisma.apiKey.create({
      data: fullData as any, // Using 'any' to bypass TypeScript checking for now
      select: {
        id: true,
        key: true,
        name: true, 
        description: true,
        createdAt: true,
        expiresAt: true,
        scopes: true,
      }
    });
    
    logger.log(`Successfully created ${type} API key for user: ${userId.substring(0, 8)}...`);
    
    // Return with the type field manually added
    return {
      ...apiKey,
      type, // Add the type field manually since it's not part of the select
      isSuccess: true,
      error: null
    } as ApiKeyResponse;
  } catch (error) {
    // Log the error for debugging
    logger.error(`Failed to create API key: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    // Fall back to a deterministic key based on the user's ID
    // This ensures the UI can continue but will indicate there was an error
    const fallbackKey = `${prefix}fallback_${userId.substring(0, 8)}_${Date.now()}`;
    
    return {
      id: `fallback_${userId.substring(0, 8)}`,
      key: fallbackKey,
      name,
      createdAt: new Date(),
      scopes,
      type,
      isSuccess: false,
      error: error instanceof Error ? error.message : 'Failed to create API key'
    };
  }
}

/**
 * Gets all API keys for a user
 */
export async function getUserApiKeys(userId: string) {
  try {
    const apiKeys = await prisma.apiKey.findMany({
      where: {
        userId
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        lastUsed: true,
        expiresAt: true,
        isActive: true,
        scopes: true,
        usageCount: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Get the raw query results to access the type field
    // @ts-ignore - Allow accessing raw results
    const rawApiKeys = apiKeys._prisma;
    
    // For now, handle key types more directly since we're having issues with the raw query results
    // This is a fallback approach until we fix the Prisma schema properly
    // Using a safe approach to handle key prefixes
    const apiKeysWithType = apiKeys.map(key => {
      // Determine the key type from the scopes or another field
      // Since 'key' field may not be directly accessible in SELECT results
      let keyType = 'publisher'; // Default
      
      // Use scopes as a fallback indicator for the type
      const scopes = key.scopes || '';
      if (scopes.includes('publisher')) keyType = 'publisher';
      else if (scopes.includes('advertiser')) keyType = 'advertiser';
      else if (scopes.includes('developer')) keyType = 'developer';
      
      return {
        ...key,
        type: keyType
      };
    });
    
    return { keys: apiKeysWithType, isSuccess: true, error: null };
  } catch (error) {
    logger.error(`Failed to get API keys for user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { keys: [], isSuccess: false, error: 'Failed to retrieve API keys' };
  }
}

/**
 * Verifies if an API key is valid and active
 */
export async function verifyApiKey(apiKeyValue: string) {
  if (!apiKeyValue) {
    return { isValid: false, error: 'API key is required' };
  }
  
  try {
    const apiKey = await prisma.apiKey.findUnique({
      where: {
        key: apiKeyValue
      },
      select: {
        id: true,
        userId: true,
        scopes: true,
        isActive: true,
        expiresAt: true,
      }
    });
    
    if (!apiKey) {
      return { isValid: false, error: 'Invalid API key' };
    }
    
    // Check if the API key is active and not expired
    const now = new Date();
    const isExpired = apiKey.expiresAt && apiKey.expiresAt < now;
    
    if (!apiKey.isActive || isExpired) {
      return { isValid: false, error: 'API key is inactive or expired' };
    }
    
    // Instead of using raw query, determine the type from the key prefix
    // This is a more reliable approach that doesn't rely on schema inconsistencies
    let type = 'publisher'; // Default to publisher
    
    // Check if the key value follows our prefix pattern
    if (apiKeyValue.startsWith('pub_')) {
      type = 'publisher';
    } else if (apiKeyValue.startsWith('adv_')) {
      type = 'advertiser';
    } else if (apiKeyValue.startsWith('dev_')) {
      type = 'developer';
    }
    
    // Update the lastUsed timestamp and increment usageCount
    await prisma.apiKey.update({
      where: {
        id: apiKey.id
      },
      data: {
        lastUsed: now,
        usageCount: { increment: 1 }
      }
    });
    
    // API key is valid
    const scopes = apiKey.scopes ? apiKey.scopes.split(',') : [];
    
    return {
      isValid: true,
      keyId: apiKey.id,
      scopes,
      userId: apiKey.userId,
      type
    };
  } catch (error) {
    logger.error(`Error verifying API key: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { isValid: false, error: 'Error validating API key' };
  }
}