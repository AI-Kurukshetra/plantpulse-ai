import type { UserAccessRecord, UserRole } from '@/types';
import { supabase } from '@/lib/supabaseClient';
import { shouldUseFallback } from '@/services/serviceUtils';

export async function getUserAccessRecords(): Promise<UserAccessRecord[]> {
  if (!supabase || shouldUseFallback()) {
    return [
      {
        id: 'seed-admin',
        email: 'admin@plantpulse.ai',
        fullName: 'PlantPulse Admin',
        role: 'admin',
        createdAt: new Date().toISOString()
      }
    ];
  }

  const [{ data: profileRows }, { data: roleRows }] = await Promise.all([
    supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    supabase.from('roles').select('*')
  ]);

  if (!profileRows?.length || !roleRows?.length) {
    return [];
  }

  const roleById = new Map(roleRows.map((row) => [row.id, row.name as UserRole]));

  return profileRows.map((row) => ({
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: roleById.get(row.role_id) ?? 'technician',
    createdAt: row.created_at
  }));
}
