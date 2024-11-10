import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Logger,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RecyclingReport } from '@prisma/client';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

import { AuthorizationGuard } from '../authorization/authorization.guard';
import {
  CreateRecyclingReportDto,
  CreateRecyclingReportSchema,
  CreateRecyclingReportSwaggerDto,
} from './dtos/create-recycling-report.dto';
import {
  UpdateRecyclingReportDto,
  UpdateRecyclingReportSwaggerDto,
} from './dtos/update-recycling-report.dto';
import { RecyclingReportService } from './recycling-report.service';

@ApiTags('recycling-reports')
// @UseGuards(AuthorizationGuard)
@Controller({ path: 'recycling-reports', version: '1' })
export class RecyclingReportController {
  constructor(
    private readonly recyclingReportService: RecyclingReportService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
  ) {}

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
  @ApiBody({ type: CreateRecyclingReportSwaggerDto })
  async createRecyclingReport(
    @Body() createRecyclingReportDto: CreateRecyclingReportDto,
  ): Promise<RecyclingReport> {
    this.logger.log(
      'Creating a new recycling report',
      'RecyclingReportController - createRecyclingReport',
    );

    const parsedData: CreateRecyclingReportDto =
      CreateRecyclingReportSchema.parse(createRecyclingReportDto);
    const report = await this.recyclingReportService.createRecyclingReport(
      parsedData,
    );

    this.logger.log(
      `Recycling report created with ID: ${report.id}`,
      'RecyclingReportController - createRecyclingReport',
    );
    return report;
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all recycling reports' })
  @ApiResponse({
    status: 200,
    description: 'List of recycling reports.',
  })
  async findAllRecyclingReports(): Promise<RecyclingReport[]> {
    this.logger.log(
      'Retrieving all recycling reports',
      'RecyclingReportController - findAllRecyclingReports',
    );

    const reports = await this.recyclingReportService.findAllRecyclingReports();

    this.logger.log(
      `Successfully retrieved ${reports.length} recycling reports`,
      'RecyclingReportController - findAllRecyclingReports',
    );
    return reports;
  }

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
    this.logger.log(
      `Retrieving recycling report with ID: ${id}`,
      'RecyclingReportController - findRecyclingReportById',
    );

    const report = await this.recyclingReportService.findRecyclingReportById(
      id,
    );

    this.logger.log(
      `Successfully retrieved recycling report with ID: ${id}`,
      'RecyclingReportController - findRecyclingReportById',
    );
    return report;
  }

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
  @ApiBody({ type: UpdateRecyclingReportSwaggerDto })
  async updateRecyclingReport(
    @Param('id') id: string,
    @Body() updateRecyclingReportDto: UpdateRecyclingReportDto,
  ): Promise<RecyclingReport> {
    this.logger.log(
      `Updating recycling report with ID: ${id}`,
      'RecyclingReportController - updateRecyclingReport',
    );

    const report = await this.recyclingReportService.updateRecyclingReport(
      id,
      updateRecyclingReportDto,
    );

    this.logger.log(
      `Recycling report with ID: ${id} successfully updated`,
      'RecyclingReportController - updateRecyclingReport',
    );
    return report;
  }

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
    this.logger.log(
      `Deleting recycling report with ID: ${id}`,
      'RecyclingReportController - deleteRecyclingReport',
    );

    const report = await this.recyclingReportService.deleteRecyclingReport(id);

    this.logger.log(
      `Recycling report with ID: ${id} successfully deleted`,
      'RecyclingReportController - deleteRecyclingReport',
    );
    return report;
  }
}
