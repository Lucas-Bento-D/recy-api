import { z } from 'zod';

export const CreateUserSchema = z.object({
  email: z
    .string({ message: 'email must be a string' })
    .email({ message: 'Email is required' }),
  name: z.string({ message: 'name must be a string' }),
  phone: z.string({ message: 'phone must be a string' }).optional(),
  walletAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid EVM wallet address format')
    .or(z.literal(''))
    .optional(),
  roleIds: z.array(z.string(), {
    message: 'Role IDs must be an array of strings',
  }),
  authId: z.string({ message: 'authId must be a string' }),
  authProvider: z.string({ message: 'authProvider must be a string' }),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
