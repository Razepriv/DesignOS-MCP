import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@designos/contracts', '@designos/core'],
};

export default nextConfig;
