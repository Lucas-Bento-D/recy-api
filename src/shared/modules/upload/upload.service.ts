import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { extname } from 'path';

import { UploadFileDto } from './dtos/upload-file.dto';

@Injectable()
export class UploadService {
  private s3Client: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.getOrThrow('AWS_S3_REGION'),
    });
  }

  async upload({
    fileName,
    file,
    type,
    bucketName,
    path,
  }: UploadFileDto): Promise<string> {
    const folder = path ? `${path}/` : '';
    const newFileName = `${folder}${Date.now()}-${randomUUID()}${extname(
      fileName,
    )}`;

    const resolvedBucketName =
      bucketName || this.configService.getOrThrow('AWS_S3_BUCKET_NAME');

    const command = new PutObjectCommand({
      Bucket: resolvedBucketName,
      Key: newFileName,
      Body: file,
      ContentType: type,
    });

    await this.s3Client.send(command);

    const fileUrl = `https://${resolvedBucketName}.s3.${this.configService.getOrThrow(
      'AWS_S3_REGION',
    )}.amazonaws.com/${newFileName}`;

    return fileUrl;
  }
}
