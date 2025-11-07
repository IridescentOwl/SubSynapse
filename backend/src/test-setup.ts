// Test setup file
import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
dotenv.config({ path: path.join(__dirname, '../.env.test') });

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