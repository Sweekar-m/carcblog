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
 * Every registered user is both a reader and a writer/creator.
 */
export function isWriter(role?: string | null): boolean {
  // All authenticated users have writer/creator permissions
  return true;
}

/**
 * Check if role is admin
 */
export function isAdmin(role?: string | null): boolean {
  return role === UserRole.ADMIN;
}

/**
 * Every registered user has reader capabilities
 */
export function isReader(role?: string | null): boolean {
  return true;
}

