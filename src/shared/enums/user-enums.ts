/**
 * Key used to define UserRoles metadata for endpoints.
 */
export const USER_ROLES_KEY = 'roles';

/**
 * Enum defining all roles in the system.
 */
export enum UserRole {
  ADMIN = 'admin',
  AUDITOR = 'auditor',
  PARTNER = 'partner',
  RECYCLER = 'recycler',
  WASTE_GENERATOR = 'waste-generator',
}

/**
 * Permissions required for each role.
 * Maps roles to a list of permission strings.
 */
export const USER_PERMISSION_SCOPES: Record<UserRole, string[]> = {
  [UserRole.ADMIN]: ['admin:read', 'admin:write', 'admin:delete'],
  [UserRole.AUDITOR]: ['auditor:read'],
  [UserRole.PARTNER]: ['partner:read', 'partner:write'],
  [UserRole.RECYCLER]: ['recycler:read', 'recycler:write'],
  [UserRole.WASTE_GENERATOR]: ['waste-generator:read', 'waste-generator:write'],
};
