import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { UserRole } from '@/types';
import { getSupabaseEnv, hasSupabaseEnv } from '@/lib/env';
import { AUTH_ACCESS_TOKEN_COOKIE } from '@/lib/authCookies';
import { getRoleFromToken } from '@/lib/authToken';

const protectedMatchers = [
  '/admin',
  '/alert-management',
  '/dashboard',
  '/alerts',
  '/analytics',
  '/benchmark-comparison',
  '/compliance',
  '/cost-optimization',
  '/data-exchange',
  '/equipment',
  '/fleet',
  '/historical-analysis',
  '/integrations',
  '/maintenance',
  '/mobile-operations',
  '/rbac',
  '/report-builder',
  '/resource-utilization',
  '/sustainability',
  '/users',
  '/waste-analytics',
  '/water-optimization'
];

const roleAccess: Record<string, UserRole[]> = {
  '/admin': ['admin'],
  '/alert-management': ['admin', 'plant_manager', 'technician'],
  '/alerts': ['admin', 'plant_manager', 'technician'],
  '/analytics': ['admin', 'plant_manager'],
  '/benchmark-comparison': ['admin', 'plant_manager'],
  '/compliance': ['admin', 'plant_manager'],
  '/cost-optimization': ['admin', 'plant_manager'],
  '/data-exchange': ['admin', 'plant_manager'],
  '/dashboard': ['admin', 'plant_manager', 'technician'],
  '/equipment': ['admin', 'plant_manager', 'technician'],
  '/fleet': ['admin', 'plant_manager'],
  '/historical-analysis': ['admin', 'plant_manager'],
  '/integrations': ['admin', 'plant_manager'],
  '/maintenance': ['admin', 'plant_manager', 'technician'],
  '/mobile-operations': ['admin', 'plant_manager', 'technician'],
  '/rbac': ['admin'],
  '/report-builder': ['admin', 'plant_manager'],
  '/resource-utilization': ['admin', 'plant_manager'],
  '/sustainability': ['admin', 'plant_manager'],
  '/users': ['admin'],
  '/waste-analytics': ['admin', 'plant_manager'],
  '/water-optimization': ['admin', 'plant_manager']
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
    '/admin/:path*',
    '/alert-management/:path*',
    '/alerts/:path*',
    '/analytics/:path*',
    '/benchmark-comparison/:path*',
    '/compliance/:path*',
    '/cost-optimization/:path*',
    '/dashboard/:path*',
    '/data-exchange/:path*',
    '/equipment/:path*',
    '/fleet/:path*',
    '/historical-analysis/:path*',
    '/integrations/:path*',
    '/maintenance/:path*',
    '/mobile-operations/:path*',
    '/rbac/:path*',
    '/report-builder/:path*',
    '/resource-utilization/:path*',
    '/sustainability/:path*',
    '/users/:path*',
    '/waste-analytics/:path*',
    '/water-optimization/:path*'
  ]
};
