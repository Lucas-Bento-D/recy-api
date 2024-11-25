import { Module } from '@nestjs/common';
import { providers } from 'web3';

import { PrismaService } from '@/modules/prisma/prisma.service';
import { UploadService } from '@/shared/modules/upload/upload.service';

import { LoggerModule } from '../../shared/modules/logger/logger.module';
import { Web3Module } from '../web3/web3.module';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';

@Module({
  imports: [LoggerModule, Web3Module],
  providers: [AuditService, PrismaService, UploadService],
  controllers: [AuditController],
  exports: [AuditService],
})
export class AuditModule {}
