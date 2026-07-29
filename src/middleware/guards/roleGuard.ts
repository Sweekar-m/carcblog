import { UserRole, isWriter } from '@/types/roles';

const WRITER_ONLY_ROUTES = [
  '/dashboard/articles',
  '/dashboard/analytics',
  '/dashboard/drafts',
  '/dashboard/published',
];

/**
 * Role Guard — Enforces writer-only route access policy
 */
export function isWriterOnlyRoute(pathname: string): boolean {
  return WRITER_ONLY_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );
}

export function validateRoleAccess(pathname: string, userRole?: string | null): boolean {
  if (isWriterOnlyRoute(pathname)) {
    return isWriter(userRole);
  }
  return true;
}
