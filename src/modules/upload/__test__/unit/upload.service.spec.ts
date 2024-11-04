import {
  PutObjectCommand,
  PutObjectCommandInput,
  PutObjectCommandOutput,
  S3Client,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { UploadService } from '../../upload.service';

interface MockS3Client extends S3Client {
  send: jest.Mock<Promise<PutObjectCommandOutput>, [PutObjectCommand]>;
}

describe('UploadService', () => {
  let service: UploadService;
  let configService: DeepMockProxy<ConfigService>;
  let logger: DeepMockProxy<Logger>;
  let s3Client: MockS3Client;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadService,
        {
          provide: ConfigService,
          useValue: mockDeep<ConfigService>(),
        },
        {
          provide: WINSTON_MODULE_NEST_PROVIDER,
          useValue: mockDeep<Logger>(),
        },
      ],
    }).compile();

    service = module.get<UploadService>(UploadService);
    configService = module.get(ConfigService) as DeepMockProxy<ConfigService>;
    logger = module.get(WINSTON_MODULE_NEST_PROVIDER) as DeepMockProxy<Logger>;

    // Create a mock S3 client
    s3Client = new S3Client({ region: 'us-east-1' }) as MockS3Client;
    s3Client.send = jest.fn();

    // Inject the mock S3 client into the service
    service['s3Client'] = s3Client;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('upload', () => {
    const fileName = 'test-file.txt';
    const fileContent = Buffer.from('Test file content');
    const uploadFileDto = { fileName, file: fileContent };

    it('should upload a file successfully', async () => {
      // Arrange
      s3Client.send.mockResolvedValue({
        $metadata: {},
      } as PutObjectCommandOutput);
      configService.getOrThrow.mockReturnValue('us-east-1');
      process.env.AWS_S3_BUCKET_NAME = 'test-bucket';

      // Act
      await expect(service.upload(uploadFileDto)).resolves.toBeUndefined();

      // Assert
      expect(logger.log).toHaveBeenCalledWith(
        `Starting upload for file: ${fileName}`,
        'UploadService',
      );

      expect(s3Client.send).toHaveBeenCalledWith(expect.any(PutObjectCommand));

      const commandArg = s3Client.send.mock.calls[0][0] as PutObjectCommand;
      expect(commandArg.input).toEqual({
        Bucket: 'test-bucket',
        Key: fileName,
        Body: fileContent,
      });

      expect(logger.log).toHaveBeenCalledWith(
        `File ${fileName} uploaded successfully`,
        'UploadService',
      );
    });

    it('should throw an error if upload fails', async () => {
      // Arrange
      const error = new Error('S3 upload error');
      s3Client.send.mockRejectedValue(error);
      configService.getOrThrow.mockReturnValue('us-east-1');
      process.env.AWS_S3_BUCKET_NAME = 'test-bucket';

      // Act & Assert
      await expect(service.upload(uploadFileDto)).rejects.toThrow(
        'S3 upload error',
      );

      expect(logger.log).toHaveBeenCalledWith(
        `Starting upload for file: ${fileName}`,
        'UploadService',
      );

      expect(s3Client.send).toHaveBeenCalledWith(expect.any(PutObjectCommand));
    });

    // it('should throw an error if AWS_S3_BUCKET_NAME is not set', async () => {
    //   // Arrange
    //   s3Client.send.mockResolvedValue({
    //     $metadata: {},
    //   } as PutObjectCommandOutput);
    //   configService.getOrThrow.mockReturnValue('us-east-1');
    //   delete process.env.AWS_S3_BUCKET_NAME; // Remove the bucket name

    //   // Act & Assert
    //   await expect(service.upload(uploadFileDto)).rejects.toThrow();

    //   // Restore the environment variable for other tests
    //   process.env.AWS_S3_BUCKET_NAME = 'test-bucket';
    // });

    it('should send the correct PutObjectCommand to S3', async () => {
      // Arrange
      s3Client.send.mockResolvedValue({
        $metadata: {},
      } as PutObjectCommandOutput);
      configService.getOrThrow.mockReturnValue('us-east-1');
      process.env.AWS_S3_BUCKET_NAME = 'test-bucket';

      // Act
      await service.upload(uploadFileDto);

      // Assert
      const commandArg = s3Client.send.mock.calls[0][0] as PutObjectCommand;
      expect(commandArg.input.Bucket).toBe('test-bucket');
      expect(commandArg.input.Key).toBe(fileName);
      expect(commandArg.input.Body).toBe(fileContent);
    });
  });
});
