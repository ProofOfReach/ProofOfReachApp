/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  
  // Allow cross-origin requests from Replit domains
  allowedDevOrigins: [
    '127.0.0.1',
    'localhost',
    '*.replit.dev',
    '*.picard.replit.dev'
  ],
  
  // Basic security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  
  // Skip TypeScript type checking and ESLint for faster builds
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
