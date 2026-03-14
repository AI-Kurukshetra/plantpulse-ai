import type { Route } from 'next';
import type { UserRole } from '@/types';

/** Path to redirect after login or signup based on role (admin → /admin, others → /dashboard). */
export function getPostAuthRedirectPath(role: UserRole): Route {
  return (role === 'admin' ? '/admin' : '/dashboard') as Route;
}
