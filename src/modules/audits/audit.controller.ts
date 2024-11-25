import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Audit } from '@prisma/client';

import { ZodValidationPipe } from '@/shared/utils/zod-validation.pipe';

import { AuthorizationGuard } from '../authorization/authorization.guard';
import { PermissionsGuard } from '../authorization/permission.guard';
import { AuditPermissions } from './audit.permissions';
import { AuditService } from './audit.service';
import { CreateAuditDto, CreateAuditSchema } from './dtos/create-audit.dto';
import { UpdateAuditDto, UpdateAuditSchema } from './dtos/update-audit.dto';

@Controller('audits')
@ApiTags('Audits')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @UseGuards(PermissionsGuard(AuditPermissions))
  @UseGuards(AuthorizationGuard)
  @Post()
  @ApiOperation({
    summary: 'Create audit',
    description: 'Creates a new audit record in the system.',
  })
  @ApiResponse({
    status: 201,
  })
  @UsePipes(new ZodValidationPipe(CreateAuditSchema))
  async create(@Body() createAuditDto: CreateAuditDto): Promise<Audit> {
    return this.auditService.createAudit(createAuditDto);
  }

  @UseGuards(PermissionsGuard(AuditPermissions))
  @UseGuards(AuthorizationGuard)
  @Get()
  @ApiOperation({
    summary: 'Retrieve all audits',
    description: 'Fetches a list of all audits from the system.',
  })
  @ApiResponse({
    status: 200,
  })
  async findAll(): Promise<Audit[]> {
    return this.auditService.findAllAudits();
  }

  @UseGuards(PermissionsGuard(AuditPermissions))
  @UseGuards(AuthorizationGuard)
  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve audit by ID',
    description: 'Fetches details of a specific audit by its unique ID.',
  })
  @ApiResponse({
    status: 200,
  })
  async findOne(@Param('id') id: string): Promise<Audit> {
    return this.auditService.findAuditById(id);
  }

  @UseGuards(PermissionsGuard(AuditPermissions))
  @UseGuards(AuthorizationGuard)
  @Put(':id')
  @ApiOperation({
    summary: 'Update audit',
    description: 'Updates the details of an existing audit by its unique ID.',
  })
  @ApiResponse({
    status: 200,
  })
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateAuditSchema))
    updateAuditDto: UpdateAuditDto,
  ): Promise<Audit> {
    return this.auditService.updateAudit(id, updateAuditDto);
  }

  @UseGuards(PermissionsGuard(AuditPermissions))
  @UseGuards(AuthorizationGuard)
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete audit',
    description: 'Deletes an existing audit by its unique ID.',
  })
  @ApiResponse({
    status: 200,
  })
  async remove(@Param('id') id: string): Promise<Audit> {
    return this.auditService.deleteAudit(id);
  }
}
