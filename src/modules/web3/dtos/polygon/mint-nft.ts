import { z } from 'zod';

export const MintNftSchema = z.object({
  recipient: z.string().min(1, { message: 'recipient cannot be empty' }),
  tokenURI: z.string().min(1, { message: 'tokenURI cannot be empty' }),
});

export type MintNftDto = z.infer<typeof MintNftSchema>;
