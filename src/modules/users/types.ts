import { User } from '@prisma/client';

export interface ValidateUserResponse {
  userExists: boolean;
  user: User;
}
