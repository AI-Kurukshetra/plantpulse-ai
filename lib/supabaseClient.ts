import { createClient } from '@supabase/supabase-js';
import { getSupabaseEnv, hasSupabaseEnv } from '@/lib/env';

const supabaseConfig = getSupabaseEnv();

export const supabase = supabaseConfig
  ? createClient(supabaseConfig.supabaseUrl, supabaseConfig.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    })
  : null;

export { hasSupabaseEnv };
