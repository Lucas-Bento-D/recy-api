import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { z } from 'zod';

import { ResidueType } from './residue-type.enum';

const MaterialSchema = z.object({
  materialType: z.nativeEnum(ResidueType),
  weightKg: z.number().nonnegative().min(0.01, 'Weight must be greater than 0'),
});

export const CreateRecyclingReportSchema = z.object({
  submittedBy: z
    .string()
    .min(1, 'ID of the user submitting needs to be defined'),
  reportDate: z
    .preprocess((arg) => {
      if (typeof arg === 'string' || arg instanceof Date) return new Date(arg);
    }, z.date().max(new Date(), 'Report date cannot be in the future'))
    .optional(),
  phone: z.string().optional(),
  materials: z
    .array(MaterialSchema)
    .min(1, 'At least one material must be submitted'),
  walletAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid EVM wallet address format')
    .or(z.literal(''))
    .optional(),
  evidenceUrl: z
    .string()
    .url('Invalid URL format')
    .refine(
      (url) => url.startsWith('https://'),
      'Evidence URL must start with https',
    ),
});

export type CreateRecyclingReportDto = z.infer<
  typeof CreateRecyclingReportSchema
>;

export class CreateRecyclingReportSwaggerDto {
  @ApiProperty({
    description: 'ID of the user submitting the report',
    example: '1',
  })
  submittedBy: string;

  @ApiProperty({
    description: 'Date when the report was submitted',
    example: '2024-01-01T00:00:00.000Z',
  })
  reportDate: Date;

  @ApiProperty({
    description: 'Recycled materials with type and weight in kilograms',
    example: [
      { materialType: ResidueType.PLASTIC, weightKg: 12.5 },
      { materialType: ResidueType.METAL, weightKg: 7.3 },
    ],
  })
  materials: { materialType: ResidueType; weightKg: number }[];

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

  @ApiProperty({
    description: 'URL for report evidence',
    example: 'https://example.com/evidence.jpg',
  })
  evidenceUrl: string;
}
