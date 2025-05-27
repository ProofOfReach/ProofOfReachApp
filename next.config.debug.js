/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  
  // Minimal config for debugging build hang
  experimental: {
    // Remove potentially problematic optimizations
    swcTraceProfiling: false,
  },
  
  // Skip checks that might cause hangs
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable webpack customizations that might cause issues
  skipMiddlewareUrlNormalize: true,
  skipTrailingSlashRedirect: true,
};

module.exports = nextConfig;