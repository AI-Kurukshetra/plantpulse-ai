import { ImportantFeatureDashboard } from '@/components/important/ImportantFeatureDashboard';
import { createPageMetadata } from '@/lib/metadata';
import { getImportantFeatureData } from '@/services/importantFeaturesService';

export const metadata = createPageMetadata(
  'Benchmark Comparison',
  'Industry benchmark comparison with gap analytics and AI-generated improvement suggestions.'
);

export default async function BenchmarkComparisonPage() {
  const data = await getImportantFeatureData('benchmark_comparison');
  return <ImportantFeatureDashboard data={data} />;
}
