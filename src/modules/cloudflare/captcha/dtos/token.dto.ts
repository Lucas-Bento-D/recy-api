import { z } from 'zod';

export const TokenSchema = z.object({
  token: z.string({ message: 'token must be a string' }),
});
export type TokenSchemaDto = z.infer<typeof TokenSchema>;
