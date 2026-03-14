import type { Session, User } from '@supabase/supabase-js';
import type { AuthenticatedUser, UserRole } from '@/types';
import { supabase } from '@/lib/supabaseClient';

export class SignupRateLimitError extends Error {
  constructor(message = 'Signup is temporarily rate limited. Retry in a few seconds or sign in if your account already exists.') {
    super(message);
    this.name = 'SignupRateLimitError';
  }
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
    if (isSignupRateLimitError(error)) {
      // Best-effort bypass: if the account exists already, try to establish a session instead of failing hard.
      const fallback = await client.auth.signInWithPassword({ email, password });
      if (!fallback.error && fallback.data.session) {
        await syncSession(fallback.data.session);
        return fallback.data;
      }
      throw new SignupRateLimitError();
    }
    throw error;
  }

  let activeSession = data.session;
  if (!activeSession) {
    const { data: sessionData } = await client.auth.getSession();
    activeSession = sessionData.session ?? null;
  }
  if (!activeSession) {
    const { data: signedInData, error: signedInError } = await client.auth.signInWithPassword({ email, password });
    if (!signedInError && signedInData?.session) {
      activeSession = signedInData.session;
    } else if (signedInError) {
      const msg = signedInError.message?.toLowerCase() ?? '';
      if (msg.includes('confirm') || msg.includes('verified')) {
        throw new Error('Please check your email to confirm your account, then sign in.');
      }
      await new Promise((r) => setTimeout(r, 800));
      const retry = await client.auth.signInWithPassword({ email, password });
      if (retry.error || !retry.data.session) {
        throw new Error('Signup completed but no active session was created. Please sign in to continue.');
      }
      activeSession = retry.data.session;
    } else {
      throw new Error('Signup completed but no active session was created. Please sign in to continue.');
    }
  }

  await syncSession(activeSession);
  return data;
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
  const { error } = await client.auth.signOut();

  if (error) {
    throw error;
  }

  await syncSession(null);
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
