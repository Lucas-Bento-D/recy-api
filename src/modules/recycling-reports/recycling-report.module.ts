import { Module } from '@nestjs/common';

import { PrismaService } from '@/modules/prisma/prisma.service'; // Adjust import according to your folder structure

import { RecyclingReportController } from './recycling-report.controller';
import { RecyclingReportService } from './recycling-report.service';

@Module({
  imports: [],
  controllers: [RecyclingReportController],
  providers: [RecyclingReportService, PrismaService],
  exports: [RecyclingReportService],
})
export class RecyclingReportModule {}
