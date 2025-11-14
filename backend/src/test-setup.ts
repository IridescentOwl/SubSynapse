// Test setup file
import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables if present
dotenv.config({ path: path.join(__dirname, '../.env.test') });

// Provide sane defaults so env validation passes even without .env.test
const requiredEnvFallbacks: Record<string, string> = {
  DATABASE_URL: 'mongodb://localhost:27017/subsynapse_test',
  JWT_SECRET: '12345678901234567890123456789012',
  JWT_REFRESH_SECRET: 'abcdefghijklmnopqrstuvwx1234567890',
  ENCRYPTION_KEY: '12345678901234567890123456789012',
  RAZORPAY_KEY_ID: 'rzp_test_key',
  RAZORPAY_KEY_SECRET: 'rzp_test_secret',
  SENDGRID_API_KEY: 'SG.test.api.key',
  EMAIL_FROM: 'test@example.com',
  ADMIN_EMAIL: 'admin@example.com',
  FRONTEND_URL: 'http://localhost:5173',
};

const optionalEnvFallbacks: Record<string, string> = {
  TWILIO_ACCOUNT_SID: 'ACtest',
  TWILIO_AUTH_TOKEN: 'testtoken',
  TWILIO_PHONE_NUMBER: '+10000000000',
  RAZORPAY_WEBHOOK_SECRET: 'webhook_secret',
  LOW_BALANCE_THRESHOLD: '100',
};

process.env.NODE_ENV = 'test';

for (const [key, value] of Object.entries({
  ...requiredEnvFallbacks,
  ...optionalEnvFallbacks,
})) {
  if (!process.env[key]) {
    process.env[key] = value;
  }
}

// Mock Prisma for tests
jest.mock('./utils/prisma.singleton', () => ({
  __esModule: true,
  default: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    activeSession: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    $disconnect: jest.fn(),
  },
}));

// Disable console.log in tests unless debugging
if (!process.env.DEBUG_TESTS) {
  console.log = jest.fn();
  console.warn = jest.fn();
}