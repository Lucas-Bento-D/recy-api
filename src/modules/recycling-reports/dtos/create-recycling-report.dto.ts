import { z } from 'zod';

import { ResidueType } from './residue-type.enum';

// Define the schema for individual material objects
const MaterialSchema = z.object({
  materialType: z.nativeEnum(ResidueType), // Validate as an enum
  weightKg: z
    .string() // Expect weight as a string
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, // Ensure it's a valid positive number
      'Weight must be a positive number greater than 0',
    )
    .transform((val) => parseFloat(val)), // Convert string to number
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
      .string() // Expect materials as a JSON string
      .refine((val) => {
        try {
          const parsed = JSON.parse(val);
          return Array.isArray(parsed) && parsed.length > 0; // Ensure it's a non-empty array
        } catch {
          return false; // If parsing fails
        }
      }, 'Materials must be a valid JSON array with at least one material')
      .transform((val) => JSON.parse(val)) // Parse the JSON string into an array
      .pipe(z.array(MaterialSchema)), // Validate each material object in the array
    walletAddress: z
      .string()
      .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid EVM wallet address format') // Validate Ethereum wallet address
      .or(z.literal('')) // Allow an empty string
      .optional(),
    evidenceUrl: z
      .string()
      .url('Invalid URL format') // Validate as a URL
      .refine(
        (url) => url.startsWith('https://'), // Ensure URL starts with HTTPS
        'Evidence URL must start with https',
      )
      .optional(),
    evidenceFile: z
      .instanceof(Buffer) // Validate file content as a Buffer
      .refine((buffer) => buffer.length > 0, 'File content cannot be empty')
      .optional(),
  })
  .refine((data) => data.evidenceUrl || data.evidenceFile, {
    message: 'Either evidenceFile or evidenceUrl must be provided.',
    path: ['evidenceFile', 'evidenceUrl'], // Reference both paths for error messages
  });

// Define the TypeScript type based on the schema
export type CreateRecyclingReportDto = z.infer<
  typeof CreateRecyclingReportSchema
>;

// Define the Swagger-compatible DTO for documentation purposes
export class CreateRecyclingReportSwaggerDto {
  submittedBy: string;
  reportDate?: Date;
  phone?: string;
  materials: { materialType: ResidueType; weightKg: number }[];
  walletAddress?: string;
  evidenceUrl?: string;
  evidenceFile?: Buffer;
}
