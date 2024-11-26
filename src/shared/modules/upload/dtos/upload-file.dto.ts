export class UploadFileDto {
  fileName: string;
  file: Buffer;
  type: string;
  bucketName?: string;
  path?: string;
}
