import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, NotFoundException } from '@nestjs/common';
import { RecyclingReport } from '@prisma/client';
import { Queue } from 'bullmq';
import { ulid } from 'ulid';

import { PrismaService } from '@/modules/prisma/prisma.service';

import { UploadService } from '../../shared/modules/upload/upload.service';
import { AuditService } from '../audits/audit.service';
import { UserService } from '../users/user.service';
import { CreateRecyclingReportDto } from './dtos/create-recycling-report.dto';
import { UpdateRecyclingReportDto } from './dtos/update-recycling-report.dto';

@Injectable()
export class RecyclingReportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly uploadService: UploadService,
    private readonly userService: UserService,
  ) {}

  //TODO: recyclingEvidence x reportEvidence

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

    // Generate a unique report ID using ULID
    const reportId = ulid();

    // Handle file upload if evidence file is provided
    let evidenceFileUrl = '';

    if (!evidenceUrl && evidenceFile) {
      const options = {
        file: evidenceFile,
        fileName: `${reportId}.png`,
        type: 'image/png',
        bucketName: 'detrash-prod',
      };
      evidenceFileUrl = await this.uploadService.upload(options);
    }

    // Create the recycling report in the database
    // TODO: need to create value with total amount per materials
    const createdReport = await this.prisma.recyclingReport.create({
      data: {
        id: reportId,
        submittedBy,
        reportDate,
        audited: false,
        phone,
        materials,
        walletAddress,
        evidenceUrl: evidenceUrl || evidenceFileUrl,
        metadata: {},
      },
    });

    // Log the creation of the audit entry for tracking
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
    await this.userService.checkUserExists(userId);

    return this.prisma.recyclingReport.findMany({
      where: { submittedBy: userId },
      include: { user: true, audits: true },
    });
  }

  async updateRecyclingReport(
    id: string,
    updateRecyclingReportDto: UpdateRecyclingReportDto,
  ): Promise<RecyclingReport> {
    const existingReport = await this.prisma.recyclingReport.findUnique({
      where: { id },
    });

    if (!existingReport) {
      throw new NotFoundException(`RecyclingReport with ID ${id} not found.`);
    }

    const updatedReport = await this.prisma.recyclingReport.update({
      where: { id },
      data: updateRecyclingReportDto,
    });

    return updatedReport;
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
