const env = {
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
};

export function hasSupabaseEnv() {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}

export function getSupabaseEnv() {
  if (!hasSupabaseEnv()) {
    return null;
  }

  return {
    serviceRoleKey: env.serviceRoleKey ?? null,
    supabaseUrl: env.supabaseUrl as string,
    supabaseAnonKey: env.supabaseAnonKey as string
  };
}
