import { cookies } from 'next/headers';
import type { AuthenticatedUser, UserRole } from '@/types';
import { AUTH_ACCESS_TOKEN_COOKIE } from '@/lib/authCookies';
import { decodeAuthToken, getRoleFromToken } from '@/lib/authToken';

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const accessToken = cookies().get(AUTH_ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return null;
  }

  const payload = decodeAuthToken(accessToken);
  const role = getRoleFromToken(accessToken);

  if (!payload?.sub || !payload.email || !role) {
    return null;
  }

  return {
    email: payload.email,
    fullName: null,
    id: payload.sub,
    plantId: null,
    role
  };
}

export async function getCurrentRole(): Promise<UserRole> {
  const currentUser = await getCurrentUser();
  return currentUser?.role ?? 'technician';
}
