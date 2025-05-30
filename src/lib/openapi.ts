import { createSwaggerSpec } from 'next-swagger-doc';

// Custom function to group paths by tags and reorganize the API documentation
const organizeSpecByTags = (spec: any) => {
  // Create tag groups
  const tagGroups = [
    {
      name: "Advertisers",
      tags: ["Ads", "Billing", "Campaigns"]
    },
    {
      name: "Analytics",
      tags: ["Metrics", "Performance", "Reports"]
    },
    {
      name: "Core",
      tags: ["Authentication", "Users"]
    },
    {
      name: "Publishers",
      tags: ["AdPlacements", "AdSpaces", "Earnings"]
    }
  ];

  // Add tag groups to the spec
  spec.tags = [
    { name: "AdPlacements", description: "Manage ad placements in ad spaces" },
    { name: "Ads", description: "Individual ad creation and management" },
    { name: "AdSpaces", description: "Ad space registration and management" },
    { name: "Authentication", description: "Authentication and API key operations" },
    { name: "Billing", description: "Billing and payment operations" },
    { name: "Campaigns", description: "Campaign creation and management" },
    { name: "Earnings", description: "Publisher earnings and withdrawals" },
    { name: "Metrics", description: "Access metrics and KPIs" },
    { name: "Performance", description: "Performance tracking and optimization" },
    { name: "Reports", description: "Generate reports for campaigns and ad spaces" },
    { name: "Users", description: "User account management" }
  ];

  // Add tag groups to spec for x-tagGroups extension
  spec["x-tagGroups"] = tagGroups;

  return spec;
};

