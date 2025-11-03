import { createClient } from 'redis';
import { log } from './logging.util';

const redisClient = createClient({
  // In a real application, you would pass the Redis connection URL here.
  // url: process.env.REDIS_URL
});

redisClient.on('error', (err) => log('error', 'Redis Client Error', err));

redisClient.connect().catch(err => {
    log('error', 'Failed to connect to Redis', err);
});

export default redisClient;
