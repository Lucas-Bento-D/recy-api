import { INestApplication, VersioningType } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Audit } from '@prisma/client';
import request from 'supertest';

import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { CreateAuditDto } from './dtos/create-audit.dto';
import { UpdateAuditDto } from './dtos/update-audit.dto';

describe('AuditController (e2e)', () => {
  let app: INestApplication;
  let service: AuditService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuditController],
      providers: [
        {
          provide: AuditService,
          useValue: {
            createAudit: jest.fn(),
            findAllAudits: jest.fn(),
            findAuditById: jest.fn(),
            updateAudit: jest.fn(),
            deleteAudit: jest.fn(),
            owner: jest.fn(),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.enableVersioning({
      type: VersioningType.URI,
    });

    await app.init();

    service = moduleFixture.get<AuditService>(AuditService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/POST /v1/audits', () => {
    it('should create an audit successfully', async () => {
      const createAuditDto: CreateAuditDto = {
        reportId: 'report123',
        audited: true,
        auditorId: 'auditor456',
        comments: 'All good.',
      };

      const createdAudit: Audit = {
        id: 'audit123',
        reportId: createAuditDto.reportId,
        audited: createAuditDto.audited,
        auditorId: createAuditDto.auditorId,
        comments: createAuditDto.comments ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'createAudit').mockResolvedValue(createdAudit);

      await request(app.getHttpServer())
        .post('/v1/audits')
        .send(createAuditDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual({
            ...createdAudit,
            createdAt: createdAudit.createdAt.toISOString(),
            updatedAt: createdAudit.updatedAt.toISOString(),
          });
          expect(service.createAudit).toHaveBeenCalledWith(createAuditDto);
        });
    });

    it('should throw BadRequestException when validation fails', async () => {
      const invalidCreateAuditDto: any = {
        reportId: '',
        audited: true,
        auditorId: 'auditor456',
        comments: 'All good.',
      };

      await request(app.getHttpServer())
        .post('/v1/audits')
        .send(invalidCreateAuditDto)
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
        });
    });
  });

  describe('/GET /v1/audits', () => {
    it('should return an array of audits', async () => {
      const audits: Audit[] = [
        {
          id: 'audit123',
          reportId: 'report123',
          audited: true,
          auditorId: 'auditor456',
          comments: 'All good.',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      jest.spyOn(service, 'findAllAudits').mockResolvedValue(audits);

      await request(app.getHttpServer())
        .get('/v1/audits')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual(
            audits.map((audit) => ({
              ...audit,
              createdAt: audit.createdAt.toISOString(),
              updatedAt: audit.updatedAt.toISOString(),
            })),
          );
          expect(service.findAllAudits).toHaveBeenCalled();
        });
    });
  });

  describe('/GET /v1/audits/owner', () => {
    it('should return an empty array when no owner is found', async () => {
      jest.spyOn(service, 'owner').mockResolvedValue([]);

      await request(app.getHttpServer())
        .get('/v1/audits/owner')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual([]);
          expect(service.owner).toHaveBeenCalled();
        });
    });

    it('should return empty object when owner is undefined', async () => {
      jest.spyOn(service, 'owner').mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .get('/v1/audits/owner')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({});
          expect(service.owner).toHaveBeenCalled();
        });
    });
  });

  describe('/GET /v1/audits/:id', () => {
    it('should return an audit when it exists', async () => {
      const audit: Audit = {
        id: 'audit123',
        reportId: 'report123',
        audited: true,
        auditorId: 'auditor456',
        comments: 'All good.',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'findAuditById').mockResolvedValue(audit);

      await request(app.getHttpServer())
        .get('/v1/audits/audit123')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            ...audit,
            createdAt: audit.createdAt.toISOString(),
            updatedAt: audit.updatedAt.toISOString(),
          });
          expect(service.findAuditById).toHaveBeenCalledWith('audit123');
        });
    });

    it('should return 404 when the audit does not exist', async () => {
      jest.spyOn(service, 'findAuditById').mockResolvedValue(null);

      await request(app.getHttpServer())
        .get('/v1/audits/nonexistentId')
        .expect(404)
        .expect(() => {
          expect(service.findAuditById).toHaveBeenCalledWith('nonexistentId');
        });
    });
  });

  describe('/PUT /v1/audits/:id', () => {
    it('should update an audit successfully', async () => {
      const updateAuditDto: UpdateAuditDto = {
        audited: false,
        comments: 'Updated comments',
      };

      const existingAudit: Audit = {
        id: 'audit123',
        reportId: 'report123',
        audited: true,
        auditorId: 'auditor456',
        comments: 'Previous comments',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedAudit: Audit = {
        id: existingAudit.id,
        reportId: existingAudit.reportId,
        audited: updateAuditDto.audited,
        auditorId: existingAudit.auditorId,
        comments: updateAuditDto.comments,
        createdAt: existingAudit.createdAt,
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'updateAudit').mockResolvedValue(updatedAudit);

      const response = await request(app.getHttpServer())
        .put('/v1/audits/audit123')
        .send(updateAuditDto)
        .expect(async (res) => {
          if (res.status !== 200) {
            console.log('PUT/v1/audits/audit123 response:', res.body);
          }
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ...updatedAudit,
        createdAt: updatedAudit.createdAt.toISOString(),
        updatedAt: updatedAudit.updatedAt.toISOString(),
      });
      expect(service.updateAudit).toHaveBeenCalledWith(
        'audit123',
        updateAuditDto,
      );
    });

    it('should throw BadRequestException when validation fails', async () => {
      const invalidUpdateAuditDto: any = {
        audited: 'notBoolean',
        comments: 'Updated comments',
      };

      await request(app.getHttpServer())
        .put('/v1/audits/audit123')
        .send(invalidUpdateAuditDto)
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
        });
    });
  });

  describe('/DELETE /v1/audits/:id', () => {
    it('should delete an audit successfully', async () => {
      const deletedAudit: Audit = {
        id: 'audit123',
        reportId: 'report123',
        audited: true,
        auditorId: 'auditor456',
        comments: 'All good.',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'deleteAudit').mockResolvedValue(deletedAudit);

      await request(app.getHttpServer())
        .delete('/v1/audits/audit123')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            ...deletedAudit,
            createdAt: deletedAudit.createdAt.toISOString(),
            updatedAt: deletedAudit.updatedAt.toISOString(),
          });
          expect(service.deleteAudit).toHaveBeenCalledWith('audit123');
        });
    });
  });
});
