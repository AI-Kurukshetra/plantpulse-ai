import { ImportantFeatureDashboard } from '@/components/important/ImportantFeatureDashboard';
import { createPageMetadata } from '@/lib/metadata';
import { getImportantFeatureData } from '@/services/importantFeaturesService';

export const metadata = createPageMetadata(
  'Historical Data Analysis',
  'Time-series analytics for trend identification and continuous operational improvement.'
);

export default async function HistoricalAnalysisPage() {
  const data = await getImportantFeatureData('historical_analysis');
  return <ImportantFeatureDashboard data={data} />;
}
