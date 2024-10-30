import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Audit } from '@prisma/client';

import { ZodValidationPipe } from '@/shared/utils/zod-validation.pipe';

import { MintCeloDto, MintCeloSchema } from '../web3/dtos/celo/mint';
import { MintNftDto, MintNftSchema } from '../web3/dtos/polygon/mint-nft';
import { AuditService } from './audit.service';
import { CreateAuditDto, CreateAuditSchema } from './dtos/create-audit.dto';
import { UpdateAuditDto, UpdateAuditSchema } from './dtos/update-audit.dto';

@ApiTags('audits')
@Controller({ path: 'audits', version: '1' })
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Post()
  @ApiOperation({ summary: 'Create an audit' })
  @ApiResponse({
    status: 201,
    description: 'The audit has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @UsePipes(new ZodValidationPipe(CreateAuditSchema))
  async create(@Body() createAuditDto: CreateAuditDto): Promise<Audit> {
    return this.auditService.createAudit(createAuditDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all audits' })
  @ApiResponse({
    status: 200,
    description: 'List of all audits.',
  })
  async findAll(): Promise<Audit[]> {
    return this.auditService.findAllAudits();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a specific audit by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'The ID of the audit' })
  @ApiResponse({
    status: 200,
    description: 'The audit with the specified ID.',
  })
  @ApiResponse({ status: 404, description: 'Audit not found.' })
  async findOne(@Param('id') id: string): Promise<Audit> {
    const audit = await this.auditService.findAuditById(id);
    if (!audit) {
      throw new NotFoundException(`Audit with ID ${id} not found.`);
    }
    return audit;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a specific audit by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'The ID of the audit' })
  @ApiResponse({
    status: 200,
    description: 'The audit has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Audit not found.' })
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateAuditSchema))
    updateAuditDto: UpdateAuditDto,
  ): Promise<Audit> {
    return this.auditService.updateAudit(id, updateAuditDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a specific audit by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'The ID of the audit' }) // Corrected type
  @ApiResponse({
    status: 200,
    description: 'The audit has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Audit not found.' })
  async remove(@Param('id') id: string): Promise<Audit> {
    return this.auditService.deleteAudit(id);
  }

  // TODO: its only for test purpoises
  @Post('web3')
  // async mintPolygon(
  //   @Body(new ZodValidationPipe(MintNftSchema))
  //   mintNftDto: MintNftDto,
  // ) {
  //   return this.auditService.mintNFTPolygon(mintNftDto);
  // }
  async owner() {
    // return this.auditService.owner();

    console.log('call');
  }
}
