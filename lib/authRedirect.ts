import type { Route } from 'next';
import type { UserRole } from '@/types';

/** Path to redirect after login or signup. */
export function getPostAuthRedirectPath(_role: UserRole): Route {
  return '/dashboard';
}
