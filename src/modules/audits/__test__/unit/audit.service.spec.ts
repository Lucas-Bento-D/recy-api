// import {
//   BadRequestException,
//   InternalServerErrorException,
//   NotFoundException,
// } from '@nestjs/common';
// import { Test, TestingModule } from '@nestjs/testing';
// import { Audit, RecyclingReport } from '@prisma/client';
// import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
// import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
// import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
// import { ulid } from 'ulid';
// import { Logger } from 'winston';

// import { PrismaService } from '../../../prisma/prisma.service';
// import { Web3Service } from '../../../web3/web3.service';
// import { AuditService } from '../../audit.service';
// import { CreateAuditDto } from '../../dtos/create-audit.dto';
// import { UpdateAuditDto } from '../../dtos/update-audit.dto';

// describe('AuditService', () => {
//   let service: AuditService;
//   let prisma: DeepMockProxy<PrismaService>;
//   let logger: DeepMockProxy<Logger>;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         AuditService,
//         {
//           provide: PrismaService,
//           useValue: mockDeep<PrismaService>(),
//         },
//         {
//           provide: Web3Service,
//           useValue: mockDeep<Web3Service>(),
//         },
//         {
//           provide: WINSTON_MODULE_NEST_PROVIDER,
//           useValue: mockDeep<Logger>(),
//         },
//       ],
//     }).compile();