export const getOpenApiSpec = () => {
  // Generate the OpenAPI specification
  const spec = createSwaggerSpec({
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Proof Of Reach API',
        version: '1.0.0',
        description: `
# Introduction
The Proof Of Reach API provides programmatic access to all features of the platform, allowing you to integrate advertising capabilities into your applications.

This API uses standard RESTful conventions with JSON request and response bodies. All requests require authentication either through API keys or Nostr-based authentication.

# Authentication
There are two ways to authenticate with the API:

## API Key Authentication
Most endpoints require an API key which you can generate in your account settings.
Include your API key in the \`X-API-Key\` header with all requests.

## Nostr Authentication
Some endpoints support Nostr-based authentication using public keys and signatures.

# Rate Limits
The API has rate limits to prevent abuse:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

# Webhooks
You can configure webhooks in your account settings to receive real-time notifications for specific events.

# Questions?
If you have any questions, please contact our [support team](mailto:support@proofofreach.com).
        `,
        contact: {
          name: 'API Support',
          email: 'support@proofofreach.com',
          url: 'https://proofofreach.com/contact'
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT'
        }
      },
      servers: [
        {
          url: '/api',
          description: 'Current API endpoint'
        },
        {
          url: 'https://api.proofofreach.com',
          description: 'Production API server'
        },
        {
          url: 'https://api-sandbox.proofofreach.com',
          description: 'Sandbox API server'
        }
      ],
      components: {
        securitySchemes: {
          ApiKeyAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'X-API-Key',
            description: 'API key for authentication (generate in dashboard settings)'
          },
          NostrAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'X-Nostr-Pubkey',
            description: 'Nostr public key for authentication'
          },
          NostrSignature: {
            type: 'apiKey',
            in: 'header',
            name: 'X-Nostr-Signature',
            description: 'Signature of the request payload with the Nostr private key'
          }
        },
        parameters: {
          pageParam: {
            name: 'page',
            in: 'query',
            description: 'Page number for pagination',
            schema: {
              type: 'integer',
              default: 1,
              minimum: 1
            }
          },
          limitParam: {
            name: 'limit',
            in: 'query',
            description: 'Number of items per page',
            schema: {
              type: 'integer',
              default: 20,
              minimum: 1,
              maximum: 100
            }
          },
          idParam: {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Unique identifier',
            schema: {
              type: 'string',
              format: 'uuid'
            }
          },
          statusParam: {
            name: 'status',
            in: 'query',
            description: 'Filter by status',
            schema: {
              type: 'string',
              enum: ['ACTIVE', 'PAUSED', 'ENDED', 'DRAFT']
            }
          },
          dateFromParam: {
            name: 'dateFrom',
            in: 'query',
            description: 'Filter by start date (ISO 8601)',
            schema: {
              type: 'string',
              format: 'date-time'
            }
          },
          dateToParam: {
            name: 'dateTo',
            in: 'query',
            description: 'Filter by end date (ISO 8601)',
            schema: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        responses: {
          Unauthorized: {
            description: 'Unauthorized - Authentication credentials are missing or invalid',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                },
                example: {
                  code: 'UNAUTHORIZED',
                  message: 'Invalid or missing API key'
                }
              }
            }
          },
          Forbidden: {
            description: 'Forbidden - User does not have permission to access the resource',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                },
                example: {
                  code: 'FORBIDDEN',
                  message: 'You do not have permission to access this resource'
                }
              }
            }
          },
          NotFound: {
            description: 'Not Found - The requested resource does not exist',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                },
                example: {
                  code: 'NOT_FOUND',
                  message: 'The requested resource was not found'
                }
              }
            }
          },
          ValidationError: {
            description: 'Validation Error - The request contains invalid data',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    code: {
                      type: 'string',
                      example: 'VALIDATION_ERROR'
                    },
                    message: {
                      type: 'string',
                      example: 'Validation failed'
                    },
                    errors: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          field: {
                            type: 'string'
                          },
                          message: {
                            type: 'string'
                          }
                        }
                      },
                      example: [
                        {
                          field: 'name',
                          message: 'Name is required'
                        },
                        {
                          field: 'budget',
                          message: 'Budget must be a positive number'
                        }
                      ]
                    }
                  }
                }
              }
            }
          },
          InternalServerError: {
            description: 'Internal Server Error - Something went wrong on the server',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                },
                example: {
                  code: 'INTERNAL_SERVER_ERROR',
                  message: 'An unexpected error occurred'
                }
              }
            }
          }
        },
        schemas: {
          Error: {
            type: 'object',
            required: ['code', 'message'],
            properties: {
              code: {
                type: 'string',
                description: 'Error code for programmatic handling',
                example: 'INVALID_INPUT'
              },
              message: {
                type: 'string',
                description: 'Human-readable error message',
                example: 'Invalid input provided'
              }
            }
          },
          
          // User and Auth schemas
          User: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
                description: 'Unique identifier for the user',
                example: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
              },
              pubkey: {
                type: 'string',
                description: 'Nostr public key',
                example: 'npub1abcdef0123456789abcdef0123456789abcdef0123456789abcdef01234567'
              },
              name: {
                type: 'string',
                description: 'Display name',
                example: 'Bitcoin Maximalist'
              },
              email: {
                type: 'string',
                format: 'email',
                nullable: true,
                description: 'Email address (if provided)',
                example: 'user@example.com'
              },
              isAdvertiser: {
                type: 'boolean',
                description: 'Whether the user is an advertiser',
                example: true
              },
              isPublisher: {
                type: 'boolean',
                description: 'Whether the user is a publisher',
                example: false
              },
              walletBalance: {
                type: 'integer',
                description: 'User wallet balance in satoshis',
                example: 1050000
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
                description: 'When the user was created',
                example: '2023-01-15T12:00:00Z'
              },
              updatedAt: {
                type: 'string',
                format: 'date-time',
                description: 'When the user was last updated',
                example: '2023-02-22T14:30:00Z'
              }
            }
          },
          
          ApiKey: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
                description: 'Unique identifier for the API key',
                example: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
              },
              name: {
                type: 'string',
                description: 'Name for the API key',
                example: 'My App Integration'
              },
              key: {
                type: 'string',
                description: 'The actual API key value (only shown once on creation)',
                example: 'nam_api_2f7d9be052a0f2c1a8f5b71c5e4be8f0ad3ec8b6'
              },
              lastUsed: {
                type: 'string',
                format: 'date-time',
                nullable: true,
                description: 'When the key was last used',
                example: '2023-03-10T09:15:32Z'
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
                description: 'When the key was created',
                example: '2023-01-15T12:00:00Z'
              },
              expiresAt: {
                type: 'string',
                format: 'date-time',
                nullable: true,
                description: 'When the key expires (null if never)',
                example: '2024-01-15T12:00:00Z'
              }
            }
          },
          
          // Campaign schemas
          Campaign: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
                description: 'Unique identifier for the campaign',
                example: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
              },
              name: {
                type: 'string',
                description: 'Campaign name',
                example: 'Summer Bitcoin Promotion'
              },
              description: {
                type: 'string',
                description: 'Campaign description',
                example: 'Promoting our services during the summer season'
              },
              budget: {
                type: 'integer',
                description: 'Total budget in satoshis',
                example: 10000000
              },
              dailyBudget: {
                type: 'integer',
                description: 'Daily budget in satoshis',
                nullable: true,
                example: 500000
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
                nullable: true,
                description: 'When the campaign ends (null if no end date)',
                example: '2023-08-31T23:59:59Z'
              },
              status: {
                type: 'string',
                enum: ['DRAFT', 'ACTIVE', 'PAUSED', 'ENDED', 'SCHEDULED', 'REVIEW'],
                description: 'Current campaign status',
                example: 'ACTIVE'
              },
              targetLocation: {
                type: 'string',
                nullable: true,
                description: 'Target geographic location',
                example: 'US,CA,UK'
              },
              targetInterests: {
                type: 'string',
                nullable: true,
                description: 'Target interest categories (comma-separated)',
                example: 'bitcoin,cryptocurrency,lightning'
              },
              targetAge: {
                type: 'string',
                nullable: true,
                description: 'Target age range',
                example: '25-45'
              },
              targetAudience: {
                type: 'string',
                nullable: true,
                description: 'Additional targeting parameters',
                example: 'tech-savvy,investors'
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
                description: 'When the campaign was created',
                example: '2023-05-15T12:00:00Z'
              },
              updatedAt: {
                type: 'string',
                format: 'date-time',
                description: 'When the campaign was last updated',
                example: '2023-05-20T08:15:30Z'
              }
            }
          },
          
          // Ad schemas
          Ad: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
                description: 'Unique identifier for the ad',
                example: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
              },
              title: {
                type: 'string',
                description: 'Ad title',
                example: 'Stack Sats Every Day'
              },
              description: {
                type: 'string',
                description: 'Ad description/content',
                example: 'Join our platform to stack sats automatically with every purchase.'
              },
              imageUrl: {
                type: 'string',
                format: 'uri',
                nullable: true,
                description: 'URL to ad image (if applicable)',
                example: 'https://cdn.nostradmarketplace.com/images/ads/stack-sats.jpg'
              },
              targetUrl: {
                type: 'string',
                format: 'uri',
                description: 'Landing page URL',
                example: 'https://example.com/stack-sats-promo'
              },
              urlParameters: {
                type: 'string',
                nullable: true,
                description: 'Additional URL parameters for tracking',
                example: 'utm_source=nostr&utm_medium=ad&utm_campaign=summer'
              },
              bidPerImpression: {
                type: 'integer',
                description: 'Bid amount per impression in satoshis',
                example: 10
              },
              bidPerClick: {
                type: 'integer',
                description: 'Bid amount per click in satoshis',
                example: 100
              },
              status: {
                type: 'string',
                enum: ['PENDING', 'ACTIVE', 'PAUSED', 'COMPLETED', 'REJECTED'],
                description: 'Current ad status',
                example: 'ACTIVE'
              },
              freqCapViews: {
                type: 'integer',
                description: 'Maximum impressions per user',
                example: 5
              },
              freqCapHours: {
                type: 'integer',
                description: 'Time period for frequency cap (hours)',
                example: 24
              },
              targetLocation: {
                type: 'string',
                nullable: true,
                description: 'Ad-specific geo targeting (overrides campaign)',
                example: 'US,CA'
              },
              targetInterests: {
                type: 'string',
                nullable: true,
                description: 'Ad-specific interest targeting (overrides campaign)',
                example: 'bitcoin,lightning'
              },
              targetAge: {
                type: 'string',
                nullable: true,
                description: 'Ad-specific age targeting (overrides campaign)',
                example: '25-45'
              },
              campaignId: {
                type: 'string',
                format: 'uuid',
                description: 'Campaign this ad belongs to',
                example: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
              },
              impressions: {
                type: 'integer',
                description: 'Total number of impressions',
                example: 12500
              },
              clicks: {
                type: 'integer',
                description: 'Total number of clicks',
                example: 350
              },
              ctr: {
                type: 'number',
                format: 'float',
                description: 'Click-through rate (percentage)',
                example: 2.8
              },
              spend: {
                type: 'integer',
                description: 'Total spend in satoshis',
                example: 160000
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
                description: 'When the ad was created',
                example: '2023-05-20T12:00:00Z'
              },
              updatedAt: {
                type: 'string',
                format: 'date-time',
                description: 'When the ad was last updated',
                example: '2023-05-22T15:30:00Z'
              }
            }
          },
          
          // Ad Space schemas
          AdSpace: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
                description: 'Unique identifier for the ad space',
                example: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
              },
              name: {
                type: 'string',
                description: 'Ad space name',
                example: 'Homepage Banner'
              },
              description: {
                type: 'string',
                description: 'Ad space description',
                example: 'Premium banner at the top of the homepage'
              },
              website: {
                type: 'string',
                format: 'uri',
                description: 'Website or app where ad space appears',
                example: 'https://satstack.blog'
              },
              minBidPerImpression: {
                type: 'integer',
                description: 'Minimum bid per impression in satoshis',
                example: 5
              },
              minBidPerClick: {
                type: 'integer',
                description: 'Minimum bid per click in satoshis',
                example: 50
              },
              dimensions: {
                type: 'string',
                description: 'Dimensions (WIDTHxHEIGHT)',
                example: '728x90'
              },
              allowedAdTypes: {
                type: 'string',
                description: 'Allowed ad types (comma-separated)',
                example: 'image,text'
              },
              contentCategory: {
                type: 'string',
                description: 'Content category of the website',
                example: 'cryptocurrency'
              },
              contentTags: {
                type: 'string',
                description: 'Content tags (comma-separated)',
                example: 'bitcoin,lightning,finance'
              },
              domainBlacklist: {
                type: 'string',
                description: 'Blocked domains (comma-separated)',
                nullable: true,
                example: 'scam.com,fake-ico.net'
              },
              keywordBlacklist: {
                type: 'string',
                description: 'Blocked keywords (comma-separated)',
                nullable: true,
                example: 'gambling,ico,scam'
              },
              pubkeyBlacklist: {
                type: 'string',
                description: 'Blocked Nostr pubkeys (comma-separated)',
                nullable: true,
                example: 'npub123,npub456'
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
                description: 'When the ad space was created',
                example: '2023-01-15T12:00:00Z'
              },
              updatedAt: {
                type: 'string',
                format: 'date-time',
                description: 'When the ad space was last updated',
                example: '2023-02-22T14:30:00Z'
              }
            }
          },
          
          // Transaction schemas
          Transaction: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
                description: 'Unique identifier for the transaction',
                example: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
              },
              amount: {
                type: 'integer',
                description: 'Transaction amount in satoshis',
                example: 50000
              },
              type: {
                type: 'string',
                enum: ['DEPOSIT', 'WITHDRAWAL', 'AD_PAYMENT', 'PUBLISHER_EARNING', 'USER_EARNING'],
                description: 'Transaction type',
                example: 'DEPOSIT'
              },
              status: {
                type: 'string',
                enum: ['PENDING', 'COMPLETED', 'FAILED'],
                description: 'Transaction status',
                example: 'COMPLETED'
              },
              description: {
                type: 'string',
                nullable: true,
                description: 'Transaction description',
                example: 'Wallet deposit via Lightning'
              },
              balanceBefore: {
                type: 'integer',
                description: 'Balance before transaction in satoshis',
                example: 100000
              },
              balanceAfter: {
                type: 'integer',
                description: 'Balance after transaction in satoshis',
                example: 150000
              },
              lightningInvoice: {
                type: 'string',
                nullable: true,
                description: 'Lightning invoice for deposits/withdrawals',
                example: 'lnbc500n1p3zpm2hpp5...'
              },
              paymentHash: {
                type: 'string',
                nullable: true,
                description: 'Lightning payment hash',
                example: '5ab36a7401fde5db0a89cfcd2690f8e540ca95c875bd130de0b9afef86f4c0d7'
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
                description: 'When the transaction occurred',
                example: '2023-03-10T14:25:30Z'
              }
            }
          },
          
          // Payment schemas
          Invoice: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                format: 'uuid',
                description: 'Unique identifier for the invoice',
                example: '3fa85f64-5717-4562-b3fc-2c963f66afa6'
              },
              amount: {
                type: 'integer',
                description: 'Invoice amount in satoshis',
                example: 50000
              },
              description: {
                type: 'string',
                description: 'Invoice description',
                example: 'Wallet deposit'
              },
              invoice: {
                type: 'string',
                description: 'Lightning invoice string (BOLT11)',
                example: 'lnbc500n1p3zpm2hpp5...'
              },
              status: {
                type: 'string',
                enum: ['PENDING', 'PAID', 'EXPIRED', 'CANCELLED'],
                description: 'Invoice status',
                example: 'PENDING'
              },
              expiresAt: {
                type: 'string',
                format: 'date-time',
                description: 'When the invoice expires',
                example: '2023-03-10T15:25:30Z'
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
                description: 'When the invoice was created',
                example: '2023-03-10T14:25:30Z'
              }
            }
          },
          
          // Analytics schemas
          DailyAnalytics: {
            type: 'object',
            properties: {
              date: {
                type: 'string',
                format: 'date',
                description: 'Date for the analytics data',
                example: '2023-07-15'
              },
              impressions: {
                type: 'integer',
                description: 'Total impressions for the day',
                example: 2500
              },
              clicks: {
                type: 'integer',
                description: 'Total clicks for the day',
                example: 75
              },
              ctr: {
                type: 'number',
                format: 'float',
                description: 'Click-through rate for the day',
                example: 3.0
              },
              spend: {
                type: 'integer',
                description: 'Total spend in satoshis',
                example: 30000
              },
              averageCostPerClick: {
                type: 'integer',
                description: 'Average cost per click in satoshis',
                example: 400
              },
              averageCostPerImpression: {
                type: 'integer',
                description: 'Average cost per impression in satoshis',
                example: 12
              }
            }
          },
          
          // Pagination wrapper schema
          PaginatedResponse: {
            type: 'object',
            properties: {
              data: {
                type: 'array',
                items: {
                  type: 'object'
                },
                description: 'Array of result items'
              },
              pagination: {
                type: 'object',
                properties: {
                  page: {
                    type: 'integer',
                    description: 'Current page number',
                    example: 1
                  },
                  limit: {
                    type: 'integer',
                    description: 'Items per page',
                    example: 20
                  },
                  totalItems: {
                    type: 'integer',
                    description: 'Total number of items',
                    example: 153
                  },
                  totalPages: {
                    type: 'integer',
                    description: 'Total number of pages',
                    example: 8
                  },
                  hasNextPage: {
                    type: 'boolean',
                    description: 'Whether there is a next page',
                    example: true
                  },
                  hasPrevPage: {
                    type: 'boolean',
                    description: 'Whether there is a previous page',
                    example: false
                  }
                }
              }
            }
          }
        }
      },
      tags: [
        { name: 'Authentication', description: 'API keys and user authentication' },
        { name: 'User Management', description: 'Core user account operations' },
        { name: 'Advertiser', description: 'Advertiser-specific operations' },
        { name: 'Publisher', description: 'Publisher-specific operations' },
        { name: 'Payments', description: 'Wallet and payment operations' },
        { name: 'Analytics', description: 'Reporting and performance metrics' }
      ],
      // Define actual API endpoints and operations
      paths: {
        // Authentication endpoints
        '/auth/api-keys': {
          get: {
            tags: ['Authentication'],
            summary: 'List API Keys',
            description: 'Retrieve all API keys for the authenticated user',
            security: [{ ApiKeyAuth: [] }, { NostrAuth: [] }],
            parameters: [
              { $ref: '#/components/parameters/pageParam' },
              { $ref: '#/components/parameters/limitParam' }
            ],
            responses: {
              '200': {
                description: 'Successful response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'array',
                          items: {
                            $ref: '#/components/schemas/ApiKey'
                          }
                        },
                        pagination: {
                          type: 'object',
                          properties: {
                            page: { type: 'integer', example: 1 },
                            limit: { type: 'integer', example: 20 },
                            totalItems: { type: 'integer', example: 5 },
                            totalPages: { type: 'integer', example: 1 }
                          }
                        }
                      }
                    },
                    example: {
                      data: [
                        {
                          id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                          name: 'Personal API Key',
                          lastUsed: '2023-03-10T09:15:32Z',
                          createdAt: '2023-01-15T12:00:00Z',
                          expiresAt: '2024-01-15T12:00:00Z'
                        },
                        {
                          id: '7cb6f40d-83e9-42e1-9c3a-b77a3e94d20c',
                          name: 'App Integration',
                          lastUsed: '2023-05-20T14:22:10Z',
                          createdAt: '2023-02-10T08:30:00Z',
                          expiresAt: null
                        }
                      ],
                      pagination: {
                        page: 1,
                        limit: 20,
                        totalItems: 2,
                        totalPages: 1
                      }
                    }
                  }
                }
              },
              '401': { $ref: '#/components/responses/Unauthorized' }
            }
          },
          post: {
            tags: ['Authentication'],
            summary: 'Create API Key',
            description: 'Generate a new API key for the authenticated user',
            security: [{ ApiKeyAuth: [] }],
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
                        example: 'My Integration'
                      },
                      expiresAt: {
                        type: 'string',
                        format: 'date-time',
                        nullable: true,
                        description: 'Expiration date (null for never)',
                        example: '2024-06-01T00:00:00Z'
                      }
                    }
                  }
                }
              }
            },
            responses: {
              '201': {
                description: 'API key created logfully',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/ApiKey'
                    },
                    example: {
                      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                      name: 'My Integration',
                      key: 'nam_api_2f7d9be052a0f2c1a8f5b71c5e4be8f0ad3ec8b6',
                      lastUsed: null,
                      createdAt: '2023-06-10T15:30:00Z',
                      expiresAt: '2024-06-01T00:00:00Z'
                    }
                  }
                }
              },
              '400': { $ref: '#/components/responses/ValidationError' },
              '401': { $ref: '#/components/responses/Unauthorized' }
            }
          }
        },
        
        '/auth/api-keys/{id}': {
          get: {
            tags: ['Authentication'],
            summary: 'Get API Key',
            description: 'Retrieve information about a specific API key',
            security: [{ ApiKeyAuth: [] }],
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                description: 'API key ID',
                schema: {
                  type: 'string',
                  format: 'uuid'
                }
              }
            ],
            responses: {
              '200': {
                description: 'Successful response',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/ApiKey'
                    },
                    example: {
                      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                      name: 'Personal API Key',
                      lastUsed: '2023-03-10T09:15:32Z',
                      createdAt: '2023-01-15T12:00:00Z',
                      expiresAt: '2024-01-15T12:00:00Z'
                    }
                  }
                }
              },
              '401': { $ref: '#/components/responses/Unauthorized' },
              '404': { $ref: '#/components/responses/NotFound' }
            }
          },
          put: {
            tags: ['Authentication'],
            summary: 'Update API Key',
            description: 'Update an existing API key',
            security: [{ ApiKeyAuth: [] }],
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                description: 'API key ID',
                schema: {
                  type: 'string',
                  format: 'uuid'
                }
              }
            ],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      name: {
                        type: 'string',
                        description: 'Name for the API key',
                        example: 'Updated Integration Name'
                      },
                      expiresAt: {
                        type: 'string',
                        format: 'date-time',
                        nullable: true,
                        description: 'Expiration date (null for never)',
                        example: '2024-12-31T00:00:00Z'
                      }
                    }
                  }
                }
              }
            },
            responses: {
              '200': {
                description: 'API key updated logfully',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/ApiKey'
                    },
                    example: {
                      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                      name: 'Updated Integration Name',
                      lastUsed: '2023-03-10T09:15:32Z',
                      createdAt: '2023-01-15T12:00:00Z',
                      expiresAt: '2024-12-31T00:00:00Z'
                    }
                  }
                }
              },
              '400': { $ref: '#/components/responses/ValidationError' },
              '401': { $ref: '#/components/responses/Unauthorized' },
              '404': { $ref: '#/components/responses/NotFound' }
            }
          },
          delete: {
            tags: ['Authentication'],
            summary: 'Delete API Key',
            description: 'Delete an API key',
            security: [{ ApiKeyAuth: [] }],
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                description: 'API key ID',
                schema: {
                  type: 'string',
                  format: 'uuid'
                }
              }
            ],
            responses: {
              '204': {
                description: 'API key deleted logfully'
              },
              '401': { $ref: '#/components/responses/Unauthorized' },
              '404': { $ref: '#/components/responses/NotFound' }
            }
          }
        },
        
        '/auth/api-keys/verify': {
          post: {
            tags: ['Authentication'],
            summary: 'Verify API Key',
            description: 'Verify if an API key is valid',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['apiKey'],
                    properties: {
                      apiKey: {
                        type: 'string',
                        description: 'API key to verify',
                        example: 'nam_api_2f7d9be052a0f2c1a8f5b71c5e4be8f0ad3ec8b6'
                      }
                    }
                  }
                }
              }
            },
            responses: {
              '200': {
                description: 'Successful verification',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        valid: {
                          type: 'boolean',
                          description: 'Whether the API key is valid',
                          example: true
                        },
                        keyInfo: {
                          type: 'object',
                          properties: {
                            name: {
                              type: 'string',
                              example: 'Personal API Key'
                            },
                            createdAt: {
                              type: 'string',
                              format: 'date-time',
                              example: '2023-01-15T12:00:00Z'
                            }
                          }
                        }
                      }
                    },
                    example: {
                      valid: true,
                      keyInfo: {
                        name: 'Personal API Key',
                        createdAt: '2023-01-15T12:00:00Z'
                      }
                    }
                  }
                }
              },
              '400': {
                description: 'Invalid API key',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        valid: {
                          type: 'boolean',
                          example: false
                        },
                        message: {
                          type: 'string',
                          example: 'Invalid API key'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        
        // User operations
        '/users/me': {
          get: {
            tags: ['Users'],
            summary: 'Get Current User',
            description: 'Get information about the currently authenticated user',
            security: [{ ApiKeyAuth: [] }],
            responses: {
              '200': {
                description: 'Successful response',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/User'
                    },
                    example: {
                      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                      pubkey: 'npub1abcdef0123456789abcdef0123456789abcdef0123456789abcdef01234567',
                      name: 'Bitcoin Maximalist',
                      email: 'user@example.com',
                      isAdvertiser: true,
                      isPublisher: true,
                      walletBalance: 1050000,
                      createdAt: '2023-01-15T12:00:00Z',
                      updatedAt: '2023-02-22T14:30:00Z'
                    }
                  }
                }
              },
              '401': { $ref: '#/components/responses/Unauthorized' }
            }
          },
          put: {
            tags: ['Users'],
            summary: 'Update Current User',
            description: 'Update information for the authenticated user',
            security: [{ ApiKeyAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      name: {
                        type: 'string',
                        example: 'Updated Name'
                      },
                      email: {
                        type: 'string',
                        format: 'email',
                        example: 'updated@example.com'
                      }
                    }
                  }
                }
              }
            },
            responses: {
              '200': {
                description: 'User updated logfully',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/User'
                    }
                  }
                }
              },
              '400': { $ref: '#/components/responses/ValidationError' },
              '401': { $ref: '#/components/responses/Unauthorized' }
            }
          }
        },
        
        // Campaign operations
        '/campaigns': {
          get: {
            tags: ['Campaigns'],
            summary: 'List Campaigns',
            description: 'Get a list of all campaigns for the authenticated advertiser',
            security: [{ ApiKeyAuth: [] }],
            parameters: [
              { $ref: '#/components/parameters/pageParam' },
              { $ref: '#/components/parameters/limitParam' },
              {
                name: 'status',
                in: 'query',
                description: 'Filter by campaign status',
                schema: {
                  type: 'string',
                  enum: ['DRAFT', 'ACTIVE', 'PAUSED', 'ENDED', 'SCHEDULED', 'REVIEW']
                }
              },
              {
                name: 'search',
                in: 'query',
                description: 'Search term to filter campaigns by name',
                schema: {
                  type: 'string'
                }
              },
              {
                name: 'sortBy',
                in: 'query',
                description: 'Field to sort by',
                schema: {
                  type: 'string',
                  enum: ['name', 'startDate', 'endDate', 'budget', 'createdAt'],
                  default: 'createdAt'
                }
              },
              {
                name: 'sortDirection',
                in: 'query',
                description: 'Sort direction',
                schema: {
                  type: 'string',
                  enum: ['asc', 'desc'],
                  default: 'desc'
                }
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
                            page: { type: 'integer', example: 1 },
                            limit: { type: 'integer', example: 20 },
                            totalItems: { type: 'integer', example: 35 },
                            totalPages: { type: 'integer', example: 2 }
                          }
                        }
                      }
                    },
                    example: {
                      data: [
                        {
                          id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                          name: 'Summer Bitcoin Promotion',
                          description: 'Promoting our services during the summer season',
                          budget: 10000000,
                          dailyBudget: 500000,
                          startDate: '2023-06-01T00:00:00Z',
                          endDate: '2023-08-31T23:59:59Z',
                          status: 'ACTIVE',
                          targetLocation: 'US,CA,UK',
                          targetInterests: 'bitcoin,cryptocurrency,lightning',
                          targetAge: '25-45',
                          targetAudience: 'tech-savvy,investors',
                          createdAt: '2023-05-15T12:00:00Z',
                          updatedAt: '2023-05-20T08:15:30Z'
                        },
                        {
                          id: '8c6e1dc4-3fa3-4f8a-b148-5a136e0c51ab',
                          name: 'Lightning Payment Promotion',
                          description: 'Campaign highlighting our Lightning Network capabilities',
                          budget: 5000000,
                          dailyBudget: 250000,
                          startDate: '2023-09-01T00:00:00Z',
                          endDate: null,
                          status: 'SCHEDULED',
                          targetLocation: 'US,EU',
                          targetInterests: 'lightning,payments',
                          targetAge: '18-65',
                          targetAudience: null,
                          createdAt: '2023-05-20T09:30:00Z',
                          updatedAt: '2023-05-20T09:30:00Z'
                        }
                      ],
                      pagination: {
                        page: 1,
                        limit: 20,
                        totalItems: 2,
                        totalPages: 1
                      }
                    }
                  }
                }
              },
              '401': { $ref: '#/components/responses/Unauthorized' }
            }
          },
          post: {
            tags: ['Campaigns'],
            summary: 'Create Campaign',
            description: 'Create a new advertising campaign',
            security: [{ ApiKeyAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['name', 'startDate', 'budget'],
                    properties: {
                      name: {
                        type: 'string',
                        example: 'New Campaign'
                      },
                      description: {
                        type: 'string',
                        example: 'Description of the new campaign'
                      },
                      budget: {
                        type: 'integer',
                        description: 'Total budget in satoshis',
                        example: 5000000
                      },
                      dailyBudget: {
                        type: 'integer',
                        description: 'Daily budget in satoshis',
                        nullable: true,
                        example: 250000
                      },
                      startDate: {
                        type: 'string',
                        format: 'date-time',
                        example: '2023-07-01T00:00:00Z'
                      },
                      endDate: {
                        type: 'string',
                        format: 'date-time',
                        nullable: true,
                        example: '2023-12-31T23:59:59Z'
                      },
                      status: {
                        type: 'string',
                        enum: ['DRAFT', 'ACTIVE', 'PAUSED', 'ENDED', 'SCHEDULED', 'REVIEW'],
                        default: 'DRAFT',
                        example: 'DRAFT'
                      },
                      targetLocation: {
                        type: 'string',
                        nullable: true,
                        example: 'US,EU'
                      },
                      targetInterests: {
                        type: 'string',
                        nullable: true,
                        example: 'bitcoin,payments'
                      },
                      targetAge: {
                        type: 'string',
                        nullable: true,
                        example: '25-45'
                      },
                      targetAudience: {
                        type: 'string',
                        nullable: true,
                        example: 'tech-enthusiasts'
                      }
                    }
                  }
                }
              }
            },
            responses: {
              '201': {
                description: 'Campaign created logfully',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/Campaign'
                    }
                  }
                }
              },
              '400': { $ref: '#/components/responses/ValidationError' },
              '401': { $ref: '#/components/responses/Unauthorized' }
            }
          }
        },
        
        '/campaigns/{id}': {
          get: {
            tags: ['Campaigns'],
            summary: 'Get Campaign',
            description: 'Get details of a specific campaign',
            security: [{ ApiKeyAuth: [] }],
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                description: 'Campaign ID',
                schema: {
                  type: 'string',
                  format: 'uuid'
                }
              }
            ],
            responses: {
              '200': {
                description: 'Campaign details',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/Campaign'
                    }
                  }
                }
              },
              '401': { $ref: '#/components/responses/Unauthorized' },
              '404': { $ref: '#/components/responses/NotFound' }
            }
          },
          put: {
            tags: ['Campaigns'],
            summary: 'Update Campaign',
            description: 'Update an existing campaign',
            security: [{ ApiKeyAuth: [] }],
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                description: 'Campaign ID',
                schema: {
                  type: 'string',
                  format: 'uuid'
                }
              }
            ],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      name: {
                        type: 'string',
                        example: 'Updated Campaign Name'
                      },
                      description: {
                        type: 'string',
                        example: 'Updated campaign description'
                      },
                      budget: {
                        type: 'integer',
                        example: 6000000
                      },
                      dailyBudget: {
                        type: 'integer',
                        nullable: true,
                        example: 300000
                      },
                      startDate: {
                        type: 'string',
                        format: 'date-time',
                        example: '2023-07-15T00:00:00Z'
                      },
                      endDate: {
                        type: 'string',
                        format: 'date-time',
                        nullable: true,
                        example: '2024-01-15T23:59:59Z'
                      },
                      status: {
                        type: 'string',
                        enum: ['DRAFT', 'ACTIVE', 'PAUSED', 'ENDED', 'SCHEDULED', 'REVIEW'],
                        example: 'ACTIVE'
                      },
                      targetLocation: {
                        type: 'string',
                        nullable: true,
                        example: 'US,EU,CA'
                      },
                      targetInterests: {
                        type: 'string',
                        nullable: true,
                        example: 'bitcoin,lightning,payments'
                      },
                      targetAge: {
                        type: 'string',
                        nullable: true,
                        example: '18-65'
                      },
                      targetAudience: {
                        type: 'string',
                        nullable: true,
                        example: 'tech-enthusiasts,investors'
                      }
                    }
                  }
                }
              }
            },
            responses: {
              '200': {
                description: 'Campaign updated logfully',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/Campaign'
                    }
                  }
                }
              },
              '400': { $ref: '#/components/responses/ValidationError' },
              '401': { $ref: '#/components/responses/Unauthorized' },
              '404': { $ref: '#/components/responses/NotFound' }
            }
          },
          delete: {
            tags: ['Campaigns'],
            summary: 'Delete Campaign',
            description: 'Delete a campaign and all its ads',
            security: [{ ApiKeyAuth: [] }],
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                description: 'Campaign ID',
                schema: {
                  type: 'string',
                  format: 'uuid'
                }
              }
            ],
            responses: {
              '204': {
                description: 'Campaign deleted logfully'
              },
              '401': { $ref: '#/components/responses/Unauthorized' },
              '404': { $ref: '#/components/responses/NotFound' }
            }
          }
        },
        
        '/campaigns/{id}/status': {
          put: {
            tags: ['Campaigns'],
            summary: 'Update Campaign Status',
            description: 'Update the status of a campaign (activate, pause, etc.)',
            security: [{ ApiKeyAuth: [] }],
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                description: 'Campaign ID',
                schema: {
                  type: 'string',
                  format: 'uuid'
                }
              }
            ],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['status'],
                    properties: {
                      status: {
                        type: 'string',
                        enum: ['DRAFT', 'ACTIVE', 'PAUSED', 'ENDED', 'SCHEDULED', 'REVIEW'],
                        example: 'ACTIVE'
                      }
                    }
                  }
                }
              }
            },
            responses: {
              '200': {
                description: 'Campaign status updated logfully',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/Campaign'
                    }
                  }
                }
              },
              '400': { $ref: '#/components/responses/ValidationError' },
              '401': { $ref: '#/components/responses/Unauthorized' },
              '404': { $ref: '#/components/responses/NotFound' }
            }
          }
        },
        
        // Ads endpoints
        '/campaigns/{campaignId}/ads': {
          get: {
            tags: ['Ads'],
            summary: 'List Campaign Ads',
            description: 'Get all ads in a specific campaign',
            security: [{ ApiKeyAuth: [] }],
            parameters: [
              {
                name: 'campaignId',
                in: 'path',
                required: true,
                description: 'Campaign ID',
                schema: {
                  type: 'string',
                  format: 'uuid'
                }
              },
              { $ref: '#/components/parameters/pageParam' },
              { $ref: '#/components/parameters/limitParam' },
              {
                name: 'status',
                in: 'query',
                description: 'Filter by ad status',
                schema: {
                  type: 'string',
                  enum: ['PENDING', 'ACTIVE', 'PAUSED', 'COMPLETED', 'REJECTED']
                }
              }
            ],
            responses: {
              '200': {
                description: 'List of ads in the campaign',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'array',
                          items: {
                            $ref: '#/components/schemas/Ad'
                          }
                        },
                        pagination: {
                          type: 'object',
                          properties: {
                            page: { type: 'integer', example: 1 },
                            limit: { type: 'integer', example: 20 },
                            totalItems: { type: 'integer', example: 3 },
                            totalPages: { type: 'integer', example: 1 }
                          }
                        }
                      }
                    },
                    example: {
                      data: [
                        {
                          id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                          title: 'Stack Sats Every Day',
                          description: 'Join our platform to stack sats automatically with every purchase.',
                          imageUrl: 'https://cdn.nostradmarketplace.com/images/ads/stack-sats.jpg',
                          targetUrl: 'https://example.com/stack-sats-promo',
                          urlParameters: 'utm_source=nostr&utm_medium=ad&utm_campaign=summer',
                          bidPerImpression: 10,
                          bidPerClick: 100,
                          status: 'ACTIVE',
                          freqCapViews: 5,
                          freqCapHours: 24,
                          targetLocation: 'US,CA',
                          targetInterests: 'bitcoin,lightning',
                          targetAge: '25-45',
                          campaignId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                          impressions: 12500,
                          clicks: 350,
                          ctr: 2.8,
                          spend: 160000,
                          createdAt: '2023-05-20T12:00:00Z',
                          updatedAt: '2023-05-22T15:30:00Z'
                        }
                      ],
                      pagination: {
                        page: 1,
                        limit: 20,
                        totalItems: 1,
                        totalPages: 1
                      }
                    }
                  }
                }
              },
              '401': { $ref: '#/components/responses/Unauthorized' },
              '404': { $ref: '#/components/responses/NotFound' }
            }
          },
          post: {
            tags: ['Ads'],
            summary: 'Create Ad',
            description: 'Create a new ad in a campaign',
            security: [{ ApiKeyAuth: [] }],
            parameters: [
              {
                name: 'campaignId',
                in: 'path',
                required: true,
                description: 'Campaign ID',
                schema: {
                  type: 'string',
                  format: 'uuid'
                }
              }
            ],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['title', 'description', 'targetUrl', 'bidPerImpression', 'bidPerClick'],
                    properties: {
                      title: {
                        type: 'string',
                        example: 'New Lightning Ad'
                      },
                      description: {
                        type: 'string',
                        example: 'Experience the speed of Lightning payments!'
                      },
                      imageUrl: {
                        type: 'string',
                        format: 'uri',
                        nullable: true,
                        example: 'https://example.com/images/lightning-ad.jpg'
                      },
                      targetUrl: {
                        type: 'string',
                        format: 'uri',
                        example: 'https://example.com/lightning-promo'
                      },
                      urlParameters: {
                        type: 'string',
                        nullable: true,
                        example: 'utm_source=nostr&utm_medium=ad'
                      },
                      bidPerImpression: {
                        type: 'integer',
                        example: 10
                      },
                      bidPerClick: {
                        type: 'integer',
                        example: 100
                      },
                      freqCapViews: {
                        type: 'integer',
                        example: 5
                      },
                      freqCapHours: {
                        type: 'integer',
                        example: 24
                      },
                      targetLocation: {
                        type: 'string',
                        nullable: true,
                        example: 'US,CA'
                      },
                      targetInterests: {
                        type: 'string',
                        nullable: true,
                        example: 'bitcoin,lightning'
                      },
                      targetAge: {
                        type: 'string',
                        nullable: true,
                        example: '25-45'
                      }
                    }
                  }
                }
              }
            },
            responses: {
              '201': {
                description: 'Ad created logfully',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/Ad'
                    }
                  }
                }
              },
              '400': { $ref: '#/components/responses/ValidationError' },
              '401': { $ref: '#/components/responses/Unauthorized' },
              '404': { $ref: '#/components/responses/NotFound' }
            }
          }
        },
        
        // Payments
        '/payments/wallet/balance': {
          get: {
            tags: ['Payments'],
            summary: 'Get Wallet Balance',
            description: 'Get the current wallet balance for the authenticated user',
            security: [{ ApiKeyAuth: [] }],
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
                          description: 'Current balance in satoshis',
                          example: 1500000
                        },
                        pendingDeposits: {
                          type: 'integer',
                          description: 'Pending deposits in satoshis',
                          example: 50000
                        },
                        pendingWithdrawals: {
                          type: 'integer',
                          description: 'Pending withdrawals in satoshis',
                          example: 0
                        },
                        reservedFunds: {
                          type: 'integer',
                          description: 'Funds reserved for active campaigns',
                          example: 300000
                        },
                        availableBalance: {
                          type: 'integer',
                          description: 'Available balance for spending',
                          example: 1200000
                        }
                      }
                    }
                  }
                }
              },
              '401': { $ref: '#/components/responses/Unauthorized' }
            }
          }
        },
        
        '/payments/wallet/deposit': {
          post: {
            tags: ['Payments'],
            summary: 'Create Deposit Invoice',
            description: 'Generate a Lightning invoice to deposit funds into the wallet',
            security: [{ ApiKeyAuth: [] }],
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
                        example: 50000
                      },
                      description: {
                        type: 'string',
                        description: 'Optional description for the invoice',
                        example: 'Wallet deposit'
                      }
                    }
                  }
                }
              }
            },
            responses: {
              '201': {
                description: 'Invoice created logfully',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/Invoice'
                    },
                    example: {
                      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                      amount: 50000,
                      description: 'Wallet deposit',
                      invoice: 'lnbc500n1p3zpm2hpp5...',
                      status: 'PENDING',
                      expiresAt: '2023-03-10T15:25:30Z',
                      createdAt: '2023-03-10T14:25:30Z'
                    }
                  }
                }
              },
              '400': { $ref: '#/components/responses/ValidationError' },
              '401': { $ref: '#/components/responses/Unauthorized' }
            }
          }
        },
        
        // Analytics
        '/analytics/campaigns/{id}': {
          get: {
            tags: ['Analytics'],
            summary: 'Get Campaign Analytics',
            description: 'Get analytics data for a specific campaign',
            security: [{ ApiKeyAuth: [] }],
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                description: 'Campaign ID',
                schema: {
                  type: 'string',
                  format: 'uuid'
                }
              },
              {
                name: 'startDate',
                in: 'query',
                description: 'Start date for the analytics data (ISO 8601)',
                schema: {
                  type: 'string',
                  format: 'date'
                }
              },
              {
                name: 'endDate',
                in: 'query',
                description: 'End date for the analytics data (ISO 8601)',
                schema: {
                  type: 'string',
                  format: 'date'
                }
              },
              {
                name: 'groupBy',
                in: 'query',
                description: 'Group data by time period',
                schema: {
                  type: 'string',
                  enum: ['day', 'week', 'month'],
                  default: 'day'
                }
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
                        summary: {
                          type: 'object',
                          properties: {
                            impressions: {
                              type: 'integer',
                              example: 25000
                            },
                            clicks: {
                              type: 'integer',
                              example: 750
                            },
                            ctr: {
                              type: 'number',
                              format: 'float',
                              example: 3.0
                            },
                            spend: {
                              type: 'integer',
                              example: 350000
                            },
                            averageCostPerClick: {
                              type: 'integer',
                              example: 92
                            },
                            averageCostPerImpression: {
                              type: 'integer',
                              example: 11
                            }
                          }
                        },
                        timeSeries: {
                          type: 'array',
                          items: {
                            $ref: '#/components/schemas/DailyAnalytics'
                          }
                        }
                      }
                    },
                    example: {
                      summary: {
                        impressions: 25000,
                        clicks: 750,
                        ctr: 3.0,
                        spend: 350000,
                        averageCostPerClick: 92,
                        averageCostPerImpression: 11
                      },
                      timeSeries: [
                        {
                          date: '2023-07-01',
                          impressions: 2500,
                          clicks: 75,
                          ctr: 3.0,
                          spend: 35000,
                          averageCostPerClick: 93,
                          averageCostPerImpression: 11
                        },
                        {
                          date: '2023-07-02',
                          impressions: 2300,
                          clicks: 70,
                          ctr: 3.04,
                          spend: 32000,
                          averageCostPerClick: 91,
                          averageCostPerImpression: 11
                        }
                      ]
                    }
                  }
                }
              },
              '401': { $ref: '#/components/responses/Unauthorized' },
              '404': { $ref: '#/components/responses/NotFound' }
            }
          }
        }
      }
    },
    apiFolder: 'src/pages/api',
  });
  
  // Apply the tag organization to improve documentation structure
  return organizeSpecByTags(spec);
};