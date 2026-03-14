import { ImportantFeatureDashboard } from '@/components/important/ImportantFeatureDashboard';
import { createPageMetadata } from '@/lib/metadata';
import { getImportantFeatureData } from '@/services/importantFeaturesService';

export const metadata = createPageMetadata(
  'Multi-site Fleet Management',
  'Centralized multi-facility monitoring with KPI rollups and AI-guided operational insights.'
);

export default async function FleetPage() {
  const data = await getImportantFeatureData('multi_site_fleet');
  return <ImportantFeatureDashboard data={data} />;
}
