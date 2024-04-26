/* eslint-disable @typescript-eslint/no-explicit-any */
import Redis from 'ioredis';

// Create a Redis client instance
export const redisClient = new Redis({
  host: 'localhost', // Redis server host
  port: process.env.post_redis as number | undefined,
  // Redis server port
});
