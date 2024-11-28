import { Processor, WorkerHost } from '@nestjs/bullmq';
import { InternalServerErrorException } from '@nestjs/common';
import { User } from '@prisma/client';
import { Job } from 'bullmq';
import { createCanvas, loadImage } from 'canvas';
import { existsSync } from 'fs';
import path from 'path';

import { UploadService } from '@/shared/modules/upload/upload.service';
import { formattedMaterialTotals } from '@/shared/utils/recycling-report';

import { Metadata } from '../recycling-reports/types';
import { JOBS, QUEUE_NAME } from './bullmq.constants';

@Processor(QUEUE_NAME)
export class BullMQProcessor extends WorkerHost {
  constructor(private readonly uploadService: UploadService) {
    super();
  }

  async process(job: Job<any>, token: string | undefined): Promise<any> {
    console.log(token);
    switch (job.name) {
      case JOBS.reportEvidence:
        return this.reportEvidence(job);
      default:
        throw new Error(`Process ${job.name} not implemented`);
    }
  }

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

  async reportEvidence(job: Job<any>): Promise<any> {
    const { user, report, reportId } = job.data;

    const { walletAddress, email } = user;

    const { materials } = report;

    const capitalize = (word: string): string =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();

    const formattedTotals = await formattedMaterialTotals(materials);

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
          value: 'Verified',
        },
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

    const bufferMetadata = Buffer.from(JSON.stringify(metadataWithImage));

    const options = {
      file: bufferMetadata,
      fileName: `${reportId}.json`,
      type: 'application/json',
      bucketName: 'detrash-public',
      path: 'metadata',
    };

    await this.uploadService.upload(options);

    return metadataWithImage;
  }
}