//     service = module.get<AuditService>(AuditService);
//     prisma = module.get(PrismaService) as DeepMockProxy<PrismaService>;
//     logger = module.get(WINSTON_MODULE_NEST_PROVIDER) as DeepMockProxy<Logger>;
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   describe('createAudit', () => {
//     const createAuditDto: CreateAuditDto = {
//       reportId: 'report123',
//       audited: true,
//       auditorId: 'auditor456',
//       comments: 'All good.',
//     };

//     const recyclingReport: RecyclingReport = {
//       id: 'report123',
//       audited: false,
//       submittedBy: 'user789',
//       reportDate: new Date(),
//       phone: '1234567890',
//       materials: {},
//       walletAddress: 'wallet123',
//       evidenceUrl: 'http://evidence.url',
//       createdAt: new Date(),
//       updatedAt: new Date(),
//       metadata: {},
//     };

//     const createdAudit: Audit = {
//       id: ulid(),
//       reportId: 'report123',
//       audited: true,
//       auditorId: 'auditor456',
//       comments: 'All good.',
//       createdAt: new Date(),
//       updatedAt: new Date(),
//     };

//     it('should create an audit successfully', async () => {
//       prisma.recyclingReport.findUnique.mockResolvedValue(recyclingReport);
//       prisma.audit.create.mockResolvedValue(createdAudit);
//       prisma.recyclingReport.update.mockResolvedValue({
//         ...recyclingReport,
//         audited: true,
//       });

//       const result = await service.createAudit(createAuditDto);

//       expect(prisma.recyclingReport.findUnique).toHaveBeenCalledWith({
//         where: { id: 'report123' },
//       });

//       expect(prisma.audit.create).toHaveBeenCalledWith({
//         data: {
//           id: expect.any(String),
//           reportId: 'report123',
//           audited: true,
//           auditorId: 'auditor456',
//           comments: 'All good.',
//         },
//       });

//       expect(prisma.recyclingReport.update).toHaveBeenCalledWith({
//         where: { id: 'report123' },
//         data: { audited: true },
//       });

//       expect(result).toEqual(createdAudit);
//     });

//     it('should create an audit without comments', async () => {
//       const dtoWithoutComments: CreateAuditDto = {
//         reportId: 'report123',
//         audited: true,
//         auditorId: 'auditor456',
//       };

//       const createdAuditWithoutComments: Audit = {
//         id: ulid(),
//         reportId: 'report123',
//         audited: true,
//         auditorId: 'auditor456',
//         comments: null,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       };

//       prisma.recyclingReport.findUnique.mockResolvedValue(recyclingReport);
//       prisma.audit.create.mockResolvedValue(createdAuditWithoutComments);
//       prisma.recyclingReport.update.mockResolvedValue({
//         ...recyclingReport,
//         audited: true,
//       });

//       const result = await service.createAudit(dtoWithoutComments);

//       expect(prisma.recyclingReport.findUnique).toHaveBeenCalledWith({
//         where: { id: 'report123' },
//       });

//       expect(prisma.audit.create).toHaveBeenCalledWith({
//         data: {
//           id: expect.any(String),
//           reportId: 'report123',
//           audited: true,
//           auditorId: 'auditor456',
//           comments: undefined,
//         },
//       });

//       expect(prisma.recyclingReport.update).toHaveBeenCalledWith({
//         where: { id: 'report123' },
//         data: { audited: true },
//       });

//       expect(result).toEqual(createdAuditWithoutComments);
//     });

//     it('should throw NotFoundException if RecyclingReport is not found', async () => {
//       prisma.recyclingReport.findUnique.mockResolvedValue(null);

//       await expect(service.createAudit(createAuditDto)).rejects.toThrow(
//         new NotFoundException('RecyclingReport with ID report123 not found.'),
//       );

//       expect(prisma.recyclingReport.findUnique).toHaveBeenCalledWith({
//         where: { id: 'report123' },
//       });

//       expect(prisma.audit.create).not.toHaveBeenCalled();
//       expect(prisma.recyclingReport.update).not.toHaveBeenCalled();
//     });

//     it('should throw BadRequestException if uniqueness constraint fails', async () => {
//       const prismaError = new PrismaClientKnownRequestError(
//         'Unique constraint failed on the fields: (`auditorId`, `reportId`)',
//         {
//           code: 'P2002',
//           clientVersion: '5.17.0',
//           meta: { target: ['auditorId', 'reportId'] },
//         },
//       );

//       prisma.recyclingReport.findUnique.mockResolvedValue(recyclingReport);
//       prisma.audit.create.mockRejectedValue(prismaError);

//       await expect(service.createAudit(createAuditDto)).rejects.toThrow(
//         new BadRequestException(
//           'Unique constraint failed on the field: auditorId,reportId',
//         ),
//       );

//       expect(prisma.recyclingReport.findUnique).toHaveBeenCalledWith({
//         where: { id: 'report123' },
//       });

//       expect(prisma.audit.create).toHaveBeenCalledWith({
//         data: {
//           id: expect.any(String),
//           reportId: 'report123',
//           audited: true,
//           auditorId: 'auditor456',
//           comments: 'All good.',
//         },
//       });

//       expect(prisma.recyclingReport.update).not.toHaveBeenCalled();
//     });

//     it('should throw InternalServerErrorException for unknown errors', async () => {
//       const unknownError = new Error('Unknown error');

//       prisma.recyclingReport.findUnique.mockResolvedValue(recyclingReport);
//       prisma.audit.create.mockRejectedValue(unknownError);

//       await expect(service.createAudit(createAuditDto)).rejects.toThrow(
//         new InternalServerErrorException('An unexpected error occurred.'),
//       );

//       expect(prisma.recyclingReport.findUnique).toHaveBeenCalledWith({
//         where: { id: 'report123' },
//       });

//       expect(prisma.audit.create).toHaveBeenCalledWith({
//         data: {
//           id: expect.any(String),
//           reportId: 'report123',
//           audited: true,
//           auditorId: 'auditor456',
//           comments: 'All good.',
//         },
//       });

//       expect(prisma.recyclingReport.update).not.toHaveBeenCalled();
//     });
//   });

//   describe('findAll', () => {
//     it('should return an empty array when no audits are found', async () => {
//       prisma.audit.findMany.mockResolvedValue([]);

//       const result = await service.findAllAudits();

//       expect(prisma.audit.findMany).toHaveBeenCalled();

//       expect(result).toEqual([]);
//     });

//     it('should return a list of audits when audits are found', async () => {
//       const audits: Audit[] = [
//         {
//           id: 'audit123',
//           reportId: 'report123',
//           audited: true,
//           auditorId: 'auditor456',
//           comments: 'All good',
//           createdAt: new Date(),
//           updatedAt: new Date(),
//         },
//       ];

//       prisma.audit.findMany.mockResolvedValue(audits);

//       const result = await service.findAllAudits();

//       expect(prisma.audit.findMany).toHaveBeenCalled();

//       expect(result).toEqual(audits);
//     });
//   });

//   describe('findOne', () => {
//     it('should return an audit when a valid ID is provided', async () => {
//       const audit: Audit = {
//         id: 'audit123',
//         reportId: 'report123',
//         audited: true,
//         auditorId: 'auditor456',
//         comments: 'All good',
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       };

//       prisma.audit.findUnique.mockResolvedValue(audit);

//       const result = await service.findAuditById('audit123');

//       expect(prisma.audit.findUnique).toHaveBeenCalledWith({
//         where: { id: 'audit123' },
//       });

//       expect(result).toEqual(audit);
//     });

//     it('should throw NotFoundException if no audit is found with the provided ID', async () => {
//       prisma.audit.findUnique.mockResolvedValue(null);

//       await expect(service.findAuditById('nonexistentId')).rejects.toThrow(
//         NotFoundException,
//       );

//       expect(prisma.audit.findUnique).toHaveBeenCalledWith({
//         where: { id: 'nonexistentId' },
//       });
//     });

//     it('should throw an error if findUnique throws an error', async () => {
//       prisma.audit.findUnique.mockRejectedValue(new Error('Database error'));

//       await expect(service.findAuditById('audit123')).rejects.toThrow(
//         'Database error',
//       );

//       expect(prisma.audit.findUnique).toHaveBeenCalledWith({
//         where: { id: 'audit123' },
//       });
//     });
//   });

//   describe('update', () => {
//     it('should successfully update an existing audit', async () => {
//       const existingAudit: Audit = {
//         id: 'audit123',
//         reportId: 'report123',
//         audited: false,
//         auditorId: 'auditor456',
//         comments: 'Initial comment',
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       };

