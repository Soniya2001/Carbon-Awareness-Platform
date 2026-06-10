import winston from 'winston';
import { getEnv } from './env';

const { combine, timestamp, errors, json, colorize, printf, splat } = winston.format;

const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  splat(),
  printf(({ timestamp, level, message, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
    return `[${timestamp}] ${level}: ${stack || message}${metaStr}`;
  })
);

const prodFormat = combine(timestamp(), errors({ stack: true }), splat(), json());

function createLogger(): winston.Logger {
  const env = getEnv();
  const isDev = env.NODE_ENV === 'development';

  return winston.createLogger({
    level: isDev ? 'debug' : 'info',
    format: isDev ? devFormat : prodFormat,
    defaultMeta: { service: 'carbonwise-api' },
    transports: [
      new winston.transports.Console(),
      ...(env.NODE_ENV === 'production'
        ? [
            new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
            new winston.transports.File({ filename: 'logs/combined.log' }),
          ]
        : []),
    ],
    exceptionHandlers: [new winston.transports.Console()],
    rejectionHandlers: [new winston.transports.Console()],
  });
}

export const logger = createLogger();
export default logger;
