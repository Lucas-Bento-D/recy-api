import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import request from 'supertest';
import { Logger } from 'winston';
import * as winston from 'winston';

import { UploadController } from '../../upload.controller';
import { UploadModule } from '../../upload.module';
import { UploadService } from '../../upload.service';

describe('UploadModule', () => {
  let module: TestingModule;
  let uploadService: UploadService;
  let uploadController: UploadController;
  let configService: ConfigService;
  let logger: Logger;
  let app: INestApplication;

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
    getOrThrow: jest.fn(),
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [UploadModule],
    })
      .overrideProvider(ConfigService)
      .useValue(mockConfigService)
      .overrideProvider(WINSTON_MODULE_NEST_PROVIDER)
      .useValue(mockLogger)
      .overrideProvider(APP_GUARD)
      .useClass(ThrottlerGuard)
      .compile();

    uploadService = module.get<UploadService>(UploadService);
    uploadController = module.get<UploadController>(UploadController);
    configService = module.get<ConfigService>(ConfigService);
    logger = module.get<Logger>(WINSTON_MODULE_NEST_PROVIDER);

    app = module.createNestApplication();
    await app.init();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide the UploadService', () => {
    expect(uploadService).toBeDefined();
  });

  it('should have the UploadController', () => {
    expect(uploadController).toBeDefined();
  });

  it('should provide the ConfigService', () => {
    expect(configService).toBeDefined();
  });

  it('should provide the Logger', () => {
    expect(logger).toBeDefined();
  });
});
