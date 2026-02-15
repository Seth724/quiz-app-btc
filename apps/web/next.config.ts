import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ['@quiz-app/sdk', '@quiz-app/contracts', '@quiz-app/shared']
};

export default nextConfig;
