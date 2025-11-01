import { PrismaClient } from '@prisma/client';
import { log } from './logging.util';

// Database connection pooling configuration
// Prisma Client automatically manages connection pooling
// For MongoDB, Prisma uses a connection pool managed by the MongoDB driver

let prisma: PrismaClient;

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// Singleton pattern for Prisma Client to ensure connection pooling works correctly
// In development, use global to prevent multiple instances during hot-reload
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: [
      { level: 'warn', emit: 'event' },
      { level: 'error', emit: 'event' },
    ],
    // Connection pool configuration for MongoDB
    // Note: MongoDB connection pooling is handled automatically by the MongoDB driver
    // The connection string can include poolSize parameter
  });
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: [
        { level: 'query', emit: 'event' },
        { level: 'warn', emit: 'event' },
        { level: 'error', emit: 'event' },
      ],
    });

    // Log query events in development
    global.__prisma.$on('query' as never, (e: any) => {
      log('debug', 'Database Query', {
        query: e.query,
        params: e.params,
        duration: `${e.duration}ms`,
      });
    });
  }
  prisma = global.__prisma;
}

// Log warnings and errors
prisma.$on('warn' as never, (e: any) => {
  log('warn', 'Prisma Warning', e);
});

prisma.$on('error' as never, (e: any) => {
  log('error', 'Prisma Error', e);
});

// Graceful shutdown handler
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  log('info', 'Database connection closed');
});

// Handle process termination
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  log('info', 'Database connection closed (SIGINT)');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  log('info', 'Database connection closed (SIGTERM)');
  process.exit(0);
});

export default prisma;

// Connection health check function
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$connect();
    // Simple query to verify connection - try to query a collection
    await prisma.user.findFirst();
    return true;
  } catch (error) {
    log('error', 'Database connection check failed', { error });
    return false;
  }
}

// Get connection pool stats (if available)
export async function getConnectionStats() {
  try {
    // MongoDB doesn't expose pool stats directly through Prisma
    // This is a placeholder for future enhancements
    return {
      status: 'connected',
      provider: 'mongodb',
    };
  } catch (error) {
    log('error', 'Failed to get connection stats', { error });
    return null;
  }
}

