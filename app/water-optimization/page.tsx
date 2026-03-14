import { ImportantFeatureDashboard } from '@/components/important/ImportantFeatureDashboard';
import { AppShell } from '@/components/layout/AppShell';
import { getCurrentRole } from '@/lib/auth';
import { createPageMetadata } from '@/lib/metadata';
import { getImportantFeatureData } from '@/services/importantFeaturesService';

export const metadata = createPageMetadata(
  'Water Usage Optimization',
  'Water consumption intelligence with efficiency trends and AI conservation recommendations.'
);

export default async function WaterOptimizationPage() {
  const [role, data] = await Promise.all([getCurrentRole(), getImportantFeatureData('water_usage')]);
  return (
    <AppShell title={data.title} subtitle={data.subtitle} role={role}>
      <ImportantFeatureDashboard data={data} />
    </AppShell>
  );
}