//       const updateAuditDto: UpdateAuditDto = {
//         audited: true,
//         comments: 'Updated comment',
//       };

//       const updatedAudit: Audit = {
//         ...existingAudit,
//         ...updateAuditDto,
//         updatedAt: new Date(),
//       };

//       prisma.audit.findUnique.mockResolvedValue(existingAudit);
//       prisma.audit.update.mockResolvedValue(updatedAudit);

//       const result = await service.updateAudit('audit123', updateAuditDto);

//       expect(prisma.audit.findUnique).toHaveBeenCalledWith({
//         where: { id: 'audit123' },
//       });

//       expect(prisma.audit.update).toHaveBeenCalledWith({
//         where: { id: 'audit123' },
//         data: updateAuditDto,
//       });

//       expect(result).toEqual(updatedAudit);
//     });

//     it('should throw NotFoundException if the audit is not found', async () => {
//       prisma.audit.findUnique.mockResolvedValue(null);

//       const updateAuditDto: UpdateAuditDto = {
//         audited: true,
//         comments: 'Updated comment',
//       };

//       await expect(
//         service.updateAudit('nonexistentId', updateAuditDto),
//       ).rejects.toThrow(
//         new NotFoundException('Audit with ID nonexistentId not found.'),
//       );

//       expect(prisma.audit.findUnique).toHaveBeenCalledWith({
//         where: { id: 'nonexistentId' },
//       });

//       expect(prisma.audit.update).not.toHaveBeenCalled();
//     });

//     it('should throw an error if update fails', async () => {
//       const existingAudit: Audit = {
//         id: 'audit123',
//         reportId: 'report123',
//         audited: false,
//         auditorId: 'auditor456',
//         comments: 'Initial comment',
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       };

//       const updateAuditDto: UpdateAuditDto = {
//         audited: true,
//         comments: 'Updated comment',
//       };

//       prisma.audit.findUnique.mockResolvedValue(existingAudit);

//       prisma.audit.update.mockRejectedValue(new Error('Database update error'));

//       await expect(
//         service.updateAudit('audit123', updateAuditDto),
//       ).rejects.toThrow('Database update error');

//       expect(prisma.audit.findUnique).toHaveBeenCalledWith({
//         where: { id: 'audit123' },
//       });

//       expect(prisma.audit.update).toHaveBeenCalledWith({
//         where: { id: 'audit123' },
//         data: updateAuditDto,
//       });
//     });
//   });

//   describe('delete', () => {
//     it('should successfully delete an audit when it exists', async () => {
//       const audit: Audit = {
//         id: 'audit123',
//         reportId: 'report123',
//         audited: true,
//         auditorId: 'auditor456',
//         comments: 'Audit completed',
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       };

//       prisma.audit.findUnique.mockResolvedValue(audit);
//       prisma.audit.delete.mockResolvedValue(audit);

//       const result = await service.deleteAudit('audit123');

//       expect(prisma.audit.findUnique).toHaveBeenCalledWith({
//         where: { id: 'audit123' },
//       });

//       expect(prisma.audit.delete).toHaveBeenCalledWith({
//         where: { id: 'audit123' },
//       });

//       expect(result).toEqual(audit);
//     });

//     it('should throw NotFoundException if the audit does not exist', async () => {
//       prisma.audit.findUnique.mockResolvedValue(null);

//       await expect(service.deleteAudit('nonexistentId')).rejects.toThrow(
//         new NotFoundException('Audit with ID nonexistentId not found.'),
//       );

//       expect(prisma.audit.findUnique).toHaveBeenCalledWith({
//         where: { id: 'nonexistentId' },
//       });

//       expect(prisma.audit.delete).not.toHaveBeenCalled();
//     });

//     it('should throw an error if deletion fails', async () => {
//       const audit: Audit = {
//         id: 'audit123',
//         reportId: 'report123',
//         audited: true,
//         auditorId: 'auditor456',
//         comments: 'Audit completed',
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       };

//       prisma.audit.findUnique.mockResolvedValue(audit);

//       prisma.audit.delete.mockRejectedValue(
//         new Error('Database deletion error'),
//       );

//       await expect(service.deleteAudit('audit123')).rejects.toThrow(
//         'Database deletion error',
//       );

//       expect(prisma.audit.findUnique).toHaveBeenCalledWith({
//         where: { id: 'audit123' },
//       });

//       expect(prisma.audit.delete).toHaveBeenCalledWith({
//         where: { id: 'audit123' },
//       });
//     });
//   });
// });
