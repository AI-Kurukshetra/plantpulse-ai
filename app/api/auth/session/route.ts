import { NextResponse } from 'next/server';
import { AUTH_ACCESS_TOKEN_COOKIE, AUTH_REFRESH_TOKEN_COOKIE } from '@/lib/authCookies';
import { getExpiryFromToken } from '@/lib/authToken';

function createCookieResponse() {
  return NextResponse.json({ ok: true });
}

export async function POST(request: Request) {
  const { accessToken, refreshToken } = (await request.json()) as {
    accessToken?: string;
    expiresAt?: number | null;
    refreshToken?: string;
  };

  if (!accessToken || !refreshToken) {
    return NextResponse.json({ error: 'Missing session tokens.' }, { status: 400 });
  }

  const response = createCookieResponse();
  const expiresAt = getExpiryFromToken(accessToken);
  const maxAge = expiresAt ? Math.max(expiresAt - Math.floor(Date.now() / 1000), 0) : 60 * 60;
  const secure = process.env.NODE_ENV === 'production';

  response.cookies.set(AUTH_ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    maxAge,
    path: '/',
    sameSite: 'lax',
    secure
  });

  response.cookies.set(AUTH_REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
    sameSite: 'lax',
    secure
  });

  return response;
}

export async function DELETE() {
  const response = createCookieResponse();

  response.cookies.set(AUTH_ACCESS_TOKEN_COOKIE, '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });

  response.cookies.set(AUTH_REFRESH_TOKEN_COOKIE, '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });

  return response;
}
