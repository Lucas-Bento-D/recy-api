import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

import { ResidueType } from './residue-type.enum';

const MaterialSchema = z.object({
  materialType: z.nativeEnum(ResidueType),
  weightKg: z
    .number()
    .positive('Weight must be a positive number greater than 0'),
});

export const CreateRecyclingReportSchema = z
  .object({
    submittedBy: z.string().min(1, 'Submitter name cannot be empty'),
    reportDate: z
      .string()
      .optional()
      .refine(
        (val) => !val || !isNaN(new Date(val).getTime()),
        'Report date must be valid',
      )
      .transform((val) => (val ? new Date(val) : undefined))
      .refine(
        (date) => !date || date <= new Date(),
        'Report date cannot be in the future',
      ),
    phone: z.string().optional(),
    materials: z
      .array(MaterialSchema)
      .nonempty('Materials array cannot be empty'),
    walletAddress: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid EVM wallet address format')
      .or(z.literal(''))
      .optional(),
    residueEvidence: z
      .string()
      .url('Invalid URL format')
      .refine(
        (url) => url.startsWith('https://'),
        'Evidence URL must start with https',
      )
      .optional(),
    residueEvidenceFile: z
      .instanceof(Buffer)
      .refine((buffer) => buffer.length > 0, 'File content cannot be empty')
      .optional(),
  })
  .refine((data) => data.residueEvidence || data.residueEvidenceFile, {
    message: 'Either residueEvidenceFile or residueEvidence must be provided.',
    path: ['residueEvidenceFile', 'residueEvidence'],
  });

export type CreateRecyclingReportDto = z.infer<
  typeof CreateRecyclingReportSchema
>;
export class CreateRecyclingReportSwaggerDto {
  @ApiProperty()
  submittedBy: string;

  @ApiProperty({ required: false, type: Date })
  reportDate?: Date;

  @ApiProperty({ required: false })
  phone?: string;

  @ApiProperty({
    type: () => Array,
    description: 'List of materials with their type and weight',
  })
  materials: { materialType: ResidueType; weightKg: number }[];

  @ApiProperty({ required: false, type: String })
  walletAddress?: string;

  @ApiProperty({ required: false, type: String })
  residueEvidence?: string;

  @ApiProperty({ required: false, type: Buffer })
  residueEvidenceFile?: Buffer;
}
