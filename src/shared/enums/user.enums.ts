import { Permission } from './permissions.enums';

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
// Permissions required for each role. Maps roles to a list of permission strings.
export const USER_PERMISSION_SCOPES: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    Permission.READ_USERS,
    Permission.WRITE_USERS,
    Permission.UPDATE_USERS,
    Permission.DELETE_USERS,
    Permission.READ_AUDITS,
    Permission.WRITE_AUDITS,
    Permission.UPDATE_AUDITS,
    Permission.DELETE_AUDITS,
    Permission.READ_REPORTS,
    Permission.WRITE_REPORTS,
    Permission.UPDATE_REPORTS,
    Permission.DELETE_REPORTS,
    Permission.READ_UPLOAD,
    Permission.WRITE_UPLOAD,
    Permission.UPDATE_UPLOAD,
    Permission.DELETE_UPLOAD,
  ],
  [UserRole.AUDITOR]: [
    Permission.READ_AUDITS,
    Permission.WRITE_AUDITS,
    Permission.UPDATE_AUDITS,
    Permission.READ_REPORTS,
    Permission.WRITE_REPORTS,
  ],
  [UserRole.PARTNER]: [
    Permission.READ_AUDITS,
    Permission.WRITE_AUDITS,
    Permission.UPDATE_AUDITS,
    Permission.READ_REPORTS,
    Permission.WRITE_REPORTS,
    Permission.UPDATE_REPORTS,
    Permission.WRITE_UPLOAD,
    Permission.DELETE_REPORTS,
    Permission.DELETE_AUDITS,
    Permission.UPDATE_AUDITS,
    Permission.UPDATE_REPORTS,
  ],

  [UserRole.RECYCLER]: [Permission.READ_REPORTS, Permission.WRITE_REPORTS],
  [UserRole.WASTE_GENERATOR]: [
    Permission.READ_REPORTS,
    Permission.WRITE_REPORTS,
  ],
};
