import { Injectable, NotFoundException } from '@nestjs/common';
import { Audit } from '@prisma/client';
import { ulid } from 'ulid';

import { PrismaService } from '@/modules/prisma/prisma.service';
import { UploadService } from '@/shared/modules/upload/upload.service';

// import { MintCeloDto } from '../web3/dtos/celo/mint';
// import { MintNftDto } from '../web3/dtos/polygon/mint-nft';
// import { Web3Service } from '../web3/web3.service';
import { CreateAuditDto } from './dtos/create-audit.dto';
import { UpdateAuditDto } from './dtos/update-audit.dto';

interface Attribute {
  trait_type: string;
  value: string;
}
@Injectable()
export class AuditService {
  constructor(
    private readonly prisma: PrismaService, // private readonly web3Service: Web3Service,
    private readonly uploadService: UploadService,
  ) {}

  private async processAfterAuditValidated(auditId: string) {
    try {
      const audit = await this.prisma.audit.findUnique({
        where: { id: auditId },
      });

      if (!audit || !audit.audited) {
        throw new NotFoundException(
          `Audit with ID ${auditId} not found or not audited.`,
        );
      }

      const recyclingReport = await this.prisma.recyclingReport.findUnique({
        where: { id: audit.reportId },
      });

      if (!recyclingReport) {
        throw new NotFoundException(
          `Recycling report with ID ${audit.reportId} not found.`,
        );
      }

      if (recyclingReport) {
        const metadata = recyclingReport.metadata as Record<string, any> | null;

        // Filter out the 'Not Verified' attribute
        const updatedMetadata = {
          ...metadata, // Spread the existing metadata
          attributes: (metadata?.attributes || []).filter(
            (
              attribute: Attribute, // Explicitly define the type for 'attribute'
            ) =>
              !(
                attribute.trait_type === 'Audit' &&
                attribute.value === 'Not Verified'
              ),
          ),
          Audit: {
            trait_type: 'Audit',
            value: 'Verified', // New value to mark the report as audited
          },
        };

        // Now update the recycling report with the new metadata
        await this.prisma.recyclingReport.update({
          where: { id: audit.reportId },
          data: {
            metadata: updatedMetadata, // Updated metadata
          },
        });

        // Convert updatedMetadata to a JSON string and then to a Buffer
        const bufferMetadata = Buffer.from(JSON.stringify(updatedMetadata));

        const options = {
          file: bufferMetadata,
          fileName: audit.reportId,
          type: 'application/json',
        };

        await this.uploadService.upload(options);

        return audit;

        // upload metadata on aws

        //   // Creating report on polygon after validate true
        //   async mintNFTPolygon(data: MintNftDto) {
        //     return this.web3Service.mintNFTPolygon(data);
        //   }
        //   // if user is recycler
        //   async mintCelo(data: MintCeloDto) {
        //     return this.web3Service.mintCelo(data);
        //   }
        //   // 1) Mint de 50% do volume em cRECY para a carteira que mandou o relatório tokenizado (o agente de tratamento sustentável de resíduos).
        //   // 2) Mint de 10% do volume em cRECY para a carteira dona do contrato.
        //   // 3) Mint de 40% do volume para a carteira de incentivos e liquidez 0xBdF566d020e206456534e873f5EF385A762aC4FC
        //   // 4) Transfer da carteira de incentivos e liquidez de 0.5 cRECYs por relatório para cada gerador de resíduos
        //   // 5) que mandou relatórios (e conectaram a carteira) na data entre esse mint de cRECY e o último mint de cRECY.
      }
    } catch (error) {
      throw new Error(`Error processing after audit validation: ${error}`);
    }
  }

  async createAudit(createAuditDto: CreateAuditDto): Promise<Audit> {
    const { reportId, audited, auditorId, comments } = createAuditDto;

    try {
      const recyclingReport = await this.prisma.recyclingReport.findUnique({
        where: { id: reportId },
      });

      if (!recyclingReport) {
        throw new NotFoundException(
          `RecyclingReport with ID ${reportId} not found.`,
        );
      }

      // Generate ULID for the audit ID
      const auditId = ulid();

      const audit = await this.prisma.audit.create({
        data: {
          id: auditId,
          reportId: reportId,
          audited,
          auditorId: auditorId,
          comments,
        },
      });

      await this.prisma.recyclingReport.update({
        where: { id: reportId },
        data: {
          audited,
        },
      });

      return audit;
    } catch (error) {
      throw error;
    }
  }

  async findAllAudits(): Promise<Audit[]> {
    try {
      return await this.prisma.audit.findMany();
    } catch (error) {
      throw error;
    }
  }

  async findAuditById(id: string): Promise<Audit> {
    const audit = await this.prisma.audit.findUnique({ where: { id } });

    if (!audit) {
      throw new NotFoundException(`Audit with ID ${id} not found.`);
    }

    return audit;
  }

  async updateAudit(
    id: string,
    updateAuditDto: UpdateAuditDto,
  ): Promise<Audit> {
    if (!updateAuditDto.auditorId) {
      throw new NotFoundException(
        'Auditor ID is required to updated an Audit.',
      );
    }

    const existingAudit = await this.prisma.audit.findUnique({ where: { id } });

    if (!existingAudit) {
      throw new NotFoundException(`Audit with ID ${id} not found.`);
    }

    const updatedAudit = await this.prisma.audit.update({
      where: { id },
      data: updateAuditDto,
    });

    if (updatedAudit.audited && !existingAudit.audited) {
      await this.processAfterAuditValidated(updatedAudit.id);
    }

    return updatedAudit;
  }

  async deleteAudit(id: string): Promise<Audit> {
    const audit = await this.prisma.audit.findUnique({ where: { id } });

    if (!audit) {
      throw new NotFoundException(`Audit with ID ${id} not found.`);
    }

    const deletedAudit = await this.prisma.audit.delete({
      where: { id },
    });

    return deletedAudit;
  }
}
