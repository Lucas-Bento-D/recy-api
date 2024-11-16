import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

import { USER_ROLES_KEY } from '@/shared/enums/user-enums';
/**
 * Role decorator to assign roles to a route or controller.
 */
export const Roles = (...roles: Role[]) => SetMetadata(USER_ROLES_KEY, roles);
