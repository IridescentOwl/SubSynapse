import { createClient } from 'redis';
import { log } from './logging.util';

type RedisClient = ReturnType<typeof createClient>;

let redisClient: RedisClient | null = null;
let isRedisConnected = false;

// Only initialize Redis if REDIS_URL is provided
if (process.env.REDIS_URL) {
  redisClient = createClient({
    url: process.env.REDIS_URL
  });

  redisClient.on('error', (err) => {
    log('warn', 'Redis Client Error', err);
    isRedisConnected = false;
  });

  redisClient.on('connect', () => {
    log('info', 'Redis Client Connected');
    isRedisConnected = true;
  });

  redisClient.on('disconnect', () => {
    log('warn', 'Redis Client Disconnected');
    isRedisConnected = false;
  });

  // Connect to Redis, but don't block if it fails
  redisClient.connect().catch(err => {
    log('warn', 'Failed to connect to Redis (caching disabled)', { error: err.message });
    isRedisConnected = false;
  });
} else {
  log('info', 'Redis URL not provided - caching disabled');
}

// Export a wrapper that checks if Redis is available
export const getRedisClient = (): RedisClient | null => {
  return isRedisConnected && redisClient ? redisClient : null;
};

export const isRedisAvailable = (): boolean => {
  return isRedisConnected && redisClient !== null;
};

// For backward compatibility, export the client (but it may be null)
export default redisClient;
