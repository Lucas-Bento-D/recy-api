import { forwardRef, Module } from '@nestjs/common';

import { PrismaService } from '@/modules/prisma/prisma.service';

import { UploadService } from '../../shared/modules/upload/upload.service';
import { AuditModule } from '../audits/audit.module';
import { AuditService } from '../audits/audit.service';
import { UserService } from '../users/user.service';
import { RecyclingReportController } from './recycling-report.controller';
import { RecyclingReportService } from './recycling-report.service';

@Module({
  controllers: [RecyclingReportController],
  providers: [
    RecyclingReportService,
    PrismaService,
    AuditService,
    UploadService,
    UserService,
  ],
  exports: [RecyclingReportService],
  imports: [AuditModule],
})
export class RecyclingReportModule {}
