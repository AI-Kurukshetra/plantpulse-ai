import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { AUTH_ACCESS_TOKEN_COOKIE } from '@/lib/authCookies';
import { decodeAuthToken, getRoleFromToken } from '@/lib/authToken';
import { getSupabaseEnv } from '@/lib/env';
import { createUserSchema } from '@/lib/validation/auth';

function getAccessToken(request: Request) {
  const cookieHeader = request.headers.get('cookie') ?? '';
  const accessTokenMatch = cookieHeader.match(new RegExp(`${AUTH_ACCESS_TOKEN_COOKIE}=([^;]+)`));
  return accessTokenMatch?.[1] ? decodeURIComponent(accessTokenMatch[1]) : null;
}

function getAdminClient(request: Request) {
  const accessToken = getAccessToken(request);
  const requesterId = accessToken ? decodeAuthToken(accessToken)?.sub ?? null : null;

  if (!accessToken || getRoleFromToken(accessToken) !== 'admin') {
    return {
      error: NextResponse.json({ error: 'Admin access required.' }, { status: 403 }),
      client: null,
      requesterId: null
    };
  }

  const env = getSupabaseEnv();
  if (!env?.serviceRoleKey) {
    return {
      error: NextResponse.json({ error: 'Server-side Supabase service role key is not configured.' }, { status: 500 }),
      client: null,
      requesterId
    };
  }

  const client = createClient(env.supabaseUrl, env.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  return { error: null, client, requesterId };
}

export async function GET(request: Request) {
  const { error, client, requesterId } = getAdminClient(request);
  if (error || !client) {
    return error;
  }

  const url = new URL(request.url);
  const search = (url.searchParams.get('search') ?? '').trim();
  const page = Math.max(1, Number(url.searchParams.get('page') ?? '1'));
  const pageSize = Math.min(50, Math.max(5, Number(url.searchParams.get('pageSize') ?? '10')));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = client
    .from('profiles')
    .select('id, email, full_name, created_at, role:roles(name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (search) {
    query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
  }

  const { data, count, error: queryError } = await query;
  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 400 });
  }

  return NextResponse.json({
    items: (data ?? []).map((row) => ({
      id: row.id,
      email: row.email,
      fullName: row.full_name,
      role: row.role && typeof row.role === 'object' && 'name' in row.role ? row.role.name : 'technician',
      createdAt: row.created_at
    })),
    currentUserId: requesterId,
    page,
    pageSize,
    total: count ?? 0
  });
}

export async function POST(request: Request) {
  const { error, client: adminClient } = getAdminClient(request);
  if (error || !adminClient) {
    return error;
  }

  const parsed = createUserSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid user payload.' }, { status: 400 });
  }

  const { data: roleRow } = await adminClient
    .from('roles')
    .select('id, name')
    .eq('name', parsed.data.role)
    .single();

  if (!roleRow) {
    return NextResponse.json({ error: 'Requested role does not exist.' }, { status: 400 });
  }

  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    app_metadata: {
      role: parsed.data.role
    },
    user_metadata: {
      role: parsed.data.role
    }
  });

  if (createError || !created.user) {
    return NextResponse.json({ error: createError?.message ?? 'Unable to create user.' }, { status: 400 });
  }

  const { error: profileError } = await adminClient.from('profiles').upsert(
    {
      id: created.user.id,
      email: parsed.data.email,
      full_name: parsed.data.fullName,
      role_id: roleRow.id
    },
    { onConflict: 'id' }
  );

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, userId: created.user.id });
}

export async function DELETE(request: Request) {
  const { error, client: adminClient, requesterId } = getAdminClient(request);
  if (error || !adminClient) {
    return error;
  }

  const url = new URL(request.url);
  const userId = (url.searchParams.get('userId') ?? '').trim();

  if (!userId) {
    return NextResponse.json({ error: 'User id is required.' }, { status: 400 });
  }

  if (requesterId && requesterId === userId) {
    return NextResponse.json({ error: 'You cannot delete the currently signed-in admin user.' }, { status: 400 });
  }

  const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, userId });
}
