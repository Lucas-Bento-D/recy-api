import {
  Controller,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';

import { AuthorizationGuard } from '../../../modules/authorization/authorization.guard';
import { PermissionsGuard } from '../../../modules/authorization/permission.guard';
import { UploadFileDto } from './dtos/upload-file.dto';
import { UploadPermissions } from './upload.permissions';
import { UploadService } from './upload.service';

@ApiTags('upload')
@Controller({ path: 'upload', version: '1' })
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @UseGuards(PermissionsGuard(UploadPermissions))
  @UseGuards(AuthorizationGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          // new MaxFileSizeValidator({ maxSize: 1000 }),
          // new FileTypeValidator({ fileType: 'image/jpeg' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const options: UploadFileDto = {
      fileName: file.originalname,
      file: file.buffer,
      type: file.mimetype,
    };

    await this.uploadService.upload(options);
  }
}
