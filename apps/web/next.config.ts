import type { NextConfig } from "next";
import webpack from 'webpack';

const nextConfig: NextConfig = {
  transpilePackages: ['@quiz-app/sdk', '@quiz-app/contracts', '@quiz-app/shared', '@bitcoin-computer/lib'],
  webpack: (config, { isServer }) => {
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
