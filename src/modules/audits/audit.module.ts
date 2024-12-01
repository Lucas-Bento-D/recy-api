import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { PrismaService } from '@/modules/prisma/prisma.service';

import { LoggerModule } from '../../shared/modules/logger/logger.module';
import { REPORT_QUEUE } from '../bullmq/bullmq.constants';
import { UserService } from '../users/user.service';
import { Web3Module } from '../web3/web3.module';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';

@Module({
  imports: [
    LoggerModule,
    Web3Module,
    BullModule.registerQueue({
      name: REPORT_QUEUE,
    }),
    BullBoardModule.forFeature({
      name: REPORT_QUEUE,
      adapter: BullMQAdapter,
    }),
  ],
  providers: [AuditService, PrismaService, UserService],
  controllers: [AuditController],
  exports: [AuditService, BullModule],
})
export class AuditModule {}
