import { NextResponse } from 'next/server';
import { AUTH_ACCESS_TOKEN_COOKIE, AUTH_REFRESH_TOKEN_COOKIE } from '@/lib/authCookies';

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL('/', request.url));
  const secure = process.env.NODE_ENV === 'production';

  response.cookies.set(AUTH_ACCESS_TOKEN_COOKIE, '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
    sameSite: 'lax',
    secure
  });

  response.cookies.set(AUTH_REFRESH_TOKEN_COOKIE, '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
    sameSite: 'lax',
    secure
  });

  return response;
}
