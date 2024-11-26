import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { RecyclingReport, User } from '@prisma/client';
import { createCanvas, loadImage } from 'canvas';
import { existsSync } from 'fs';
import path from 'path';
import { audit } from 'rxjs';
import { ulid } from 'ulid';

import { PrismaService } from '@/modules/prisma/prisma.service';

import { UploadService } from '../../shared/modules/upload/upload.service';
import { AuditService } from '../audits/audit.service';
import { UserService } from '../users/user.service';
import { CreateRecyclingReportDto } from './dtos/create-recycling-report.dto';
import { ResidueType } from './dtos/residue-type.enum';
import { UpdateRecyclingReportDto } from './dtos/update-recycling-report.dto';

interface Metadata {
  attributes: { trait_type: string; value: string | undefined }[];
  description: string;
  name: string;
  image?: string | Buffer;
  [key: string]: unknown;
}

type MaterialTotals = Record<ResidueType, number | undefined>;

@Injectable()
export class RecyclingReportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly uploadService: UploadService,
    private readonly userService: UserService,
  ) {}

  private async generateReportImage(
    metadata: Metadata,
    reportId: string,
    user: User,
  ): Promise<Buffer> {
    try {
      const canvasWidth = 1280;
      const canvasHeight = 720;
      const canvas = createCanvas(canvasWidth, canvasHeight);
      const ctx = canvas.getContext('2d');

      // Correct the path to point to the desired template file
      const filePath = path.join(
        __dirname,
        '../../../public/imgs/recy-report-template.png',
      );

      // Check if the template file exists
      if (!existsSync(filePath)) {
        throw new Error(`Template file not found at path: ${filePath}`);
      }

      const templateBackground = await loadImage(filePath);
      ctx.drawImage(templateBackground, 0, 0, canvasWidth, canvasHeight);

      // Define font style
      ctx.font = '24px Arial';

      // Adjust vertical alignment by moving 20px higher
      const verticalOffset = 20; // Adjust text block position slightly

      // Define the Y position starting point (middle of the page, adjusted with offset)
      const baseYPosition = canvasHeight / 2 + verticalOffset;

      // Positioning for left-side text
      const leftTextX = 300; // Moved closer to the center
      const leftTextYStart = baseYPosition - 50; // Starting position for left text
      const textSpacing = 40; // Increased spacing between lines

      // Draw left-side text with different colors
      ctx.fillStyle = '#173C09';
      ctx.fillText('Issued by:', leftTextX, leftTextYStart);

      ctx.fillStyle = '#0D4075';
      ctx.fillText(user.email, leftTextX, leftTextYStart + textSpacing);

      ctx.fillStyle = '#173C09';
      ctx.fillText(
        'Report Number:',
        leftTextX,
        leftTextYStart + textSpacing * 2,
      );

      ctx.fillStyle = '#0D4075';
      ctx.fillText(reportId, leftTextX, leftTextYStart + textSpacing * 3);

      // Filter and position materials for the right side
      const materials = metadata.attributes.filter(
        (material) => material.value && /kg/i.test(material.value),
      );

      // Positioning for materials on the right side
      const rightTextX = canvasWidth - 500; // Moved closer to center
      const rightTextYStart =
        baseYPosition - materials.length * (textSpacing / 2); // Align with left text

      let rightTextY = rightTextYStart;
      materials.forEach((attribute) => {
        // Draw the trait type above the attribute value
        ctx.fillStyle = '#173C09';
        ctx.fillText(attribute.trait_type, rightTextX, rightTextY);

        // Only draw the value if it's defined
        if (attribute.value) {
          ctx.fillStyle = '#0D4075';
          ctx.fillText(attribute.value, rightTextX, rightTextY + 30);
        }

        rightTextY += textSpacing * 2; // Add space between blocks of trait type and value
      });

      const imageBuffer = canvas.toBuffer('image/png');
      return imageBuffer;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  private async formattedMaterialTotals(
    materials: {
      materialType: ResidueType;
      weightKg: number;
    }[],
  ) {
    const materialTotals: MaterialTotals = materials.reduce(
      (acc, { materialType, weightKg }) => {
        if (!acc[materialType]) {
          acc[materialType] = 0;
        }
        acc[materialType]! += weightKg; // Non-null assertion as it will be initialized
        return acc;
      },
      {} as MaterialTotals,
    );

    // Format the material totals to two decimal places
    const formattedMaterialTotals: { [key in ResidueType]?: number } = {};

    for (const [key, value] of Object.entries(materialTotals)) {
      formattedMaterialTotals[key as ResidueType] = parseFloat(
        value!.toFixed(2),
      ); // Ensure value is not undefined
    }

    return formattedMaterialTotals;
  }

  private async createMetadata({
    user,
    report,
    reportId,
  }: {
    user: User;
    report: CreateRecyclingReportDto;
    reportId: string;
  }) {
    const { walletAddress, email } = user;

    const { materials } = report;

    const capitalize = (word: string): string =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();

    const formattedTotals = await this.formattedMaterialTotals(materials);

    // Prepare metadata for the report
    const jsonMetadata: Metadata = {
      attributes: [
        {
          trait_type: 'Originating email',
          value: email,
        },
        {
          trait_type: 'Originating wallet',
          value: walletAddress || '',
        },
        {
          trait_type: 'Audit',
          value: 'Not Verified',
        },
        // Consolidar os materiais
        ...Object.entries(formattedTotals).map(([key, totalWeight]) => ({
          trait_type: capitalize(key),
          value: `${totalWeight} kg`,
        })),
      ],
      description: 'Recycling and composting report',
      name: 'RECY Report',
    };

    // Generate PNG image buffer representing the report
    const pngImageBuffer = await this.generateReportImage(
      jsonMetadata,
      reportId,
      user,
    );

    // Upload the image to S3 and get the URL
    const imageReportUrlUploaded = await this.uploadService.upload({
      fileName: `${reportId}.png`,
      file: pngImageBuffer,
      type: 'image/png',
      bucketName: 'detrash-public',
      path: 'images',
    });

    // Add image URL to metadata
    const metadataWithImage = {
      ...jsonMetadata,
      image: imageReportUrlUploaded,
    };

    return metadataWithImage;
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

    const user = await this.userService.checkUserExists(submittedBy);

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

    const metadata = await this.createMetadata({
      user,
      report: createRecyclingReportDto,
      reportId,
    });

    const materialsFormatted = await this.formattedMaterialTotals(materials);

    // Create the recycling report in the database
    // TODO: need to create value with total amount per materials
    const createdReport = await this.prisma.recyclingReport.create({
      data: {
        id: reportId,
        submittedBy,
        reportDate,
        audited: false,
        phone,
        materials: materialsFormatted,
        walletAddress,
        evidenceUrl: evidenceUrl || evidenceFileUrl,
        metadata,
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
    const {
      materials,
      submittedBy,
      phone,
      walletAddress,
      evidenceFile,
      evidenceUrl,
    } = updateRecyclingReportDto;

    const existingReport = await this.prisma.recyclingReport.findUnique({
      where: { id },
    });

    if (!existingReport) {
      throw new NotFoundException(`RecyclingReport with ID ${id} not found.`);
    }

    if (submittedBy) {
      await this.userService.checkUserExists(submittedBy);
    }

    const user = await this.userService.checkUserExists(
      submittedBy || existingReport.submittedBy,
    );

    let updatedEvidenceUrl = existingReport.evidenceUrl;

    if (!evidenceUrl && evidenceFile) {
      const options = {
        file: evidenceFile,
        fileName: `${id}.png`,
        type: 'image/png',
        bucketName: 'detrash-prod',
      };
      updatedEvidenceUrl = await this.uploadService.upload(options);
    }

    if (evidenceUrl) {
      updatedEvidenceUrl = evidenceUrl;
    }

    const formattedMaterials = materials
      ? await this.formattedMaterialTotals(materials)
      : existingReport.materials;

    const updatedMetadata = await this.createMetadata({
      user,
      report: {
        materials: materials || [],
        phone: phone || existingReport.phone || '',
        walletAddress: walletAddress || existingReport.walletAddress || '',
        evidenceFile,
        evidenceUrl: updatedEvidenceUrl,
        submittedBy: submittedBy || '',
      },
      reportId: id,
    });

    const updatedReport = await this.prisma.recyclingReport.update({
      where: { id },
      data: {
        submittedBy: submittedBy || existingReport.submittedBy,
        phone: phone || existingReport.phone,
        walletAddress: walletAddress || existingReport.walletAddress,
        materials: formattedMaterials || {},
        evidenceUrl: updatedEvidenceUrl,
        metadata: updatedMetadata,
      },
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
