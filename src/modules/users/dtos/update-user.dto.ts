import { ApiPropertyOptional } from '@nestjs/swagger';
import { z } from 'zod';

import { CreateUserSchema } from './create-user.dto';

export const UpdateUserSchema = CreateUserSchema.partial();

export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;

export class UpdateUserSwaggerDto {
  @ApiPropertyOptional({
    description: "User's email address",
    example: 'user@example.com',
  })
  email?: string;

  @ApiPropertyOptional({
    description: "User's name",
    example: 'John Doe',
  })
  name?: string;

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

  @ApiPropertyOptional({
    description: 'Array of role IDs assigned to the user',
    example: ['2'],
    type: [String],
  })
  roleIds?: string[];
}
