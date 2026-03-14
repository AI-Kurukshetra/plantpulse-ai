import type { Session, User } from '@supabase/supabase-js';
import type { AuthenticatedUser, UserRole } from '@/types';
import { isDemoMode } from '@/lib/env';
import { supabase } from '@/lib/supabaseClient';

export class SignupRateLimitError extends Error {
  constructor(message = 'Signup is temporarily rate limited. Retry in a few seconds or sign in if your account already exists.') {
    super(message);
    this.name = 'SignupRateLimitError';
  }
}

export interface SignupResult {
  requiresEmailVerification: boolean;
  session: Session | null;
  usedDemoBypass: boolean;
  user: User | null;
}

async function syncSession(session: Session | null) {
  const response = await fetch('/api/auth/session', {
    method: session ? 'POST' : 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: session
      ? JSON.stringify({
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          expiresAt: session.expires_at ?? null
        })
      : undefined
  });

  if (!response.ok) {
    throw new Error('Unable to synchronize the authenticated session.');
  }
}

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  return supabase;
}

function readRole(user: User | null): UserRole | null {
  const role = user?.app_metadata?.role ?? user?.user_metadata?.role;
  return role === 'admin' || role === 'plant_manager' || role === 'technician' ? role : null;
}

function isSignupRateLimitError(error: { message?: string } | null) {
  const message = error?.message?.toLowerCase() ?? '';
  return message.includes('rate limit') || message.includes('security purposes') || message.includes('too many requests');
}

function isExistingUserError(error: { message?: string } | null) {
  const message = error?.message?.toLowerCase() ?? '';
  return message.includes('already registered') || message.includes('already exists') || message.includes('already been registered');
}

async function runDemoSignupBypass(
  email: string,
  password: string,
  role: UserRole,
  options?: {
    fullName?: string;
  }
) {
  const response = await fetch('/api/auth/demo-signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      fullName: options?.fullName ?? '',
      password,
      role
    })
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? 'Unable to provision the demo account.');
  }
}

async function signInAfterBypass(
  email: string,
  password: string,
  role: UserRole,
  options?: {
    fullName?: string;
  }
) {
  // Demo mode skips confirmation/rate-limit blockers by ensuring a confirmed server-side user first.
  await runDemoSignupBypass(email, password, role, options);
  const data = await signIn(email, password);

  return {
    requiresEmailVerification: false,
    session: data.session,
    usedDemoBypass: true,
    user: data.user
  } satisfies SignupResult;
}

export async function signUp(
  email: string,
  password: string,
  role: UserRole,
  options?: {
    fullName?: string;
  }
) {
  if (role === 'admin') {
    throw new Error('Admin accounts are provisioned by the seed script and cannot sign up from the UI.');
  }

  const client = requireSupabase();
  const demoMode = isDemoMode();
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
        full_name: options?.fullName ?? null
      }
    }
  });

  if (error) {
    if (demoMode && isExistingUserError(error)) {
      try {
        const signedIn = await signIn(email, password);
        return {
          requiresEmailVerification: false,
          session: signedIn.session,
          usedDemoBypass: true,
          user: signedIn.user
        } satisfies SignupResult;
      } catch {
        throw new Error('Account exists or verification skipped. Signing you in failed because the password was rejected.');
      }
    }

    if (demoMode && isSignupRateLimitError(error)) {
      return signInAfterBypass(email, password, role, options);
    }

    if (isSignupRateLimitError(error)) {
      throw new SignupRateLimitError();
    }
    throw error;
  }

  if (data.session) {
    await syncSession(data.session);
    return {
      requiresEmailVerification: false,
      session: data.session,
      usedDemoBypass: false,
      user: data.user
    } satisfies SignupResult;
  }

  if (demoMode) {
    return signInAfterBypass(email, password, role, options);
  }

  return {
    requiresEmailVerification: true,
    session: null,
    usedDemoBypass: false,
    user: data.user
  } satisfies SignupResult;
}

export async function signIn(email: string, password: string) {
  const client = requireSupabase();
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    throw error;
  }

  if (!data.session) {
    throw new Error('Login succeeded but no active session was returned by Supabase Auth.');
  }

  await syncSession(data.session);
  return data;
}

export async function signOut() {
  const client = requireSupabase();
  let sessionError: Error | null = null;

  try {
    const { error } = await client.auth.signOut({ scope: 'local' });
    if (error && !error.message.toLowerCase().includes('session')) {
      sessionError = error;
    }
  } catch (error) {
    sessionError = error instanceof Error ? error : new Error('Unable to sign out of the local session.');
  }

  try {
    // Cookie cleanup still runs even when the local Supabase session is already stale.
    await syncSession(null);
  } catch (error) {
    if (!sessionError) {
      sessionError =
        error instanceof Error ? error : new Error('Unable to clear the authenticated session cookies.');
    }
  }

  if (sessionError) {
    throw sessionError;
  }
}

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const client = requireSupabase();
  const {
    data: { user },
    error
  } = await client.auth.getUser();

  if (error || !user) {
    return null;
  }

  const { data: profile } = await client
    .from('profiles')
    .select('id, email, full_name, plant_id, role:roles(name)')
    .eq('id', user.id)
    .single();

  const profileRole = profile?.role && typeof profile.role === 'object' && 'name' in profile.role ? profile.role.name : null;

  return {
    email: profile?.email ?? user.email ?? '',
    fullName: profile?.full_name ?? null,
    id: user.id,
    plantId: profile?.plant_id ?? null,
    role: (profileRole as UserRole | null) ?? readRole(user) ?? 'technician'
  };
}
