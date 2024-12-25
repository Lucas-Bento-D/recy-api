import { z } from 'zod';

export const ValidateUserSchema = z.object({
  email: z
    .string({ message: 'Email must be a string' })
    .email({ message: 'Invalid email format' }),
  name: z.string({ message: 'Name must be a string' }),
  picture: z.string().optional(),
  authId: z.string({ message: 'sub must be a string' }),
  authProvider: z.string({ message: 'authProvider must be a string' }),
});

export type ValidateUserDto = z.infer<typeof ValidateUserSchema>;
