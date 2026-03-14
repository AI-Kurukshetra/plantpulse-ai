import { ImportantFeatureDashboard } from '@/components/important/ImportantFeatureDashboard';
import { createPageMetadata } from '@/lib/metadata';
import { getImportantFeatureData } from '@/services/importantFeaturesService';

export const metadata = createPageMetadata(
  'Waste Stream Analytics',
  'Waste generation, disposal optimization, and AI-guided reduction opportunities.'
);

export default async function WasteAnalyticsPage() {
  const data = await getImportantFeatureData('waste_stream');
  return <ImportantFeatureDashboard data={data} />;
}
