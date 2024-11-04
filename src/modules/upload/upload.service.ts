import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Inject, Injectable, Logger, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import process from 'process';

import { UploadFileDto } from './dtos/upload-file.dto';

@Injectable()
export class UploadService {
  private s3Client: S3Client;

  constructor(
    private readonly configService: ConfigService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {
    this.s3Client = new S3Client({
      region: this.configService.getOrThrow('AWS_S3_REGION'),
    });
  }

  async upload({ fileName, file }: UploadFileDto): Promise<void> {
    this.logger.log(`Starting upload for file: ${fileName}`, 'UploadService');

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: fileName,
        Body: file,
      }),
    );

    this.logger.log(`File ${fileName} uploaded successfully`, 'UploadService');
  }
}
