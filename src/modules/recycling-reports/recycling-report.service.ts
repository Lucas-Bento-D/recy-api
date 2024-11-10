import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma, RecyclingReport, User } from '@prisma/client';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ulid } from 'ulid';

import { PrismaService } from '@/modules/prisma/prisma.service';

import { CreateRecyclingReportDto } from './dtos/create-recycling-report.dto';
import { UpdateRecyclingReportDto } from './dtos/update-recycling-report.dto';

@Injectable()
export class RecyclingReportService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
  ) {}

  private async checkUserExists(userId: string): Promise<User> {
    this.logger.log(
      `Checking if user exists with ID: ${userId}`,
      'RecyclingReportService - checkUserExists',
    );
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      this.logger.warn(
        `User with ID ${userId} not found`,
        'RecyclingReportService - checkUserExists',
      );
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
      evidenceUrl,
    } = createRecyclingReportDto;

    this.logger.log(
      'Starting recycling report creation',
      'RecyclingReportService - createRecyclingReport',
    );

    await this.checkUserExists(submittedBy);

    const jsonMaterials: Prisma.JsonArray =
      materials as unknown as Prisma.JsonArray;
    const reportId = ulid();

    const report = await this.prisma.recyclingReport.create({
      data: {
        id: reportId,
        submittedBy,
        reportDate,
        audited: false,
        phone,
        materials: jsonMaterials,
        walletAddress,
        evidenceUrl,
      },
    });

    this.logger.log(
      `Recycling report created with ID: ${report.id}`,
      'RecyclingReportService - createRecyclingReport',
    );

    return report;
  }

  async findAllRecyclingReports(): Promise<RecyclingReport[]> {
    this.logger.log(
      'Retrieving all recycling reports',
      'RecyclingReportService - findAllRecyclingReports',
    );

    const reports = await this.prisma.recyclingReport.findMany({
      include: { user: true, audits: true },
    });

    this.logger.log(
      `Retrieved ${reports.length} recycling reports`,
      'RecyclingReportService - findAllRecyclingReports',
    );

    return reports;
  }

  async findRecyclingReportById(id: string): Promise<RecyclingReport> {
    this.logger.log(
      `Retrieving recycling report with ID: ${id}`,
      'RecyclingReportService - findRecyclingReportById',
    );

    const report = await this.prisma.recyclingReport.findUnique({
      where: { id },
      include: { user: true, audits: true },
    });

    if (!report) {
      this.logger.warn(
        `Recycling report with ID ${id} not found`,
        'RecyclingReportService - findRecyclingReportById',
      );
      throw new NotFoundException(`Recycling report with ID ${id} not found.`);
    }

    this.logger.log(
      `Successfully retrieved recycling report with ID: ${id}`,
      'RecyclingReportService - findRecyclingReportById',
    );

    return report;
  }

  async findRecyclingReportsByUser(userId: string): Promise<RecyclingReport[]> {
    await this.checkUserExists(userId);

    this.logger.log(
      `Retrieving recycling reports for user ID: ${userId}`,
      'RecyclingReportService - findRecyclingReportsByUser',
    );

    const reports = await this.prisma.recyclingReport.findMany({
      where: { submittedBy: userId },
      include: { user: true, audits: true },
    });

    this.logger.log(
      `Retrieved ${reports.length} recycling reports for user ID: ${userId}`,
      'RecyclingReportService - findRecyclingReportsByUser',
    );

    return reports;
  }

  async updateRecyclingReport(
    id: string,
    updateRecyclingReportDto: UpdateRecyclingReportDto,
  ): Promise<RecyclingReport> {
    this.logger.log(
      `Updating recycling report with ID: ${id}`,
      'RecyclingReportService - updateRecyclingReport',
    );

    const existingReport = await this.prisma.recyclingReport.findUnique({
      where: { id },
    });

    if (!existingReport) {
      this.logger.warn(
        `Recycling report with ID ${id} not found`,
        'RecyclingReportService - updateRecyclingReport',
      );
      throw new NotFoundException(`Recycling report with ID ${id} not found.`);
    }

    if (updateRecyclingReportDto.submittedBy) {
      await this.checkUserExists(updateRecyclingReportDto.submittedBy);
    }

    const jsonMaterials: Prisma.JsonArray =
      updateRecyclingReportDto.materials as unknown as Prisma.JsonArray;

    const updatedReport = await this.prisma.recyclingReport.update({
      where: { id },
      data: { ...updateRecyclingReportDto, materials: jsonMaterials },
    });

    this.logger.log(
      `Recycling report with ID ${id} successfully updated`,
      'RecyclingReportService - updateRecyclingReport',
    );

    return updatedReport;
  }

  async deleteRecyclingReport(id: string): Promise<RecyclingReport> {
    this.logger.log(
      `Deleting recycling report with ID: ${id}`,
      'RecyclingReportService - deleteRecyclingReport',
    );

    const existingReport = await this.prisma.recyclingReport.findUnique({
      where: { id },
    });

    if (!existingReport) {
      this.logger.warn(
        `Recycling report with ID ${id} not found`,
        'RecyclingReportService - deleteRecyclingReport',
      );
      throw new NotFoundException(`Recycling report with ID ${id} not found.`);
    }

    const deletedReport = await this.prisma.recyclingReport.delete({
      where: { id },
    });

    this.logger.log(
      `Recycling report with ID ${id} successfully deleted`,
      'RecyclingReportService - deleteRecyclingReport',
    );

    return deletedReport;
  }
}
