import 'winston-daily-rotate-file';

import * as winston from 'winston';

const { format, transports } = winston;

const devFormat = format.combine(
  format.colorize({ all: true }),
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.printf(({ timestamp, level, message, stack, context }) => {
    return `${timestamp} - [${level}] - ${context ? '[' + context + '] ' : ''}${
      stack || message
    }`;
  }),
);

const prodFormat = format.combine(
  format.timestamp(),
  format.errors({ stack: true }),
  format.json(),
);

const commonTransports = [];

if (process.env.NODE_ENV !== 'production') {
  commonTransports.push(
    new transports.Console({
      level: 'debug',
      format: devFormat,
    }),
  );
}

if (process.env.NODE_ENV === 'production') {
  commonTransports.push(
    new transports.DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: 'info',
      format: prodFormat,
    }),
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: prodFormat,
    }),
  );
}

export const winstonLoggerOptions = {
  transports: commonTransports,
};
