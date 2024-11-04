import {
  INestApplication,
  Logger,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as fs from 'fs';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import * as os from 'os';
import * as path from 'path';
import request from 'supertest';

import { AllExceptionsFilter } from '@/exception-filter';

import { UploadController } from '../../upload.controller';
import { UploadService } from '../../upload.service';

class MockLogger extends Logger { }

describe('UploadController (e2e)', () => {
  let app: INestApplication;
  let service: UploadService;
  let logger: MockLogger;

  let tempTestFilePath: string;
  let tempInvalidFilePath: string;

  beforeAll(async () => {
    logger = new MockLogger('TestLogger');

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [
        {
          provide: UploadService,
          useValue: {
            upload: jest.fn(),
          },
        },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: logger,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
      }),
    );

    // Apply the exception filter
    app.useGlobalFilters(new AllExceptionsFilter(logger));

    app.enableVersioning({
      type: VersioningType.URI,
    });

    await app.init();

    service = moduleFixture.get<UploadService>(UploadService);
  });

  afterAll(async () => {
    await app.close();

    // Clean up temporary files
    if (tempTestFilePath && fs.existsSync(tempTestFilePath)) {
      fs.unlinkSync(tempTestFilePath);
    }
    if (tempInvalidFilePath && fs.existsSync(tempInvalidFilePath)) {
      fs.unlinkSync(tempInvalidFilePath);
    }
  });

  beforeEach(() => {
    // Create a temporary test file
    tempTestFilePath = path.join(os.tmpdir(), `test-image-${Date.now()}.jpg`);
    fs.writeFileSync(tempTestFilePath, 'Test file content');

    // Create a temporary invalid test file (e.g., wrong file type)
    tempInvalidFilePath = path.join(
      os.tmpdir(),
      `invalid-file-${Date.now()}.txt`,
    );
    fs.writeFileSync(tempInvalidFilePath, 'Invalid test file content');
  });

  afterEach(() => {
    // Clean up temporary files after each test
    if (tempTestFilePath && fs.existsSync(tempTestFilePath)) {
      fs.unlinkSync(tempTestFilePath);
    }
    if (tempInvalidFilePath && fs.existsSync(tempInvalidFilePath)) {
      fs.unlinkSync(tempInvalidFilePath);
    }
  });

  describe('/POST /v1/upload', () => {
    it('should upload a file successfully', async () => {
      expect(fs.existsSync(tempTestFilePath)).toBe(true);

      jest.spyOn(service, 'upload').mockResolvedValue(undefined);

      const response = await request(app.getHttpServer())
        .post('/v1/upload')
        .attach('file', tempTestFilePath)
        .field('fileName', 'test-image.jpg')
        .expect(201);

      expect(response.body).toEqual({});
      expect(service.upload).toHaveBeenCalledWith({
        fileName: 'test-image.jpg',
        file: expect.any(Buffer),
      });
    });

    it('should return 400 when no file is uploaded', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/upload')
        .field('fileName', 'no-file.jpg')
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('File is required');
    });

    // Useful test: Will be valuable once file validation is implemented.

    // it('should return 400 when validation fails', async () => {
    //   expect(fs.existsSync(tempInvalidFilePath)).toBe(true);

    //   const response = await request(app.getHttpServer())
    //     .post('/v1/upload')
    //     .attach('file', tempInvalidFilePath)
    //     .field('fileName', 'invalid-file.txt')
    //     .expect(400);

    //   expect(response.body).toHaveProperty('message');
    //   // Adjust the expected message based on your validators
    //   expect(response.body.message).toContain(
    //     'Validation failed (expected type is jpeg)',
    //   );
    // });

    it('should handle errors from the service', async () => {
      expect(fs.existsSync(tempTestFilePath)).toBe(true);

      jest
        .spyOn(service, 'upload')
        .mockRejectedValue(new Error('Service error'));

      const response = await request(app.getHttpServer())
        .post('/v1/upload')
        .attach('file', tempTestFilePath)
        .field('fileName', 'test-image.jpg')
        .expect(500);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain(
        'Internal server error, contact support and provide the errorId',
      );
    });
  });
});
