import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { PrismaService } from '@/modules/prisma/prisma.service';

import { CreateRecyclingReportDto } from '../../dtos/create-recycling-report.dto';
import { ResidueType } from '../../dtos/residue-type.enum';
import { RecyclingReportService } from '../../recycling-report.service';

describe('RecyclingReportService', () => {
  let service: RecyclingReportService;
  let prisma: DeepMockProxy<PrismaService>;
  let logger: DeepMockProxy<Logger>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecyclingReportService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: mockDeep<Logger>(),
        },
      ],
    }).compile();

    service = module.get<RecyclingReportService>(RecyclingReportService);
    prisma = module.get(PrismaService) as DeepMockProxy<PrismaService>;
    logger = module.get(WINSTON_MODULE_NEST_PROVIDER) as DeepMockProxy<Logger>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createRecyclingReport', () => {
    it('should create a new recycling report', async () => {
      // Arrange
      const createDto: CreateRecyclingReportDto = {
        submittedBy: 'user123',
        reportDate: new Date(),
        phone: '+55 11 912345678',
        materials: [{ materialType: ResidueType.PLASTIC, weightKg: 12.5 }],
        walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
        evidenceUrl: 'https://example.com/evidence.jpg',
      };

      prisma.user.findUnique.mockResolvedValue({
        id: 'user123',
        name: 'John Doe',
        phone: null,
        walletAddress: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        email: 'john.doe@example.com',
      });

      prisma.recyclingReport.create.mockResolvedValue({
        id: 'report123',
        submittedBy: createDto.submittedBy,
        reportDate: createDto.reportDate || new Date(),
        audited: false,
        phone: createDto.phone || null,
        materials: createDto.materials as unknown as Prisma.JsonArray,
        walletAddress: createDto.walletAddress || null,
        evidenceUrl: createDto.evidenceUrl,
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      const result = await service.createRecyclingReport(createDto);

      // Assert
      expect(result).toEqual(expect.objectContaining({ id: 'report123' }));
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user123' },
      });
      expect(prisma.recyclingReport.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user does not exist', async () => {
      // Arrange
      const createDto: CreateRecyclingReportDto = {
        submittedBy: 'invalidUser',
        reportDate: new Date(),
        phone: '+55 11 912345678',
        materials: [{ materialType: ResidueType.PLASTIC, weightKg: 12.5 }],
        walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
        evidenceUrl: 'https://example.com/evidence.jpg',
      };

      prisma.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.createRecyclingReport(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAllRecyclingReports', () => {
    it('should return all recycling reports', async () => {
      // Arrange
      const mockReports = [
        {
          id: 'report123',
          submittedBy: 'user123',
          reportDate: new Date(),
          audited: false,
          phone: '+55 11 912345678',
          materials: [
            { materialType: ResidueType.PLASTIC, weightKg: 12.5 },
          ] as unknown as Prisma.JsonArray,
          walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
          evidenceUrl: 'https://example.com/evidence.jpg',
          metadata: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      prisma.recyclingReport.findMany.mockResolvedValue(mockReports);

      // Act
      const result = await service.findAllRecyclingReports();

      // Assert
      expect(result).toEqual(mockReports);
      expect(prisma.recyclingReport.findMany).toHaveBeenCalled();
    });
  });

  describe('findRecyclingReportById', () => {
    it('should return a recycling report by ID', async () => {
      // Arrange
      const mockReport = {
        id: 'report123',
        submittedBy: 'user123',
        reportDate: new Date(),
        audited: false,
        phone: '+55 11 912345678',
        materials: [
          { materialType: ResidueType.PLASTIC, weightKg: 12.5 },
        ] as unknown as Prisma.JsonArray,
        walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
        evidenceUrl: 'https://example.com/evidence.jpg',
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prisma.recyclingReport.findUnique.mockResolvedValue(mockReport);

      // Act
      const result = await service.findRecyclingReportById('report123');

      // Assert
      expect(result).toEqual(mockReport);
    });

    it('should throw NotFoundException if report does not exist', async () => {
      // Arrange
      prisma.recyclingReport.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.findRecyclingReportById('invalidId'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
