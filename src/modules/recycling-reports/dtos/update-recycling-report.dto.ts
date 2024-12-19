import { ApiProperty, PartialType } from '@nestjs/swagger';

import { CreateRecyclingReportSwaggerDto } from './create-recycling-report.dto';

// Extends the Create DTO to allow partial updates for editing purposes
export class UpdateRecyclingReportDto extends PartialType(
  CreateRecyclingReportSwaggerDto,
) {
  @ApiProperty({ required: true, type: String })
  id: string; // Unique identifier required for editing
}
