import { ImportantFeatureDashboard } from '@/components/important/ImportantFeatureDashboard';
import { AppShell } from '@/components/layout/AppShell';
import { getCurrentRole } from '@/lib/auth';
import { createPageMetadata } from '@/lib/metadata';
import { getImportantFeatureData } from '@/services/importantFeaturesService';

export const metadata = createPageMetadata(
  'Alert Management System',
  'Configurable notifications and escalation workflows with complete alert visibility.'
);

export default async function AlertManagementPage() {
  const [role, data] = await Promise.all([getCurrentRole(), getImportantFeatureData('alert_management')]);
  return (
    <AppShell title={data.title} subtitle={data.subtitle} role={role}>
      <ImportantFeatureDashboard data={data} showModal />
    </AppShell>
  );
}
