// Permission Action Enum
export enum PermissionAction {
  READ = 'read',
  WRITE = 'write',
  UPDATE = 'update',
  DELETE = 'delete',
}

// Permission Resources Enum
export enum PermissionResource {
  USERS = 'users',
  AUDITS = 'audits',
  REPORTS = 'reports',
  UPLOAD = 'upload',
}

// Full Permission Enum: Combining Action and Resource
export enum Permission {
  READ_USERS = `${PermissionAction.READ}:${PermissionResource.USERS}`,
  WRITE_USERS = `${PermissionAction.WRITE}:${PermissionResource.USERS}`,
  UPDATE_USERS = `${PermissionAction.UPDATE}:${PermissionResource.USERS}`,
  DELETE_USERS = `${PermissionAction.DELETE}:${PermissionResource.USERS}`,

  READ_AUDITS = `${PermissionAction.READ}:${PermissionResource.AUDITS}`,
  WRITE_AUDITS = `${PermissionAction.WRITE}:${PermissionResource.AUDITS}`,
  UPDATE_AUDITS = `${PermissionAction.UPDATE}:${PermissionResource.AUDITS}`,
  DELETE_AUDITS = `${PermissionAction.DELETE}:${PermissionResource.AUDITS}`,

  READ_REPORTS = `${PermissionAction.READ}:${PermissionResource.REPORTS}`,
  WRITE_REPORTS = `${PermissionAction.WRITE}:${PermissionResource.REPORTS}`,
  UPDATE_REPORTS = `${PermissionAction.UPDATE}:${PermissionResource.REPORTS}`,
  DELETE_REPORTS = `${PermissionAction.DELETE}:${PermissionResource.REPORTS}`,

  READ_UPLOAD = `${PermissionAction.READ}:${PermissionResource.UPLOAD}`,
  WRITE_UPLOAD = `${PermissionAction.WRITE}:${PermissionResource.UPLOAD}`,
  UPDATE_UPLOAD = `${PermissionAction.UPDATE}:${PermissionResource.UPLOAD}`,
  DELETE_UPLOAD = `${PermissionAction.DELETE}:${PermissionResource.UPLOAD}`,
}
