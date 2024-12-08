import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    PinoLoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  singleLine: true,
                  levelFirst: true,
                  translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
                },
              }
            : undefined,
        customSuccessMessage: (req, res) => {
          if (res.statusCode >= 400) {
            return '';
          }
          return `Request to ${req.method} ${req.url} finished successfully.`;
        },
        customErrorMessage: (req, _, err) => {
          return `Error on request ${req.method} ${req.url}: ${err.message}`;
        },
        redact: ['req.headers', 'req.body', 'res.body'],
      },
    }),
  ],
  exports: [PinoLoggerModule],
})
export class LoggerModule {}
