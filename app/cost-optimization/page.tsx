import { ImportantFeatureDashboard } from '@/components/important/ImportantFeatureDashboard';
import { AppShell } from '@/components/layout/AppShell';
import { getCurrentRole } from '@/lib/auth';
import { createPageMetadata } from '@/lib/metadata';
import { getImportantFeatureData } from '@/services/importantFeaturesService';

export const metadata = createPageMetadata(
  'Cost Optimization Recommendations',
  'AI-powered cost reduction recommendations with savings impact and confidence scoring.'
);

export default async function CostOptimizationPage() {
  const [role, data] = await Promise.all([getCurrentRole(), getImportantFeatureData('cost_optimization')]);
  return (
    <AppShell title={data.title} subtitle={data.subtitle} role={role}>
      <ImportantFeatureDashboard data={data} showModal />
    </AppShell>
  );
}
