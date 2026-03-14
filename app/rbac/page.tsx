import { RbacManagementDashboard } from '@/components/admin/RbacManagementDashboard';
import { AppShell } from '@/components/layout/AppShell';
import { getCurrentRole } from '@/lib/auth';
import { createPageMetadata } from '@/lib/metadata';
import { getRbacPermissionMatrix, getRbacProfiles } from '@/services/rbacService';

export const metadata = createPageMetadata(
  'Role-based Access Control',
  'Granular role permissions and assignment controls across PlantPulse AI modules.'
);

export default async function RbacPage() {
  const [role, profiles, matrix] = await Promise.all([
    getCurrentRole(),
    Promise.resolve(getRbacProfiles()),
    Promise.resolve(getRbacPermissionMatrix())
  ]);

  return (
    <AppShell
      title="Role-based Access Control"
      subtitle="Create permission profiles, manage module-level actions, and enforce secure operational access."
      role={role}
    >
      <RbacManagementDashboard currentRole={role} initialProfiles={profiles} matrix={matrix} />
    </AppShell>
  );
}
