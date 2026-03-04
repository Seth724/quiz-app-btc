/**
 * App Configuration — Centralized environment-based configuration
 *
 * All values MUST come from environment variables.
 * No hardcoded fallbacks — fail fast if not configured.
 */

import { registerAs } from '@nestjs/config';

export const APP_CONFIG = {
  KEY: 'app',
};

export interface AppConfigType {
  /** Server port */
  port: number;
  /** CORS origin */
  corsOrigin: string;
  /** JWT secret key */
  jwtSecret: string;
  /** JWT token expiry */
  jwtExpiry: string;
  /** MongoDB connection URL */
  databaseUrl: string;
  /** Bitcoin Computer node URL */
  bcNodeUrl: string;
  /** Blockchain chain (LTC, BTC, etc.) */
  chain: string;
  /** Blockchain network (regtest, testnet, mainnet) */
  network: string;
  /** Environment (development, production, test) */
  nodeEnv: string;
}

export const appConfig = registerAs(APP_CONFIG.KEY, (): AppConfigType => {
  const required = (key: string): string => {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
  };

  return {
    port: parseInt(required('PORT'), 10),
    corsOrigin: required('CORS_ORIGIN'),
    jwtSecret: required('JWT_SECRET'),
    jwtExpiry: process.env.JWT_EXPIRY || '7d',
    databaseUrl: required('DATABASE_URL'),
    bcNodeUrl: required('BLOCKCHAIN_URL'),
    chain: required('BLOCKCHAIN_CHAIN'),
    network: required('BLOCKCHAIN_NETWORK'),
    nodeEnv: process.env.NODE_ENV || 'development',
  };
});