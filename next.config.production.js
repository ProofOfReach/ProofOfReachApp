/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  
  // Production deployment configuration
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  
  // Skip problematic optimizations
  experimental: {
    swcTraceProfiling: false,
  },
  
  // Skip type checking and linting during build
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Simplified webpack configuration
  webpack: (config, { isServer }) => {
    // Disable optimization that might cause hangs
    config.optimization.minimize = false;
    
    // Enable top level await
    config.experiments = { ...config.experiments, topLevelAwait: true };
    
    return config;
  },
};

module.exports = nextConfig;