import { Request, Response, NextFunction } from 'express';
import { getRedisClient, isRedisAvailable } from '../utils/redis.util';
import { log } from '../utils/logging.util';

export const cache = (duration: number) => async (req: Request, res: Response, next: NextFunction) => {
  // If Redis is not available, skip caching and proceed normally
  if (!isRedisAvailable()) {
    return next();
  }

  const redisClient = getRedisClient();
  if (!redisClient) {
    return next();
  }

  const key = `__express__${req.originalUrl || req.url}`;

  try {
    const cachedResponse = await redisClient.get(key);
    if (cachedResponse) {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.parse(cachedResponse));
      return;
    }
  } catch (err) {
    // If Redis fails, just continue without cache
    log('warn', 'Could not retrieve from Redis cache', { error: err });
  }

  const originalSend = res.send;
  res.send = (body) => {
    // Try to cache, but don't fail if it doesn't work
    if (isRedisAvailable() && redisClient) {
      try {
        redisClient.set(key, JSON.stringify(body), {
          EX: duration,
          NX: true
        }).catch((err) => {
          log('warn', 'Could not cache response to Redis', { error: err });
        });
      } catch (err) {
        log('warn', 'Could not cache response to Redis', { error: err });
      }
    }
    res.setHeader('Content-Type', 'application/json');
    return originalSend.call(res, body);
  };
  next();
};

export const clearCache = (key: string) => {
  if (!isRedisAvailable()) {
    return;
  }
  
  const redisClient = getRedisClient();
  if (redisClient) {
    redisClient.del(`__express__${key}`).catch((err) => {
      log('warn', 'Could not clear Redis cache', { error: err });
    });
  }
};
