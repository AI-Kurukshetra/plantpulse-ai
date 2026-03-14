import { ImportantFeatureDashboard } from '@/components/important/ImportantFeatureDashboard';
import { createPageMetadata } from '@/lib/metadata';
import { getImportantFeatureData } from '@/services/importantFeaturesService';

export const metadata = createPageMetadata(
  'Cost Optimization Recommendations',
  'AI-powered cost reduction recommendations with savings impact and confidence scoring.'
);

export default async function CostOptimizationPage() {
  const data = await getImportantFeatureData('cost_optimization');
  return <ImportantFeatureDashboard data={data} showModal />;
}
