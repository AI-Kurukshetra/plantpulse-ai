import type { UserRole } from '@/types';

interface JwtMetadata {
  role?: string;
}

interface JwtPayload {
  app_metadata?: JwtMetadata;
  user_metadata?: JwtMetadata;
  email?: string;
  exp?: number;
  sub?: string;
}

const validRoles: UserRole[] = ['admin', 'plant_manager', 'technician'];

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4 ? '='.repeat(4 - (normalized.length % 4)) : '';
  return atob(`${normalized}${padding}`);
}

export function decodeAuthToken(token: string): JwtPayload | null {
  const [, payload] = token.split('.');

  if (!payload) {
    return null;
  }

  try {
    return JSON.parse(decodeBase64Url(payload)) as JwtPayload;
  } catch {
    return null;
  }
}

export function getRoleFromToken(token: string): UserRole | null {
  const payload = decodeAuthToken(token);
  const role = payload?.app_metadata?.role ?? payload?.user_metadata?.role;

  return role && validRoles.includes(role as UserRole) ? (role as UserRole) : null;
}

export function getExpiryFromToken(token: string) {
  const payload = decodeAuthToken(token);
  return payload?.exp ?? null;
}
