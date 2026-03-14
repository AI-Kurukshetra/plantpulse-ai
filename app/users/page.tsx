import { AppShell } from '@/components/layout/AppShell';
import { UsersManagementClient } from '@/components/admin/UsersManagementClient';
import { getCurrentRole } from '@/lib/auth';
import { createPageMetadata } from '@/lib/metadata';

export const metadata = createPageMetadata(
  'Users',
  'Role-based user access management for PlantPulse AI administrators.'
);

export default async function UsersPage() {
  const role = await getCurrentRole();

  return (
    <AppShell
      title="User Access Management"
      subtitle="Role-based user directory for platform governance and operational access control."
      role={role}
    >
      <UsersManagementClient />
    </AppShell>
  );
}
