/* eslint-disable @typescript-eslint/no-explicit-any */
import Redis from 'ioredis';

export const redisClient = new Redis({
  host: 'localhost',
  port: process.env.post_redis as number | undefined,
});
