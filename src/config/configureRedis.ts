/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Redis from 'ioredis';

export const redisClient = new Redis({
  host: 'localhost',
  port: process.env.post_redis as number | undefined,
});

export async function publishToChannel(
  channel: string,
  message: any,
): Promise<void> {
  await redisClient.publish(channel, JSON.stringify(message));
}

export async function subscribeToChannel(
  channel: string,
  callback: (message: any) => void,
): Promise<void> {
  await redisClient.subscribe(channel);
  redisClient.on('message', (receivedChannel, message) => {
    if (receivedChannel === channel) {
      callback(JSON.parse(message));
    }
  });
}
