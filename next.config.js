/** @type {import('next').NextConfig} */
const nextConfig = {
  // Using App Router (default in Next.js 14)
  // Explicitly ignore pages directory for routing
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js']
  },
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: false,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: false,
  },
  // Optimize images
  images: {
    domains: [],
  },
  // Add bundle analyzer support and exclude scripts from bundling
  webpack: (config, { isServer }) => {
    if (process.env.ANALYZE) {
      const { BundleAnalyzerPlugin } = require('@next/bundle-analyzer')();
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
        })
      );
    }
    
    // Exclude specific modules from client-side bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        util: false,
        'fs/promises': false,
      };
    }
    
    // Exclude scripts from being processed
    config.module.rules.push({
      test: /scripts\//,
      use: 'null-loader'
    });
    
    return config;
  },
}

module.exports = nextConfig