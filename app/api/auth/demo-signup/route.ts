import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseEnv, isDemoMode } from '@/lib/env';

const demoSignupSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2).optional(),
  password: z.string().min(6),
  role: z.enum(['plant_manager', 'technician'])
});

async function findUserByEmail(
  client: SupabaseClient,
  email: string
): Promise<User | null> {
  let page = 1;

  while (true) {
    const { data, error } = await client.auth.admin.listUsers({
      page,
      perPage: 200
    });

    if (error) {
      throw error;
    }

    const matchedUser = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
    if (matchedUser) {
      return matchedUser;
    }

    if (data.users.length < 200) {
      return null;
    }

    page += 1;
  }
}

export async function POST(request: Request) {
  // Demo bypass is intentionally server-only and gated behind NEXT_PUBLIC_DEMO_MODE.
  if (!isDemoMode()) {
    return NextResponse.json({ error: 'Demo signup bypass is disabled.' }, { status: 403 });
  }

  const env = getSupabaseEnv();
  if (!env?.serviceRoleKey) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY is required for demo signup bypass.' }, { status: 500 });
  }

  const parsed = demoSignupSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid demo signup payload.' }, { status: 400 });
  }

  const adminClient = createClient(env.supabaseUrl, env.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const { email, fullName, password, role } = parsed.data;
  const { data: roleRow, error: roleError } = await adminClient.from('roles').select('id').eq('name', role).single();

  if (roleError || !roleRow) {
    return NextResponse.json({ error: 'Requested role does not exist.' }, { status: 400 });
  }

  let user = await findUserByEmail(adminClient, email);

  if (user) {
    const { data: updated, error: updateError } = await adminClient.auth.admin.updateUserById(user.id, {
      email_confirm: true,
      password,
      app_metadata: {
        ...user.app_metadata,
        role
      },
      user_metadata: {
        ...user.user_metadata,
        full_name: fullName ?? user.user_metadata?.full_name ?? null,
        role
      }
    });

    if (updateError || !updated.user) {
      return NextResponse.json({ error: updateError?.message ?? 'Unable to update the existing demo user.' }, { status: 400 });
    }

    user = updated.user;
  } else {
    const { data: created, error: createError } = await adminClient.auth.admin.createUser({
      email,
      email_confirm: true,
      password,
      app_metadata: {
        role
      },
      user_metadata: {
        full_name: fullName ?? null,
        role
      }
    });

    if (createError || !created.user) {
      return NextResponse.json({ error: createError?.message ?? 'Unable to create the demo user.' }, { status: 400 });
    }

    user = created.user;
  }

  const { error: profileError } = await adminClient.from('profiles').upsert(
    {
      id: user.id,
      email,
      full_name: fullName ?? null,
      role_id: roleRow.id
    },
    { onConflict: 'id' }
  );

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
