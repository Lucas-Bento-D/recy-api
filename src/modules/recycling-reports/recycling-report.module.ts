import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

import { PrismaService } from '@/modules/prisma/prisma.service';

import { UploadService } from '../../shared/modules/upload/upload.service';
import { AuditService } from '../audits/audit.service';
import { QUEUE_NAME } from '../bullmq/bullmq.constants';
import { UserService } from '../users/user.service';
import { RecyclingReportController } from './recycling-report.controller';
import { RecyclingReportService } from './recycling-report.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QUEUE_NAME,
    }),
  ],
  controllers: [RecyclingReportController],
  providers: [
    RecyclingReportService,
    PrismaService,
    AuditService,
    UploadService,
    UserService,
  ],
  exports: [RecyclingReportService],
})
export class RecyclingReportModule {}
