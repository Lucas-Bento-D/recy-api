import { Test, TestingModule } from '@nestjs/testing';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { LoggerModule } from '@/modules/logger/logger.module';
import { PrismaService } from '@/modules/prisma/prisma.service';

import { Web3Module } from '../../../web3/web3.module';
import { Web3Service } from '../../../web3/web3.service';
import { AuditController } from '../../audit.controller';
import { AuditModule } from '../../audit.module';
import { AuditService } from '../../audit.service';

const mockWeb3Service = {
  balance: jest.fn(),
  transfer: jest.fn(),
  owner: jest.fn(),
};

const mockWeb3Provider = {};

const mockConfigProvider = {
  wallet: '0xMockWalletAddress',
  privateKey: '0xMockPrivateKey',
};

const mockLogger = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
};

describe('AuditModule', () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AuditModule, Web3Module, LoggerModule],
    })
      .overrideProvider(Web3Service)
      .useValue(mockWeb3Service)
      .overrideProvider('Web3')
      .useValue(mockWeb3Provider)
      .overrideProvider('Config')
      .useValue(mockConfigProvider)
      .overrideProvider(WINSTON_MODULE_NEST_PROVIDER)
      .useValue(mockLogger)
      .compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide the AuditService', () => {
    const auditService = module.get<AuditService>(AuditService);
    expect(auditService).toBeDefined();
  });

  it('should provide the PrismaService', () => {
    const prismaService = module.get<PrismaService>(PrismaService);
    expect(prismaService).toBeDefined();
  });

  it('should have the AuditController', () => {
    const auditController = module.get<AuditController>(AuditController);
    expect(auditController).toBeDefined();
  });

  it('should export the AuditService', () => {
    const auditService = module.get<AuditService>(AuditService);
    expect(auditService).toBeDefined();
  });
});
