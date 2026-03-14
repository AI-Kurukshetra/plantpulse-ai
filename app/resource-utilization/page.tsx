import { ImportantFeatureDashboard } from '@/components/important/ImportantFeatureDashboard';
import { AppShell } from '@/components/layout/AppShell';
import { getCurrentRole } from '@/lib/auth';
import { createPageMetadata } from '@/lib/metadata';
import { getImportantFeatureData } from '@/services/importantFeaturesService';

export const metadata = createPageMetadata(
  'Resource Utilization Analytics',
  'Resource consumption analytics across materials, water, and utilities with AI inefficiency detection.'
);

export default async function ResourceUtilizationPage() {
  const [role, data] = await Promise.all([getCurrentRole(), getImportantFeatureData('resource_utilization')]);
  return (
    <AppShell title={data.title} subtitle={data.subtitle} role={role}>
      <ImportantFeatureDashboard data={data} />
    </AppShell>
  );
}
