import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: { cpus: 1, authInterrupts: true },
  poweredByHeader: false,
};
export default nextConfig;
