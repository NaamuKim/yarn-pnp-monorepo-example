import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@mono/api-client', '@mono/ui', '@mono/utils'],
};

export default nextConfig;
