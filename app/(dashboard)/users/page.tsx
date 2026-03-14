import { UsersManagementClient } from '@/components/admin/UsersManagementClient';
import { createPageMetadata } from '@/lib/metadata';

export const metadata = createPageMetadata(
  'Users',
  'Role-based user access management for PlantPulse AI administrators.'
);

export default async function UsersPage() {
  return <UsersManagementClient />;
}
