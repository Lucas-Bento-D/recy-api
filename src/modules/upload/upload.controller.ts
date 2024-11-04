import {
  Body,
  Controller,
  FileTypeValidator,
  Inject,
  Logger,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { AuthorizationGuard } from '../authorization/authorization.guard';
import { UploadFileDto } from './dtos/upload-file.dto';
import { UploadService } from './upload.service';

@ApiTags('upload')
@Controller({ path: 'upload', version: '1' })
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
  ) { }

  // @UseGuards(AuthorizationGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File upload',
    required: true,
    schema: {
      type: 'object',
      properties: {
        fileName: {
          type: 'string',
          description: 'Optional file name',
          example: 'custom-name.jpg',
        },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File has been uploaded successfully.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 404, description: 'Bucket not found.' })
  @ApiResponse({ status: 503, description: 'Service unavailable.' })
  @ApiResponse({ status: 504, description: 'Gateway timeout.' })
  @ApiResponse({
    status: 500,
    description: 'An unexpected error occurred during file upload.',
  })
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [],
      }),
    )
    file: Express.Multer.File,
    @Body() body: { fileName?: string },
  ): Promise<void> {
    const fileName = body.fileName || file.originalname;
    this.logger.log(
      `Starting file upload: ${fileName}`,
      'UploadController - uploadFile',
    );

    const options: UploadFileDto = {
      fileName: fileName,
      file: file.buffer,
    };

    await this.uploadService.upload(options);

    this.logger.log(
      `File ${fileName} uploaded successfully`,
      'UploadController - uploadFile',
    );
  }
}
