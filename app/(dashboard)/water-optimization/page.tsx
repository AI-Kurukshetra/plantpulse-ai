import { ImportantFeatureDashboard } from '@/components/important/ImportantFeatureDashboard';
import { createPageMetadata } from '@/lib/metadata';
import { getImportantFeatureData } from '@/services/importantFeaturesService';

export const metadata = createPageMetadata(
  'Water Usage Optimization',
  'Water consumption intelligence with efficiency trends and AI conservation recommendations.'
);

export default async function WaterOptimizationPage() {
  const data = await getImportantFeatureData('water_usage');
  return <ImportantFeatureDashboard data={data} />;
}
