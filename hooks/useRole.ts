'use client';

import { useMemo } from 'react';
import type { UserRole } from '@/types';

export function useRole(role: UserRole = 'plant_manager') {
  return useMemo(
    () => ({
      role,
      isAdmin: role === 'admin',
      isManager: role === 'plant_manager',
      isTechnician: role === 'technician'
    }),
    [role]
  );
}
