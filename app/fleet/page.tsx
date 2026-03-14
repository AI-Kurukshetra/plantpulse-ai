import { ImportantFeatureDashboard } from '@/components/important/ImportantFeatureDashboard';
import { AppShell } from '@/components/layout/AppShell';
import { getCurrentRole } from '@/lib/auth';
import { createPageMetadata } from '@/lib/metadata';
import { getImportantFeatureData } from '@/services/importantFeaturesService';

export const metadata = createPageMetadata(
  'Multi-site Fleet Management',
  'Centralized multi-facility monitoring with KPI rollups and AI-guided operational insights.'
);

export default async function FleetPage() {
  const [role, data] = await Promise.all([getCurrentRole(), getImportantFeatureData('multi_site_fleet')]);
  return (
    <AppShell title={data.title} subtitle={data.subtitle} role={role}>
      <ImportantFeatureDashboard data={data} />
    </AppShell>
  );
}
