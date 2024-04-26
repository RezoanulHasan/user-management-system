import { RequestHandler } from 'express';
import Redis from 'ioredis';

// Create a Redis client instance
const redisClient = new Redis();

// Middleware to cache responses using Redis
export const cacheMiddleware: RequestHandler = (req, res, next) => {
  const key = `user:${req.params.id}`; // Unique key for caching user data
  redisClient.get(key, (err, data) => {
    if (err) {
      console.error('Redis Error:', err);
      return next();
    }
    if (data) {
      // If cached data exists, send it as response
      res.status(200).json(JSON.parse(data));
    } else {
      // If no cached data, proceed to the next middleware
      next();
    }
  });
};
