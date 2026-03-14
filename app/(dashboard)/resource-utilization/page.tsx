import { ImportantFeatureDashboard } from '@/components/important/ImportantFeatureDashboard';
import { createPageMetadata } from '@/lib/metadata';
import { getImportantFeatureData } from '@/services/importantFeaturesService';

export const metadata = createPageMetadata(
  'Resource Utilization Analytics',
  'Resource consumption analytics across materials, water, and utilities with AI inefficiency detection.'
);

export default async function ResourceUtilizationPage() {
  const data = await getImportantFeatureData('resource_utilization');
  return <ImportantFeatureDashboard data={data} />;
}
