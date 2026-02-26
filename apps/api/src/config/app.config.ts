/**
 * App Configuration — Centralized environment-based configuration
 *
 * Usage:
 *   import { appConfig, APP_CONFIG } from './config';
 *   // or inject via ConfigModule:
 *   @Inject(APP_CONFIG.KEY) config: AppConfigType
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

export const appConfig = registerAs(APP_CONFIG.KEY, (): AppConfigType => ({
  port: parseInt(process.env.PORT || '3002', 10),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  jwtSecret: process.env.JWT_SECRET || 'quiz-app-secret',
  jwtExpiry: process.env.JWT_EXPIRY || '7d',
  databaseUrl: process.env.DATABASE_URL || '',
  bcNodeUrl: process.env.BC_NODE_URL || 'http://localhost:1031',
  chain: process.env.CHAIN || 'LTC',
  network: process.env.NETWORK || 'regtest',
  nodeEnv: process.env.NODE_ENV || 'development',
}));
