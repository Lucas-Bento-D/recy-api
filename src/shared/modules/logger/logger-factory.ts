import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { IncomingMessage, ServerResponse } from 'http';
import { Params } from 'nestjs-pino';
import { GenReqId, Options } from 'pino-http';

const genReqId: GenReqId = (
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage>,
) => {
  const headerId = req.headers['x-request-id'];
  const id = typeof headerId === 'string' && headerId ? headerId : randomUUID();
  res.setHeader('X-Request-Id', String(id));
  return id;
};

const customReceivedMessage = (req: IncomingMessage): string => {
  const reqId = String(req.id || '*');
  return `[${reqId}] => Request received: "${req.method} ${req.url}"`;
};

const customSuccessMessage = (
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage>,
  responseTime: number,
): string => {
  const reqId = String(req.id || '*');
  return `[${reqId}] "${req.method} ${req.url}" ${res.statusCode} - ${responseTime} ms`;
};

const customErrorMessage = (
  req: IncomingMessage,
  res: ServerResponse<IncomingMessage>,
  err: Error,
): string => {
  const reqId = String(req.id || '*');
  return `[${reqId}] "${req.method} ${req.url}" ${res.statusCode} - Error: ${err.message}`;
};

const loggingRedactPaths = [
  'req.headers.authorization',
  'req.body.password',
  'req.headers.cookie',
];

function consoleLoggingConfig(isProduction: boolean): Options {
  if (!isProduction) {
    return {
      messageKey: 'msg',
      transport: {
        target: 'pino-pretty',
        options: {
          singleLine: true,
          colorize: true,
          translateTime: 'SYS:standard',
        },
      },
    };
  } else {
    return {
      messageKey: 'msg',
    };
  }
}

async function loggerFactory(configService: ConfigService): Promise<Params> {
  const logLevel =
    configService.get<string>('app.logLevel', { infer: true }) || 'info';
  const isDebug =
    configService.get<boolean>('app.debug', { infer: true }) || false;

  const isProduction = process.env.NODE_ENV === 'production';

  const pinoHttpOptions: Options = {
    level: logLevel,
    genReqId: isDebug ? genReqId : undefined,
    customReceivedMessage,
    customSuccessMessage,
    customErrorMessage,
    serializers: {
      req: (req) => {
        const serializedReq: Record<string, unknown> = {
          id: req.id,
          method: req.method,
          url: req.url,
        };
        if (isDebug && req.raw && req.raw.body) {
          serializedReq.body = req.raw.body;
        }
        return serializedReq;
      },
      res: (res) => ({
        statusCode: res.statusCode,
      }),
    },
    redact: {
      paths: loggingRedactPaths,
      censor: '**REDACTED**',
    },
    ...consoleLoggingConfig(isProduction),
  };

  return {
    pinoHttp: pinoHttpOptions,
  };
}

export default loggerFactory;
