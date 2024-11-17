import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;

export class CreateUserSwaggerDto {
  @ApiProperty({
    description: "User's email address",
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: "User's name",
    example: 'John Doe',
  })
  name: string;

  @ApiPropertyOptional({
    description: "User's phone number",
    example: '+1-555-1234',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: "User's wallet address (EVM format)",
    example: '0x1234567890abcdef1234567890abcdef12345678',
  })
  walletAddress?: string;

  @ApiProperty({
    description: 'Array of role IDs assigned to the user',
    example: ['2', '3'],
    type: [String],
  })
  roleIds: string[];
}
