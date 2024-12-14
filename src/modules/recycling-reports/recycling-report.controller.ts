import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
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
import { RecyclingReport } from '@prisma/client';

import {
  PaginatedResult,
  PaginationParams,
} from '@/shared/utils/pagination.util';

import { AuthorizationGuard } from '../authorization/authorization.guard';
import { PermissionsGuard } from '../authorization/permission.guard';
import {
  CreateRecyclingReportDto,
  CreateRecyclingReportSchema,
  CreateRecyclingReportSwaggerDto,
} from './dtos/create-recycling-report.dto';
import { UpdateRecyclingReportDto } from './dtos/update-recycling-report.dto';
import { RecyclingReportPermissions } from './recycling-report.permissions';
import { RecyclingReportService } from './recycling-report.service';

@ApiTags('recycling-reports')
@Controller({ path: 'recycling-reports', version: '1' })
export class RecyclingReportController {
  constructor(
    private readonly recyclingReportService: RecyclingReportService,
  ) { }

  @UseGuards(PermissionsGuard(RecyclingReportPermissions))
  @UseGuards(AuthorizationGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new recycling report' })
  @ApiResponse({
    status: 201,
    description: 'The recycling report has been successfully created.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation errors or other issues.',
  })
  @UseInterceptors(FileInterceptor('residueEvidenceFile'))
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiBody({ type: CreateRecyclingReportSwaggerDto })
  async createRecyclingReport(
    @Body() createRecyclingReportDto: CreateRecyclingReportDto,
    @UploadedFile() residueEvidenceFile: Express.Multer.File,
  ): Promise<RecyclingReport> {
    const mergedData = {
      ...createRecyclingReportDto,
      residueEvidenceFile: residueEvidenceFile?.buffer,
    };

    const parsedData: CreateRecyclingReportDto =
      CreateRecyclingReportSchema.parse(mergedData);

    return this.recyclingReportService.createRecyclingReport(parsedData);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all recycling reports' })
  @ApiResponse({
    status: 200,
    description: 'List of recycling reports.',
  })
  async findAllRecyclingReports(
    @Query() params: PaginationParams,
  ): Promise<PaginatedResult<RecyclingReport>> {
    const { page, limit } = params;
    return this.recyclingReportService.findAllRecyclingReports({ page, limit });
  }

  @UseGuards(PermissionsGuard(RecyclingReportPermissions))
  @UseGuards(AuthorizationGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a recycling report by ID' })
  @ApiResponse({
    status: 200,
    description: 'The recycling report with the specified ID.',
  })
  @ApiResponse({
    status: 404,
    description: 'The recycling report with the specified ID was not found.',
  })
  async findRecyclingReportById(
    @Param('id') id: string,
  ): Promise<RecyclingReport> {
    return this.recyclingReportService.findRecyclingReportById(id);
  }

  @UseGuards(PermissionsGuard(RecyclingReportPermissions))
  @UseGuards(AuthorizationGuard)
  @Put(':id')
  @ApiOperation({ summary: 'Update a recycling report by ID' })
  @ApiResponse({
    status: 200,
    description: 'The recycling report has been successfully updated.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request. Validation errors or other issues.',
  })
  @ApiResponse({
    status: 404,
    description: 'The recycling report with the specified ID was not found.',
  })
  async updateRecyclingReport(
    @Param('id') id: string,
    @Body() updateRecyclingReportDto: UpdateRecyclingReportDto,
  ): Promise<RecyclingReport> {
    return this.recyclingReportService.updateRecyclingReport(
      id,
      updateRecyclingReportDto,
    );
  }

  @UseGuards(PermissionsGuard(RecyclingReportPermissions))
  @UseGuards(AuthorizationGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a recycling report by ID' })
  @ApiResponse({
    status: 200,
    description: 'The recycling report has been successfully deleted.',
  })
  @ApiResponse({
    status: 404,
    description: 'The recycling report with the specified ID was not found.',
  })
  async deleteRecyclingReport(
    @Param('id') id: string,
  ): Promise<RecyclingReport> {
    return this.recyclingReportService.deleteRecyclingReport(id);
  }
}
