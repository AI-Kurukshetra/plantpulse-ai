import { RbacManagementDashboard } from '@/components/admin/RbacManagementDashboard';
import { getCurrentRole } from '@/lib/auth';
import { createPageMetadata } from '@/lib/metadata';
import { getRbacPermissionMatrix, getRbacProfiles } from '@/services/rbacService';

export const metadata = createPageMetadata(
  'Role-based Access Control',
  'Granular role permissions and assignment controls across PlantPulse AI modules.'
);

export default async function RbacPage() {
  const [currentRole, profiles, matrix] = await Promise.all([
    getCurrentRole(),
    getRbacProfiles(),
    getRbacPermissionMatrix()
  ]);

  return <RbacManagementDashboard currentRole={currentRole} initialProfiles={profiles} matrix={matrix} />;
}
