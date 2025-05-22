import { createSwaggerSpec } from 'next-swagger-doc';

/**
 * Generate an extended OpenAPI specification with additional schemas, examples, and endpoints
 * 
 * @returns The complete OpenAPI specification
 */
export async function getExtendedOpenApiSpec() {
  // Basic specification
  const spec = createSwaggerSpec({
    apiFolder: 'src/pages/api',
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Proof Of Reach API',
        version: '1.0.0',
        description: 'API for the Proof Of Reach platform. This API allows advertisers and publishers to interact with the marketplace programmatically.',
        contact: {
          name: 'API Support',
          email: 'support@proofofreach.com',
        },
      },
      tags: [
        { name: 'Authentication', description: 'Endpoints for authentication and session management' },
        { name: 'API Keys', description: 'Endpoints for API key management' },
        { name: 'User', description: 'Endpoints for user profile and account management' },
        { name: 'Advertiser', description: 'Endpoints for advertisers to manage campaigns and ads' },
        { name: 'Publisher', description: 'Endpoints for publishers to manage ad spaces and integrations' },
        { name: 'Wallet', description: 'Endpoints for wallet and payment management' },
        { name: 'Analytics', description: 'Endpoints for retrieving analytics data' },
      ],
      components: {
        securitySchemes: {
          ApiKeyAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'Authorization',
            description: 'API key authentication. Format: `Bearer YOUR_API_KEY`',
          },
          NostrAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'JWT token obtained from Nostr authentication',
          },
        },
        schemas: {
          // Request schemas
          NostrLoginRequest: {
            type: 'object',
            required: ['pubkey', 'signature', 'challenge'],
            properties: {
              pubkey: {
                type: 'string',
                description: 'Nostr public key (npub or hex format)',
                example: 'npub1abc123...',
              },
              signature: {
                type: 'string',
                description: 'Signature of the challenge',
                example: 'valid_signature_here',
              },
              challenge: {
                type: 'string',
                description: 'Challenge string to sign',
                example: 'nostr:login:timestamp:1620000000',
              },
            },
          },
          ApiKey: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'Unique identifier for the API key',
                example: 'c1a2b3c4-d5e6-f7g8-h9i0',
              },
              name: {
                type: 'string',
                description: 'Name for the API key',
                example: 'My Publisher Integration',
              },
              key: {
                type: 'string',
                description: 'The actual API key value (only shown once on creation)',
                example: 'nam_api_2f7d9be052a0f2c1a8f5b71c5e4be8f0ad3ec8b6',
              },
              lastUsed: {
                type: 'string',
                format: 'date-time',
                nullable: true,
                description: 'When the key was last used',
                example: '2023-03-10T09:15:32Z',
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
                description: 'When the key was created',
                example: '2023-01-15T12:00:00Z',
              },
              expiresAt: {
                type: 'string',
                format: 'date-time',
                nullable: true,
                description: 'When the key expires (null if never)',
                example: '2024-01-15T12:00:00Z',
              },
            },
          },
          CreateAdRequest: {
            type: 'object',
            required: ['title', 'description', 'targetUrl', 'bidPerImpression', 'campaignId'],
            properties: {
              title: {
                type: 'string',
                description: 'Ad title',
                example: 'Try our new product',
                maxLength: 100,
              },
              description: {
                type: 'string',
                description: 'Ad description',
                example: 'Our new product is amazing and you should try it!',
                maxLength: 500,
              },
              imageUrl: {
                type: 'string',
                format: 'uri',
                description: 'URL to the ad image',
                example: 'https://example.com/images/ad.jpg',
              },
              targetUrl: {
                type: 'string',
                format: 'uri',
                description: 'URL where users will be directed when clicking the ad',
                example: 'https://example.com/product',
              },
              urlParameters: {
                type: 'object',
                description: 'URL parameters to add for tracking',
                example: {
                  utm_source: 'nostr',
                  utm_medium: 'ad',
                  utm_campaign: 'test',
                },
              },
              bidPerImpression: {
                type: 'integer',
                description: 'Bid amount per impression in satoshis',
                example: 10,
                minimum: 1,
              },
              bidPerClick: {
                type: 'integer',
                description: 'Bid amount per click in satoshis',
                example: 100,
                minimum: 0,
              },
              format: {
                type: 'string',
                description: 'Ad format',
                example: 'text-image',
                enum: ['text', 'image', 'text-image', 'rich'],
              },
              placement: {
                type: 'string',
                description: 'Preferred ad placement',
                example: 'feed',
                enum: ['feed', 'sidebar', 'banner', 'sponsored', 'native'],
              },
              freqCapViews: {
                type: 'integer',
                description: 'Frequency cap - maximum number of times to show to the same user',
                example: 3,
                minimum: 0,
              },
              freqCapHours: {
                type: 'integer',
                description: 'Frequency cap duration in hours',
                example: 24,
                minimum: 0,
              },
              targetInterests: {
                type: 'array',
                description: 'Target interests',
                example: ['bitcoin', 'web3', 'privacy'],
                items: {
                  type: 'string',
                },
              },
              targetLocation: {
                type: 'array',
                description: 'Target locations (countries)',
                example: ['US', 'CA', 'EU'],
                items: {
                  type: 'string',
                },
              },
              targetAge: {
                type: 'object',
                description: 'Target age range',
                example: {
                  min: 18,
                  max: 35,
                },
                properties: {
                  min: {
                    type: 'integer',
                    minimum: 0,
                  },
                  max: {
                    type: 'integer',
                    minimum: 0,
                  },
                },
              },
              campaignId: {
                type: 'string',
                description: 'ID of the campaign this ad belongs to',
                example: 'clm12345abcdef',
              },
            },
          },
          
          // Response schemas
          NostrLoginResponse: {
            type: 'object',
            properties: {
              token: {
                type: 'string',
                description: 'JWT token for authentication',
                example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              },
              user: {
                $ref: '#/components/schemas/User',
              },
            },
          },
          User: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'User ID',
                example: 'clm12345abcdef',
              },
              pubkey: {
                type: 'string',
                description: 'Nostr public key',
                example: 'npub1abc123...',
              },
              name: {
                type: 'string',
                description: 'User name',
                example: 'Alice',
              },
              email: {
                type: 'string',
                format: 'email',
                description: 'User email',
                example: 'alice@example.com',
              },
              isAdvertiser: {
                type: 'boolean',
                description: 'Whether the user has advertiser role',
                example: true,
              },
              isPublisher: {
                type: 'boolean',
                description: 'Whether the user has publisher role',
                example: false,
              },
              isAdmin: {
                type: 'boolean',
                description: 'Whether the user has admin role',
                example: false,
              },
              walletBalance: {
                type: 'number',
                description: 'User wallet balance in satoshis',
                example: 10000,
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
                description: 'User creation timestamp',
                example: '2023-01-01T00:00:00Z',
              },
              updatedAt: {
                type: 'string',
                format: 'date-time',
                description: 'User last update timestamp',
                example: '2023-01-01T00:00:00Z',
              },
            },
          },
          AdSpace: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'Ad space ID',
                example: 'clm12345abcdef',
              },
              name: {
                type: 'string',
                description: 'Ad space name',
                example: 'Blog Sidebar',
              },
              description: {
                type: 'string',
                description: 'Ad space description',
                example: 'Right sidebar on my blog',
              },
              type: {
                type: 'string',
                enum: ['BANNER', 'SIDEBAR', 'NATIVE', 'INLINE'],
                description: 'Ad space type',
                example: 'SIDEBAR',
              },
              url: {
                type: 'string',
                format: 'uri',
                description: 'URL where the ad space is located',
                example: 'https://example.com/blog',
              },
              allowedFormats: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: ['TEXT', 'IMAGE', 'TEXT_IMAGE'],
                },
                description: 'Allowed ad formats',
                example: ['TEXT', 'TEXT_IMAGE'],
              },
              status: {
                type: 'string',
                description: 'Ad space status',
                example: 'ACTIVE',
                enum: ['ACTIVE', 'INACTIVE', 'PENDING_REVIEW'],
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
                description: 'When the ad space was created',
                example: '2023-01-15T12:00:00Z',
              },
              updatedAt: {
                type: 'string',
                format: 'date-time',
                description: 'When the ad space was last updated',
                example: '2023-02-22T14:30:00Z',
              },
            },
          },
          Campaign: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'Campaign ID',
                example: 'clm12345abcdef',
              },
              name: {
                type: 'string',
                description: 'Campaign name',
                example: 'Summer Promotion',
              },
              description: {
                type: 'string',
                description: 'Campaign description',
                example: 'Promoting our summer product line',
              },
              budget: {
                type: 'integer',
                description: 'Total budget in satoshis',
                example: 10000000,
              },
              dailyBudget: {
                type: 'integer',
                description: 'Daily budget in satoshis',
                example: 100000,
              },
              startDate: {
                type: 'string',
                format: 'date-time',
                description: 'When the campaign starts',
                example: '2023-06-01T00:00:00Z',
              },
              endDate: {
                type: 'string',
                format: 'date-time',
                description: 'When the campaign ends',
                example: '2023-08-31T23:59:59Z',
              },
              status: {
                type: 'string',
                enum: ['DRAFT', 'ACTIVE', 'PAUSED', 'ENDED'],
                description: 'Campaign status',
                example: 'ACTIVE',
              },
              targetInterests: {
                type: 'array',
                items: {
                  type: 'string',
                },
                description: 'Target interests',
                example: ['bitcoin', 'lightning', 'nostr'],
              },
              targetLocation: {
                type: 'array',
                items: {
                  type: 'string',
                },
                description: 'Target locations',
                example: ['US', 'EU'],
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
                description: 'When the campaign was created',
                example: '2023-01-15T12:00:00Z',
              },
              updatedAt: {
                type: 'string',
                format: 'date-time',
                description: 'When the campaign was last updated',
                example: '2023-02-22T14:30:00Z',
              },
            },
          },
          Ad: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'Ad ID',
                example: 'clm12345abcdef',
              },
              title: {
                type: 'string',
                description: 'Ad title',
                example: 'Try our new product',
              },
              description: {
                type: 'string',
                description: 'Ad description',
                example: 'Our new product is amazing and you should try it!',
              },
              imageUrl: {
                type: 'string',
                format: 'uri',
                description: 'URL to the ad image',
                example: 'https://example.com/images/ad.jpg',
              },
              targetUrl: {
                type: 'string',
                format: 'uri',
                description: 'URL where users will be directed when clicking the ad',
                example: 'https://example.com/product',
              },
              urlParameters: {
                type: 'object',
                description: 'URL parameters to add for tracking',
                example: {
                  utm_source: 'nostr',
                  utm_medium: 'ad',
                  utm_campaign: 'test',
                },
              },
              bidPerImpression: {
                type: 'integer',
                description: 'Bid amount per impression in satoshis',
                example: 10,
              },
              bidPerClick: {
                type: 'integer',
                description: 'Bid amount per click in satoshis',
                example: 100,
              },
              format: {
                type: 'string',
                description: 'Ad format',
                example: 'text-image',
                enum: ['text', 'image', 'text-image', 'rich'],
              },
              placement: {
                type: 'string',
                description: 'Preferred ad placement',
                example: 'feed',
                enum: ['feed', 'sidebar', 'banner', 'sponsored', 'native'],
              },
              status: {
                type: 'string',
                description: 'Ad status',
                example: 'ACTIVE',
                enum: ['DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'REJECTED', 'PAUSED', 'ARCHIVED'],
              },
              freqCapViews: {
                type: 'integer',
                description: 'Frequency cap - maximum number of times to show to the same user',
                example: 3,
              },
              freqCapHours: {
                type: 'integer',
                description: 'Frequency cap duration in hours',
                example: 24,
              },
              targetInterests: {
                type: 'array',
                description: 'Target interests',
                example: ['bitcoin', 'web3', 'privacy'],
                items: {
                  type: 'string',
                },
              },
              targetLocation: {
                type: 'array',
                description: 'Target locations (countries)',
                example: ['US', 'CA', 'EU'],
                items: {
                  type: 'string',
                },
              },
              targetAge: {
                type: 'object',
                description: 'Target age range',
                example: {
                  min: 18,
                  max: 35,
                },
                properties: {
                  min: {
                    type: 'integer',
                  },
                  max: {
                    type: 'integer',
                  },
                },
              },
              impressions: {
                type: 'integer',
                description: 'Number of impressions',
                example: 1000,
              },
              clicks: {
                type: 'integer',
                description: 'Number of clicks',
                example: 50,
              },
              ctr: {
                type: 'number',
                description: 'Click-through rate (percentage)',
                example: 5.0,
              },
              spend: {
                type: 'integer',
                description: 'Total spend in satoshis',
                example: 10000,
              },
              campaignId: {
                type: 'string',
                description: 'ID of the campaign this ad belongs to',
                example: 'clm12345abcdef',
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
                description: 'Ad creation timestamp',
                example: '2023-01-01T00:00:00Z',
              },
              updatedAt: {
                type: 'string',
                format: 'date-time',
                description: 'Ad last update timestamp',
                example: '2023-01-01T00:00:00Z',
              },
            },
          },
        },
        responses: {
          ValidationError: {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    code: {
                      type: 'string',
                      example: 'VALIDATION_ERROR',
                    },
                    message: {
                      type: 'string',
                      example: 'Validation failed',
                    },
                    errors: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          field: {
                            type: 'string',
                            example: 'email',
                          },
                          message: {
                            type: 'string',
                            example: 'Email is required',
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          NotFoundError: {
            description: 'Resource not found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    code: {
                      type: 'string',
                      example: 'NOT_FOUND',
                    },
                    message: {
                      type: 'string',
                      example: 'Resource not found',
                    },
                  },
                },
              },
            },
          },
          InternalServerError: {
            description: 'Internal server error',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    code: {
                      type: 'string',
                      example: 'INTERNAL_SERVER_ERROR',
                    },
                    message: {
                      type: 'string',
                      example: 'An unexpected error occurred',
                    },
                  },
                },
              },
            },
          },
          UnauthorizedError: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    code: {
                      type: 'string',
                      example: 'UNAUTHORIZED',
                    },
                    message: {
                      type: 'string',
                      example: 'Authentication required',
                    },
                  },
                },
              },
            },
          },
          ForbiddenError: {
            description: 'Forbidden',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    code: {
                      type: 'string',
                      example: 'FORBIDDEN',
                    },
                    message: {
                      type: 'string',
                      example: 'You do not have permission to access this resource',
                    },
                  },
                },
              },
            },
          },
          TooManyRequests: {
            description: 'Too many requests',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    code: {
                      type: 'string',
                      example: 'TOO_MANY_REQUESTS',
                    },
                    message: {
                      type: 'string',
                      example: 'Rate limit exceeded',
                    },
                    retryAfter: {
                      type: 'integer',
                      example: 60,
                    },
                  },
                },
              },
            },
          },
        },
      },
      paths: {
        // Publisher Endpoints
        '/api/ads/serve': {
          get: {
            summary: 'Serve a single ad',
            description: 'Returns a contextual ad for display on the publisher\'s platform.',
            tags: ['Publisher'],
            security: [{ NostrAuth: [] }, { ApiKeyAuth: [] }],
            parameters: [
              {
                name: 'placement',
                in: 'query',
                schema: {
                  type: 'string'
                },
                required: false,
                description: 'Placement zone (e.g. \'sidebar\', \'header\')'
              },
              {
                name: 'pubkey',
                in: 'query',
                schema: {
                  type: 'string'
                },
                required: false,
                description: 'Optional Nostr pubkey of the publisher'
              }
            ],
            responses: {
              '200': {
                description: 'Returns one ad object',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/Ad'
                    }
                  }
                }
              },
              '401': {
                $ref: '#/components/responses/UnauthorizedError'
              },
              '500': {
                $ref: '#/components/responses/InternalServerError'
              }
            }
          }
        },

        // Authentication Endpoints
        '/api/auth/nostr-login': {
          post: {
            summary: 'Nostr login',
            description: 'Accepts a signed challenge and returns a session token or JWT.',
            tags: ['Authentication'],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/NostrLoginRequest'
                  }
                }
              }
            },
            responses: {
              '200': {
                description: 'Returns session token',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/NostrLoginResponse'
                    }
                  }
                }
              },
              '400': {
                $ref: '#/components/responses/ValidationError'
              },
              '401': {
                $ref: '#/components/responses/UnauthorizedError'
              },
              '500': {
                $ref: '#/components/responses/InternalServerError'
              }
            }
          }
        },
        '/api/auth/api-keys': {
          get: {
            summary: 'List API Keys',
            description: 'Get all API keys for the authenticated user',
            tags: ['Authentication', 'API Keys'],
            security: [{ NostrAuth: [] }],
            responses: {
              '200': {
                description: 'List of API keys',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/ApiKey'
                      }
                    }
                  }
                }
              },
              '401': {
                $ref: '#/components/responses/UnauthorizedError'
              }
            }
          },
          post: {
            summary: 'Create API Key',
            description: 'Create a new API key for the authenticated user',
            tags: ['Authentication', 'API Keys'],
            security: [{ NostrAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                      name: {
                        type: 'string',
                        description: 'Name for the API key',
                        example: 'My Publisher Integration'
                      },
                      expiresIn: {
                        type: 'integer',
                        description: 'Expiration time in seconds (optional, 0 = never expires)',
                        example: 31536000
                      }
                    }
                  }
                }
              }
            },
            responses: {
              '201': {
                description: 'API key created successfully',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/ApiKey'
                    }
                  }
                }
              },
              '400': {
                $ref: '#/components/responses/ValidationError'
              },
              '401': {
                $ref: '#/components/responses/UnauthorizedError'
              }
            }
          }
        },
        '/api/auth/api-keys/{id}': {
          parameters: {
            name: 'id',
            in: 'path',
            required: true,
            description: 'API key ID',
            schema: {
              type: 'string'
            }
          },
          get: {
            summary: 'Get API Key',
            description: 'Get details of a specific API key',
            tags: ['Authentication', 'API Keys'],
            security: [{ NostrAuth: [] }],
            responses: {
              '200': {
                description: 'API key details',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/ApiKey'
                    }
                  }
                }
              },
              '401': {
                $ref: '#/components/responses/UnauthorizedError'
              },
              '404': {
                $ref: '#/components/responses/NotFoundError'
              }
            }
          },
          delete: {
            summary: 'Delete API Key',
            description: 'Delete a specific API key',
            tags: ['Authentication', 'API Keys'],
            security: [{ NostrAuth: [] }],
            responses: {
              '204': {
                description: 'API key deleted successfully'
              },
              '401': {
                $ref: '#/components/responses/UnauthorizedError'
              },
              '404': {
                $ref: '#/components/responses/NotFoundError'
              }
            }
          }
        },

        // User Endpoints
        '/api/users/me': {
          get: {
            summary: 'Get User Profile',
            description: 'Get the profile of the authenticated user',
            tags: ['User'],
            security: [{ NostrAuth: [] }, { ApiKeyAuth: [] }],
            responses: {
              '200': {
                description: 'User profile',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/User'
                    }
                  }
                }
              },
              '401': {
                $ref: '#/components/responses/UnauthorizedError'
              }
            }
          },
          patch: {
            summary: 'Update User Profile',
            description: 'Update the profile of the authenticated user',
            tags: ['User'],
            security: [{ NostrAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      name: {
                        type: 'string',
                        description: 'Display name',
                        example: 'Alice'
                      },
                      email: {
                        type: 'string',
                        format: 'email',
                        description: 'Email address',
                        example: 'alice@example.com'
                      }
                    }
                  }
                }
              }
            },
            responses: {
              '200': {
                description: 'User profile updated successfully',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/User'
                    }
                  }
                }
              },
              '400': {
                $ref: '#/components/responses/ValidationError'
              },
              '401': {
                $ref: '#/components/responses/UnauthorizedError'
              }
            }
          }
        },

        // Advertiser Endpoints
        '/api/campaigns': {
          get: {
            summary: 'List Campaigns',
            description: 'Get all campaigns for the authenticated advertiser',
            tags: ['Advertiser'],
            security: [{ NostrAuth: [] }, { ApiKeyAuth: [] }],
            parameters: [
              {
                name: 'status',
                in: 'query',
                schema: {
                  type: 'string',
                  enum: ['ACTIVE', 'PAUSED', 'DRAFT', 'ENDED']
                },
                description: 'Filter campaigns by status'
              },
              {
                name: 'page',
                in: 'query',
                schema: {
                  type: 'integer',
                  default: 1
                },
                description: 'Page number for pagination'
              },
              {
                name: 'limit',
                in: 'query',
                schema: {
                  type: 'integer',
                  default: 20,
                  maximum: 100
                },
                description: 'Number of items per page'
              }
            ],
            responses: {
              '200': {
                description: 'List of campaigns',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'array',
                          items: {
                            $ref: '#/components/schemas/Campaign'
                          }
                        },
                        pagination: {
                          type: 'object',
                          properties: {
                            total: {
                              type: 'integer'
                            },
                            page: {
                              type: 'integer'
                            },
                            limit: {
                              type: 'integer'
                            },
                            pages: {
                              type: 'integer'
                            }
                          }
                        }
                      }
                    }
                  }
                }
              },
              '401': {
                $ref: '#/components/responses/UnauthorizedError'
              }
            }
          },
          post: {
            summary: 'Create Campaign',
            description: 'Create a new advertising campaign',
            tags: ['Advertiser'],
            security: [{ NostrAuth: [] }, { ApiKeyAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['name', 'budget'],
                    properties: {
                      name: {
                        type: 'string',
                        description: 'Campaign name',
                        example: 'Summer Promotion'
                      },
                      description: {
                        type: 'string',
                        description: 'Campaign description',
                        example: 'Promoting our summer product line'
                      },
                      budget: {
                        type: 'integer',
                        description: 'Total budget in satoshis',
                        example: 10000000
                      },
                      dailyBudget: {
                        type: 'integer',
                        description: 'Daily budget in satoshis',
                        example: 100000
                      },
                      startDate: {
                        type: 'string',
                        format: 'date-time',
                        description: 'When the campaign starts',
                        example: '2023-06-01T00:00:00Z'
                      },
                      endDate: {
                        type: 'string',
                        format: 'date-time',
                        description: 'When the campaign ends',
                        example: '2023-08-31T23:59:59Z'
                      },
                      status: {
                        type: 'string',
                        enum: ['DRAFT', 'ACTIVE', 'PAUSED'],
                        description: 'Campaign status',
                        example: 'DRAFT'
                      },
                      targetInterests: {
                        type: 'array',
                        items: {
                          type: 'string'
                        },
                        description: 'Target interests',
                        example: ['bitcoin', 'lightning', 'nostr']
                      },
                      targetLocation: {
                        type: 'array',
                        items: {
                          type: 'string'
                        },
                        description: 'Target locations',
                        example: ['US', 'EU']
                      }
                    }
                  }
                }
              }
            },
            responses: {
              '201': {
                description: 'Campaign created successfully',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/Campaign'
                    }
                  }
                }
              },
              '400': {
                $ref: '#/components/responses/ValidationError'
              },
              '401': {
                $ref: '#/components/responses/UnauthorizedError'
              }
            }
          }
        },

        // Publisher Endpoints
        '/api/publisher/ad-spaces': {
          get: {
            summary: 'List Ad Spaces',
            description: 'Get all ad spaces for the authenticated publisher',
            tags: ['Publisher'],
            security: [{ NostrAuth: [] }, { ApiKeyAuth: [] }],
            responses: {
              '200': {
                description: 'List of ad spaces',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/AdSpace'
                      }
                    }
                  }
                }
              },
              '401': {
                $ref: '#/components/responses/UnauthorizedError'
              }
            }
          },
          post: {
            summary: 'Create Ad Space',
            description: 'Create a new ad space',
            tags: ['Publisher'],
            security: [{ NostrAuth: [] }, { ApiKeyAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['name', 'type'],
                    properties: {
                      name: {
                        type: 'string',
                        description: 'Ad space name',
                        example: 'Blog Sidebar'
                      },
                      description: {
                        type: 'string',
                        description: 'Ad space description',
                        example: 'Right sidebar on my blog'
                      },
                      type: {
                        type: 'string',
                        enum: ['BANNER', 'SIDEBAR', 'NATIVE', 'INLINE'],
                        description: 'Ad space type',
                        example: 'SIDEBAR'
                      },
                      url: {
                        type: 'string',
                        format: 'uri',
                        description: 'URL where the ad space is located',
                        example: 'https://example.com/blog'
                      },
                      allowedFormats: {
                        type: 'array',
                        items: {
                          type: 'string',
                          enum: ['TEXT', 'IMAGE', 'TEXT_IMAGE']
                        },
                        description: 'Allowed ad formats',
                        example: ['TEXT', 'TEXT_IMAGE']
                      }
                    }
                  }
                }
              }
            },
            responses: {
              '201': {
                description: 'Ad space created successfully',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/AdSpace'
                    }
                  }
                }
              },
              '400': {
                $ref: '#/components/responses/ValidationError'
              },
              '401': {
                $ref: '#/components/responses/UnauthorizedError'
              }
            }
          }
        },

        // Wallet Endpoints
        '/api/payments/wallet/balance': {
          get: {
            summary: 'Get Wallet Balance',
            description: 'Get the current wallet balance of the authenticated user',
            tags: ['Wallet'],
            security: [{ NostrAuth: [] }, { ApiKeyAuth: [] }],
            responses: {
              '200': {
                description: 'Wallet balance',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        balance: {
                          type: 'integer',
                          description: 'Balance in satoshis',
                          example: 1234567
                        }
                      }
                    }
                  }
                }
              },
              '401': {
                $ref: '#/components/responses/UnauthorizedError'
              }
            }
          }
        },
        '/api/payments/wallet/deposit': {
          post: {
            summary: 'Create Deposit Invoice',
            description: 'Create a Lightning invoice to deposit funds into the wallet',
            tags: ['Wallet'],
            security: [{ NostrAuth: [] }, { ApiKeyAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['amount'],
                    properties: {
                      amount: {
                        type: 'integer',
                        description: 'Amount to deposit in satoshis',
                        example: 100000
                      },
                      description: {
                        type: 'string',
                        description: 'Optional description for the invoice',
                        example: 'Deposit to Nostr Ad Marketplace'
                      }
                    }
                  }
                }
              }
            },
            responses: {
              '200': {
                description: 'Lightning invoice created',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        invoice: {
                          type: 'string',
                          description: 'Lightning invoice (BOLT11)',
                          example: 'lnbc1500n1pvjluezpp...'
                        },
                        expiresAt: {
                          type: 'string',
                          format: 'date-time',
                          description: 'When the invoice expires',
                          example: '2023-06-15T15:30:00Z'
                        }
                      }
                    }
                  }
                }
              },
              '400': {
                $ref: '#/components/responses/ValidationError'
              },
              '401': {
                $ref: '#/components/responses/UnauthorizedError'
              }
            }
          }
        },

        // Analytics
        '/api/analytics/campaigns/{id}': {
          parameters: {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Campaign ID',
            schema: {
              type: 'string'
            }
          },
          get: {
            summary: 'Get Campaign Analytics',
            description: 'Get analytics data for a specific campaign',
            tags: ['Analytics'],
            security: [{ NostrAuth: [] }, { ApiKeyAuth: [] }],
            parameters: [
              {
                name: 'from',
                in: 'query',
                schema: {
                  type: 'string',
                  format: 'date'
                },
                description: 'Start date for analytics (YYYY-MM-DD)'
              },
              {
                name: 'to',
                in: 'query',
                schema: {
                  type: 'string',
                  format: 'date'
                },
                description: 'End date for analytics (YYYY-MM-DD)'
              },
              {
                name: 'groupBy',
                in: 'query',
                schema: {
                  type: 'string',
                  enum: ['day', 'week', 'month']
                },
                description: 'How to group the analytics data'
              }
            ],
            responses: {
              '200': {
                description: 'Campaign analytics data',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        impressions: {
                          type: 'integer',
                          description: 'Total number of impressions',
                          example: 12500
                        },
                        clicks: {
                          type: 'integer',
                          description: 'Total number of clicks',
                          example: 250
                        },
                        ctr: {
                          type: 'number',
                          format: 'float',
                          description: 'Click-through rate',
                          example: 2.0
                        },
                        spend: {
                          type: 'integer',
                          description: 'Total spend in satoshis',
                          example: 125000
                        },
                        timeline: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              date: {
                                type: 'string',
                                format: 'date',
                                example: '2023-06-15'
                              },
                              impressions: {
                                type: 'integer',
                                example: 1200
                              },
                              clicks: {
                                type: 'integer',
                                example: 35
                              },
                              spend: {
                                type: 'integer',
                                example: 12000
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              },
              '401': {
                $ref: '#/components/responses/UnauthorizedError'
              },
              '404': {
                $ref: '#/components/responses/NotFoundError'
              }
            }
          }
        }
      },
      security: [
        {
          ApiKeyAuth: [],
        },
        {
          NostrAuth: [],
        },
      ],
    },
  });

  return spec;
}