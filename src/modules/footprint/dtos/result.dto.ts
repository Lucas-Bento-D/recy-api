import { z } from 'zod';

export const ResultDtoSchema = z.object({
  walletAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid EVM wallet address format')
    .or(z.literal(''))
    .optional(),
  cRecys: z.number({ message: 'cRecys must be a number' }),
  wasteFootprint: z
    .number({ message: 'wasteFootprint must be a number' })
    .min(1, { message: 'wasteFootprint cannot be empty' }),
});

export type ResultDto = z.infer<typeof ResultDtoSchema>;
