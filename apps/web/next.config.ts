import type { NextConfig } from "next";
// @ts-expect-error webpack types not needed at runtime - Next.js provides webpack
import webpack from 'webpack';
import path from 'path';

const currentDir = import.meta.dirname!;

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',

  // Skip TS errors during build (pre-existing type mismatches with @bitcoin-computer/lib)
  typescript: { ignoreBuildErrors: true },

  // Only transpile bitcoin-computer/lib, NOT quiz-contracts (to avoid __name decoration issues)
  transpilePackages: ['@bitcoin-computer/lib'],
  webpack: (config, { isServer }) => {
    // Alias @quiz-app/contracts to pre-compiled dist to avoid SWC __name issues
    config.resolve.alias = {
      ...config.resolve.alias,
      '@quiz-app/contracts': path.resolve(currentDir, '../../packages/quiz-contracts/dist/index.js'),
    };
    if (!isServer) {
      config.resolve.fallback = {
        ...(config.resolve.fallback ?? {}),
        buffer: require.resolve('buffer'),
        stream: require.resolve('stream-browserify'),
        crypto: require.resolve('crypto-browserify'),
        process: require.resolve('process/browser'),
        fs: false,
        net: false,
        tls: false,
        child_process: false,
      };

      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: ['process'],
        }),
      );
    }
    return config;
  },
  // Ensure environment variables are properly exposed to the client
  env: {
    NEXT_PUBLIC_CHAIN: process.env.NEXT_PUBLIC_CHAIN,
    NEXT_PUBLIC_NETWORK: process.env.NEXT_PUBLIC_NETWORK,
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_PATH: process.env.NEXT_PUBLIC_PATH,
    NEXT_PUBLIC_TEACHER_MOD: process.env.NEXT_PUBLIC_TEACHER_MOD,
    NEXT_PUBLIC_STUDENT_MOD: process.env.NEXT_PUBLIC_STUDENT_MOD,
    NEXT_PUBLIC_QUIZ_MOD: process.env.NEXT_PUBLIC_QUIZ_MOD,
    NEXT_PUBLIC_ATTEMPT_MOD: process.env.NEXT_PUBLIC_ATTEMPT_MOD,
    NEXT_PUBLIC_PAYMENT_MOD: process.env.NEXT_PUBLIC_PAYMENT_MOD,
    NEXT_PUBLIC_QUIZ_ACCESS_MOD: process.env.NEXT_PUBLIC_QUIZ_ACCESS_MOD,
    NEXT_PUBLIC_QUIZ_ACCESS_SALE_MOD: process.env.NEXT_PUBLIC_QUIZ_ACCESS_SALE_MOD,
  },
};

export default nextConfig;
