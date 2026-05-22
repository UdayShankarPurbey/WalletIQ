import winston from 'winston';

const { combine, timestamp, printf, colorize, errors, json, splat } = winston.format;

const devFormat = printf(({ level, message, timestamp: ts, stack, ...meta }) => {
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `${ts} [${level}]: ${stack || message}${metaStr}`;
});

const isProd = process.env.NODE_ENV === 'production';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isProd ? 'info' : 'debug'),
  format: combine(timestamp(), errors({ stack: true }), splat()),
  transports: [
    new winston.transports.Console({
      format: isProd ? json() : combine(colorize(), devFormat),
    }),
  ],
});

export { logger };
export default logger;
