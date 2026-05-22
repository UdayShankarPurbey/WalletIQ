import 'dotenv/config';
import { app } from './app.js';
import { connectDB } from './config/db.js';
import { connectRedis } from './config/redis.js';
import { configureCloudinary } from './config/cloudinary.js';
import { logger } from './utils/logger.js';

const PORT = process.env.PORT || 8000;

const start = async () => {
  await connectDB();
  connectRedis();
  configureCloudinary();

  const server = app.listen(PORT, () => {
    logger.info(`Server listening on port ${PORT}`);
  });

  const gracefulShutdown = (signal) => {
    logger.info(`${signal} received, shutting down`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
};

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { reason: String(reason) });
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { err: err.message, stack: err.stack });
  process.exit(1);
});

start().catch((err) => {
  logger.error('Failed to start server', { err: err.message, stack: err.stack });
  process.exit(1);
});
