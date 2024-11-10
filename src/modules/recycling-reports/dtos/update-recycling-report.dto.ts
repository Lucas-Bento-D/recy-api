import { ApiPropertyOptional } from '@nestjs/swagger';
import { z } from 'zod';

import { CreateRecyclingReportSchema } from './create-recycling-report.dto';
import { ResidueType } from './residue-type.enum';

export const UpdateRecyclingReportSchema =
  CreateRecyclingReportSchema.partial();

export type UpdateRecyclingReportDto = z.infer<
  typeof UpdateRecyclingReportSchema
>;

export class UpdateRecyclingReportSwaggerDto {
  @ApiPropertyOptional({
    description: 'ID of the user submitting the report',
    example: '1',
  })
  submittedBy?: string;

  @ApiPropertyOptional({
    description: 'Date when the report was submitted',
    example: '2024-01-01T00:00:00.000Z',
  })
  reportDate?: Date;

  @ApiPropertyOptional({
    description: 'Recycled materials with type and weight in kilograms',
    example: [
      { materialType: ResidueType.PLASTIC, weightKg: 12.5 },
      { materialType: ResidueType.METAL, weightKg: 7.3 },
    ],
  })
  materials?: { materialType: ResidueType; weightKg: number }[];

  @ApiPropertyOptional({
    description: "User's phone number",
    example: '+55 11 912345678',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Wallet address for recycling credits',
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  walletAddress?: string;

  @ApiPropertyOptional({
    description: 'URL for report evidence',
    example: 'https://example.com/evidence.jpg',
  })
  evidenceUrl?: string;
}
