import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, RecyclingReport, User } from '@prisma/client';
import { ulid } from 'ulid';

import { PrismaService } from '@/modules/prisma/prisma.service';

import { AuditService } from '../audits/audit.service';
import { UploadService } from '../upload/upload.service';
import { CreateRecyclingReportDto } from './dtos/create-recycling-report.dto';
import { UpdateRecyclingReportDto } from './dtos/update-recycling-report.dto';

@Injectable()
export class RecyclingReportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly uploadService: UploadService,
  ) {}

  private async checkUserExists(userId: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    return user;
  }

  async createRecyclingReport(
    createRecyclingReportDto: CreateRecyclingReportDto,
  ): Promise<RecyclingReport> {
    const {
      submittedBy,
      reportDate,
      phone,
      materials,
      walletAddress,
      evidenceFile,
      evidenceUrl,
    } = createRecyclingReportDto;

    await this.checkUserExists(submittedBy);

    // Generate ULID
    const reportId = ulid();

    // If no evidenceUrl is provided, handle file upload to S3
    let evidenceFileUrl = '';

    if (!evidenceUrl && evidenceFile) {
      // Upload evidenceFile to S3 and get the URL
      const options = {
        file: evidenceFile,
        fileName: reportId,
      };

      evidenceFileUrl = await this.uploadService.upload(options);
    }

    // Create recycling report
    const createdReport = await this.prisma.recyclingReport.create({
      data: {
        id: reportId,
        submittedBy: submittedBy,
        reportDate,
        audited: false,
        phone,
        materials,
        walletAddress,
        evidenceUrl: evidenceUrl || evidenceFileUrl,
        metadata: {},
      },
    });

    // Create audit entry for the recycling report
    await this.auditService.createAudit({
      reportId,
      audited: false,
      auditorId: null,
      comments: '',
    });

    return createdReport;
  }

  async findAllRecyclingReports(): Promise<RecyclingReport[]> {
    return this.prisma.recyclingReport.findMany({
      include: { user: true, audits: true },
    });
  }

  async findRecyclingReportById(id: string): Promise<RecyclingReport> {
    const report = await this.prisma.recyclingReport.findUnique({
      where: { id },
      include: { user: true, audits: true },
    });

    if (!report) {
      throw new NotFoundException(`RecyclingReport with ID ${id} not found.`);
    }

    return report;
  }

  async findRecyclingReportsByUser(userId: string): Promise<RecyclingReport[]> {
    await this.checkUserExists(userId);

    return this.prisma.recyclingReport.findMany({
      where: { submittedBy: userId },
      include: { user: true, audits: true },
    });
  }

  async updateRecyclingReport(
    id: string,
    updateRecyclingReportDto: UpdateRecyclingReportDto,
  ): Promise<RecyclingReport> {
    const { materials, submittedBy } = updateRecyclingReportDto;

    const existingReport = await this.prisma.recyclingReport.findUnique({
      where: { id },
    });

    if (!existingReport) {
      throw new NotFoundException(`RecyclingReport with ID ${id} not found.`);
    }

    if (submittedBy) {
      await this.checkUserExists(submittedBy);
    }

    return this.prisma.recyclingReport.update({
      where: { id },
      data: {
        ...updateRecyclingReportDto,
        materials,
      },
    });
  }

  async deleteRecyclingReport(id: string): Promise<RecyclingReport> {
    const existingReport = await this.prisma.recyclingReport.findUnique({
      where: { id },
    });

    if (!existingReport) {
      throw new NotFoundException(`RecyclingReport with ID ${id} not found.`);
    }

    return this.prisma.recyclingReport.delete({
      where: { id },
    });
  }
}
