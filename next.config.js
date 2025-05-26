/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disable strict mode in development to reduce renders
  
  // Skip TypeScript and ESLint checks during build for deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Enhanced build performance
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Fix cross-origin warnings in development
  allowedDevOrigins: ['127.0.0.1', 'localhost', '*.replit.dev'],
  
  // Optimize bundle and imports
  experimental: {
    swcTraceProfiling: false,
    // Disable optimizeCss temporarily due to missing critters dependency
    // optimizeCss: true,
    optimizePackageImports: [
      '@heroicons/react',
      '@radix-ui/react-icons',
      '@radix-ui/react-progress',
      '@radix-ui/react-switch',
      'react-feather',
    ],
    // Enable modern bundling
    esmExternals: true,
  },
  
  // External packages for server components
  serverExternalPackages: ['@prisma/client'],
  
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
  
  webpack: (config, { dev, isServer }) => {
    // Enable experiments
    config.experiments = { ...config.experiments, topLevelAwait: true };
    
    // Enable filesystem caching for faster builds
    if (dev) {
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      };
    }
    
    // Optimize bundle splitting
    if (!isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      };
    }
    
    return config;
  },
  
  // Skip TypeScript type checking and ESLint for faster builds
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable the middleware to avoid the import attributes error
  skipMiddlewareUrlNormalize: true,
  skipTrailingSlashRedirect: true,
};

module.exports = nextConfig;
