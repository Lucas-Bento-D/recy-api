import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

import { ResidueType } from './residue-type.enum';

const MaterialSchema = z.object({
  materialType: z.nativeEnum(ResidueType), // Valida como enum
  weightKg: z
    .number() // Agora aceita o peso como número diretamente
    .positive('Weight must be a positive number greater than 0'), // Valida peso como número positivo
});

// Define the main schema for the recycling report
export const CreateRecyclingReportSchema = z
  .object({
    submittedBy: z.string().min(1, 'Submitter name cannot be empty'), // Required string
    reportDate: z
      .string()
      .optional()
      .refine(
        (val) => !val || !isNaN(new Date(val).getTime()), // Ensure it's a valid date string
        'Report date must be valid',
      )
      .transform((val) => (val ? new Date(val) : undefined)) // Transform to a Date object
      .refine(
        (date) => !date || date <= new Date(), // Validate that the date is not in the future
        'Report date cannot be in the future',
      ),
    phone: z.string().optional(), // Optional phone number
    materials: z
      .array(MaterialSchema) // Valida como um array de objetos diretamente
      .nonempty('Materials array cannot be empty'), // Garante que o array não está vazio
    walletAddress: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid EVM wallet address format') // Validate Ethereum wallet address
      .or(z.literal('')) // Allow an empty string
      .optional(),
    residueEvidence: z
      .string()
      .url('Invalid URL format') // Validate as a URL
      .refine(
        (url) => url.startsWith('https://'), // Ensure URL starts with HTTPS
        'Evidence URL must start with https',
      )
      .optional(),
    residueEvidenceFile: z
      .instanceof(Buffer) // Validate file content as a Buffer
      .refine((buffer) => buffer.length > 0, 'File content cannot be empty')
      .optional(),
  })
  .refine((data) => data.residueEvidence || data.residueEvidenceFile, {
    message: 'Either residueEvidenceFile or residueEvidence must be provided.',
    path: ['residueEvidenceFile', 'residueEvidence'], // Reference both paths for error messages
  });

// Define the TypeScript type based on the schema
export type CreateRecyclingReportDto = z.infer<
  typeof CreateRecyclingReportSchema
>;

// Define the Swagger-compatible DTO for documentation purposes
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
