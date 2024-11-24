import { Module } from '@nestjs/common';

import { PrismaService } from '@/modules/prisma/prisma.service';

import { AuditService } from '../audits/audit.service';
import { UploadService } from '../upload/upload.service';
import { RecyclingReportController } from './recycling-report.controller';
import { RecyclingReportService } from './recycling-report.service';

@Module({
  imports: [],
  controllers: [RecyclingReportController],
  providers: [
    RecyclingReportService,
    PrismaService,
    AuditService,
    UploadService,
  ],
  exports: [RecyclingReportService],
})
export class RecyclingReportModule {}
