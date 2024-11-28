import { z } from 'zod';

import { ResidueType } from './residue-type.enum';

const MaterialSchema = z.object({
  materialType: z.nativeEnum(ResidueType),
  weightKg: z.number().nonnegative().min(0.01, 'Weight must be greater than 0'),
});

export const CreateRecyclingReportSchema = z
  .object({
    submittedBy: z.string().min(1, 'Submitter name cannot be empty'),
    reportDate: z
      .preprocess((arg) => {
        if (typeof arg === 'string' || arg instanceof Date)
          return new Date(arg);
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
      )
      .optional(),
    evidenceFile: z
      .instanceof(Buffer)
      .refine((buffer) => buffer.length > 0, 'File content cannot be empty') // assuming the file will be uploaded as a Buffer
      .optional(),
  })
  .refine((data) => data.evidenceUrl || data.evidenceFile, {
    message: 'Either evidenceFile or evidenceUrl must be provided.',
    path: ['evidenceFile', 'evidenceUrl'],
  });

export type CreateRecyclingReportDto = z.infer<
  typeof CreateRecyclingReportSchema
>;

// Manually make all fields optional for the update scenario
export const UpdateRecyclingReportSchema = z
  .object({
    submittedBy: z.string().min(1, 'Submitter name cannot be empty').optional(),
    reportDate: z
      .preprocess((arg) => {
        if (typeof arg === 'string' || arg instanceof Date)
          return new Date(arg);
      }, z.date().max(new Date(), 'Report date cannot be in the future'))
      .optional(),
    phone: z.string().optional(),
    materials: z
      .array(MaterialSchema)
      .min(1, 'At least one material must be submitted')
      .optional(),
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
      .refine((buffer) => buffer.length > 0, 'File content cannot be empty') // assuming the file will be uploaded as a Buffer
      .optional(),
  })
  .refine((data) => data.residueEvidence || data.residueEvidenceFile, {
    message: 'Either residueEvidenceFile or evidenceUrl must be provided.',
    path: ['residueEvidenceFile', 'residueEvidence'],
  });

export type UpdateRecyclingReportDto = z.infer<
  typeof UpdateRecyclingReportSchema
>;

export class CreateRecyclingReportSwaggerDto {
  submittedBy: string;
  reportDate?: Date;
  phone?: string;
  materials: { materialType: ResidueType; weightKg: number }[];
  walletAddress?: string;
  residueEvidence?: string;
  residueEvidenceFile?: Buffer;
}
