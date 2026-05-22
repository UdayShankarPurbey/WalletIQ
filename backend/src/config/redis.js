import Redis from 'ioredis';
import { logger } from '../utils/logger.js';

let client;

const connectRedis = () => {
  if (client) return client;
  const url = process.env.REDIS_URL;
  if (!url) throw new Error('REDIS_URL is not set');

  client = new Redis(url, { maxRetriesPerRequest: 3 });
  client.on('connect', () => logger.info('Redis connected'));
  client.on('error', (err) => logger.error('Redis error', { err: err.message }));
  return client;
};

const getRedis = () => {
  if (!client) throw new Error('Redis not initialized — call connectRedis() at boot');
  return client;
};

export { connectRedis, getRedis };
