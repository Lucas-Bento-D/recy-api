import { z } from 'zod';

export const MintCeloSchema = z.object({
  to: z.string().min(1, { message: 'to cannot be empty' }),
  amount: z.number().min(1, { message: 'amount cannot be empty' }),
});

export type MintCeloDto = z.infer<typeof MintCeloSchema>;
