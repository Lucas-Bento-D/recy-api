import { Test, TestingModule } from '@nestjs/testing';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { LoggerModule } from '@/modules/logger/logger.module';
import { PrismaService } from '@/modules/prisma/prisma.service';

import { RecyclingReportController } from '../../recycling-report.controller';
import { RecyclingReportModule } from '../../recycling-report.module';
import { RecyclingReportService } from '../../recycling-report.service';

const mockLogger = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
};

describe('RecyclingReportModule', () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [RecyclingReportModule, LoggerModule],
    })
      .overrideProvider(WINSTON_MODULE_NEST_PROVIDER)
      .useValue(mockLogger)
      .compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide the RecyclingReportService', () => {
    const recyclingReportService = module.get<RecyclingReportService>(
      RecyclingReportService,
    );
    expect(recyclingReportService).toBeDefined();
  });

  it('should provide the PrismaService', () => {
    const prismaService = module.get<PrismaService>(PrismaService);
    expect(prismaService).toBeDefined();
  });

  it('should have the RecyclingReportController', () => {
    const recyclingReportController = module.get<RecyclingReportController>(
      RecyclingReportController,
    );
    expect(recyclingReportController).toBeDefined();
  });

  it('should export the RecyclingReportService', () => {
    const recyclingReportService = module.get<RecyclingReportService>(
      RecyclingReportService,
    );
    expect(recyclingReportService).toBeDefined();
  });
});
