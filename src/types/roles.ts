/**
 * Centralized Role Definitions and Role Management Utilities
 */

export enum UserRole {
  WRITER = 'writer',
  READER = 'reader',
  ADMIN = 'admin',
}

export type UserRoleType = `${UserRole}`;

/**
 * Type guard to check if a string is a valid UserRole
 */
export function isValidUserRole(role: string): role is UserRole {
  return Object.values(UserRole).includes(role as UserRole);
}

/**
 * Check if role has creator/writer permissions
 */
export function isWriter(role?: string | null): boolean {
  return role === UserRole.WRITER || role === UserRole.ADMIN;
}

/**
 * Check if role is admin
 */
export function isAdmin(role?: string | null): boolean {
  return role === UserRole.ADMIN;
}

/**
 * Check if role is reader
 */
export function isReader(role?: string | null): boolean {
  return role === UserRole.READER;
}
