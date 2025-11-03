import { Request, Response, NextFunction } from 'express';
import redisClient from '../utils/redis.util';
import { log } from '../utils/logging.util';

export const cache = (duration: number) => async (req: Request, res: Response, next: NextFunction) => {
  const key = `__express__${req.originalUrl || req.url}`;

  try {
    const cachedResponse = await redisClient.get(key);
    if (cachedResponse) {
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.parse(cachedResponse));
      return;
    }
  } catch (err) {
    log('error', 'Could not retrieve from Redis cache', { error: err });
  }

  const originalSend = res.send;
  res.send = (body) => {
    try {
      redisClient.set(key, JSON.stringify(body), {
        EX: duration,
        NX: true
      });
    } catch (err) {
      log('error', 'Could not cache response to Redis', { error: err });
    }
    res.setHeader('Content-Type', 'application/json');
    return originalSend.call(res, body);
  };
  next();
};

export const clearCache = (key: string) => {
  redisClient.del(`__express__${key}`);
};
