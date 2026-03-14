import type { UserRole } from '@/types';

/** Path to redirect after login or signup based on role (admin → /admin, others → /dashboard). */
export function getPostAuthRedirectPath(role: UserRole): string {
  return role === 'admin' ? '/admin' : '/dashboard';
}
