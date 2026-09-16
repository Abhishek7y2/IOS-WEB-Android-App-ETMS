import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      'country-state-city',
      '@tanstack/react-query',
      'sonner',
    ],
  },
};

export default nextConfig;
