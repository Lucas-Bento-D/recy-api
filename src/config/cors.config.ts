import { INestApplication } from '@nestjs/common';
import { Request } from 'express';

import { HttpRequestHeaderKeysEnum } from '@/shared/http';

export const corsOptionsDelegate: Parameters<
  INestApplication['enableCors']
>[0] = function (req: Request, callback) {
  const corsOptions: Parameters<typeof callback>[1] = {
    origin: false as boolean | string | string[],
    preflightContinue: false,
    maxAge: 86400,
    allowedHeaders: Object.values(HttpRequestHeaderKeysEnum),
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  };

  const origin = extractOrigin(req);

  if (enableWildcard()) {
    corsOptions.origin = '*';
  } else {
    corsOptions.origin = [];

    if (process.env.FRONT_BASE_URL) {
      corsOptions.origin.push(process.env.FRONT_BASE_URL);
    }
  }

  // TODO: waiting pino logger feature
  console.log({
    curEnv: process.env.NODE_ENV,
    previewUrlRoot: process.env.PR_PREVIEW_ROOT_URL,
    origin,
  });

  callback(null as unknown as Error, corsOptions);
};

function enableWildcard(): boolean {
  return process.env.NODE_ENV === 'dev';
}

function extractOrigin(req: Request): string {
  return req.headers.origin || '';
}
