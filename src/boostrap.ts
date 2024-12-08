import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './exception-filter';
import { setupSwagger } from './shared/swagger/swagger.controller';

export async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const logger = app.get(Logger);

  app.useLogger(logger);
  app.useGlobalFilters(new AllExceptionsFilter(logger));

  app.enableCors({
    origin: 'http://localhost:3333',
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type'],
    maxAge: 86400,
  });

  app.enableVersioning({
    type: VersioningType.URI,
    // defaultVersion: '1',
  });

  await setupSwagger(app);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  logger.log('BOOTSTRAPPED SUCCESSFULLY');

  const port = process.env.PORT || 3333;
  await app.listen(port);
  logger.log(`Application running on port ${port}`, 'Bootstrap');
}
