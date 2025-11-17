import { log } from '../utils/logging.util';

interface RequiredEnvVars {
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  ENCRYPTION_KEY: string;
  RAZORPAY_KEY_ID: string;
  RAZORPAY_KEY_SECRET: string;
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_USER: string;
  SMTP_PASS: string;
  SMTP_FROM_EMAIL: string;
  ADMIN_EMAIL: string;
  FRONTEND_URL: string;
  PORT?: string;
  NODE_ENV?: string;
  SENTRY_DSN?: string;
}

interface OptionalEnvVars {
  RAZORPAY_WEBHOOK_SECRET?: string;
  LOW_BALANCE_THRESHOLD?: string;
}

export interface EnvConfig extends RequiredEnvVars, OptionalEnvVars {}

export function validateEnvironment(): EnvConfig {
  const requiredVars: (keyof RequiredEnvVars)[] = [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'ENCRYPTION_KEY',
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
    'SMTP_FROM_EMAIL',
    'ADMIN_EMAIL',
    'FRONTEND_URL'
  ];

  const missing: string[] = [];
  const config: Partial<EnvConfig> = {};

  // Check required variables
  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      missing.push(varName);
    } else {
      (config as any)[varName] = value.trim();
    }
  }

  // Check optional variables
  const optionalVars: (keyof OptionalEnvVars)[] = [
    'RAZORPAY_WEBHOOK_SECRET',
    'LOW_BALANCE_THRESHOLD'
  ];

  for (const varName of optionalVars) {
    const value = process.env[varName];
    if (value && value.trim() !== '') {
      (config as any)[varName] = value.trim();
    }
  }

  // Set defaults for optional vars
  config.PORT = process.env.PORT || '4000';
  config.NODE_ENV = process.env.NODE_ENV || 'development';
  config.SENTRY_DSN = process.env.SENTRY_DSN;

  if (missing.length > 0) {
    log('error', `Missing required environment variables: ${missing.join(', ')}`);
    // Don't exit in test environment - let tests handle missing vars
    if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'testing') {
      process.exit(1);
    } else {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }

  // Validate specific formats
  validateSpecificFormats(config as EnvConfig);

  log('info', 'Environment validation passed');
  return config as EnvConfig;
}

function validateSpecificFormats(config: EnvConfig): void {
  // Validate JWT secrets length
  if (config.JWT_SECRET.length < 32) {
    const error = 'JWT_SECRET must be at least 32 characters long';
    log('error', error);
    if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'testing') {
      process.exit(1);
    } else {
      throw new Error(error);
    }
  }

  if (config.JWT_REFRESH_SECRET.length < 32) {
    const error = 'JWT_REFRESH_SECRET must be at least 32 characters long';
    log('error', error);
    if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'testing') {
      process.exit(1);
    } else {
      throw new Error(error);
    }
  }

  // Validate encryption key length (must be exactly 32 bytes)
  if (Buffer.from(config.ENCRYPTION_KEY).length !== 32) {
    const error = 'ENCRYPTION_KEY must be exactly 32 bytes';
    log('error', error);
    if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'testing') {
      process.exit(1);
    } else {
      throw new Error(error);
    }
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(config.SMTP_FROM_EMAIL)) {
    const error = 'SMTP_FROM_EMAIL must be a valid email address';
    log('error', error);
    if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'testing') {
      process.exit(1);
    } else {
      throw new Error(error);
    }
  }

  if (!emailRegex.test(config.ADMIN_EMAIL)) {
    const error = 'ADMIN_EMAIL must be a valid email address';
    log('error', error);
    if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'testing') {
      process.exit(1);
    } else {
      throw new Error(error);
    }
  }

  // Validate SMTP_PORT
  const port = Number(config.SMTP_PORT);
  if (isNaN(port) || port <= 0) {
    const error = 'SMTP_PORT must be a positive number';
    log('error', error);
    if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'testing') {
        process.exit(1);
    } else {
        throw new Error(error);
    }
  }
  config.SMTP_PORT = port;

  // Validate URL format
  try {
    new URL(config.FRONTEND_URL);
  } catch {
    const error = 'FRONTEND_URL must be a valid URL';
    log('error', error);
    if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'testing') {
      process.exit(1);
    } else {
      throw new Error(error);
    }
  }

  // Validate MongoDB connection string (relaxed for testing)
  if (!config.DATABASE_URL.includes('mongodb') && process.env.NODE_ENV !== 'test') {
    const error = 'DATABASE_URL must be a valid MongoDB connection string';
    log('error', error);
    process.exit(1);
  }
}