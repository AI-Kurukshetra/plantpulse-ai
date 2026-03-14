import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { UserRole } from '@/types';
import { getSupabaseEnv, hasSupabaseEnv } from '@/lib/env';
import { AUTH_ACCESS_TOKEN_COOKIE } from '@/lib/authCookies';
import { getRoleFromToken } from '@/lib/authToken';

const protectedMatchers = [
  '/dashboard',
  '/plants',
  '/equipment',
  '/analytics',
  '/alerts',
  '/maintenance',
  '/sustainability',
  '/integrations',
  '/rbac',
  '/users',
  '/admin'
];

const roleAccess: Record<string, UserRole[]> = {
  '/admin': ['admin'],
  '/dashboard': ['admin', 'plant_manager', 'technician'],
  '/plants': ['admin', 'plant_manager'],
  '/equipment': ['admin', 'plant_manager', 'technician'],
  '/analytics': ['admin', 'plant_manager'],
  '/alerts': ['admin', 'plant_manager', 'technician'],
  '/maintenance': ['admin', 'plant_manager', 'technician'],
  '/sustainability': ['admin', 'plant_manager'],
  '/integrations': ['admin', 'plant_manager'],
  '/rbac': ['admin'],
  '/users': ['admin']
};

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const requiresAuth = protectedMatchers.some((route) => pathname.startsWith(route));

  if (!requiresAuth) {
    return NextResponse.next();
  }

  if (!hasSupabaseEnv()) {
    const loginUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  const sessionToken = request.cookies.get(AUTH_ACCESS_TOKEN_COOKIE)?.value;

  if (!sessionToken) {
    const loginUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  const { supabaseAnonKey, supabaseUrl } = getSupabaseEnv()!;
  const authResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${sessionToken}`
    }
  });

  if (!authResponse.ok) {
    const loginUrl = new URL('/auth/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  const role = getRoleFromToken(sessionToken);
  const baseRoute = `/${pathname.split('/')[1]}`;
  const allowedRoles = roleAccess[baseRoute] ?? [];

  if (!role || !allowedRoles.includes(role)) {
    return NextResponse.redirect(new URL('/dashboard?denied=1', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/plants/:path*',
    '/equipment/:path*',
    '/analytics/:path*',
    '/alerts/:path*',
    '/maintenance/:path*',
    '/sustainability/:path*',
    '/integrations/:path*',
    '/rbac/:path*',
    '/users/:path*',
    '/admin/:path*'
  ]
};
