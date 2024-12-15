import './tracing';

import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { AppModule } from './app.module';
import { corsOptionsDelegate } from './config/cors.config';
import { AllExceptionsFilter } from './exception-filter';
import { setupSwagger } from './shared/swagger/swagger.controller';

export async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);

  app.useGlobalFilters(new AllExceptionsFilter(logger));

  app.useLogger(logger);

  app.enableVersioning({
    type: VersioningType.URI,
  });

  await setupSwagger(app);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.enableCors(corsOptionsDelegate);

  logger.log('BOOTSTRAPPED SUCCESSFULLY');

  const port = process.env.PORT || 3333;
  await app.listen(port);
  logger.log(`Application running on port ${port}`, 'Bootstrap');
}
