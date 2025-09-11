import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Fix the deprecated experimental.serverComponentsExternalPackages
  serverExternalPackages: ['pdf-parse', 'canvas', 'jsdom', 'pdfjs-dist'],
  experimental: {
    esmExternals: 'loose'
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  webpack: (config) => {
    // Handle canvas dependency for react-pdf
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    
    // Handle PDF.js worker and other dependencies
    config.resolve.alias = {
      ...config.resolve.alias,
      "pdfjs-dist/build/pdf.worker.js": "pdfjs-dist/build/pdf.worker.min.js",
    };

    // Ensure proper handling of ES modules
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: "javascript/auto",
    });

    // Ignore node-specific modules in client bundle
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    return config;
  },
}

export default nextConfig