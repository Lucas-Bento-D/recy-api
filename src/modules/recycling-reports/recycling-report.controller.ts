import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RecyclingReport } from '@prisma/client';

import {
  CreateRecyclingReportDto,
  CreateRecyclingReportSchema,
  CreateRecyclingReportSwaggerDto,
} from './dtos/create-recycling-report.dto';
import { UpdateRecyclingReportDto } from './dtos/update-recycling-report.dto';
import { RecyclingReportService } from './recycling-report.service';

@ApiTags('recycling-reports')
@Controller({ path: 'recycling-reports', version: '1' })
export class RecyclingReportController {
  constructor(
    private readonly recyclingReportService: RecyclingReportService,
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
    const parsedData: CreateRecyclingReportDto =
      CreateRecyclingReportSchema.parse(createRecyclingReportDto);

    return this.recyclingReportService.createRecyclingReport(parsedData);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all recycling reports' })
  @ApiResponse({
    status: 200,
    description: 'List of recycling reports.',
  })
  async findAllRecyclingReports(): Promise<RecyclingReport[]> {
    return this.recyclingReportService.findAllRecyclingReports();
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
    return this.recyclingReportService.findRecyclingReportById(id);
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
  async updateRecyclingReport(
    @Param('id') id: string,
    @Body() updateRecyclingReportDto: UpdateRecyclingReportDto,
  ): Promise<RecyclingReport> {
    return this.recyclingReportService.updateRecyclingReport(
      id,
      updateRecyclingReportDto,
    );
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
    return this.recyclingReportService.deleteRecyclingReport(id);
  }
}
