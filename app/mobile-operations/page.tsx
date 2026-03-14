import { ImportantFeatureDashboard } from '@/components/important/ImportantFeatureDashboard';
import { AppShell } from '@/components/layout/AppShell';
import { getCurrentRole } from '@/lib/auth';
import { createPageMetadata } from '@/lib/metadata';
import { getImportantFeatureData } from '@/services/importantFeaturesService';

export const metadata = createPageMetadata(
  'Mobile Operations App',
  'Mobile-first operations view for managers and technicians with key KPIs and alerts.'
);

export default async function MobileOperationsPage() {
  const [role, data] = await Promise.all([getCurrentRole(), getImportantFeatureData('mobile_operations')]);
  return (
    <AppShell title={data.title} subtitle={data.subtitle} role={role}>
      <ImportantFeatureDashboard data={data} />
    </AppShell>
  );
}
