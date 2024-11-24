import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { UploadFileDto } from './dtos/upload-file.dto';

@Injectable()
export class UploadService {
  private s3Client: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.getOrThrow('AWS_S3_REGION'),
    });
  }

  async upload({ fileName, file }: UploadFileDto): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileName,
      Body: file,
    });

    await this.s3Client.send(command);

    const fileUrl = `https://${
      process.env.AWS_S3_BUCKET_NAME
    }.s3.${this.configService.getOrThrow(
      'AWS_S3_REGION',
    )}.amazonaws.com/${fileName}`;

    return fileUrl;
  }
}
