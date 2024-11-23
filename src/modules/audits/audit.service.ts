import {
  BadRequestException,
  GatewayTimeoutException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Audit, Prisma } from '@prisma/client';
import { ulid } from 'ulid';

import { PrismaService } from '@/modules/prisma/prisma.service';

import { MintCeloDto } from '../web3/dtos/celo/mint';
import { MintNftDto } from '../web3/dtos/polygon/mint-nft';
import { Web3Service } from '../web3/web3.service';
import { CreateAuditDto } from './dtos/create-audit.dto';
import { UpdateAuditDto } from './dtos/update-audit.dto';

@Injectable()
export class AuditService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly web3Service: Web3Service,
  ) {}

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
    } catch (error: unknown) {
      const err = error as Error;

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new BadRequestException(
            `Foreign key constraint failed on the field: ${error.meta?.field_name}`,
          );
        }

        if (error.code === 'P2002') {
          throw new BadRequestException(
            `Unique constraint failed on the field: ${error.meta?.target}`,
          );
        }
      }

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException('An unexpected error occurred.');
    }
  }

  async findAllAudits(): Promise<Audit[]> {
    try {
      return await this.prisma.audit.findMany();
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientInitializationError) {
      throw new ServiceUnavailableException(
        'Database connection error. Please try again later.',
      );
    } else if (error instanceof Prisma.PrismaClientRustPanicError) {
      throw new GatewayTimeoutException(
        'Database engine encountered an unexpected error. Please try again later.',
      );
    } else {
      throw new InternalServerErrorException(
        'An unexpected error occurred while retrieving audits. Please try again later.',
      );
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
    const existingAudit = await this.prisma.audit.findUnique({ where: { id } });

    if (!existingAudit) {
      throw new NotFoundException(`Audit with ID ${id} not found.`);
    }

    const updatedAudit = await this.prisma.audit.update({
      where: { id },
      data: updateAuditDto,
    });

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

  // Other functions...

  async mintNFTPolygon(data: MintNftDto) {
    return this.web3Service.mintNFTPolygon(data);
  }

  async mintCelo(data: MintCeloDto) {
    return this.web3Service.mintCelo(data);
  }

  // 1) Creating report
  //   // {
  //   //   "submittedBy": "01JAER87DV9WHJFQ2T7A47H5B5",
  //   //   "reportDate": "2024-10-17T12:00:00Z",
  //   //   "phone": "+551199234-5678",
  //   //   "materials": [
  //   //     { "materialType": "PLASTIC", "weightKg": 12.5 },
  //   //     { "materialType": "METAL", "weightKg": 7.3 }
  //   //   ],
  //   //   "walletAddress": "0xdA7aEe1A6f2337Bd908B4669702604f5327C1A61",
  //   //   "evidenceUrl": "https://example.com/evidence.jpg"
  //   // }

  //   // Here I need to save the volume of materials

  //   // --------------------------------------------------------------------------------

  //   // 2) Audit validated report
  //   // {
  //   //   "reportId": "01JAES25E1FENC4XZ5XX6PCAHG",
  //   //   "audited": true,
  //   //   "auditorId": "01JAER87DV9WHJFQ2T7A47H5B5",
  //   //   "comments": "Audit completed successfully."
  //   // }

  //   // Creating metadata

  //   // {
  //   //   "attributes": [
  //   //     {
  //   //       "trait_type": "Originating email",
  //   //       "value": "ffs.china@gmail.com"
  //   //     },
  //   //     {
  //   //       "trait_type": "Originating wallet",
  //   //       "value": "0xF70d06D4d3a78E80Be405267d229224697d25c68"
  //   //     },
  //   //     {
  //   //       "trait_type": "Audit",
  //   //       "value": "Verified"
  //   //     },
  //   //     {
  //   //       "trait_type": "Metal kgs",
  //   //       "value": "35"
  //   //     },
  //   //     {
  //   //       "trait_type": "Paper kgs",
  //   //       "value": "115"
  //   //     },
  //   //     {
  //   //       "trait_type": "Plastic kgs",
  //   //       "value": "75"
  //   //     }
  //   //   ],
  //   //   "description": "Recycling and composting report",
  //   //   "image": "https://detrash-public.s3.us-east-1.amazonaws.com/images/eaf8f37f-2055-40c1-8e0e-400c8453b6e9.png",
  //   //   "name": "RECY Report"
  //   // }

  //   // --------------------------------------------------------------------------------

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
