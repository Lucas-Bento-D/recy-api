import { Module } from '@nestjs/common';

import { PrismaService } from '@/modules/prisma/prisma.service';

import { UploadService } from '../../shared/modules/upload/upload.service';
import { AuditService } from '../audits/audit.service';
import { UserService } from '../users/user.service';
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
    UserService,
  ],
  exports: [RecyclingReportService],
})
export class RecyclingReportModule {}
