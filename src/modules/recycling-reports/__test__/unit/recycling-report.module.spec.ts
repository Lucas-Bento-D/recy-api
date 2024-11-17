import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from 'winston';

import { RecyclingReportController } from '../../recycling-report.controller';
import { RecyclingReportModule } from '../../recycling-report.module';
import { RecyclingReportService } from '../../recycling-report.service';

describe('RecyclingReportModule', () => {
  let module: TestingModule;
  let recyclingReportService: RecyclingReportService;
  let recyclingReportController: RecyclingReportController;
  let logger: Logger;
  let app: INestApplication;

  const mockLogger = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [RecyclingReportModule],
    })
      .overrideProvider(Logger)
      .useValue(mockLogger)
      .compile();

    recyclingReportService = module.get<RecyclingReportService>(
      RecyclingReportService,
    );
    recyclingReportController = module.get<RecyclingReportController>(
      RecyclingReportController,
    );
    logger = mockLogger as unknown as Logger;

    app = module.createNestApplication();
    await app.init();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide the RecyclingReportService', () => {
    expect(recyclingReportService).toBeDefined();
  });

  it('should have the RecyclingReportController', () => {
    expect(recyclingReportController).toBeDefined();
  });

  it('should provide the Logger', () => {
    expect(logger).toBeDefined();
  });

  afterAll(async () => {
    await app.close();
  });
});
